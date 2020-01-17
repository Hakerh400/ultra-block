(() => {
  'use strict';

  const inco = chrome.extension.inIncognitoContext;

  if(inco){
  }

  var script = () => {
    (() => {
      'use strict';

      if(window['youtube-init.js']) return;
      window['youtube-init.js'] = true;

      var ytObj = Object.create(null);
      var videoHiddenLevel = 0;

      var toPrim = () => '1';

      var nopf = function(){};

      var nop = new Proxy(nopf, {
        getPrototypeOf(){ return null; },
        setPrototypeOf(){ return nop; },
        isExtensible(){ return false; },
        preventExtensions(){ return nop; },
        getOwnPropertyDescriptor(){ return {writable: false} },
        defineProperty(){ return nop; },
        has(){ return nop; },

        get(t, prop){
          if(prop === Symbol.toPrimitive) return toPrim;
          return nop;
        },

        set(){ return nop; },
        deleteProperty(){ return nop; },

        ownKeys(){ return ['prototype']; },

        apply(){ return nop; },
        construct(){ return nop; }
      });

      var maxAttemptsNum = 100;
      var attemptTimeDelay = 100;

      var func = null;
      var rot = 0;

      {
        const f = () => {
          if(document.title === '\u034f') return;
          document.title = ['ublock-title', ''];
          document.title = '\u034F';
          setTimeout(f);
        };
        f();
      }

      EventTarget.prototype.addEventListener = new Proxy(EventTarget.prototype.addEventListener, {
        apply(f, t, args){
          if(args[0] === 'keydown'){
            args[1] = (func => {
              return evt => {
                if(evt.code === 'KeyT' && !('' in func)) return nop;
                func(evt);
              };
            })(args[1]);

            if(t instanceof HTMLDivElement && t.classList.contains('html5-video-player')){
              func = args[1];

              args[1] = evt => {
                var video = document.querySelector('video');
                if(!video) return;

                if(evt.code === 'Space') return;

                if(evt.code === 'ArrowLeft' || evt.code === 'ArrowRight'){
                  if(!evt.ctrlKey) return;

                  rot = rot + (evt.code === 'ArrowLeft' ? -1 : 1) & 3;

                  const c = document.body.classList;
                  const index = [...c].findIndex(a => /^ublock-rot-[0123]$/.test(a));

                  if(index !== -1) c.remove(c[index]);
                  c.add(`ublock-rot-${rot}`);

                  return;
                }

                if(evt.code === 'Home' || evt.code === 'End'){
                  videoHiddenLevel++;

                  hide(video);
                  playOrPauseVideo(evt, false);

                  setTimeout(() => {
                    video.currentTime = 0;
                    setTimeout(() => {
                      videoHiddenLevel--;
                    }, 2e3);
                  }, 2e3);

                  return;
                }
                
                callFunc(func, evt);
              };
            }
          }

          return f.apply(t, args);
        }
      });

      Node.prototype.appendChild = new Proxy(Node.prototype.appendChild, {
        apply(f, t, args){
          var elem = args[0];
          var videos = [];

          try{
            videos = [...elem.querySelectorAll('video')].map(video => {
              return [video, !video.paused];
            });
          }catch{}

          var result = f.apply(t, args);

          videos.forEach(([video, playing]) => {
            if(playing) video.play(ytObj);
          });

          return result;
        }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////

      {
        HTMLVideoElement.prototype.play = new Proxy(HTMLVideoElement.prototype.play, {
          apply(f, t, args){
            if(args[0] !== ytObj) return nop;
            playVideo(t, f);
          }
        });

        HTMLVideoElement.prototype.pause = new Proxy(HTMLVideoElement.prototype.pause, {
          apply(f, t, args){
            if(args[0] !== ytObj) return nop;
            return f.apply(t, []);
          }
        });

        const prop = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');

        /*Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
          get(){
            return prop.get.call(this);
          },
        });*/
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////

      (() => {
        XMLHttpRequest = (XHR => {
          return function(){
            var xhr = new XHR();

            xhr.open = (...args) => {
              var url = args[1];

              if(url.includes('mime=audio'))
                sessionStorage.ublockYTAudio = url;
              else if(url.includes('mime=video'))
                sessionStorage.ublockYTVideo = url;

              return XHR.prototype.open.apply(xhr, args);
            };

            return xhr;
          };
        })(XMLHttpRequest);
      })();

      ////////////////////////////////////////////////////////////////////////////////////////////////////

      window.addEventListener('keydown', evt => {
        var activeElem = document.activeElement;

        if(activeElem){
          var tag = activeElem.tagName;
          if(tag === 'INPUT' || tag === 'TEXTAREA') return false;
        }
        
        if(evt.code === 'Space'){
          evt.preventDefault();
          evt.stopPropagation();
          dispatchEvent(evt.code, evt.keyCode);
          return;
        }
      });

      window.addEventListener('ublock_ytVideo', evt => {
        playOrPauseVideo(null, evt.detail);
      });

      function onKeyDown(evt){
        var activeElem = document.activeElement;

        if(activeElem){
          var tag = activeElem.tagName;
          if(tag === 'INPUT' || tag === 'TEXTAREA') return false;
        }

        var video = document.querySelector('video');
        if(!video) return;

        switch(evt.code){
          case 'Space': playOrPauseVideo(evt); break;
        }
      }

      function dispatchEvent(code, keyCode){
        if(func === null)
          return;

        var div = document.querySelector('.html5-video-player');

        var evt = {
          altKey: false,
          bubbles: true,
          cancelBubble: false,
          cancelable: true,
          charCode: 0,
          code: code,
          composed: true,
          ctrlKey: false,
          currentTarget: null,
          defaultPrevented: false,
          detail: 0,
          eventPhase: 0,
          isComposing: false,
          isTrusted: true,
          key: code,
          keyCode: keyCode,
          location: 0,
          metaKey: false,
          repeat: false,
          returnValue: true,
          shiftKey: false,
          srcElement: div,
          target: div,
          timeStamp: 0,
          type: 'keydown',
          which: keyCode,
          path: [div],

          preventDefault: () => {},
          stopPropagation: () => {},
          composedPath: () => [],
        };

        Object.setPrototypeOf(evt, KeyboardEvent.prototype);

        callFunc(func, evt);
      }

      function callFunc(func, evt){
        onKeyDown(evt);
        func(evt);
      }

      function playOrPauseVideo(evt, play = null){
        var video = document.querySelector('video');
        if(!video) return;

        if(evt){
          evt.preventDefault();
          evt.stopPropagation();
        }

        if(play === null){
          play = video.paused;
        }

        if(play){
          if(video.paused){
            video.play(ytObj);
            show(video);
          }
        }else{
          if(!video.paused){
            video.pause(ytObj);
            if(video.currentTime === 0)
              hide(video);
          }
        }
      }

      function hideVideo(){
        var video = document.querySelector('video');
        if(!video) return;
        hide(video);
      }

      function playVideo(video, play, attempt=maxAttemptsNum){
        if(!canVideoBeShown()){
          if(attempt !== 0)
            setTimeout(() => playVideo(video, play, attempt - 1), attemptTimeDelay);
          return;
        }

        play.apply(video, []);
      }

      function show(elem, attempt=maxAttemptsNum){
        if(elem.tagName === 'VIDEO'){
          if(videoHiddenLevel !== 0 || !canVideoBeShown() || elem.readyState !== 4){
            if(attempt !== 0)
              setTimeout(() => show(elem, attempt - 1), attemptTimeDelay);
            return;
          }
        }

        elem.classList.remove('ublock_hidden');
        elem.classList.add('ublock_visible');
      }

      function hide(elem){
        elem.classList.remove('ublock_visible');
        elem.classList.add('ublock_hidden');
      }

      function canVideoBeShown(){
        var safeElem = document.querySelector('#ublock_safe');
        if(safeElem === null) return false;
        return (safeElem.value | 0) === 1;
      }

      function log(...a){
        (window.console_ || console).log(...a);
      }
    })();
  };

  var code = script.toString();
  code = code.substring(code.indexOf('{') + 1);
  code = code.substring(0, code.length - 1);

  document.documentElement.setAttribute('onreset', code);
  document.documentElement.dispatchEvent(new CustomEvent('reset'));
  document.documentElement.removeAttribute('onreset');
})();