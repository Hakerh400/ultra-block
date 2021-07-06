(() => {
  'use strict';

  var script = () => {
    'use strict';

    var ublockFunc = (w=window) => {
      const scriptName = 'blank';

      const wScriptProp = `ublock-${scriptName}-init.js`;
      if(w[wScriptProp]) return;
      w[wScriptProp] = 1;

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

        const url = location.href.match(/^[^\/]+?\:\/{2,3}(.+)/)[1];

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let latitude = 36.3931395;
        let longitude = 25.4614646;
        let accuracy = 1;

        class Geolocation{
          getCurrentPosition(succCb, failCb, opts){
            const coords = new GeolocationCoordinates(latitude, longitude, accuracy);
            const pos = new GeolocationPosition(coords);

            setTimeout(() => succCb(pos));
          }

          watchPosition(){
            return nop;
          }
        }

        class GeolocationPosition{
          constructor(coords){
            this.coords = coords;
            this.timestamp = Date.now();
          }
        }

        class GeolocationCoordinates{
          constructor(latitude, longitude, accuracy){
            this.latitude = latitude;
            this.longitude = longitude;
            this.altitude = null;
            this.accuracy = accuracy;
            this.altitudeAccuracy = null;
            this.heading = null;
            this.speed = null;
          }
        }

        Object.defineProperty(navigator, 'geolocation', {
          value: new Geolocation(),
        });
        
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  (() => {
    const script = document.createElement('script');
    script.textContent = code;
    document.documentElement.appendChild(script);
    script.remove();
  })();
})();