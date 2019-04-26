(() => {
  'use strict';

  onbeforeunload = () => {
    if(sessionStorage['ublock-prevent-hard-reload'])
      return;

    try{
      window.scrollTo(0, 0);
      const d = document;
      const e = d.body || d.documentElement;
      e.innerHTML = '';
    }catch{}
  };

  if(location.href.startsWith('http://localhost')) return;
  if(location.href.startsWith('https://hakerh400.github.io/')) return;

  var STYLE_URL = chrome.runtime.getURL('main.css');

  var script = () => {
    'use strict';

    var ublockFunc = (w=window) => {
      if(w['ublock-init.js']) return;
      w['ublock-init.js'] = true;

      var injectedWorkerCode = `(${injectedWorkerFunc})();`;

      main();

      function main(){
        const qsa = a => document.querySelectorAll(a);

        w.console_ = w.console;
        w.alert_ = w.alert;
        w.prompt_ = w.prompt;

        var log = w.console_.log.bind(w.console_);
        var document = w.document;
        var Object = w.Object;

        var symbol = Symbol('ublock');
        var toPrim = () => '1';
        var nopf = function(){};

        var nop = proxify(nopf, {
          getPrototypeOf(){ return null; },
          setPrototypeOf(){ return nop; },
          isExtensible(){ return false; },
          preventExtensions(){ return nop; },

          getOwnPropertyDescriptor(t, prop){
            if(prop === 'prototype')
              return Object.getOwnPropertyDescriptor(t, prop);

            return {
              writable: false,
              configurable: true,
            };
          },

          defineProperty(){ return nop; },
          has(){ return nop; },

          get(t, prop){
            if(prop === Symbol.toPrimitive) return toPrim;
            return nop;
          },

          set(){ return true; },
          deleteProperty(){ return nop; },
          ownKeys(){ return ['prototype']; },
          apply(){ return nop; },
          construct(){ return nop; },
        });

        w.log = log;

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const url = w.location.href;

        {
          const scripts = [
            ['Video', () => (q=>((v,S,s=v.style)=>{'controls,autoplay'.split`,`.map(a=>v.removeAttribute(a)),s.width=s.height='100%',addEventListener('keydown',(a,b=!a.ctrlKey?a.keyCode:0,c='currentTime')=>b-37?b-39?b-77?b-116?1:(a.preventDefault(),v.pause(),S.src=(a=>(a=a.split`?`,a[1]='a='+Date.now()+Math.random(),a.join`?`))(S.src),v.load()):v.muted^=1:v[c]+=5:v[c]-=5);sessionStorage['ublock-prevent-hard-reload']=1})(q('video')[0],q('source')[0]))(a=>[...document.querySelectorAll(a)])],
            ['Visited links', () => ((a,Y,M)=>(a('pre',a=>a.innerHTML=a.innerHTML.replace(/\<[^\.]*\>/g,'').trim().split(/\r\n|\r|\n/).map(a=>`<a href=${a.match(/\b[a-z]+?:\/\/[\S]+/)||((M=a.match(/\[([a-zA-Z0-9\_\-]{11})\]/))?Y+'watch?v='+M[1]:Y+'results?search_query='+a.split(/\-{2,}/)[0].split(/\*{2,}/).pop().trim().split('').map(a=>a<'~'?escape(a):a).join(''))}>${a}</a>`).join('<br>')),a('a',a=>a.addEventListener('mousedown',b=>b.button===1&&a.style.setProperty('color','red','important')))))((a,b)=>[...document.querySelectorAll(a)].map(b),'https://www.youtube.com/')],
            ['Remove emoji', () => ((a=>(a(document,'title'),[...document.querySelectorAll('h1.title')].forEach(b=>a(b,'innerText'))))((a,b)=>a[b]=a[b]?a[b].replace(/[^ -~]+/gu,' ').replace(/\s+/g,' ').trim():'\u034f'),Object.defineProperty(document,'title',{}))],
            ['Extract videos', () => (document.documentElement.innerText=[...document.querySelectorAll`#contents a[href]`].map(a=>a.href).filter((a,b,c)=>c.indexOf(a)==b).map(a=>a.slice(-11)).reverse().join`\n`)],
            ['Prevent unload', () => (onbeforeunload=a=>'')],
            ['Extract embedded video', () => (a=>location.href='https://www.youtube.com/watch?v='+document.querySelector(`iframe[src^="${a}"]`).src.slice(a=a.length,a+11))('https://www.youtube.com/embed/')],
          ];

          w.addEventListener('keydown', evt => {
            if(!(evt.code === 'KeyS' && evt.ctrlKey)) return;

            evt.preventDefault('ublock');
            evt.stopPropagation('ublock');

            const i = w.prompt_(scripts.map((a, b) => {
              return `${b + 1}. ${a[0]}`;
            }).join('\n'));
            if(i === null) return;

            try{
              scripts[(i | 0) - 1][1]();
            }catch(e){
              alert_(e);
            }
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          let rot = 0;

          window.addEventListener('keydown', evt => {
            if(!(evt.ctrlKey && (evt.code === 'ArrowLeft' || evt.code === 'ArrowRight'))) return;

            const elem = document.activeElement;
            if(elem !== null){
              const tag = elem.tagName.toLowerCase();
              if(tag === 'input' || tag === 'textarea') return;
            }

            evt.preventDefault('ublock');
            evt.stopPropagation('ublock');

            rot = rot + (evt.code === 'ArrowLeft' ? -1 : 1) & 3;

            const c = document.body.classList;
            const index = [...c].findIndex(a => /^ublock-rot-[0123]$/.test(a));

            if(index !== -1) c.remove(c[index]);
            c.add(`ublock-rot-${rot}`);
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        Object.defineProperty(w.navigator, 'userAgent', {
          get(){
            if(w.location.href.startsWith('https://github.com/'))
              return 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36';
            return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';
          }
        });

        [
          'console',
          'alert',
          'prompt',
          'confirm',
          'open',

          // Service workers

          'Cache',
          'CacheStorage',
          'Client',
          'Clients',
          'ExtendableEvent',
          'FetchEvent',
          'InstallEvent',
          'NotificationEvent',
          'PeriodicSyncEvent',
          'PeriodicSyncManager',
          'PeriodicSyncRegistration',
          'ServiceWorker',
          'ServiceWorkerContainer',
          'ServiceWorkerGlobalScope',
          'ServiceWorkerRegistration',
          'SyncEvent',
          'SyncManager',
          'SyncRegistration',
          'wClient',
          'Navigator.serviceWorker',
          'navigator.serviceWorker',
          'SharedWorker',
          'NetworkInformation',
        ].forEach(a => {
          a = a.split`.`;

          var b = a.pop();
          var obj = a.reduce((a, b) => a[b], w);

          Object.defineProperty(obj, b, {
            value: nop,
            writable: false,
          });
        });

        proxify(w, 'Worker', {
          construct(ctor, args){
            try{
              var source = `${injectedWorkerCode}importScripts('${args[0]}');`;
              var blob = new Blob([source]);
              var url = w.URL.createObjectURL(blob);
            }catch(a){}
            return new ctor(url);
          }
        });

        Object.defineProperty(w, 'googletag', {
          get: () => ({cmd: []}),
          set: nop,
        });

        var blackListedListeners = [
          'contextmenu',
          'beforeunload',
          'unload',
          'error',

          ...0 ? [
            ...1 ? [
              'keydown',
              'keypress',
              'keyup',
            ] : [],

            ...1 ? [
              'mouseenter',
              'mouseover',
              'mousemove',
              'mousedown',
              'mouseup',
              'auxclick',
              'click',
              'dblclick',
              'contextmenu',
              'wheel',
              'mouseleave',
              'mouseout',
              'select',
              'pointerlockchange',
              'pointerlockerror',
            ] : [],
          ] : [],
        ];

        [
          w,
          document,
        ].forEach(target => {
          blackListedListeners.forEach(type => {
            Object.defineProperty(target, `on${type}`, {
              get: nop,
              set: nop,
            });
          });
        });

        w.addEventListener('keydown', evt => {
          switch(evt.code){
            case 'F5':
              if(sessionStorage['ublock-prevent-hard-reload'])
                break;

              evt.preventDefault('ublock');
              evt.stopPropagation('ublock');

              try{
                window.scrollTo(0, 0);
                const d = document;
                const e = d.body || d.documentElement;
                e.innerHTML = '';
              }catch{}
              
              w.location.reload();
              break;
          }
        });

        proxify(w.EventTarget.prototype, 'addEventListener', {
          apply(f, t, args){
            var type = args[0];
            if(blackListedListeners.some(a => a === type)) return nop;
            return f.apply(t, args);
          }
        });

        proxify(w.Event.prototype, 'preventDefault', {
          apply(f, t, args){
            if(args[0] !== 'ublock'){
              if(blackListedListeners.some(type => type === t.type)) return nop;
              if(t.type === 'auxclick') return nop;
            }

            return f.apply(t, args);
          }
        });

        proxify(w.Event.prototype, 'stopPropagation', {
          apply(f, t, args){
            if(args[0] !== 'ublock' && blackListedListeners.some(type => type === t.type)) return nop;
            return f.apply(t, args);
          }
        });

        proxify(w.Node.prototype, 'dispatchEvent', {
          apply(f, t, args){
            if(t.target) return nop;
            return f.apply(t, args);
          }
        });

        w._shadows = new Set();
        proxify(w.Element.prototype, 'attachShadow', {
          apply(f, t, args){
            const d = w.document;
            const sr = f.apply(t, args);

            w._shadows.add(sr);
            t.classList.add('ublock-shadow');

            const style = d.createElement('style');
            style.innerHTML = `
              *{
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `;
            sr.appendChild(style);

            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
              if(xhr.readyState !== 4 || xhr.status !== 200) return;

              let s = xhr.responseText;

              s = s.replace(/\/\* #{3} (\S+)\s*(.*?)\*\//gs, (a, b, c) => {
                if(!url.startsWith(b)) return a;
                return c;
              });

              w.requestAnimationFrame(() => {
                style.innerHTML = s;
              });
            };
            xhr.open('GET', STYLE_URL);
            xhr.send(null);

            return sr;
          }
        });

        disableEventListeners();

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          const whiteList = [
            'https://www.youtube.com/',
          ];

          if(!whiteList.some(a => url.startsWith(a))){
            let loaded = 0;

            document.addEventListener('DOMContentLoaded', () => {
              loaded = 1;
            });

            const f = () => {
              let e;

              for(e of qsa('video')){
                e.autoplay = false;
                e.currentTime = 0;
              }

              if(!loaded) setTimeout(f);
            };

            f();

            proxify(w.Node.prototype, 'appendChild', {
              apply(f, t, args){
                const e = args[0];

                if(e.tagName === 'VIDEO'){
                  e.autoplay = false;
                  e.currentTime = 0;
                }

                args[0] = e;
                const result = f.apply(t, args);

                return result;
              }
            });
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        proxify(w, 'Promise', {
          construct(f, args){
            var promise = new f(...args);
            promise.catch(nop);
            return promise;
          }
        });

        proxify(w, 'eval', {
          apply(f, t, args){
            if(`${args[0]}`.includes('payload')) return nop;
            return f.apply(t, args);
          }
        });

        proxify(w, 'fetch', {
          apply(f, t, args){
            var promise = f.apply(t, args);
            promise.catch(nop);
            return promise;
          }
        });

        proxify(w.Function.prototype, 'toString', {
          apply(f, t, args){
            if(symbol in t) return t[symbol];
            return f.apply(t, args);
          }
        });

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        (proxify => {
          var textBlackList = [
          ];

          var textReplacement = 'ctx';

          var emojiReg = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+/g;

          proxify = ((proxify, ctx) => {
            return (prop, func) => {
              return proxify(ctx, prop, {
                apply: func,
              });
            };
          })(proxify, w.CanvasRenderingContext2D.prototype);

          proxify('measureText', filterText);
          proxify('strokeText', filterText);
          proxify('fillText', filterText);

          function filterText(f, g, args){
            var str = String(args[0]);
            var fs = g.fillStyle;

            str = str.replace(emojiReg, '');
            if(textBlackList.some(a => a.test(str))) str = textReplacement;

            args[0] = str;
            return f.apply(g, args);
          }

          function reload(){
            var style = document.body.style;

            style.setProperty('display', 'none', 'important');
            style.setProperty('visibility', 'hidden', 'important');
            style.setProperty('opacity', '0', 'important');
            
            window.location.reload();

            return nop;
          }
        })(proxify);

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var href = w.location.href;

        if(href.startsWith('https://www.youtube.com/') && !href.includes('&list=')) (() => {
          proxify(w.Node.prototype, 'appendChild', {
            apply(f, t, args){
              var result = f.apply(t, args);
              var elem = args[0];

              if(elem.tagName === 'IFRAME'){
                try{
                  ublockFunc(elem.contentWindow);
                }catch(e){}
              }

              return result;
            }
          });

          proxify(w.History.prototype, 'pushState', {
            apply(f, t, args){
              var url = args[2];

              w.location.href = url;
              w.document.body.innerHTML = '';

              return nop;
            }
          });

          proxify(w.History.prototype, 'replaceState', {
            apply(f, t, args){
              var url = args[2];

              if(url === w.location.href)
                return nop;

              w.location.href = url;
              w.document.body.innerHTML = '';

              return nop;
            }
          });
        })();

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(0){
          const a = [window];
          const b = ['scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight', 'scrollIntoView', 'scrollIntoViewIfNeeded', 'scroll', 'scrollTo', 'scrollBy'];

          a.forEach(a => {
            b.forEach(b => {
              Object.defineProperty(a, b, {value: nop});
            });
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(0){
          const info = (...args) => {
            log(...args.map(arg => {
              if(!paths.has(arg)) return arg;
              return `~${paths.get(arg)}~`;
            }));

            debugger;
          };

          const B = Object;
          const dp = B.defineProperty;
          const gd = B.getOwnPropertyDescriptors;

          const map = new WeakMap();
          const proxies = new Set();
          const paths = new WeakMap();
          const pds = new WeakMap();

          const P = (t, m=0, prev=null, path=null) => {
            if(proxies.has(t)) return t;
            if(pds.has(t)) return pds.get(t);

            let tt = 1;

            if(t === null || !(typeof t === 'object' || typeof t === 'function')){
              if(!(m && (t === undefined || t === null))) return t;

              if(m === 1) t = {};
              else if(m === 2) t = function(){ return '1'; };

              if(path === null)
                path = m === 1 ? 'obj' : 'func';

              tt = 0;
            }

            let b = map.get(t);

            if(!b){
              if(tt) info(t, 'PROXIFY');

              b = new Proxy(t, {
                getPrototypeOf(t){
                  let r = B.getPrototypeOf(t);
                  info(t, 'GET_PROTO', r);
                  return P(r, m, t, '[[proto]]');
                },

                setPrototypeOf(t, v){
                  info(t, 'SET_PROTO');
                  B.setPrototypeOf(t, v);
                  return 1;
                },

                isExtensible(t){
                  let r = B.isExtensible(t);
                  info(t, 'IS_EXTENSIBLE', r);
                  return r;
                },

                preventExtensions(t){
                  info(t, 'PREVENT_EXTS');
                  B.preventExtensions(t);
                  return 1;
                },

                getOwnPropertyDescriptor(t, p){
                  let r = m ? gd(Object.create(null), '') : gd(t)[p];
                  info(t, 'DESC', p, r);
                  return r;
                },

                defineProperty(t, p, d){
                  info(t, 'DEFINE_PROP', p, d);
                  dp(t, p, d);
                  return 1;
                },

                has(t, p){
                  let r = p in t;
                  info(t, 'HAS', p, r);
                  return r;
                },

                get(t, p){
                  let r = typeof t === 'function' && [
                    'length', 'name', 'arguments', 'caller', 'prototype',
                  ].includes(p) ? null : t[p];

                  info(t, 'GET', p, r);

                  const isSym = typeof p === 'symbol';
                  let pStr = String(p);
                  if(isSym) pStr = pStr.slice(7, pStr.length - 1);

                  return P(r, m, t, `${
                    isSym || !/^[a-zA-Z\_\$][a-zA-Z0-9\_\$]*$/.test(p) ?
                    `[${pStr}]` : `.${pStr}`
                  }`);
                },
                
                set(t, p, v){
                  info(t, 'SET', p, v);
                  t[p] = v;
                  return 1;
                },

                deleteProperty(t, p){
                  info(t, 'DELETE', p);
                  delete t[p];
                  return 1;
                },

                ownKeys(t){
                  let r = Reflect.ownKeys(t);
                  info(t, 'KEYS', r);
                  return P(r);
                },

                apply(f, t, args){
                  let r = f.apply(P(t, m), args);
                  info(f, 'CALL', t, args, r);
                  return P(r, m, f, '()');
                },

                construct(f, args, t){
                  let r = Reflect.construct(t, args, P(t, m));
                  info(f, 'NEW', t, args, r);
                  return P(r, m, t, `[[new]]()`);
                },
              });

              map.set(t, b);
              proxies.add(b);

              if(path !== null && (prev === null || paths.has(prev))){
                if(prev !== null){
                  const pathPrev = paths.get(prev);
                  const pathNew = pathPrev + path;
                  paths.set(t, pathNew);
                }else{
                  paths.set(t, path);
                }
              }
            }

            return b;
          }

          const L = a => {
            info(a, 'PROTECT');
            const obj = Object.create(null);
            pds.set(obj, a);
            return obj;
          };

          const m = new Set;

          proxify(document, 'getElementById', {
            apply(f, t, args){
              let a = args[0];
              let r = f.apply(t, args);

              if(a === 'a'){
                return {
                  style: {
                    display: '',
                    visibility: '',
                  },
                };
              }

              if(/^a[123]$/.test(a))
                return r;

              //if(!m.has(a)) m.add(a), log('GI', a);
              return r;
            }
          });

          proxify(document, 'querySelector', {
            apply(f, t, args){
              let a = args[0];
              let r = f.apply(t, args);

              if(/^script/.test(a) || [
                '#chitikaAdBlock-0',
                'ins[data-ad-client="ca-pub-8318511014856551"]',
              ].includes(a)){
                //log('QS', a);
                r = P(null, 2, null, `QS(${a})`);
              }
              
              //if(!m.has(a)) m.add(a), log('QS', a);
              return r;
            }
          });

          proxify(document, 'querySelectorAll', {
            apply(f, t, args){
              let a = args[0];
              let r = f.apply(t, args);

              if(a === 'iframe[id^="google_ads_iframe"]'){
                return [{
                  clientHeight: 1,
                  parentNode: document.body,
                }];
              }

              if(a === '.aa > div > div > iframe'){
                return [{
                  src: '',
                }];
              }

              //if(!m.has(a)) m.add(a), log('QSA', a);
              return r;
            }
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function proxify(obj, prop, traps=null){
          var b = traps !== null;
          var proxy, t;

          if(b){
            t = obj[prop];
          }else{
            t = obj;
            traps = prop;
          }

          proxy = new w.Proxy(t, traps);
          proxy[symbol] = `${t}`;

          if(b){
            obj[prop] = proxy;
          }

          return proxy;
        }

        function disableEventListeners(){
          var whiteList = [
          ];

          var url = (w.location.href.match(/^[^\/]+?\:\/{2,3}(.+)/) || [])[1];
          if(whiteList.some(a => url.startsWith(a)))
            return;

          var stage = 0;

          w.addEventListener('load', () => {
            stage = 1;
          });

          block();

          function block(){
            var body = document.body;

            if(body){
              var ee = document.querySelectorAll('*');
              for(var i = 0; i < ee.length; i++){
                var e = ee[i];

                blackListedListeners.forEach(type => {
                  e.removeAttribute(`on${type}`);
                });
              }
            }

            if(stage === 0)
              w.setTimeout(block, 0);
          }
        }
      }

      function injectedWorkerFunc(){
        self.console_ = self.console;
        var log = self.console_.log.bind(self.console_);

        var symbol = Symbol('ublock');
        var toPrim = () => '1';
        var nopf = function(){};

        var nop = proxify(nopf, {
          getPrototypeOf(){ return null; },
          setPrototypeOf(){ return nop; },
          isExtensible(){ return false; },
          preventExtensions(){ return nop; },

          getOwnPropertyDescriptor(t, prop){
            if(prop === 'prototype')
              return Object.getOwnPropertyDescriptor(t, prop);

            return {
              writable: false,
              configurable: true,
            };
          },

          defineProperty(){ return nop; },
          has(){ return nop; },

          get(t, prop){
            if(prop === Symbol.toPrimitive) return toPrim;
            return nop;
          },

          set(){ return true; },
          deleteProperty(){ return nop; },
          ownKeys(){ return ['prototype']; },
          apply(){ return nop; },
          construct(){ return nop; },
        });

        [
          'Worker',
        ].forEach(a => {
          a = a.split`.`;

          var b = a.pop();
          var obj = a.reduce((a, b) => a[b], self);

          Object.defineProperty(obj, b, {
            value: nop,
            writable: false,
          });
        });

        function proxify(obj, prop, traps = null){
          var b = traps !== null;
          var proxy, t;

          if(b){
            t = obj[prop];
          }else{
            t = obj;
            traps = prop;
          }

          proxy = new Proxy(t, traps);
          proxy[symbol] = `${t}`;

          if(b){
            obj[prop] = proxy;
          }

          return proxy;
        }
      }
    };

    ublockFunc();
  };

  var code = `(${script})();`;
  var elem = document.documentElement;

  code = code.replace(/STYLE_URL/g, `'${STYLE_URL}'`);

  elem.setAttribute('onreset', code);
  elem.dispatchEvent(new CustomEvent('reset'));
  elem.removeAttribute('onreset');
})();