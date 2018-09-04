(() => {
  'use strict';

  if(window.location.href.startsWith('http://localhost/')) return;
  if(!/\.pdf(?:\?|$)/i.test(window.location.href)) return;

  main();

  function main(){
    if(!document.body) return setTimeout(main);

    var w = window.innerWidth;
    var h = window.innerHeight;
    var shift = false;
    var ctrl = false;

    var keyDownPrev = null;
    var keyUpPrev = null;

    var blocks = [
      [0, 0], [w, 0],
      [0, h], [w, h],
    ];

    var activeBlock = null;

    var canvas = document.createElement('canvas');
    canvas.className = 'ultra-block overlay';
    refreshCanvas();

    var g = canvas.getContext('2d');

    window.addEventListener('scroll', updateCanvas);
    window.addEventListener('resize', updateCanvas);

    updateCanvas();

    function updateCanvas(){
      w = window.innerWidth;
      h = window.innerHeight;

      canvas.width = w;
      canvas.height = h;

      canvas.style.left = `${window.scrollX}px`;
      canvas.style.top = `${window.scrollY}px`;

      render();
    }

    function render(){
      g.clearRect(0, 0, w, h);

      g.fillStyle = '#515659';

      blocks = [
        [w, 56], [w - 102, h],
        [0, h], [w, h],
      ];

      var [a, b, c, d] = blocks;

      g.fillRect(0, 0, a[0], a[1]);
      g.fillRect(b[0], 0, w - b[0], b[1]);
      g.fillRect(0, c[1], c[0], h - c[1]);
      g.fillRect(d[0], d[1], w - d[0], h - d[1]);
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
      canvas.style.pointerEvents = 'all';
    }

    function clearActiveBlock(x, y){
      selectNearestBlock(x, y);

      var index = blocks.indexOf(activeBlock);

      activeBlock[0] = (index & 1) * w;
      activeBlock[1] = (index / 2 & 1) * h;

      activeBlock = null;
    }

    function refreshCanvas(){
      canvas.remove();
      document.body.appendChild(canvas);
      canvas.style.setProperty('display', 'block', 'important');

      setTimeout(refreshCanvas, 1e3);
    }
  };
})();