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

    block();

    function block(){
      for(const e of qsa('video:not(.ublock-safe)')){
        e.muted = 0;
        e.classList.add('ublock-unmuted');

        e.loop = 0;

        e.addEventListener('mousedown', evt => {
          if(evt.button !== 0) return;

          if(e.paused) e.play();
          else e.pause();
        });

        show(e);
      }

      setTimeout(block, stage === 0 ? 0 : 1e3);
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