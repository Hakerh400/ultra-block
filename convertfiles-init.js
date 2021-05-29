(() => {
  'use strict';

  var script = () => {
    (() => {
      'use strict';

      if(window['ublock-convertfiles-init.js']) return;
      window['ublock-convertfiles-init.js'] = true;

      var toPrim = () => '1';

      var nop = new Proxy(function(){}, {
        getPrototypeOf(){ return nop; },
        setPrototypeOf(){ return nop; },
        isExtensible(){ return nop; },
        preventExtensions(){ return nop; },
        getOwnPropertyDescriptor(){ return nop; },
        defineProperty(){ return nop; },
        has(){ return nop; },
        get(a, b){ return b === Symbol.toPrimitive ? toPrim : nop; },
        set(){ return nop; },
        deleteProperty(){ return nop; },
        ownKeys(){ return nop; },
        apply(){ return nop; },
        construct(){ return nop; }
      });

      [
        'eval'
      ].forEach(a => Object.defineProperty(window, a, {get: nop, set: nop}));
    })();
  };

  var code = script.toString();
  code = code.substring(code.indexOf('{') + 1);
  code = code.substring(0, code.length - 1);

  (() => {
    const script = document.createElement('script');
    script.textContent = code;
    document.documentElement.appendChild(script);
    script.remove();
  })();
})();