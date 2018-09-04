(() => {
  'use strict';

  if(window.location.href.startsWith('http://localhost/')) return;

  main();

  function main(){
    if(!document.body) return setTimeout(main);

    var isBottomVisible = true;

    ael('keydown', evt => {
      switch(evt.code){
        case 'KeyT':
          isBottomVisible = !isBottomVisible;
          render();
          break;
      }
    });

    var w = window.innerWidth;
    var h = window.innerHeight;
    var shift = false;
    var ctrl = false;

    var keyDownPrev = null;
    var keyUpPrev = null;
    var col = /\.pdf(?:\?|$)/.test(window.location.href) ? '#515659' : '#ffffff';

    var blocks = [
      [0, 0], [w, 0],
      [0, h], [w, h],
    ];

    var activeBlock = null;
    var g = null;

    var canvas = document.createElement('canvas');
    canvas.className = 'ultra-block overlay';
    refreshCanvas();

    g = canvas.getContext('2d');

    ael('scroll', updateCanvas);
    ael('resize', updateCanvas);

    ael('keydown', evt => {
      if(evt.key == keyDownPrev && evt.key != keyUpPrev) return;

      switch(evt.key){
        case 'Shift': shift = !ctrl; break;
        case 'Control': ctrl = true; break;
        case 'KeyF': setTimeout(() => updateCanvas()); break;
      }

      if(!shift) activeBlock = null;
      setPointerEvents(shift ? 'all' : 'none');

      keyDownPrev = evt.key;
    });

    ael('keyup', evt => {
      if(evt.key == keyUpPrev && evt.key != keyDownPrev) return;

      switch(evt.key){
        case 'Shift': shift = false; break;
        case 'Control': ctrl = shift; break;
      }

      if(!shift) activeBlock = null;
      setPointerEvents(shift ? 'all' : 'none');

      keyUpPrev = evt.key;
    });

    ael('mousedown', evt => {
      var x = evt.clientX;
      var y = evt.clientY;

      switch(evt.button){
        case 0:
          if(!shift) break;
          evt.preventDefault();
          selectNearestBlock(x, y);
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

    ael('contextmenu', evt => {
      if(!shift) return;

      evt.preventDefault();
      evt.stopPropagation();
    });

    updateCanvas();

    function updateCanvas(){
      w = window.innerWidth;
      h = window.innerHeight;

      canvas.width = w;
      canvas.height = h;

      canvas.style.left = `${window.scrollX}px`;
      canvas.style.top = `${window.scrollY}px`;

      if(isYtVideo()){
        resetBlocks();
      }
      
      render();
    }

    function render(){
      if(g === null)
        return;

      g.clearRect(0, 0, w, h);
      g.fillStyle = col;

      if(isYtVideo()){
        var elem = document.querySelector('#ublock_yt-overlay');
        if(!elem) return setTimeout(render);

        var arr = [null, null, null, null];

        try{
          arr = JSON.parse(elem.value);
        }catch(err){
          console.log(elem);
          alert(`JSON ERROR:\n${elem.value}`);
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

      var [a, b, c, d] = blocks;

      g.fillRect(0, 0, a[0], a[1]);
      g.fillRect(b[0], 0, w - b[0], b[1]);

      if(isBottomVisible){
        g.fillRect(0, c[1], c[0], h - c[1]);
        g.fillRect(d[0], d[1], w - d[0], h - d[1]);
      }
    }

    function resetBlocks(){
      blocks[0][0] = 0, blocks[0][1] = 0;
      blocks[1][0] = w, blocks[1][1] = 0;
      blocks[2][0] = 0, blocks[2][1] = h;
      blocks[3][0] = w, blocks[3][1] = h;
    }

    function selectNearestBlock(x, y){
      var coords = blocks;

      var index = coords.reduce((a, coord, index) => {
        var dist = Math.hypot(x - coord[0], y - coord[1]);

        if(a[0] === null || dist < a[0]){
          a[0] = dist;
          a[1] = index;
        }

        return a;
      }, [null, 0])[1];

      activeBlock = blocks[index];
      setPointerEvents('all');
    }

    function clearActiveBlock(x, y){
      selectNearestBlock(x, y);

      var index = blocks.indexOf(activeBlock);

      activeBlock[0] = (index & 1) * w;
      activeBlock[1] = (index / 2 & 1) * h;

      activeBlock = null;
    }

    function refreshCanvas(){
      document.documentElement.appendChild(canvas);
      canvas.style.setProperty('display', 'block', 'important');

      //setTimeout(refreshCanvas, 1e3);
    }

    function setPointerEvents(mode){
      canvas.style.pointerEvents = mode;
    }

    function isYtVideo(){
      return window.location.href.startsWith('https://www.youtube.com/watch?v=');
    }

    function ael(type, func){
      func[''] = 1;
      window.addEventListener(type, func);
    }
  };
})();