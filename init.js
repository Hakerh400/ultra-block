(() => {
  'use strict';

  if(location.href.startsWith('file:///')) return;
  if(location.href.startsWith('http://localhost/')) return;
  if(location.href.startsWith('https://hakerh400.github.io/')) return;

  var STYLE_URL = chrome.runtime.getURL('main.css');

  var script = () => {
    'use strict';

    var ublockFunc = (w=top) => {
      if(w['ublock-init.js']) return;
      w['ublock-init.js'] = true;

      var injectedWorkerCode = `(${injectedWorkerFunc})();`;

      main();

      function main(){
        window.qsa = a => [...document.querySelectorAll(a)];

        w.console_ = w.console;
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

        Object.defineProperty(w.navigator, 'userAgent', {
          get(){
            return `Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3555.2 Safari/537.36`;
            return `Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36`;
            return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36`;
          }
        });

        [
          'console',
          'alert',
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
              evt.preventDefault('ublock');
              evt.stopPropagation('ublock');
              document.body.innerHTML = '';
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
            if(args[0] !== 'ublock' && blackListedListeners.some(type => type === t.type)) return nop;
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

        proxify(w.Element.prototype, 'attachShadow', {
          apply(f, t, args){
            var d = w.document;
            var sr = f.apply(t, args);

            var style = d.createElement('link');
            style.rel = 'stylesheet';
            style.href = STYLE_URL;
            sr.appendChild(style);

            return sr;
          }
        });

        disableEventListeners();

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

        var href = top.location.href;

        if(href.startsWith('https://www.youtube.com/')/* && !href.includes('&list=')*/) (() => {
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

              top.location.href = url;
              top.document.body.innerHTML = '';

              return nop;
            }
          });

          proxify(w.History.prototype, 'replaceState', {
            apply(f, t, args){
              var url = args[2];

              if(url === top.location.href)
                return nop;

              top.location.href = url;
              top.document.body.innerHTML = '';

              return nop;
            }
          });
        })();

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