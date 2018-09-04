(() => {
  'use strict';

  if(!/^https\:\/\/[^\.]+\.tumblr\.com\/post/.test(window.location.href)) return;

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

      e = document.querySelector('.main>.photo img');
      if(e){
        var src = e.src;
        window.location.href = src;
      }

      if(stage === 1)
        return;

      setTimeout(block, 1e3);
    }
  }
})();