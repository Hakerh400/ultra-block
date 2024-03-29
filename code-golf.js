(() => {
  'use strict';

  const {href: url} = top.location;
  
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
      for(const e of qsa('[id$="_license_id"]:not(.ublock-safe)')){
        for(const opt of qsa(e, 'option'))
          if(opt.innerText.includes('CC0'))
            opt.selected = 1;

        show(e);
      }

      /*for(const e of qsa('.container:not(.header--container) a[href*="/users/"]:not(.ublock-safe)')){
        let str = e.innerText.trim();
        if(!str) continue;

        str = str.split('\u{1F637}').join('');
        e.innerText = str;

        show(e);
      }*/

      if(stage === 0)
        return setTimeout(block);
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