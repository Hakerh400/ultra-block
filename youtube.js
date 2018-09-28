(() => {
  'use strict';

  const O = {
    enum(arr){
      var obj = O.obj();
      obj.name = index => arr[index];

      arr.forEach((name, index) => {
        obj[name] = index;
      });

      return obj;
    },

    cap(str, lowerOthers=0){
      if(lowerOthers) str = str.toLowerCase();
      return `${str[0].toUpperCase()}${str.substring(1)}`;
    },

    obj(proto=null){ return Object.create(proto); },
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const ENABLE_DOW = 0;
  const PORT = 27000;

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const stats = O.enum([
    'NOT_QUEUED',
    'DOWNLOADING',
    'DOWNLOADED',
  ]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const blackList = [
  ];

  const requiredWhiteList = [
  ];

  const timeOffsetsList = [
  ];

  timeOffsetsList.forEach(a => {
    if(a.length === 3)
      a.push([null, null, null, null]);
  });

  const symbs = [
    'status',
  ].map(a => Symbol(a));

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  var musicMode = 0;

  var waitTimeBody = 3e3;
  var waitTimeItems = 5e3;

  var emptyTimeOffsets = [null, null, null, [null, null, null, null]];

  var safeElem = document.createElement('input');
  safeElem.style.display = 'none';
  safeElem.id = 'ublock_safe';
  safeElem.type = 'hidden';
  safeElem.value = 0;

  main();

  function main(){
    var url = window.location.href;
    var focused = musicMode;
    var disabledSearch = false;
    var debugMode = false;
    var ended = false;
    var currentSrc = null;

    var lastAction = Date.now();

    aels();

    ((f,g=()=>f(g)) => g())(f => {
      if(!document.body) return setTimeout(f);
      lastAction = Date.now();
      block();
    });

    function aels(){
      window.addEventListener('keydown', evt => {
        var activeElem = document.activeElement;

        if(activeElem){
          var tag = activeElem.tagName;
          if(tag === 'INPUT' || tag === 'TEXTAREA') return false;
        }

        if(evt.code === 'Space' || evt.code === 'ArrowLeft' || evt.code === 'ArrowRight')
          return;

        switch(evt.code){
          case 'KeyQ': toggleControls(evt); break;
          case 'KeyW': toggleRelated(evt); break;
          case 'KeyE': toggleDescription(evt); break;
          case 'KeyR': toggleComments(evt); break;
          case 'KeyA': evt.preventDefault(); musicMode ^= 1; break;

          case 'KeyD':
            evt.preventDefault();

            var urls = [
              sessionStorage.ublockYTAudio,
              sessionStorage.ublockYTVideo,
            ];

            server({
              type: 'download',
              id: top.location.href.match(/[\?\&]v\=([^\&\#]+)/)[1],
              channel: qs('#owner-name.ytd-video-owner-renderer').innerText.trim(),
              title: document.title.substring(0, document.title.length - 10),
              urls,
            });
            break;

          case 'F8':
            debugMode = true;
            evt.preventDefault();
            break;
        }
      });

      window.addEventListener('mousedown', evt => {
        if(evt.button !== 0) return;
        if(!evt.target.closest('a:not(.ytd-toggle-button-renderer)')) return;

        lastAction = Date.now();

        var ee, e, i;

        ee = document.querySelector('#items');
        if(ee){
          ee = ee.querySelectorAll('.style-scope.ytd-watch-next-secondary-results-renderer');
          for(i = 0; i < ee.length; i++){
            e = ee[i];
            hide(e);
          }
        }

        toggleVideo(false);
        toggleRelated(null, true);

        ended = false;
      });

      window.addEventListener('mousemove', evt => {
        if(musicMode) return;

        focused = true;
      });

      window.addEventListener('focus', evt => {
        if(musicMode) return;

        if(focused){
          toggleRelated(null, true);
        }

        focused = true;
      });

      window.addEventListener('blur', evt => {
        if(musicMode) return;

        if(focused){
          toggleRelated(null, true);
        }

        focused = false;
      });
    }

    function block(){
      if(debugMode){
        debugMode = false;
        debugger;
      }

      var canShowBody = Date.now() - lastAction > waitTimeBody;
      var canShowItems = Date.now() - lastAction > waitTimeItems;

      var eee, ee, e, i, j;

      if(!disabledSearch)
        disabledSearch = tryToDisableSearch();

      e = document.querySelector('input[id="search"][disabled]');
      if(e){
        e.value = '';
        e.blur();
        e.removeAttribute('autofocus');
      }

      eee = document.querySelectorAll('#items');
      for(i = 0; i < eee.length; i++){
        ee = eee[i].querySelectorAll('.style-scope.ytd-watch-next-secondary-results-renderer');

        for(j = 0; j < ee.length; j++){
          e = ee[j];
          if(!e.querySelector('.ublock_safe')) continue;

          var html = e.innerHTML;

          if(blackList.some(a => a.test(html)) || !requiredWhiteList.every(a => a.test(html))){
            if(1){
              e.remove();
            }else{
              if(canShowItems) show(e);
              e.style.backgroundColor = 'red';
            }
          }else{
            if(canShowItems) show(e);
          }
        }
      }

      ee = document.querySelectorAll('#video-title:not(*[class*="ublock_safe"])');
      for(i = 0; i < ee.length; i++){
        e = ee[i];
        if(e[symbs.status]) continue;
        e[symbs.status] = 1;

        var url;
        if(e.className === 'A') url = e.href;
        else url = e.closest('a').href;

        if(requiredWhiteList.length !== 0){
          e.classList.add('ublock_safe');
          continue;
        }
        
        rf(url, e, updateTitle);
      }

      if(/[\?\&]v\=/.test(top.location.href)){
        ee = document.querySelectorAll('h1.title');
        for(i = 0; i < ee.length; i++){
          e = ee[i];
          if(e[symbs.status]) continue;
          e[symbs.status] = 1;

          if(requiredWhiteList.length !== 0){
            e.classList.add('ublock_safe');
            continue;
          }
          
          updateStat(e);
        }
      }

      if(url !== window.location.href){
        url = window.location.href;
        if(/^www\.youtube\.com\/(?:channel|user)\/[^\/]+$/.test(url.match(/^[^\/]+?\:\/\/(.+)/)[1])){
          hide(document.documentElement);
          window.location.href = url.replace(/$/, '/videos');
        }
      }

      var video = document.querySelector('video');
      if(video){
        if(!video.ublock_videoListeners){
          video.ublock_ytVideoListeners = true;

          video.onended = () => {
            ended = true;
          };
        }

        checkVideoTime();

        if(currentSrc !== video.currentSrc){
          ended = false;
        }

        if(musicMode && !ended && video.paused && currentSrc !== video.currentSrc){
          currentSrc = video.currentSrc;
          playVideo();
        }
      }

      url = window.location.href;
      setTimeout(block, !focused || canShowBody ? 1e3 : 0);
    }

    function checkVideoTime(){
      safeElem.remove();
      document.body.appendChild(safeElem);

      var elem = document.querySelector('.ytd-video-owner-renderer a');
      var video = document.querySelector('video');
      if(!(elem && video)) return;

      toggleVideo(true);

      var channel = elem.innerText.trim();
      var timeOffsets = timeOffsetsList.find(([ch]) => ch === channel);

      if(!timeOffsets){
        updateOverlayElem(emptyTimeOffsets);
        return video.ublock_start = 0;
      }

      updateOverlayElem(timeOffsets);

      var duration = video.duration;
      var start = timeOffsets[1];
      var end = duration - timeOffsets[2];
      var time = video.currentTime;

      video.ublock_start = start;

      if(time < start){
        pauseVideo();
        video.currentTime = start;
        return;
      }

      if(time > end && time != duration){
        pauseVideo();
        video.currentTime = duration;
        ended = true;
        return;
      }
    }

    function updateOverlayElem(timeOffsets){
      var elem = document.querySelector('#ublock_yt-overlay');

      if(!elem){
        var elem = document.createElement('input');
        document.body.appendChild(elem);
        elem.type = 'hidden';
        elem.style.display = 'none';
        elem.id = 'ublock_yt-overlay';
      }

      elem.value = JSON.stringify(timeOffsets[3]);
    }

    function tryToDisableSearch(){
      var e = document.querySelector('input[id="search"]');
      if(!e) return false;

      if(e !== document.activeElement){
        e.value = '';
        e.disabled = true;
      }

      var ee = e.parentNode;

      ee.addEventListener('click', () => {
        e.disabled = false;
        e.focus();
      });

      e.addEventListener('blur', () => {
        e.value = '';
        e.disabled = true;
      });

      return true;
    }

    function toggleVideo(s){
      var video = document.querySelector('video');
      if(!video) return;

      if(s) show(video);
      else hide(video);
    }

    function toggleControls(evt){
      var selectors = [
        '.ytp-chrome-bottom',
        '.ytp-popup.ytp-settings-menu',
        '.ytp-tooltip.ytp-bottom',
      ];

      if(!toggleControls.elem){
        var elem = document.createElement('div');
        document.head.appendChild(elem);

        elem.style.width = '0px';
        elem.style.height = '0px';

        toggleControls.elem = elem;
      }

      var mainElem = toggleControls.elem;
      toggleElem(mainElem);

      return selectors.reduce((a, selector) => {
        if(toggleElem(selector, evt, mainElem)){
          var parent = document.querySelector(selector);
          var ee, e, i;

          ee = parent.querySelectorAll('*');
          for(i = 0; i < ee.length; i++){
            e = ee[i];
            toggleElem(e, null, mainElem);
          }

          return true;
        }

        return a;
      }, false);
    }

    function toggleRelated(evt, forceHide = false){
      var selector = '#items.style-scope.ytd-watch-next-secondary-results-renderer,yt-next-continuation,*[id*="continuation"],*[class*="continuation"]';
      var toggled = toggleElem(selector, evt);
      if(!toggled) return false;

      if(forceHide){
        var elems = document.querySelectorAll(selector);
        for(var i = 0; i < elems.length; i++){
          var elem = elems[i];

          if(getComputedStyle(elem).opacity !== '0'){
            toggleElem(elem);
          }

          elem.style.setProperty('pointer-events', 'all', 'important');
        }
      }

      return true;
    }

    function toggleDescription(evt){
      return toggleElem('ytd-expander.ytd-video-secondary-info-renderer', evt);
    }

    function toggleComments(evt){
      return toggleElem('ytd-comments', evt);
    }

    function playVideo(){
      var evt = new CustomEvent('ublock_ytVideo', {detail: true});
      window.dispatchEvent(evt);
    }

    function pauseVideo(){
      hide(document.querySelector('video'));
      var evt = new CustomEvent('ublock_ytVideo', {detail: false});
      window.dispatchEvent(evt);
    }

    function toggleElem(selector, evt=null, mainElem=null){
      var activeElem = document.activeElement;

      if(activeElem){
        var tag = activeElem.tagName;
        if(tag == 'INPUT' || tag == 'TEXTAREA') return false;
      }

      if(evt){
        evt.preventDefault();
      }

      var elems = typeof selector == 'string' ? document.querySelectorAll(selector) : [selector];
      if(!elems.length) return false;

      var visible;

      for(var i = 0; i < elems.length; i++){
        var elem = elems[i];

        if(i === 0){
          var computedStyle = getComputedStyle(mainElem || elem);
          visible = computedStyle.opacity === '1';
        }

        if(visible) hide(elem);
        else show(elem);

        elem.style.setProperty('pointer-events', visible ? 'none' : 'all', 'important');
      }

      return true;
    }

    function show(elem){
      if(elem.tagName === 'VIDEO'){
        safeElem.value = 1;
        return;
      }

      elem.classList.remove('ublock_hidden');
      elem.classList.add('ublock_visible');
    }

    function hide(elem){
      if(elem.tagName === 'VIDEO'){
        safeElem.value = 0;
      }

      elem.classList.remove('ublock_visible');
      elem.classList.add('ublock_hidden');
    }

    function updateTitle(str, e){
      var title;

      if(str === null){
        title = document.title;
      }else{
        title = str.match(/^\s*document.title = (".*");$/m);

        if(title === null){
          title = '_ublock_error_';
        }else{
          title = JSON.parse(title[1]);
        }
      }

      title = title.substring(0, title.length - 10);

      e.innerHTML = '';
      var text = document.createTextNode(title);
      e.appendChild(text);

      e.classList.add('ublock_safe');
    }

    function updateStat(e){
      server({
        type: 'status',
        id: top.location.href.match(/[\?\&]v\=([^\&\#]+)/)[1],
        channel: qs('#owner-name.ytd-video-owner-renderer').innerText.trim(),
        title: document.title.substring(0, document.title.length - 10),
      }, res => {
        if(res === null){
          updateTitle(null, e);
          return;
        }

        var span = e.querySelector('span');

        if(!span){
          updateTitle(null, e);
          span = document.createElement('span');
          e.appendChild(span);
        }

        var {style} = span;
        style.marginLeft = '10px';
        style.color = res.stat === stats.DOWNLOADING ? 'green' : 'blue';

        if(res.stat !== stats.NOT_QUEUED){
          var stat = O.cap(stats.name(res.stat), 1);
          span.innerText = `[${stat}]`;
        }

        setTimeout(() => {
          updateStat(e);
        }, 1e3);
      });
    }

    function rf(url, data, cb){
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if(xhr.readyState !== 4) return;
        cb(xhr.responseText, data);
      };

      xhr.open('GET', url);
      xhr.send(null);
    }

    function server(data, cb=nop){
      if(!ENABLE_DOW) return cb(null);
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if(xhr.readyState !== 4) return;
        if(xhr.status !== 200) return cb(null);
        cb(JSON.parse(xhr.responseText));
      };

      xhr.open('POST', `http://localhost:${PORT}`);
      xhr.send(JSON.stringify(data));
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

    function log(...a){
      console.log(...a);
      return a[a.length - 1];
    }

    function nop(){}
  };
})();