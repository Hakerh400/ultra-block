(() => {
  'use strict';

  const ENABLED = !/[?&]udsb(?:[&=]|$)/.test(location.href);
  const DEBUG = /[?&]udbg(?:[&=]|$)/.test(location.href);

  const inco = chrome.extension.inIncognitoContext;
  const {href} = top.location;

  const kws = href.
    match(/[\?\&]search_query=([^&]*)/)[1].
    split('+').
    filter(a => a && !a.startsWith('-')).
    map(a => decodeURIComponent(a));

  const cyr = kws.some(a => /[^!-~]/.test(a));

  const CHECK_VIEWS = 0;
  const CHECK_KEYWORDS = 1;
  const CHECK_DURATION = !cyr;

  const DURATION_MIN = 60 * 2;

  let capsReg = /\b[A-Z]/g;

  const interchangeableWords = [
  ];

  const interchangeableWordsObj = Object.create(null);

  for(const words of interchangeableWords)
    for(const word of words)
      interchangeableWordsObj[word] = words;

  const blackList = inco ? [
  ] : [];

  const blackListMeta = inco ? [
    ...blackList,
  ] : [];

  const blackListTitle = inco ? [
  ] : [];

  const blackListChannelName = inco ? [
    ...blackList,
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

    // localStorage.z = 0;

    function block(){
      let e;

      for(e of qsa('ytd-video-renderer:not(.ublock-safe)')){
        if(!ENABLED){
          show(e);
          continue;
        }

        const duration = qs(e, 'ytd-thumbnail-overlay-time-status-renderer');
        const meta = qs(e, '#metadata');
        const title = qs(e, '#title-wrapper');
        const desc = qs(e, '#description-text,.metadata-snippet-text');
        const channel = qs(e, '#byline-container a');

        // if(localStorage.z|0){
        //   localStorage.z = 0;
        //   log('duration: ', duration);
        //   log('meta: ', meta);
        //   log('title: ', title);
        //   log('desc: ', desc);
        //   log('channel: ', channel);
        //   debugger;
        // }

        if(!(duration && meta && title && desc && channel)) continue;

        let force = 1;

        if(
          checkChannel(channel) && !(force = 0) &&
          checkDuration(duration) &&
          checkMeta(meta) &&
          checkTitle(title) &&
          checkDesc(desc)
        ){
          show(e);
        }else if(DEBUG && !force){
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

    if(CHECK_DURATION && dur < DURATION_MIN){
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

    if(CHECK_VIEWS){
      const match = str.match(/(\d+(?:\.\d+)?)([KMB]?) views/);
      if(match !== null){
        const views = match[1] * 10 ** (['', 'K', 'M', 'B'].indexOf(match[2]) * 3) + .5 | 0;
        if(views > 5e3){
          if(DEBUG) dbg = 'Too many views';
          return 0;
        }
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

    if(CHECK_KEYWORDS){
      let mkw = null;

      const hasAllKws = kws.every(kw => {
        mkw = kw;

        if(lcStr.includes(kw)) return 1;
        if(!(kw in interchangeableWordsObj)) return 0;

        const words = interchangeableWordsObj[kw];
        return words.some(word => lcStr.includes(word));
      });

      if(!hasAllKws){
        if(DEBUG) dbg = `Missing keyword "${mkw}"`;
        return 0;
      }
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
    if(channel in blackListChannel || channel in blackListUser) return 0;

    const name = e.innerText.trim();
    const func = checkFunc(name);

    if(blackListChannelName.find(func)) return 0;
    return 1;
  }

  function checkFunc(str){
    return reg => {
      const found = reg.test(str);
      if(!found) return 0;
      if(DEBUG) dbg = `${reg} ---> ${JSON.stringify(str.match(reg)[0])}`;
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