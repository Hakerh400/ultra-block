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
      var ee, e, i;

      ee = document.querySelectorAll('.pagedlist_item');
      for(i = 0; i < ee.length; i++){
        e = ee[i];

        if(/promoted/i.test(e.innerHTML))
          e.remove();
      }

      if(stage === 1){
        document.body.style.setProperty('opacity', '1', 'important');
      }

      setTimeout(block, stage ? 1e3 : 0);
    }
  }
})();