(() => {
  'use strict';

  var script = () => {
    (() => {
      'use strict';

      if(window['ublock-wikihow-init.js']) return;
      window['ublock-wikihow-init.js'] = true;

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

      var classNamesBlackList = [
        'sticking',
      ];

      Object.defineProperty(Element.prototype, 'className', {
        get(){
          return [...this.classList].join(' ');
        },

        set(className){
          var list = this.classList;

          [...list].forEach(item => list.remove(item));

          className.trim().split(/\s+/).forEach(item => {
            if(classNamesBlackList.includes(item)) return;
            list.add(item);
          });
        },
      });

      function proxify(obj, prop, traps=null){
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
    })();
  };

  var code = script.toString();
  code = code.substring(code.indexOf('{') + 1);
  code = code.substring(0, code.length - 1);

  document.documentElement.setAttribute('onreset', code);
  document.documentElement.dispatchEvent(new CustomEvent('reset'));
  document.documentElement.removeAttribute('onreset');
})();