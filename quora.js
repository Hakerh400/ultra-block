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

      for(e of qsa('.pagedlist_item:not(.ublock-safe)')){
        if(/promoted/i.test(e.innerHTML)) e.remove();
        else e.classList.add('ublock-safe');
      }

      for(e of qsa('.UnifiedAnswerPagedList:not(.ublock-safe)')){
        if(/ ad  by /i.test(e.innerHTML)) e.remove();
        else e.classList.add('ublock-safe');
      }

      if(stage === 0) return setTimeout(block);
      document.body.classList.add('ublock-safe');
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