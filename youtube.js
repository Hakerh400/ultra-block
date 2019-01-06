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

  const PREVENT_TITLE_TRANSLATION = 0;

  ////////////////////////////////////////////////////////////////////////////////////////////////////

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

  const chs = [
  ];

  const timeOffsets = {
  };

  Object.setPrototypeOf(timeOffsets, null);

  for(let chName in timeOffsets){
    let ch = timeOffsets[chName];

    if(top.location.href.includes('&u'))
      ch[1] += 6;
    if(ch.length === 2)
      ch.push([null, null, null, null]);
  }

  const symbs = [
    'status',
  ].map(a => Symbol(a));

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  document.addEventListener('DOMContentLoaded', () => {
    return;

    var video = qs('video');
    if(!video) return;

    var prev = 0;
    var curr = 0;
    var buf = 0;
    var t = Date.now();

    requestAnimationFrame(check);

    function check(){
      var f = null;

      curr = video.currentTime;

      if(curr >= prev){
        if(
            !buf  &&
            curr === prev &&
            Date.now() - t > 2e3 &&
            !video.paused
          ){
          f = onBuffering;
          buf = 1;
        }

        if(
            buf &&
            curr > prev &&
            !video.paused
          ){
          f = onReady;
          buf = 0;
        }
      }

      prev = curr;

      if(f) f();
      requestAnimationFrame(check);
    }

    function onBuffering(){
    }

    function onReady(){
      video.currentTime -= 5;
      t = Date.now();
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  var musicMode = 0;
  var enableDow = 1;

  var waitTimeBody = 3e3;
  var waitTimeItems = 5e3;

  var emptyTimeOffsets = [null, null, [null, null, null, null]];

  var safeElem = document.createElement('input');
  safeElem.style.display = 'none';
  safeElem.id = 'ublock_safe';
  safeElem.type = 'hidden';
  safeElem.value = 0;

  main();

  function main(){
    var url = top.location.href;
    var focused = musicMode;
    var disabledSearch = 0;
    var debugMode = 0;
    var ended = 0;
    var currentSrc = null;

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    document.addEventListener('DOMContentLoaded', () => {
      var e = qs('body');

      var m = top.location.href.match(/[\?\&]ub\=(\d+)(?:[^\d]|$)/);
      if(m !== null){
        var n = Number(m[1]);
        e.classList.add(`ub${n}`);
      }

      e.classList.add('ublock-safe');
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////

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
          if(tag === 'INPUT' || tag === 'TEXTAREA') return 0;
        }

        if(evt.altKey || evt.ctrlKey || evt.shiftKey)
          return;

        /*var v = qs('video');
        if(v) var ct = v.currentTime;*/

        switch(evt.code){
          /*case 'ArrowLeft': pd(); v && v.currentTime = ct - 5; break;
          case 'ArrowRight': pd(); v && v.currentTime = ct + 5; break;*/

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
              channel: getChName(),
              title: document.title.substring(0, document.title.length - 10),
              urls,
            });
            break;

          case 'F8':
            debugMode = 1;
            evt.preventDefault();
            break;
        }

        function pd(){
          evt.preventDefault();
          evt.stopPropagation();
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

        toggleVideo(0);
        toggleRelated(null, 1);

        ended = 0;
      });

      window.addEventListener('mousemove', evt => {
        if(musicMode) return;

        focused = 1;
      });

      window.addEventListener('focus', evt => {
        if(musicMode) return;

        if(focused){
          toggleRelated(null, 1);
        }

        focused = 1;
      });

      window.addEventListener('blur', evt => {
        if(musicMode) return;

        if(focused){
          toggleRelated(null, 1);
        }

        focused = 0;
      });
    }

    function block(){
      if(debugMode){
        debugMode = 0;
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

        if(!PREVENT_TITLE_TRANSLATION){
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

          //updateStat(e);

          //if(!PREVENT_TITLE_TRANSLATION){
            e.classList.add('ublock_safe');
            //continue;
          //}
        }
      }

      if(url !== window.location.href){
        url = window.location.href;
        if(/^www\.youtube\.com\/(?:channel|user)\/[^\/]+$/.test(url.match(/^[^\/]+?\:\/\/(.+)/)[1])){
          hide(document.documentElement);
          window.location.href = url.replace(/$/, '/videos');
        }
      }

      var video = qs('video');
      if(video){
        if(!video.ublock_videoListeners){
          video.ublock_ytVideoListeners = 1;

          video.onended = () => {
            ended = 1;
          };
        }

        checkVideoTime();

        if(currentSrc !== video.currentSrc){
          ended = 0;
        }

        if(musicMode && !ended && video.paused && currentSrc !== video.currentSrc){
          currentSrc = video.currentSrc;
          playVideo();
        }
      }

      if(canShowBody){
        let e;

        for(e of qsa('ytd-comment-thread-renderer:not(.ublock-safe)')){
          if(
            qs(e, '#pinned-comment-badge:not(*[hidden])') ||
            qs(e, 'ytd-author-comment-badge-renderer')
          ){
            e.remove();
          }else{
            e.classList.add('ublock-safe');
          }
        }

        for(e of qsa('#description:not(.ublock-safe)')){
          //e.closest('ytd-expander').removeAttribute('collapsed');

          if(getChName() === chs[0]){
            var v = e.innerText
              .split(/\r\n|\r|\n/)[0]
              .split('.');
            v.pop();
            v[v.length - 1] = '';
            v = v.join('.')
              .split(' ')
              .slice(5)
              .join(' ');
            v = `${v[0].toUpperCase()}${v.slice(1)}`;
            e.innerText = v;
          }

          e.classList.add('ublock-safe');
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

      toggleVideo(1);

      var channel = elem.innerText.trim();

      if(!(channel in timeOffsets)){
        updateOverlayElem(emptyTimeOffsets);
        return video.ublock_start = 0;
      }

      var offsets = timeOffsets[channel];
      updateOverlayElem(offsets);

      var duration = video.duration;
      var start = offsets[0];
      var end = duration - offsets[1];
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
        ended = 1;
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

      elem.value = JSON.stringify(timeOffsets[2]);
    }

    function tryToDisableSearch(){
      var e = document.querySelector('input[id="search"]');
      if(!e) return 0;

      if(e !== document.activeElement){
        e.value = '';
        e.disabled = 1;
      }

      var ee = e.parentNode;

      ee.addEventListener('click', () => {
        e.disabled = 0;
        e.focus();
      });

      e.addEventListener('blur', () => {
        e.value = '';
        e.disabled = 1;
      });

      return 1;
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

          return 1;
        }

        return a;
      }, 0);
    }

    function toggleRelated(evt, forceHide=0){
      var selector = '#items.style-scope.ytd-watch-next-secondary-results-renderer,yt-next-continuation,*[id*="continuation"],*[class*="continuation"]';
      var toggled = toggleElem(selector, evt, qs('#items.style-scope.ytd-watch-next-secondary-results-renderer'));
      if(!toggled) return 0;

      if(forceHide){
        var elems = document.querySelectorAll(selector);
        for(var i = 0; i < elems.length; i++){
          var elem = elems[i];

          if(getComputedStyle(elem).opacity !== '0'){
            toggleElem(elem);
          }

          elem.style.setProperty('pointer-events', 'auto', 'important');
        }
      }

      return 1;
    }

    function toggleDescription(evt){
      return toggleElem('ytd-expander.ytd-video-secondary-info-renderer', evt);
    }

    function toggleComments(evt){
      return toggleElem('ytd-comments', evt);
    }

    function playVideo(){
      var evt = new CustomEvent('ublock_ytVideo', {detail: 1});
      window.dispatchEvent(evt);
    }

    function pauseVideo(){
      hide(document.querySelector('video'));
      var evt = new CustomEvent('ublock_ytVideo', {detail: 0});
      window.dispatchEvent(evt);
    }

    function toggleElem(selector, evt=null, mainElem=null){
      var activeElem = document.activeElement;

      if(activeElem){
        var tag = activeElem.tagName;
        if(tag == 'INPUT' || tag == 'TEXTAREA') return 0;
      }

      if(evt) evt.preventDefault();

      var elems = typeof selector == 'string' ? document.querySelectorAll(selector) : [selector];
      if(!elems.length) return 0;

      var visible;

      for(var i = 0; i < elems.length; i++){
        var elem = elems[i];

        if(i === 0){
          var computedStyle = getComputedStyle(mainElem || elem);
          visible = computedStyle.opacity === '1';
        }

        if(visible) hide(elem);
        else show(elem);

        elem.style.setProperty('pointer-events', visible ? 'none' : 'auto', 'important');
      }

      return 1;
    }

    function show(elem){
      if(elem.tagName === 'VIDEO'){
        safeElem.value = 1;
        return;
      }

      elem.classList.remove('ublock_hidden');
      elem.classList.add('ublock_visible');

      elem.style.setProperty('pointer-events', 'auto', 'important');
    }

    function hide(elem){
      if(elem.tagName === 'VIDEO'){
        safeElem.value = 0;
      }

      elem.classList.remove('ublock_visible');
      elem.classList.add('ublock_hidden');

      elem.style.setProperty('pointer-events', 'none', 'important');
    }

    function updateTitle(str, e){
      var title;

      if(str === null){
        title = document.title;
        title = title.substring(0, title.length - 10);
      }else{
        title = str.match(/^\s*document.title = (".*");$/m);

        if(title === null){
          title = '_ublock_error_';
        }else{
          title = JSON.parse(title[1]);
          title = title.substring(0, title.length - 10);
        }
      }

      e.innerHTML = '';
      var text = document.createTextNode(title);
      e.appendChild(text);

      e.classList.add('ublock_safe');
    }

    function updateStat(e){
      server({
        type: 'status',
        id: top.location.href.match(/[\?\&]v\=([^\&\#]+)/)[1],
        channel: getChName(),
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

    function getChName(){
      return qs('#owner-name.ytd-video-owner-renderer').innerText.trim();
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
      if(!enableDow) return cb(null);
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if(xhr.readyState !== 4) return;
        if(xhr.status !== 200){
          enableDow = 0;
          return cb(null);
        }
        cb(JSON.parse(xhr.responseText));
      };

      xhr.open('POST', `http://localhost:${PORT}`);
      xhr.send(JSON.stringify(data));
    }
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
})();