(() => {
  'use strict';

  var stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  main();

  function main(){
    if(!document.body) return setTimeout(main);

    block();

    function block(){
      var ee, e, i;

      ee = document.querySelectorAll('._5pbx.userContent._3576');
      for(i = 0; i < ee.length; i++){
        e = ee[i];

        e = e.querySelector('.hidden_elem');
        if(!e) continue;
        
        e.style.setProperty('display', 'block', 'important');
      }

      setTimeout(block, stage ? 1e3 : 0);
    }
  };
})();