(() => {
  'use strict';

  const RMI = 1;

  const inco = chrome.extension.inIncognitoContext;

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const RMI_HOST = 'localhost';
  const RMI_PORT = 8081;
  const A = 1;

  class Semaphore{
    constructor(s=1){
      this.s = s;
      this.blocked = [];
    }

    init(s){
      this.s = s;
    }

    wait(){
      if(this.s > 0){
        this.s--;
        return Promise.resolve();
      }

      return new Promise(res => {
        this.blocked.push(res);
      });
    }

    signal(){
      const {blocked} = this;

      if(blocked.length === 0){
        this.s++;
        return;
      }

      setTimeout(blocked.shift());
    }
  }

  class CustomError extends Error{
    get name(){ return this.constructor.name; }
  }

  class AssertionError extends CustomError{
    constructor(){
      super();
      // new Function('debugger')();
    }
  }

  class RMIError extends CustomError{}

  const O = {
    Semaphore,
    CustomError,
    AssertionError,
    RMIError,

    has(obj, key){ return Object.hasOwnProperty.call(obj, key); },

    assert(...args){
      const len = args.length;

      if(len < 1 || len > 2)
        throw new TypeError(`Expected 1 or 2 arguments, but got ${len}`);

      if(!args[0]){
        let msg = `Assertion failed`;
        if(len === 2) msg += ` ---> ${args[1]}`;
        throw new O.AssertionError(msg);
      }
    },

    cap(str, lowerOthers=0){
      if(lowerOthers) str = str.toLowerCase();
      return `${str[0].toUpperCase()}${str.substring(1)}`;
    },

    rmiSem: new Semaphore(),

    async rmi(...args){
      await O.rmiSem.wait();

      return new Promise((resolve, reject) => {
        try{
          let host = RMI_HOST;
          let port = RMI_PORT;

          if(typeof args[0] === 'object'){
            const opts = args.shift();

            if(O.has(opts, 'host')) host = opts.host;
            if(O.has(opts, 'port')) port = opts.port;
          }

          const method = args.shift();
          O.assert(typeof method === 'string');
          O.assert(/^(?:\.[a-zA-Z0-9]+)+$/.test(`.${method}`));

          const req = JSON.stringify([method.split('.'), args]);
          const xhr = new window.XMLHttpRequest();

          xhr.onreadystatechange = () => {
            try{
              if(xhr.readyState !== 4) return;

              const {status} = xhr;

              if(status !== 200){
                if(status === 0)
                  throw new TypeError(`RMI server is unavailable`);

                throw new TypeError(`RMI server responded with status code ${status}`);
              }

              const res = JSON.parse(xhr.responseText);

              if(res[0])
                throw new O.RMIError(res[1]);

              resolve(res[1]);
            }catch(err){
              reject(err);
            }
          };

          xhr.open('POST', `http://${host}:${port}/`);
          xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
          xhr.send(req);
        }catch(err){
          reject(err);
        }
      }).finally(() => O.rmiSem.signal());
    },
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Add tab listeners
  if(RMI){
    const ael = (type, func) => {
      chrome.tabs[type].addListener((...args) => {
        func(...args)//.catch(console.error);
      });
    };

    const listeners = [
      'create',
      'update',
      'move',
      'attach',
      'detach',
      'replace',
      'remove',
    ];

    for(const type of listeners){
      const cap = O.cap(type);
      const suffix = type.endsWith('e') ? 'd' : 'ed';
      const evtName = `on${cap}${suffix}`;

      ael(evtName, async (...args) => {
        await O.rmi(`ublock.tabs.${type}`, ...args);
      });
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const blackList = [
  ];

  var whiteList = [
  ];

  var redirectionsList = [
    [/^www\.google\.(?!co\.uk)/, /\.google\.[^\/]+/, '.google.co.uk'],
    [/^www\.google\.co\.uk\/imgres\?/, /[\s\S]*/, a => unescape(a.match(/[\?\&]imgurl=([^\&]*)/)[1])],
    [/^www\.youtube\.com\/$/, /$/, 'watch?v=7'],
    [/^www\.youtube\.com\/(?:channel|user|c)\/[^\/]+$/, /\/?$/, '/videos?flow=grid&view=0'],
    [/^www\.tumblr\.com\/safe-mode\?/, /safe-mode\?[\s\S]*/, a => {
      return `dashboard/blog/${a.match(/(?:\/|%2F)([^%]*?)\.tumblr.com/i)[1]}`;
    }],
    [/^[^\/]+\.codidact\.com\/categories\/\d+$/, /$/, '?sort=age'],
  ];

  chrome.webRequest.onBeforeRequest.addListener(evt => {
    if(evt.initiator === 'https://drive.google.com') return;

    var url = evt.url.match(/^[^\/]+?\:\/{2,3}(.+)/)[1];
    var urlLower = url.toLowerCase();

    var redirect = redirectionsList.find(([a]) => a.test(url));
    if(redirect) return {redirectUrl: evt.url.replace(redirect[1], redirect[2])};

    if(inco && url.startsWith('www.youtube.com/')){
      if(!/[\?&]gl=US&persist_gl=1/.test(url)){
        const urlNew = `${evt.url}${url.includes('?') ? '&' : '?'}gl=US&persist_gl=1`;
        return {redirectUrl: urlNew};
      }
    }

    if(/*inco*/1){
    }

    let match = null;
    
    const testFunc = test => {
      let found = 0;

      if(test instanceof RegExp) found = test.test(url);
      else found = urlLower.includes(test);

      if(found && match === null)
        match = test;

      return found;
    };

    if(evt.url.includes('metamath')) return;

    const cancel = !evt.url.startsWith('file:///') &&
      !whiteList.some(testFunc) &&
      blackList.some(testFunc);

    // if(cancel) log(evt.url, match);

    return {cancel};
  },
    {urls: ['<all_urls>']},
    ['blocking'],
  );

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