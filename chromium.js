(() => {
  'use strict';

  var stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    block();

    function block(){
      for(var e of qsa('video[controls]'))
        e.removeAttribute('controls');

      if(stage === 0)
        setTimeout(block, 1e3);
    }
  }

  function qsa(a){
    return document.querySelectorAll(a);
  }
})();