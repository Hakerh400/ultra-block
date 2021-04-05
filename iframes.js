(() => {
  'use strict';

  if(location.href.startsWith('http://localhost')) return;
  if(location.href.startsWith('https://code.google.com/')) return;
  if(location.href.startsWith('https://mail.google.com/')) return;
  if(location.href.startsWith('https://drive.google.com/')) return;
  if(location.href.startsWith('https://npm.runkit.com/')) return;
  if(location.href.startsWith('https://translate.google.co.uk/')) return;

  var whiteList = [
    'mail.google.com',
    'productforums.google.com',
    'js1k.com',
    'www.mediafire.com',
    'www.twitch.tv',
    'mail.inbox.lv',
    'jsfiddle.net',
    'codepen.io',
    
    /^[^\.]+\.tumblr\.com$/,
  ];

  var url = window.location.href.match(/^[^\/]+?\:\/{2,3}([^\/]+)/)[1];
  var allowed = whiteList.some(a => {
    if(typeof a === 'string')
      return url == a
    return a.test(url);
  });

  main();

  function main(){
    if(!document.body) return setTimeout(main);

    block();

    function block(){
      var ee, e, i;

      ee = document.querySelectorAll('iframe');
      for(i = 0; i < ee.length; i++){
        e = ee[i];

        if(allowed){
          e.style.setProperty('visibility', 'visible', 'important');
          e.style.setProperty('opacity', '1', 'important');
        }else{
          e.remove();
        }
      }

      setTimeout(block, 1e3);
    }
  };
})();