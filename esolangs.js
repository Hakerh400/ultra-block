(() => {
  'use strict';

  const {href} = top.location;
  
  let stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    for(const e of qsa('span.ed:not(.ublock-safe)')){
      const children = [...e.childNodes];
      const index = children.findIndex(a => a instanceof Text && a.textContent === ' has quit (');

      if(index === -1){
        show(e);
        continue;
      }

      const text = children[index];
      text.textContent = text.textContent.replace(' (', '.');

      for(let i = index + 1; i !== children.length; i++)
        children[i].remove();

      show(e);
    }

    setTimeout(main, stage ? 1e3 : 0);
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