(() => {
  'use strict';

  const blackListedUsers = [
  ];

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
      var e;

      if(e = qs('.d-flex.flex-justify-between.px-3'))
        e.classList.add('container-lg');

      for(e of qsa('table.highlight:not(.ublock-safe)')){
        e.setAttribute('data-tab-size', '2');
        removeSpam(e);
        e.classList.add('ublock-safe');
      }

      for(e of qsa('.js-issue-row:not(.ublock-safe)')){
        const e1 = qs(e, '.opened-by a');
        if(e1 === null) continue;

        const user = e1.innerText.trim().toLowerCase();
        if(blackListedUsers.includes(user)){
          e.remove();
          continue;
        }

        e.classList.add('ublock-safe');
      }

      for(const e of qsa('.BorderGrid-row:not(.ublock-safe)')){
        let found = 0;

        for(const e1 of qsa(e, '.h4.mb-3')){
          if(e1.innerText.trim() === 'Sponsor this project'){
            found = 1;
            break;
          }
        }

        if(found){
          e.remove();
          continue;
        }

        show(e);
      }

      if(stage === 0) setTimeout(block);
    }
  }

  function removeSpam(e){
    var lines = qsa(e, 'tr');
    var str = [...lines].map(a => a.innerText.trim()).join('\n');
    var i = 0;

    do{
      var j = i;

      match(/^(?:\s|(?:'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`(?:\\.|[^`])*`)\s*\;?)*/s);
      match(/^(?:(?:\/\/|\#)[^\n]*\n|\/\*.*?\*\/|""".*?"""|\{\-.*?\-\})/s);
      match(/^\s*/s);
    }while(i !== j);

    if(i === 0) return;

    var n = str.slice(0, i).replace(/[^\n]/g, '').length;
    while(n-- > 0) lines[n].remove();

    function match(reg){
      var m = str.slice(i).match(reg);
      if(m !== null) i += m[0].length;
    }
  }

  function show(e){
    e.classList.add('ublock-safe');
  }

  function qs(a, b=null){
    if(b === null){
      b = a;
      a = document;
    }

    return a.querySelector(b);
  }

  function qsa(a, b=null){
    if(b === null){
      b = a;
      a = document;
    }

    return a.querySelectorAll(b);
  }

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