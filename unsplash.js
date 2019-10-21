(() => {
  'use strict';

  const {href} = top.location;

  const blackList = [
    decode('^6)<<29'),
    decode('^6/09+*'),
  ];

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
      let e;

      {loop: for(e of qsa('figure[itemprop="image"]')){
        const html = e.innerHTML.toLowerCase();
        for(const str of blackList){
          if(html.includes(str)){
            e.remove();
            continue loop;
          }
        }
        // show(e);
      }}

      requestAnimationFrame(block);
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