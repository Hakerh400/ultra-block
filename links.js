(() => {
  'use strict';

  if(window.location.href.startsWith('http://localhost/')) return;

  main();

  function main(){
    if(!document.body) return setTimeout(main);

    block();

    function block(){
      var ee, e, i, j;

      ee = document.querySelectorAll('a:not(*[target=""]),form:not(*[target=""])');
      for(i = 0; i < ee.length; i++){
        e = ee[i];
        
        try{
          e.removeAttribute('target');
        }catch{}
        
        e.style.setProperty('opacity', '1', 'important');
      }

      setTimeout(block, 1e3);
    }
  }

  function log(...a){
    console.log(...a);
    return a[a.length - 1];
  }
})();