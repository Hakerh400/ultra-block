(() => {
  'use strict';

  var stage = 0;
  var scrollScheduled = 1;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
    scroll();
  });

  window.addEventListener('load', () => {
    scroll();
  });

  window.addEventListener('scroll', () => {
    scrollScheduled = 0;
  });

  main();

  function main(){
    scroll();
    
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
        const e1 = e.parentNode;
        if(e1){
          const e2 = e1.parentNode;
          if(e2 && e2 !== document.body && !qs(e2, '.download')) e2.remove();
          else e1.remove();
        }
      }

      if(stage === 0) return setTimeout(block);
    }
  }

  function scroll(){
    if(!scrollScheduled) return;
    if(window.location.href.startsWith('https://www.youtube.com/')) return;
    
    if(window.parent.frames.length === 0){
      try{
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }catch{}

      if(window.scrollY !== 0)
        setTimeout(scroll);
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