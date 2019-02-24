(() => {
  'use strict';

  var script = () => {
    'use strict';

    var ublockFunc = (w=top) => {
      const scriptName = '9gag';

      const wScriptProp = `ublock-${scriptName}-init.js`;
      if(w[wScriptProp]) return;
      w[wScriptProp] = true;

      main();

      function main(){
        const log = (w.console_ || console).log;

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

        [
          'google',
        ].forEach(a => {
          a = a.split`.`;

          var b = a.pop();
          var obj = a.reduce((a, b) => a[b], w);

          Object.defineProperty(obj, b, {
            value: nop,
            writable: false,
          });
        });

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const vidSym = Symbol('video');

        w.addEventListener('click', evt => {
          let e;

          if(!(e = evt.target.closest('.post-view'))) return;
          if(!(e = e.querySelector('video'))) return;

          if(e.paused) e.play(vidSym);
          else e.pause(vidSym);
        });

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        proxify(HTMLVideoElement.prototype, 'play', {
          apply(f, t, args){
            if(args[0] !== vidSym) return nop;
            return f.apply(t, []);
          }
        });

        proxify(HTMLVideoElement.prototype, 'pause', {
          apply(f, t, args){
            if(args[0] !== vidSym) return nop;
            return f.apply(t, []);
          }
        });
        
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
      }
    };

    ublockFunc();
  };

  var code = `(${script})();`;
  var elem = document.documentElement;

  elem.setAttribute('onreset', code);
  elem.dispatchEvent(new CustomEvent('reset'));
  elem.removeAttribute('onreset');
})();