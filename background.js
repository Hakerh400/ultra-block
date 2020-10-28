(() => {
  'use strict';

  const A = 1;

  const inco = chrome.extension.inIncognitoContext;

  var blackList = [
  ];

  var whiteList = [
  ];

  var redirectionsList = [
    [/^www\.google\.(?!co\.uk)/, /\.google\.[^\/]+/, '.google.co.uk'],
    [/^www\.google\.co\.uk\/imgres\?/, /[\s\S]*/, a => unescape(a.match(/[\?\&]imgurl=([^\&]*)/)[1])],
    [/^www\.youtube\.com\/$/, /$/, 'watch?v=7&gl=US'],
    [/^www\.youtube\.com\/(?:channel|user|c)\/[^\/]+$/, /$/, '/videos?flow=grid&view=0'],
    [/^www\.tumblr\.com\/safe-mode\?/, /safe-mode\?[\s\S]*/, a => {
      return `dashboard/blog/${a.match(/(?:\/|%2F)([^%]*?)\.tumblr.com/i)[1]}`;
    }],
  ];

  chrome.webRequest.onBeforeRequest.addListener(evt => {
    if(evt.initiator === 'https://drive.google.com') return;

    var url = evt.url.match(/^[^\/]+?\:\/{2,3}(.+)/)[1];
    var urlLower = url.toLowerCase();

    var redirect = redirectionsList.find(([a]) => a.test(url));
    if(redirect) return {redirectUrl: evt.url.replace(redirect[1], redirect[2])};

    if(inco){
    }

    let match = null;
    
    const testFunc = test => {
      let found = 0;

      if(test instanceof RegExp) found = test.test(url);
      else found = urlLower.includes(test);

      if(found && match === null)
        match = test;

      return found;
    };

    if(evt.url.includes('metamath')) return;

    const cancel = !evt.url.startsWith('file:///') &&
      !whiteList.some(testFunc) &&
      blackList.some(testFunc);

    // if(cancel) log(evt.url, match);

    return {cancel};
  },
    {urls: ['<all_urls>']},
    ['blocking'],
  );

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