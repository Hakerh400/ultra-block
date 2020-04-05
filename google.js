(() => {
  'use strict';

  var stage = 0;

  document.addEventListener('DOMContentLoaded', () => {
    stage = 1;
  });

  const blackList = [
    'stock',
    'depositphotos',
    'gograph',
    'ftcdn',
    'alamy',
    'dreamstime',
    'featurepics',
    'carolweaver',
    'fastly',
    'fotosearch',
    'freepik',
    'whoa',
    'wallpaper',
    '123rf',
    'envato',
    'gettyimages',
    'freeimages',
    'colourbox',
    'cloudfront',
    'fotolibra',
    'photobucket',
    'onepixel',
    'foap',
    'glossboudoir',
    'clipdealer',
    'pixoto',
    'canva.com',
    'clipgoo',
    'barewalls',
    'mp-farm',
    'vexels',
    'meashots',
    'marketplace',
    'sketchuptextureclub',
    'newvision',
    'flickr',
    'dailymail',
    'cdninstagram',
    'w3mirchi',
    'astrologypandit',
    'lookaside',
    'crystalandcomp',
    'pinimg',
    'blogspot',
    'daz3d',
    'wikihow',
    'uidownload',
    'secondlife',
    'artstation',
    'cgivault',
    'etsystatic',
    'wordpress',
    'patreon',
    'shadywady',
    'leadyourlove',
    'epicedgephotography',
    'brainyquote',
    'stack.imgur',
    'uigradients',
    'techdows',
    'askvg',
    'redd.it',
    'javacodegeeks',
    'gogeometry',
    'daily-sudoku',
    'askbobrankin',
    'pcrisk.com',
    'ytimg',
    'yimg',
    'alicdn',
    'narvii',
    'maxpixel',
    'sguru',
    'atgbcentral',
    'cdn.',
    'qygjxz',
    'teamusa',
    'appuals',
    'i1.wp',
    'researchgate',
    'your-camping',
    'uspa',
    'epicgames',
    'proartinc',
    'hdtimelapse',
    'dwh-club',
    'scitepress',
    'motorsport',
    'cariire',
    'blacksmithscafe',
    'images.template.net',
    'averroespress',
    'musicments',
    'vweb.info',
    'rexdixon',
    'www.arto.com',
    'cavotagoo',
    'sciencesource',
    '.gif&',
    'ichef.bbci.co.uk',
  ];

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    block();

    function block(){
      let e;

      for(let e of qsa('.g')){
        if(e.innerHTML.includes('<span>Missing:</span>'))
          e.remove();
      }

      if(e = qs('#center_col')){
        if(!e.innerHTML.includes('(without quotes)')){
          e.classList.add('ublock-safe');
        }else{
          e.remove();
        }
      }

      for(const e of qsa('.islrc > div:not(.ublock-safe), .islrh > div:not(.ublock-safe)')){
        let found = 0;

        for(const span of qsa(e, 'span')){
          if(span.innerText.trim() === 'Product'){
            found = 1;
            break;
          }
        }

        if(!found) for(const link of qsa(e, 'a')){
          const url = link.href.toLowerCase();

          if(blackList.some(a => url.includes(a))){
            found = 1;
            break;
          }
        }

        if(found) e.remove();
        else show(e);
      }

      setTimeout(block, stage ? 1e3 : 0);
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