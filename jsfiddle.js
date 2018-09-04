(() => {
  'use strict';

  main();

  function main(){
    if(!document.body) return setTimeout(main);

    block();

    function block(){
      var ee, e, i, j;

      ee = document.querySelectorAll('#s-bottom');
      for(i = 0; i < ee.length; i++){
        e = ee[i];

        e.remove();
      }

      setTimeout(block, 1e3);
    }
  };
})();