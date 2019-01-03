(() => {
  'use strict';

  var blackList = [
  ];

  var whiteList = [
  ];

  var redirectionsList = [
  ];

  chrome.webRequest.onBeforeRequest.addListener(evt => {
    var url = evt.url.match(/^[^\/]+?\:\/{2,3}(.+)/)[1];
    var urlLower = url.toLowerCase();

    var redirect = redirectionsList.find(([a]) => a.test(url));
    if(redirect) return {redirectUrl: evt.url.replace(redirect[1], redirect[2])};

    var testFunc = a =>{
      if(a instanceof RegExp) return a.test(url);
      return urlLower.includes(a);
    };

    return {cancel: !whiteList.some(testFunc) && blackList.some(testFunc)};
  },
    {urls: ['<all_urls>']},
    ['blocking'],
  );

  chrome.webRequest.onHeadersReceived.addListener(evt => {
    var headers = evt.responseHeaders;

    for(var i = 0; i < headers.length; i++){
      var header = headers[i];
      var name = header.name.toLowerCase();
      var value = header.value;

      if(name === 'content-security-policy'){
        header.value = '';
      }
    }

    return {
      responseHeaders: headers,
    };
  }, {
    urls: ['<all_urls>'],
    types: ['main_frame', 'sub_frame'],
  }, [
    'blocking',
    'responseHeaders',
  ]);

  function decode(str){
    return str.split('').
      map(a => a.charCodeAt(0) - 32).
      map(a => 94 - a).
      map(a => String.fromCharCode(32 + a)).
      join('');
  }
})();