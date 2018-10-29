(() => {
  'use strict';

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

      for(e of qsa('#searchResult:not(.ublock-safe)')){
        if(qs(e, '.hide_your_ip_btn')) e.remove();
        else e.classList.add('ublock-safe');
      }

      for(e of qsa('a[href="https://bitcoin.org"]')){
        e.parentNode.parentNode.remove();
      }

      if(stage === 0) return setTimeout(block);
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