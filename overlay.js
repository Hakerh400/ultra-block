(() => {
  'use strict';

  if(window.parent.frames.length > 0) return;
  if(window.location.href.startsWith('http://localhost/')) return;

  const inco = chrome.extension.inIncognitoContext;

  const DEBUG = 0;

  const SCREEN_WIDTH = 1920;
  const SCREEN_HEIGHT = 1080;

  main();

  function main(){
    // if(!document.body) return setTimeout(main);

    let isTopVisible = 1;
    let isBottomVisible = 1;

    ael('keydown', evt => {
      if(evt.shiftKey || evt.ctrlKey) return;

      switch(evt.code){
        case 'Backquote':
          isTopVisible ^= 1;
          render();
          break;

        case 'KeyT':
          isBottomVisible ^= 1;
          render();
          break;
      }
    });

    var w = window.innerWidth;
    var h = window.innerHeight;
    var shift = 0;

    const isPDF = /\.pdf(?:\?|$)/.test(window.location.href);
    var col = isPDF ? '#515659' : '#ffffff';

    var blocks = [
      [0, 0], [w, 0],
      [0, h], [w, h],
    ];

    var activeBlock = null;
    var activeBlockCandidate = null;
    var g = null;

    var canvas = document.createElement('canvas');
    if(!canvas.style) return;

    canvas.className = 'ultra-block overlay';
    refreshCanvas();

    g = canvas.getContext('2d');

    ael('scroll', updateCanvas);
    ael('resize', updateCanvas);

    ael('keydown', evt => {
      switch(evt.key){
        case 'KeyF': setTimeout(() => updateCanvas()); break;
      }

      shift = evt.shiftKey;

      if(!shift){
        activeBlock = null;
      }else if(activeBlock === null && activeBlockCandidate !== null){
        activeBlock = activeBlockCandidate;
      }

      setPointerEvents(shift ? 'all' : 'none');
    });

    ael('keyup', evt => {
      shift = evt.shiftKey;
      if(!shift) activeBlock = null;
      setPointerEvents(shift ? 'all' : 'none');
    });

    ael('mousedown', evt => {
      var x = evt.clientX;
      var y = evt.clientY;

      switch(evt.button){
        case 0:
          selectNearestBlock(x, y, shift);
          if(!shift) break;
          evt.preventDefault();
          break;

        case 2:
          if(!shift) break;
          evt.preventDefault();
          clearActiveBlock(x, y);
          render();
          break;
      }
    });

    ael('mouseup', evt => {
      var x = evt.clientX;
      var y = evt.clientY;

      switch(evt.button){
        case 0:
          if(!shift) break;
          activeBlock = null;
          break;
      }

      activeBlockCandidate = null;
    });

    ael('mousemove', evt => {
      var x = evt.clientX;
      var y = evt.clientY;

      switch(evt.button){
        case 0:
          if(!activeBlock) break;
          activeBlock[0] = x;
          activeBlock[1] = y;
          render();
          break;
      }
    });

    ael('blur', evt => {
      shift = 0;
      activeBlock = null;
      setPointerEvents('none');
    });

    ael('contextmenu', evt => {
      if(!shift) return;

      evt.preventDefault();
      evt.stopPropagation();
    });

    if(DEBUG){
      var first = 1;
      var obj = {};
    }

    updateCanvas();

    function updateCanvas(){
      const dw = window.innerWidth - w;
      const dh = window.innerHeight - h;

      w = window.innerWidth;
      h = window.innerHeight;

      canvas.width = w;
      canvas.height = h;

      canvas.style.left = `${window.scrollX}px`;
      canvas.style.top = `${window.scrollY}px`;

      blocks[1][0] += dw;
      blocks[3][0] += dw;
      blocks[2][1] += dh;
      blocks[3][1] += dh;

      if(isYtVideo()) resetBlocks();
      render();
    }

    function render(arg){
      if(g === null) return;

      if(DEBUG){
        if(!first && arg !== obj) return;
        first = 0;
      }

      g.clearRect(0, 0, w, h);
      g.fillStyle = !isPDF && isFs() ? '#808080' : col;

      if(isYtVideo() && isFs()){
        var elem = document.querySelector('#ublock_yt-overlay');
        if(!elem) return setTimeout(render);

        var arr = [null, null, null, null];

        try{
          arr = JSON.parse(elem.value);
        }catch(err){
          alert = () => {};
        }

        arr.forEach((a, b) => {
          if(a === null) return;

          var bb = blocks[b];
          var bx = b & 1;
          var by = b & 2;

          if(bx) bb[0] = w - bb[0];
          if(by) bb[1] = h - bb[1];

          if(bb[0] < a[0]) bb[0] = a[0];
          if(bb[1] < a[1]) bb[1] = a[1];

          if(bx) bb[0] = w - bb[0];
          if(by) bb[1] = h - bb[1];
        });
      }

      if(inco && isTopVisible && window.location.href.startsWith('https://www.youtube.com/results?')){
        g.fillRect(0, 0, 574, 1080);
      }

      var [a, b, c, d] = blocks;

      if(isTopVisible){
        g.fillRect(0, 0, a[0], a[1]);
        g.fillRect(b[0], 0, w - b[0], b[1]);
      }

      if(isBottomVisible){
        g.fillRect(0, c[1], c[0], h - c[1]);
        g.fillRect(d[0], d[1], w - d[0], h - d[1]);
      }

      if(DEBUG){
        if(shift){
          g.fillStyle = '#f00';
          g.fillRect(0, 0, 100, 100);
        }

        if(activeBlock !== null){
          g.fillStyle = '#0f0';
          g.fillRect(100, 0, 100, 100);

          var index = blocks.indexOf(activeBlock);
          var x = index & 1;
          var y = index >> 1;

          g.fillStyle = '#ff0';
          g.fillRect(100 + x * 50, y * 50, 50, 50);
        }

        window.requestAnimationFrame(() => {
          render(obj);
        });
      }
    }

    function resetBlocks(){
      blocks[0][0] = 0, blocks[0][1] = 0;
      blocks[1][0] = w, blocks[1][1] = 0;
      blocks[2][0] = 0, blocks[2][1] = h;
      blocks[3][0] = w, blocks[3][1] = h;
    }

    function selectNearestBlock(x, y, actual=1){
      if(actual && activeBlockCandidate !== null){
        activeBlock = activeBlockCandidate;
        setPointerEvents('all');
        return;
      }

      var coords = blocks;

      var index = coords.reduce((a, coord, index) => {
        var dist = Math.hypot(x - coord[0], y - coord[1]);

        if(a[0] === null || dist < a[0]){
          a[0] = dist;
          a[1] = index;
        }

        return a;
      }, [null, 0])[1];

      if(actual){
        activeBlock = blocks[index];
        setPointerEvents('all');
      }else{
        activeBlockCandidate = blocks[index];
      }
    }

    function clearActiveBlock(x, y){
      selectNearestBlock(x, y);

      var index = blocks.indexOf(activeBlock);

      activeBlock[0] = (index & 1) * w;
      activeBlock[1] = (index >> 1) * h;

      activeBlock = null;
    }

    function refreshCanvas(){
      const parent = document.fullscreenElement || document.documentElement;

      if(canvas.parentNode !== parent || parent.lastChild !== canvas)
        parent.appendChild(canvas);

      canvas.style.setProperty('display', 'block', 'important');
      canvas.style.setProperty('visibility', 'visible', 'important');
      canvas.style.setProperty('opacity', '1', 'important');

      requestAnimationFrame(refreshCanvas);
    }

    function setPointerEvents(mode){
      canvas.style.pointerEvents = mode;
    }

    function isFs(){
      return document.webkitIsFullScreen || innerHeight > 947;
    }

    function isYtVideo(){
      return window.location.href.startsWith('https://www.youtube.com/watch?v=');
    }

    function ael(type, func){
      func[''] = 1;
      window.addEventListener(type, func);
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
  };
})();