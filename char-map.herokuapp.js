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

      var found = false;

      ee = document.querySelectorAll('div');
      for(i = 0; i < ee.length; i++){
        e = ee[i];

        if(!e.children.length && e.innerHTML.includes('Powered By')){
          e.remove();
          found = true;
          break;
        }
      }

      if(found){
        document.body.style.setProperty('opacity', '1', 'important');
        return;
      }

      setTimeout(block, 0);
    }
  };
})();