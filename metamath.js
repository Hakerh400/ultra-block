(() => {
  'use strict';

  const {href: url} = top.location;
  const spam = decode(';/.%,576*');
  
  document.addEventListener('DOMContentLoaded', () => {
    const {body} = document;

    const removeSpam = () => {
      let e = body;

      while(1){
        const ch = [...e.children];
        if(ch.length === 0) break;

        const chNum = ch.length;
        let index = -1;

        for(let i = chNum - 1; i !== -1; i--){
          if(ch[i].tagName === 'HR'){
            index = i;
            break;
          }
        }

        if(index === -1){
          e = ch[0];
          continue;
        }

        for(let i = chNum - 1; i !== index - 1; i--){
          const e = ch[i];
          const str = e.innerText.toLowerCase();

          e.remove();

          if(str.includes(spam)){
            let found = 0;

            for(let j = index; j < i; j++){
              if(qs(ch[j], 'table')){
                found = 1;
                break;
              }
            }

            if(found) break;

            for(let j = index; j < i; j++)
              ch[j].remove();

            break;
          }
        }

        break;
      }

      body.classList.add('ublock-show-gifs');

      show(body);
    };

    removeSpam();
  });

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