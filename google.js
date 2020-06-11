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
    'youtube',
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
    'facebook',
    'memecenter',
    'fastcompany',
    'forex24',
    'bymarkets',
    'actualitix',
    'fx-exchange',
    'dailyfx',
    'parkersydnorhistoric',
    'fotocrats',
    'theguardian',
    'sciencephoto',
    'arttournament',
    'twenty20',
    'pinterest',
  ];

  main();

  function main(){
    if(!document.body)
      return setTimeout(main);

    block();

    function block(){
      let e;

      checkSearchResults: for(const e of qsa('.g:not(.ublock-safe),.cLjAic:not(.ublock-safe)')){
        for(const span of qsa(e, 'span')){
          if(span.innerText.trim() === 'Missing:'){
            e.remove();
            continue checkSearchResults;
          }
        }

        for(const e1 of qsa(e, 'h2,div[role="heading"]')){
          if(e1.innerText.trim() === 'People also ask'){
            e.remove();
            continue checkSearchResults;
          }

          if(e1.innerText.trim() === 'Notable moments'){
            e.remove();
            continue checkSearchResults;
          }
        }

        for(const link of qsa(e, 'a')){
          if(/books.google.com/.test(link.href)){
            e.remove();
            continue checkSearchResults;
          }
        }

        show(e);
      }

      if(e = qs('#center_col')){
        if(!e.innerHTML.includes('(without quotes)')){
          e.classList.add('ublock-safe');
        }else{
          e.remove();
        }
      }

      imgLoop: for(const e of qsa('.islrc > div:not(.ublock-safe), .islrh > div:not(.ublock-safe)')){
        find: {
          let hasLink = 0;
          let hasImg = 0;

          for(const span of qsa(e, 'span'))
            if(span.innerText.trim() === 'Product')
              break find;

          if(qs(e, 'div[aria-label="Click for video information"]'))
            break find;

          for(const link of qsa(e, 'a')){
            const url = link.href.toLowerCase();
            if(url === '') continue;

            hasLink = 1;

            if(blackList.some(a => url.includes(a)))
              break find;
          }

          for(const img of qsa(e, 'img')){
            const url = img.src.toLowerCase();
            if(url === '') continue;

            hasImg = 1;

            if(blackList.some(a => url.includes(a)))
              break find;
          }

          if(!(hasLink || hasImg))
            continue imgLoop;

          show(e);
          continue imgLoop;

        }

        e.remove()
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