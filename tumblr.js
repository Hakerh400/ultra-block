(() => {
  'use strict';

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

      for(e of qsa('.tx-button.show-me'))
        e.click();

      for(e of qsa('.post_media:not(.ublock-safe),.reblog-content:not(.ublock-safe)')){
        const img = qs(e, 'img');
        if(!img) continue;

        const link = qs(e, 'a');
        if(link){
          link.href = link.hasAttribute('data-big-photo') ?
            link.getAttribute('data-big-photo') :
            img.src;
        }else{
          const link = document.createElement('a');
          link.href = img.src;
          e.appendChild(link);
          link.appendChild(img);
        }

        show(e);
      }

      /*e = document.querySelector('.main>.photo img');
      if(e){
        var src = e.src;
        window.location.href = src;
      }*/

      setTimeout(block, stage === 0 ? 1 : 1e3);
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