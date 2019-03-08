(() => {
  'use strict';

  const DEBUG = 0;

  const {href} = top.location;
  const inco = chrome.extension.inIncognitoContext;
  const kws = href.match(/\?[^=]+=([^&]+)/)[1].split('+').filter(a => !a.startsWith('-') && a.length >= 4);

  const blackList = [
  ];

  const blackListMeta = [
  ];

  const blackListTitle = [
  ];

  const types = createEnum([
    'META',
    'TITLE',
    'DESC',
  ]);

  const dbgTypes = {
    [types.META]: 'Meta',
    [types.TITLE]: 'Title',
    [types.DESC]: 'Description',
  };
  
  var stage = 0;
  let dbgType, dbg;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    block();

    function block(){
      let e;

      for(e of qsa('ytd-video-renderer:not(.ublock-safe)')){
        if(!e.classList.contains('ublock-safe-maybe')) continue;

        const meta = qs(e, '#metadata');
        const title = qs(e, '#title-wrapper');
        const desc = qs(e, '#description-text');
        if(!(meta && title && desc)) continue;

        if(checkMeta(meta) && checkTitle(title) && checkDesc(desc)){
          show(e);
        }else if(DEBUG){
          e.style.backgroundColor = 'red';
          let h1 = document.createElement('h1');
          h1.innerText = getDbgStr();
          e.appendChild(h1);
          show(e);
        }else{
          e.remove();
        }
      }

      setTimeout(block, stage ? 1e3 : 0);
    }
  }

  function checkMeta(e){
    if(!inco) return 1;
    dbgType = types.META;

    const str = e.innerText;
    const func = checkFunc(str);

    if(/(?:\d{2,}|[2-9](?:\.\d+)?)K views/.test(str)){
      if(DEBUG) dbg = 'Too many views';
      return 0;
    }

    if(blackListMeta.some(func)) return 0;

    return 1;
  }

  function checkTitle(e){
    if(!inco) return 1;
    dbgType = types.TITLE;

    const str = e.innerText;
    const lcStr = str.toLowerCase();
    const func = checkFunc(str);

    const caps = str.replace(/[^A-Z]+/g, '').length;
    const ncaps = str.replace(/[^a-z]+/g, '').length;

    if(caps >= 8 && ncaps <= 3){
      if(DEBUG) dbg = 'Too many capital letters';
      return 0;
    }

    if(!kws.every(kw => lcStr.includes(kw))){
      if(DEBUG) dbg = 'No keywords';
      return 0;
    }

    if(blackList.some(func)) return 0;
    if(blackListTitle.some(func)) return 0;

    return 1;
  }

  function checkDesc(e){
    if(!inco) return 1;
    dbgType = types.DESC;

    const str = e.innerText;
    const func = checkFunc(str);
    
    if(blackList.some(func)) return 0;

    return 1;
  }

  function checkFunc(str){
    return reg => {
      const found = reg.test(str);
      if(!found) return 0;
      if(DEBUG) dbg = JSON.stringify(str.match(reg)[0]);
      return 1;
    };
  }

  function getDbgStr(){
    return `[${dbgTypes[dbgType]}]\n${dbg}`;
  }

  function createEnum(arr){
    const obj = Object.create(null);

    arr.forEach((name, index) => {
      obj[name] = index;
      obj[index] = name;
    });

    return obj;
  }

  function show(e){
    e.classList.add('ublock-safe');
  }

  function qs(a, b=null){
    if(b === null){
      b = a;
      a = document;
    }

    return a.querySelector(b);
  }

  function qsa(a, b=null){
    if(b === null){
      b = a;
      a = document;
    }

    return a.querySelectorAll(b);
  }

  function decode(str){
    return str.split('').
      map(a => a.charCodeAt(0) - 32).
      map(a => 94 - a).
      map(a => String.fromCharCode(32 + a)).
      join('');
  }

  function log(...a){
    console.log(...a);
    return a[a.length - 1];
  }
})();