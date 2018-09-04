(() => {
  'use strict';

  var blackList = [
  ];

  var stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    block();

    function block(){
      var e;

      for(e of qsa('.photo-item:not(.ublock-safe):not(.ublock-unsafe)')){
        var link = qs(e, 'a');
        link.removeAttribute('title');

        var url = link.href;

        var found = blackList.some(item => {
          if(item instanceof RegExp) return item.test(url);
          return url.includes(item);
        });

        if(found) e.classList.add('ublock-unsafe');
        else e.classList.add('ublock-safe');
      }

      setTimeout(block, stage ? 1e3 : 0);
    }
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