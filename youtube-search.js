(() => {
  'use strict';

  const DEBUG = 0;

  const DURATION_MIN = 60 * 2;

  const {href} = top.location;
  const inco = chrome.extension.inIncognitoContext;
  const kws = href.match(/[\?\&]search_query=([^&]+)/)[1].split('+').filter(a => !a.startsWith('-'));

  let capsReg = /\b[A-Z]/g;

  const blackList = inco ? [
  ] : [];

  const blackListMeta = inco ? [
  ] : [];

  const blackListTitle = inco ? [
  ] : [];

  const blackListChannel = arr2obj([
  ]);

  const blackListUser = arr2obj([
  ]);

  const types = createEnum([
    'DURATION',
    'META',
    'TITLE',
    'DESC',
    'CHANNEL',
  ]);

  const dbgTypes = {
    [types.DURATION]: 'Duration',
    [types.META]: 'Meta',
    [types.TITLE]: 'Title',
    [types.DESC]: 'Description',
    [types.CHANNEL]: 'Channel',
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
        const duration = qs(e, 'ytd-thumbnail-overlay-time-status-renderer');
        const meta = qs(e, '#metadata');
        const title = qs(e, '#title-wrapper');
        const desc = qs(e, '#description-text');
        const channel = qs(e, '#byline-container a');
        if(!(duration && meta && title && desc && channel)) continue;

        if(
          checkDuration(duration) &&
          checkMeta(meta) &&
          checkTitle(title) &&
          checkDesc(desc) &&
          checkChannel(channel)
        ){
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

  function checkDuration(e){
    if(!inco) return 1;
    if(DEBUG) dbgType = types.DURATION;

    const str = e.innerText.trim();
    const dur = str.split(':').reduce((a, b) => {
      return a * 60 + (b.trim() | 0);
    }, 0);

    if(dur < DURATION_MIN){
      if(DEBUG) dbg = 'Too short';
      return 0;
    }

    return 1;
  }

  function checkMeta(e){
    if(!inco) return 1;
    if(DEBUG) dbgType = types.META;

    const str = e.innerText;
    const func = checkFunc(str);

    // const reg = inco ?
    //   /(?:week|month|year|(?:[2-9]|\d{2,}) day)s? ago\b/ :
    //   /(?:month|year)s? ago\b/;

    // if(reg.test(str)){
    //   if(DEBUG) dbg = 'Too old';
    //   return 0;
    // }

    if(!inco) return 1;

    const match = str.match(/(\d+(?:\.\d+)?)([KMB]?) views/);
    if(match !== null){
      const views = match[1] * 10 ** (['', 'K', 'M', 'B'].indexOf(match[2]) * 3) + .5 | 0;
      if(views > 5e3){
        if(DEBUG) dbg = 'Too many views';
        return 0;
      }
    }

    if(blackListMeta.some(func))
      return 0;

    return 1;
  }

  function checkTitle(e){
    if(!inco) return 1;
    if(DEBUG) dbgType = types.TITLE;

    const str = e.innerText;
    const lcStr = str.toLowerCase();
    const func = checkFunc(str);

    const caps = str.replace(capsReg, '').replace(/[^A-Z]+/g, '').length;
    const ncaps = str.replace(/[^a-z]+/g, '').length;

    if(caps >= 3 && (caps + 1) / (caps + ncaps + 2) > .2){
      if(DEBUG) dbg = 'Too many capital letters';
      return 0;
    }

    let mkw = null;
    if(!kws.every(kw => lcStr.includes(mkw = kw))){
      if(DEBUG) dbg = `Missing keyword "${mkw}"`;
      return 0;
    }

    if(blackList.some(func)) return 0;
    if(blackListTitle.some(func)) return 0;

    return 1;
  }

  function checkDesc(e){
    if(!inco) return 1;
    if(DEBUG) dbgType = types.DESC;

    const str = e.innerText;
    const func = checkFunc(str);
    
    if(blackList.find(func)) return 0;
    return 1;
  }

  function checkChannel(e){
    if(DEBUG) dbgType = types.CHANNEL;

    const channel = dbg = e.href.match(/\/[^\/]+$/)[0].slice(1);
    return !(channel in blackListChannel || channel in blackListUser);
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

  function arr2obj(arr, val=1){
    const obj = Object.create(null);
    for(const key of arr) obj[key] = val;
    return obj;
  }
})();