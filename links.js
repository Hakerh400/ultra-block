(() => {
  'use strict';

  const {href} = top.location;
  
  let stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    const block = () => {
      if(stage === 0){
        for(const e of qsa('a,form'))
          e.removeAttribute('target');
      }

      for(const e of qsa('a:not(.ublock-safe-link)')){
        const {href} = e;

        e.removeAttribute('href');
        show(e);

        e.addEventListener('mousedown', evt => {
          e.href = href;
          setTimeout(() => e.removeAttribute('href'), 1e3);
        });
      }

      setTimeout(() => requestAnimationFrame(block), 100);
    };

    block();
  }

  function show(e){
    e.classList.add('ublock-safe-link');
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