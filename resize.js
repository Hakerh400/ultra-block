(() => {
  'use strict';

  const url = location.href;

  if(url.startsWith('http://localhost/')) return;
  
  let stage = 0;

  window.addEventListener('load', () => {
    setTimeout(() => {
      stage = 1;
    }, 3e3);
  });

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    block();

    function block(){
      window.dispatchEvent(new Event('resize'));

      if(stage === 0) return setTimeout(block);
    }
  }

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

  function log(...a){
    console.log(...a);
    return a[a.length - 1];
  }
})();