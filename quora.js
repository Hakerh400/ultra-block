(() => {
  'use strict';

  let stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    block();

    function block(){
      for(const e of qsa('.q-box.qu-py--medium.qu-textAlign--center.qu-borderTop')){
        e.remove();
      }

      for(const e of qsa('.q-box:not(.ublock-safe)')){
        if(e.innerText.trim() === 'Related Questions'){
          e.closest('div:not([class])').remove();
          continue;
        }

        show(e);
      }

      for(const e of qsa('.spacing_log_answer_content:not(.ublock-safe)')){
        const btn = [...qsa(e, '.q-click-wrapper')].find(a => a.innerText.trim() === 'Continue Reading');
        if(btn) btn.click();
        
        show(e);
      }

      for(const e of qsa('.pagedlist_item:not(.ublock-safe)')){
        if(!e.closest('.answer_text_small')){
          e.remove();
          continue;
        }

        const str = e.innerText.trim();
        if(str.length === 0) continue;

        if(/promoted|(?:sponsored|ads?) +by /i.test(e.innerText)){
          e.remove();
          continue;
        }

        e.classList.add('ublock-safe');
      }

      for(const e of qsa('.UnifiedAnswerPagedList:not(.ublock-safe)')){
        if(!e.closest('.answer_text_small')){
          e.remove();
          continue;
        }

        const str = e.innerText.trim();
        if(str.length === 0) continue;

        if(/\bad +by /i.test(e.innerText)){
          e.remove();
          continue;
        }

        e.classList.add('ublock-safe');
      }

      setTimeout(block, stage ? 1e3 : 0);
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