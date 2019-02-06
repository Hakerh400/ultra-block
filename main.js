(() => {
  'use strict';

  var stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
    scroll();
  });

  window.addEventListener('load', () => {
    scroll();
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
        var e1 = e.parentNode;
        if(e1.parentNode !== document.body) e1.parentNode.remove();
        else e1.remove();
      }

      if(stage === 0) return setTimeout(block);
    }
  }

  function scroll(){
    if(top.location.href.startsWith('https://www.youtube.com/'))
      return;
    
    try{
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }catch{}
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