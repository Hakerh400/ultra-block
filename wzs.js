(() => {
  'use strict';

  const {href} = top.location;
  
  let stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  window.addEventListener('keydown', evt => {
    const elem = document.activeElement;
    const tag = elem ? elem.tagName.toLowerCase() : null;

    if(evt.code === 'KeyD' && !evt.ctrlKey && !evt.shiftKey){
      if(tag !== 'input' && tag !== 'textarea'){
        const e = qs('a.play[sample]');
        const url = e.getAttribute('sample');

        const link = document.createElement('a');
        link.target = 'blank_';
        link.href = url;
        link.download = `${href.match(/(\d+)\.html$/)[1]}.mp3`;
        link.click();

        return;
      }
    }
  });

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    block();

    function block(){
      for(const e of qsa('#sample-form > div:first-child:not(.ublock-safe)')){
        log(e);
        const btn = qs(e, '#sample_sending_mode_1');
        if(!btn) continue;
        btn.click();
        show(e);
      }

      for(const e of qsa('.sample-box-comment:not(.ublock-safe):not(.ublock-unsafe)')){
        if(qs(e, 'b'))
          e.innerText = '';

        show(e);
      }

      setTimeout(block, stage ? 1e3 :  0);
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