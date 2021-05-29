(() => {
  'use strict';

  const inco = chrome.extension.inIncognitoContext;

  if(inco|1){
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

      const url = location.href;

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      class Semaphore{
        constructor(s=1){
          this.s = s;
          this.blocked = [];
        }

        init(s){
          this.s = s;
        }

        wait(){
          if(this.s > 0){
            this.s--;
            return Promise.resolve();
          }

          return new Promise(res => {
            this.blocked.push(res);
          });
        }

        signal(){
          const {blocked} = this;

          if(blocked.length === 0){
            this.s++;
            return;
          }

          setTimeout(blocked.shift());
        }
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // Add special style
      {
        const style = document.createElement('style');

        style.innerText = `
          div[class*="ytp-"]:not(#movie_player)${/[\?\&]cap\b/.test(url) ? `:not(.ytp-caption-window-bottom)` : ''}:not(.ublock-visible-yt){
            opacity: 0;
            pointer-events: none;
          }
        `;

        document.documentElement.appendChild(style);
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      var maxAttemptsNum = 100;
      var attemptTimeDelay = 100;

      var func = null;
      var rot = 0;

      EventTarget.prototype.addEventListener = new Proxy(EventTarget.prototype.addEventListener, {
        apply(f, t, args){
          const type = args[0];

          if(type === 'keydown'){
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
          }else if(type === 'mouseenter'){
            const f = args[1];

            args[1] = evt => {
              const {clientX: x, clientY: y} = evt;
              const ee = [...document.elementsFromPoint(x, y)];
              const ok = ee.some(e => e.tagName.toLowerCase() === 'ytd-thumbnail');

              if(ok) return f(evt);
            };
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

      if(location.href.startsWith('https://www.youtube.com/watch?')){
        let config = undefined;

        // Object.defineProperty(window, 'ytplayer', {
        //   value: {
        //     get config(){ return config; },
        //
        //     set config(conf){
        //       const {args} = conf;
        //
        //       const prop1 = 'player_response';
        //       const prop2 = 'raw_player_response';
        //
        //       [prop1, prop2].forEach((prop, i) => {
        //         if(!args[prop]) return;
        //
        //         const playerResponse = i === 0 ? JSON.parse(args[prop]) : args[prop];
        //
        //         delete playerResponse.adPlacements;
        //         conf.args[prop] = i === 0 ? JSON.stringify(playerResponse) : playerResponse;
        //
        //         config = conf;
        //       });
        //     },
        //   },
        // });

        // JSON.stringify(conf).match(/"[a-zA-Z][a-zA-Z0-9]*"\:/g).map(a=>a.slice(1,a.length-2)).filter(a=>/^ads?(?![a-z])|Ads?(?![a-z])/.test(a)).join('\n');

        const blackList = [
          'actionCompanionAdRenderer',
          'adActionInterstitialRenderer',
          'adBadgeRenderer',
          'adBreakServiceRenderer',
          'adDurationRemaining',
          'adDurationRemainingRenderer',
          'adHoverTextButtonRenderer',
          'adInfoDialogEndpoint',
          'adInfoDialogRenderer',
          'adInfoRenderer',
          'adLayoutLoggingData',
          'adLifecycleCommand',
          'adPlacementConfig',
          'adPlacementRenderer',
          'adPlacements',
          'adPreviewRenderer',
          'adReasons',
          'adRendererCommands',
          'adSlotLoggingData',
          'adTimeOffset',
          'adVideoId',
          'getAdBreakUrl',
          'instreamAdPlayerOverlayRenderer',
          'instreamVideoAdRenderer',
          'linearAds',
          'linearAdSequenceRenderer',
          'playerAdParams',
          'playerAds',
          'playerLegacyDesktopWatchAdsRenderer',
          'serializedAdServingDataEntry',
          'serializedSlotAdServingDataEntry',
          'simpleAdBadgeRenderer',
          'skipAdRenderer',
          'templatedAdText',
        ];

        Object.defineProperty(window, 'ytInitialPlayerResponse', {
          get(){ return config; },
      
          set(conf){
            try{
              conf.adPlacements.length = 0;
              conf.playerAds.length = 0;
            }catch{}

            config = conf;
          },
        });
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
            showElem(video);
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

      function showElem(elem, attempt=maxAttemptsNum){
        if(elem.tagName === 'VIDEO'){
          if(videoHiddenLevel !== 0 || !canVideoBeShown() || elem.readyState !== 4){
            if(attempt !== 0)
              setTimeout(() => showElem(elem, attempt - 1), attemptTimeDelay);

            return;
          }
        }

        elem.classList.remove('ublock-hidden-yt');
        elem.classList.add('ublock-visible-yt');
      }

      function hide(elem){
        elem.classList.remove('ublock-visible-yt');
        elem.classList.add('ublock-hidden-yt');
      }

      function canVideoBeShown(){
        var safeElem = document.querySelector('#ublock_safe');
        if(safeElem === null) return 0;
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

  (() => {
    const script = document.createElement('script');
    script.textContent = code;
    document.documentElement.appendChild(script);
    script.remove();
  })();
})();