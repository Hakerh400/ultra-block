(() => {
  'use strict';

  var stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    block();

    function block(){
      var e;

      for(e of qsa('.pagedlist_item:not(.ublock-safe)')){
        if(/promoted|(?:sponsored|ads?) +by /i.test(e.innerText)) e.remove();
        else e.classList.add('ublock-safe');
      }

      for(e of qsa('.UnifiedAnswerPagedList:not(.ublock-safe)')){
        if(/\bad +by /i.test(e.innerText)) e.remove();
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