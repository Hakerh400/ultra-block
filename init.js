(() => {
  'use strict';

  if(location.href.startsWith('http://localhost')) return;
  if(location.href.startsWith('https://hakerh400.github.io/')) return;

  onbeforeunload = () => {
    if(sessionStorage['ublock-prevent-hard-reload'])
      return;

    if(window.parent.frames.length === 0){
      try{
        window.scrollTo(0, 0);
        const d = document;
        const e = d.body || d.documentElement;
        e.innerHTML = '';
      }catch(err){
        // (window.console_ || console).log(err);
      }
    }
  };

  const STYLE_URL = chrome.runtime.getURL('main.css');

  var script = () => {
    'use strict';

    var ublockFunc = (w=window, url=w.location.href) => {
      if(w['ublock-init.js']) return;
      w['ublock-init.js'] = 1;

      var injectedWorkerCode = `(${injectedWorkerFunc})();`;

      main();

      function main(){
        // Inspect objects
        {
          class Table{
            constructor(columns){
              this.w = columns.length;
              this.h = 0;

              this.columns = Table.toArr(columns);
              this.rows = [];
            }

            static toArr(arr){
              return arr.map(elem => String(elem));
            }

            addRow(row){
              row = Table.toArr(row);

              let dif = this.w - row.length;
              if(dif < 0) throw new RangeError('Too large row');
              while(dif-- !== 0) row.push('');

              this.rows.push(row);
              this.h++;
            }

            toString(){
              const {w, h, columns, rows} = this;

              const w1 = w - 1;
              const h1 = h - 1;

              const lens = columns.map(s => s.length);
              rows.forEach(row => {
                row.forEach((s, i) => lens[i] = Math.max(lens[i], s.length));
              });
              lens.forEach((len, i) => lens[i] = len + 2);

              const fit = (len, str=null, ch=' ') => {
                if(str === null) return ch.repeat(len);
                const strLen = str.length;
                const start = len - strLen >> 1;
                return (ch.repeat(start) + str).padEnd(len, ch);
              };

              const apply = (s, type, c1, c2, f=flag) => {
                const arr = Array.isArray(c1) ? c1 : null;
                if(arr !== null) c1 = ' ';

                str += s;

                lens.forEach((len, i) => {
                  str += fit(
                    len - (type && f && i === w1 ? 1 : 0),
                    arr !== null ? arr[i] : null,
                    c1
                  ) + c2;
                });
              };

              const applyArr = arr => {
                const len = arr.length;
                let i = 0;

                while(i !== len){
                  const n = len - i === 5 ? 5 : 4;
                  const a = arr.slice(i, i += n);
                  apply.apply(null, a);
                }
              };

              const setFlag = f => {
                flag = f;
                c1 = getCh('+');
                c2 = getCh('-');
              };

              const getCh = (ch, f=flag) => {
                return f ? ch : '|';
              };

              let str = '';

              let flag;
              let c1, c2;

              setFlag(1);

              const empty = h === 0;
              const c = getCh('+', empty);

              applyArr([
                '+', 1, '-', '-',
                '+\n|', 0, ' ', '|',
                '\n|', 0, columns, '|',
                '\n|', 0, ' ', '|',
                '\n' + c, 1, '=', '=', 1,
              ]);

              str += c;

              rows.forEach((row, ri) => {
                setFlag(ri === h1);

                applyArr([
                  '\n|', 0, ' ', '|',
                  '\n|', 0, row, '|',
                  '\n|', 0, ' ', '|',
                  '\n' + c1, 1, '-', c2,
                ]);

                if(flag) str += c1;
              });

              str = str.split(/\r\n|\r|\n/).map(line => {
                if(line === '|') return '||';
                return line;
              }).join('\n');

              return str;
            }
          };

          w.ubkeys = obj => {
            let depth = 0;

            const table = new Table([
              'Depth',
              'Type',
              'Object name',
              'Key type',
              'Key name',
              'Descriptor',
              'Value type',
              'Value',
            ]);

            const has = (obj, key) => {
              return Object.hasOwnProperty.call(obj, key);
            };

            const sf = val => {
              if(typeof val === 'symbol'){
                val = String(val);
                val = val.slice('Symbol'.length + 1, val.length - 1);
              }

              return JSON.stringify(val);
            };

            const desc2str = desc => {
              let str = '';

              if(desc.enumerable) str += 'e';
              if(desc.writable) str += 'w';
              if(desc.configurable) str += 'c';
              if(has(desc, 'value')) str += 'v';
              if(has(desc, 'get')) str += 'g';
              if(has(desc, 'set')) str += 's';

              return str;
            };

            const getGetKeysDescs = obj => {
              const keys = Reflect.ownKeys(obj);
              const descs = Object.create(null);

              for(const key of keys)
                descs[key] = Object.getOwnPropertyDescriptor(obj, key);

              const get = key => {
                if(!(key in descs))
                  return [null, null];

                const desc = descs[key];

                if(has(desc, 'value')){
                  const val = desc.value;
                  return [typeof val, val];
                }

                try{
                  const val = desc.get.call(obj);
                  return [typeof val, val];
                }catch(err){
                  return ['(error)', err];
                }
              };

              return {get, keys, descs};
            };

            while(obj !== null){
              const proto = Object.getPrototypeOf(obj);
              const type = typeof obj;
              const {get, keys, descs} = getGetKeysDescs(obj);

              let name = '(unnamed)';
              let foundName = 0;

              findName1: {
                const ctorInfo = get('constructor');
                if(ctorInfo[0] !== 'function') break findName1;

                const nameInfo = getGetKeysDescs(ctorInfo[1]).get('name');
                if(nameInfo[0] !== 'string') break findName1;

                name = sf(nameInfo[1]);
                foundName = 1;
              }

              findName2: if(!foundName){
                if(proto === null) break findName2;

                const ctorInfo = getGetKeysDescs(proto).get('constructor');
                if(ctorInfo[0] !== 'function') break findName2;

                const nameInfo = getGetKeysDescs(ctorInfo[1]).get('name');
                if(nameInfo[0] !== 'string') break findName2;

                name = `${sf(nameInfo[1])} instance`;
                foundName = 1;
              }

              for(const key of keys){
                const keyType = typeof key;
                const info = get(key);
                const [valType, valInfo] = info;

                let val = '(unknown)';

                switch(info[0]){
                  case 'undefined': val = 'undefined'; break;
                  case 'object':
                    if(valInfo === null) val = 'null';
                    else if(Array.isArray(val)) val = '(array)';
                    else val = '(object)';
                    break;
                  case 'boolean': val = String(valInfo); break;
                  case 'number': val = String(valInfo); break;
                  case 'bigint': val = `${valInfo}n`; break;
                  case 'string': val = sf(valInfo); break;
                  case 'symbol': val = sf(valInfo); break;
                  case 'function': val = '(function)'; break;
                  case '(error)': val = '(error)'; break;
                }

                table.addRow([
                  String(depth),
                  type,
                  name,
                  keyType,
                  sf(key),
                  desc2str(descs[key]),
                  valType,
                  val,
                ]);
              }

              obj = proto;
              depth++;
            }

            return table.toString();
          };
        }

        const qsa = a => document.querySelectorAll(a);

        w.console_ = w.console;
        w.alert_ = w.alert;
        w.prompt_ = w.prompt;

        var log = w.console_.log.bind(w.console_);
        var document = w.document;
        var Object = w.Object;

        var symbol = Symbol('ublock');
        var toPrim = () => '1';
        var nopf = function(){};

        var nop = proxify(nopf, {
          getPrototypeOf(){ return null; },
          setPrototypeOf(){ return nop; },
          isExtensible(){ return false; },
          preventExtensions(){ return nop; },

          getOwnPropertyDescriptor(t, prop){
            if(prop === 'prototype')
              return Object.getOwnPropertyDescriptor(t, prop);

            return {
              writable: false,
              configurable: true,
            };
          },

          defineProperty(){ return nop; },
          has(){ return nop; },

          get(t, prop){
            if(prop === Symbol.toPrimitive) return toPrim;
            return nop;
          },

          set(){ return true; },
          deleteProperty(){ return nop; },
          ownKeys(){ return ['prototype']; },
          apply(){ return nop; },
          construct(){ return nop; },
        });

        w.log = log;

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(0){
          Object.defineProperty(window, 'scrollTop', {value: nop});
          Object.defineProperty(window, 'scrollLeft', {value: nop});
          Object.defineProperty(window, 'scrollWidth', {value: nop});
          Object.defineProperty(window, 'scrollHeight', {value: nop});
          Object.defineProperty(window, 'scrollIntoView', {value: nop});
          Object.defineProperty(window, 'scroll', {value: nop});
          Object.defineProperty(window, 'scrollTo', {value: nop});
          Object.defineProperty(window, 'scrollBy', {value: nop});
          Object.defineProperty(window, 'scrollIntoViewIfNeeded', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollTop', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollLeft', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollWidth', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollHeight', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollIntoView', {value: nop});
          Object.defineProperty(Element.prototype, 'scroll', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollTo', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollBy', {value: nop});
          Object.defineProperty(Element.prototype, 'scrollIntoViewIfNeeded', {value: nop});
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const shouldBeMuted = url.startsWith('file:///') && !url.startsWith('file:///D:/Music/');

        const enhanceVideo = () => {
          (q=>((v,S)=>{'controls,autoplay'.split`,`.map(a=>v.removeAttribute(a)),v.muted=shouldBeMuted,v.classList.add('ublock-video'),addEventListener('keydown',(a,b=!a.ctrlKey?a.keyCode:0,c='currentTime')=>b-37?b-39?b-77?b-116?1:(a.preventDefault('ublock'),v.pause(),S.src=(a=>(a=a.split`?`,a[1]='a='+Date.now()+Math.random(),a.join`?`))(S.src),v.load()):v.muted^=1:v[c]+=5:v[c]-=5);

            if(/\.(?:mp4|webm|mkv)(?:[?&]|$)/i.test(url))
              sessionStorage['ublock-prevent-hard-reload'] = 1;
          })(q('video')[0],q('source')[0]))(a=>[...document.querySelectorAll(a)]);

          document.body.classList.add('ublock-rot-0');

          addEventListener('keydown', evt => {
            const shift = evt.shiftKey;
            const ctrl = evt.ctrlKey;

            if(shift || ctrl) return;

            switch(evt.code){
              case 'KeyQ':
                for(const e of qsa('video'))
                  e.controls ^= 1;
                break;
            }
          });
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          const scripts = [
            ['Refresh video', () => {
              document.location.href = document.location.href.replace(/[\?\&]t=[^\&]*|$/, a => {
                return `${a.includes('?') ? '?' : '&'}t=${
                  document.querySelector('video').currentTime | 0}`;
              });
            }],
            ['Visited links', () => ((a,Y,M)=>(a('pre',a=>a.innerHTML=a.innerHTML.replace(/\<[^\.]*\>/g,'').trim().split(/\r\n|\r|\n/).map(a=>`<a href=${a.match(/\b[a-z]+?:\/\/[\S]+/)||((M=a.match(/\[([a-zA-Z0-9\_\-]{11})\]/))?Y+'watch?v='+M[1]:Y+'results?search_query='+a.split(/\-{2,}/)[0].split(/\*{2,}/).pop().trim().split('').map(a=>a<'~'?escape(a):a).join(''))}>${a}</a>`).join('<br>')),a('a',a=>a.addEventListener('mousedown',b=>/*b.button===1&&*/a.style.setProperty('color','red','important')))))((a,b)=>[...document.querySelectorAll(a)].map(b),'https://www.youtube.com/')],
            ['Enhance title', () => {
              const f = () => {
                ((a,b)=>(document.title=['ublock-title',''],document.title='\u034F',[...document.querySelectorAll('h1.title')].forEach(b=>a(b,'innerText'))))((a,b)=>a[b]=a[b]?a[b].replace(/[^ -~]+/gu,' ').replace(/\s+/g,' ').trim():'\u034f',{a:document.title});
                setTimeout(f, 1e3);
              };
              f();
            }],
            ['Extract videos', () => (document.documentElement.innerText=[...document.querySelectorAll`#contents a[href]`].map(a=>a.href).filter((a,b,c)=>c.indexOf(a)==b).map(a=>a.slice(-11)).reverse().join`\n`)],
            ['Prevent unload', () => (onbeforeunload=a=>'')],
            ['Extract embedded video', () => {
              // (a=>location.href='https://www.youtube.com/watch?v='+document.querySelector(`iframe[src^="${a}"]`).src.slice(a=a.length,a+11))('https://www.youtube.com/embed/')
              const f = () => {
                const ee = qsa('iframe');
                if(ee.length === 0) return setTimeout(f);

                const e = ee[0];
                location.href = e.src;
              };
              f();
            }],
            ['Extract magnet link', () => location.href = document.querySelector('a[href^="magnet:"]').href],
            ['Extract lyrics', () => {
              const lyrics = [];
              w.lyrics = '';

              setInterval(()=>{
                let a = document.querySelector('.ytp-caption-segment');
                a = a ? a.innerText.trim() : '';
                if(lyrics[lyrics.length - 1] === a) return;

                lyrics.push(a);
                w.lyrics = lyrics.join('\n').trim();
              });
            }],
            ['Go to YouTube', () => {
              location.href = `https://www.youtube.com/watch?v=${location.href.match(/([a-zA-Z0-9\-\_]{11})\]?\.[^\.]+$/)[1]}`;
            }],
            ['Random link', () => {
              window.addEventListener('keydown', evt => {
                if(evt.code !== 'Enter') return;

                const aa = [...document.querySelectorAll('a')];
                const a = aa[Math.random() * aa.length | 0];

                evt.preventDefault('ublock');
                evt.stopPropagation('ublock');

                a.target = '_blank';
                a.click();
              });
            }],
          ];

          w.addEventListener('keydown', evt => {
            if(!(evt.code === 'KeyS' && evt.ctrlKey)) return;

            evt.preventDefault('ublock');
            evt.stopPropagation('ublock');

            const i = w.prompt_(scripts.map((a, b) => {
              return `${b + 1}. ${a[0]}`;
            }).join('\n'));
            if(i === null) return;

            try{
              scripts[(i | 0) - 1][1]();
            }catch(e){
              alert_(e);
            }
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const disableListeners = () => {
          const blackListedListeners = [
            'contextmenu',
            'beforeunload',
            'unload',
            'error',

            ...0 ? [
              ...1 ? [
                'keydown',
                'keypress',
                'keyup',
              ] : [],

              ...1 ? [
                'mouseenter',
                'mouseover',
                'mousemove',
                'mousedown',
                'mouseup',
                'auxclick',
                'click',
                'dblclick',
                'wheel',
                'mouseleave',
                'mouseout',
                'select',
                'pointerlockchange',
                'pointerlockerror',
              ] : [],
            ] : [],
          ];

          [
            w,
            document,
          ].forEach(target => {
            blackListedListeners.forEach(type => {
              Object.defineProperty(target, `on${type}`, {
                get: nop,
                set: nop,
              });
            });
          });

          w.addEventListener('keydown', evt => {
            switch(evt.code){
              case 'F5':
                if(sessionStorage['ublock-prevent-hard-reload']) break;

                evt.preventDefault('ublock');
                evt.stopPropagation('ublock');

                if(window.parent.frames.length === 0){
                  try{
                    window.scrollTo(0, 0);
                    const d = document;
                    const e = d.body || d.documentElement;
                    e.innerHTML = '';
                  }catch(err){
                    // (window.console_ || console).log(err);
                  }
                }
                
                w.location.reload();
                break;
            }
          });

          proxify(w.EventTarget.prototype, 'addEventListener', {
            apply(f, t, args){
              const type = args[0];
              if(blackListedListeners.includes(type)) return nop;

              if(type === 'keydown'){
                args[1] = (f => evt => {
                  try{ f(evt); }
                  catch(err){
                    // (window.console_ || console).log(err);
                  }
                })(args[1]);
              }

              return f.apply(t, args);
            }
          });

          {
            const authenticateEvent = (f, t, args) => {
              if(args[0] !== 'ublock'){
                if(blackListedListeners.some(type => type === t.type)) return nop;
                if(t.type === 'auxclick') return nop;

                if(t.type === 'keydown'){
                  const {code} = t;
                  if(/^F\d+$/.test(code)) return nop;
                  if(code === 'KeyJ' && t.ctrlKey && t.shiftKey) return nop;
                  if(code === 'KeyL' && t.ctrlKey) return nop;
                }
              }

              return f.apply(t, args);
            };

            proxify(w.Event.prototype, 'preventDefault', {
              apply(f, t, args){
                return authenticateEvent(f, t, args);
              }
            });

            proxify(w.Event.prototype, 'stopPropagation', {
              apply(f, t, args){
                return authenticateEvent(f, t, args);
              }
            });
          }

          // proxify(w.Node.prototype, 'dispatchEvent', {
          //   apply(f, t, args){
          //     if(t.target) return nop;
          //     return f.apply(t, args);
          //   }
          // });

          {
            let whiteList = [
            ];

            let url = (w.location.href.match(/^[^\/]+?\:\/{2,3}(.+)/) || [])[1];
            if(whiteList.some(a => url.startsWith(a)))
              return;

            let stage = 0;

            w.addEventListener('load', () => {
              stage = 1;
            });

            const block = () => {
              let body = document.body;

              if(body){
                let ee = document.querySelectorAll('*');
                for(let i = 0; i !== ee.length; i++){
                  let e = ee[i];

                  blackListedListeners.forEach(type => {
                    e.removeAttribute(`on${type}`);
                  });
                }
              }

              if(stage === 0) w.setTimeout(block);
            };

            block();
          }
        };

        if(
          location.href.startsWith('https://mail.google.com/') ||
          location.href.startsWith('https://drive.google.com/') ||
          location.href.startsWith('https://translate.google.co.uk/') ||
          location.href.startsWith('https://esolangs.org/w/index.php')
        ){
          disableListeners();
          return;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(w === top){
          const urlBlacklist = [
            'https://www.youtube.com/watch?',
            'https://www.youtube.com/results?',
          ];

          const titleBlacklist = [
            ' - YouTube',
          ];

          const blackListed = urlBlacklist.some(a => url.startsWith(a));

          const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
          delete Document.prototype.title;

          let origTitle = '';
          let curTitle = '';

          Object.defineProperty(Document.prototype, 'title', {
            get(){
              return curTitle;
            },

            set(title){
              if(blackListed){
                if(!Array.isArray(title)) return;
                if(title.length !== 2) return;
                if(title[0] !== 'ublock-title') return;
                title = title[1];
              }

              title = String(title);
              curTitle = title;

              if(title === '') title = '\u034F';
              desc.set.call(document, title);
            },
          });

          const f = () => {
            try{
              const title = desc.get.call(document);
              if(title === '' || title === '\u034F') return setTimeout(f, 1e3);

              origTitle = title;

              for(const t of titleBlacklist)
                if(origTitle.endsWith(t))
                  origTitle = origTitle.slice(0, origTitle.length - t.length);

              document.title = blackListed ? ['ublock-title', ''] : origTitle;
            }catch(err){
              // (window.console_ || console).log(err);
            }

            if(blackListed) setTimeout(f, 1e3);
          };

          f();
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(!url.startsWith('https://bugs.chromium.org/')){
          let rot = 0;
          let nav = 0;

          window.addEventListener('keydown', evt => {
            if(!(evt.ctrlKey && (evt.code === 'ArrowLeft' || evt.code === 'ArrowRight'))) return;

            const elem = document.activeElement;
            if(elem !== null){
              const tag = elem.tagName.toLowerCase();
              if(tag === 'input' || tag === 'textarea') return;
            }

            evt.preventDefault('ublock');
            evt.stopPropagation('ublock');

            const isLeft = evt.code === 'ArrowLeft';
            const isRight = evt.code === 'ArrowRight';

            if(/^file.*\.(?:png|jpg)$/i.test(url)){
              if(nav) return;
              nav = 1;

              (async () => {
                const [prefix, match] = url.match(/\/(.*?)(\d+)\)?\.(?:png|jpg)$/i).slice(1);
                const index = match | 0;
                const len = match.length;

                location.href = await getNextImgUrl();

                async function getNextImgUrl(){
                  const indexNext = await getNextIndex(index);

                  if(await exists(indexNext, 1))
                    return getUrl(indexNext, 1);

                  return getUrl(indexNext, 0);
                }

                async function getNextIndex(index){
                  if(isRight){
                    if(await exists(index + 1)) return index + 1;
                    return 1;
                  }

                  if(index !== 1) return index - 1;

                  let start = 1;
                  let end = 2;

                  while(await exists(end)){
                    start = end;
                    end <<= 1;
                  }

                  while(1){
                    const index = start + end >> 1;
                    
                    if(await exists(index)){
                      if(start === index) break;
                      start = index;
                    }else{
                      if(end === index) break;
                      end = index;
                    }
                  }

                  return start;
                }

                function exists(index, pad=1){
                  return new Promise(res => {
                    const b = res.bind;
                    const r = b.call(b, res, null);
                    const img = new Image();
                    
                    img.onload = r(1);
                    img.onerror = r(0);
                    img.src = getUrl(index, pad);
                  });
                }

                function getUrl(index, pad=1){
                  return url.replace(/(\/.*?)(\d+)(\)?\.(?:png|jpg))$/i, (a, b, c, d) => {
                    const s = pad ? String(index).padStart(len, '0') : String(index);
                    return `${b}${s}${d}`;
                  });
                }
              })().catch(log);
              return;
            }

            rot = rot + (isLeft ? -1 : 1) & 3;

            const c = document.body.classList;
            const index = [...c].findIndex(a => /^ublock-rot-[0123]$/.test(a));

            if(index !== -1) c.remove(c[index]);
            c.add(`ublock-rot-${rot}`);
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        Object.defineProperty(w.navigator, 'userAgent', {
          get(){
            return 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36';
          }
        });

        [
          'console',
          'alert',
          'prompt',
          'confirm',
          'open',

          // Service workers
          'Cache',
          'CacheStorage',
          'Client',
          'Clients',
          'ExtendableEvent',
          'FetchEvent',
          'InstallEvent',
          'NotificationEvent',
          'PeriodicSyncEvent',
          'PeriodicSyncManager',
          'PeriodicSyncRegistration',
          'ServiceWorker',
          'ServiceWorkerContainer',
          'ServiceWorkerGlobalScope',
          'ServiceWorkerRegistration',
          'SyncEvent',
          'SyncManager',
          'SyncRegistration',
          'wClient',
          'Navigator.serviceWorker',
          'navigator.serviceWorker',
          'SharedWorker',
          'NetworkInformation',
        ].forEach(a => {
          a = a.split`.`;

          var b = a.pop();
          var obj = a.reduce((a, b) => a[b], w);

          Object.defineProperty(obj, b, {
            value: nop,
            writable: false,
          });
        });

        proxify(w, 'Worker', {
          construct(ctor, args){
            try{
              var source = `${injectedWorkerCode}importScripts('${args[0]}');`;
              var blob = new Blob([source]);
              var url = w.URL.createObjectURL(blob);
            }catch(a){}
            return new ctor(url);
          }
        });

        Object.defineProperty(w, 'googletag', {
          get: () => ({cmd: []}),
          set: nop,
        });

        {
          const styles = new WeakSet();

          proxify(w.Node.prototype, 'removeChild', {
            apply(f, t, args){
              if(styles.has(args[0])) return nop;
              return f.apply(t, args);
            }
          });

          proxify(w.Element.prototype, 'remove', {
            apply(f, t, args){
              if(styles.has(t)) return nop;
              return f.apply(t, args);
            }
          });

          proxify(w.Element.prototype, 'attachShadow', {
            apply(f, t, args){
              const d = w.document;
              const sr = f.apply(t, args);

              const style = d.createElement('style');
              style.innerHTML = `
                *{
                  opacity: 0 !important;
                  pointer-events: none !important;
                }
              `;
              sr.appendChild(style);
              styles.add(style);

              const xhr = new XMLHttpRequest();
              xhr.onreadystatechange = () => {
                if(xhr.readyState !== 4 || xhr.status !== 200) return;

                let s = xhr.responseText;

                s = s.replace(/\/\* #{3} (\S+)\s*(.*?)\*\//gs, (a, b, c) => {
                  if(!url.startsWith(b)) return a;
                  return c;
                });

                w.requestAnimationFrame(() => {
                  style.innerHTML = s;
                });
              };
              xhr.open('GET', STYLE_URL);
              xhr.send(null);

              return sr;
            }
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          const whiteList = [
            'https://www.youtube.com/',
          ];

          const gracePeriod = 100;

          if(!whiteList.some(a => url.startsWith(a))){
            let loaded = 0;
            let enhanced = 0;

            const incLoad = () => {
              setTimeout(() => {
                loaded++;
              }, gracePeriod);
            };

            window.addEventListener('load', () => {
              incLoad();
            });

            document.addEventListener('DOMContentLoaded', () => {
              incLoad();
            });

            const f = () => {
              const elems = qsa('video');
              let e;

              for(e of elems){
                if(!e.paused) e.pause();
                e.currentTime = 0;
                e.autoplay = false;
                e.muted = shouldBeMuted;
              }

              if(elems.length !== 0 && !enhanced){
                enhanceVideo();
                enhanced = 1;
              }

              if(loaded !== 2) return setTimeout(f);
            };

            f();

            setInterval(()=>{debugger});

            proxify(w.Node.prototype, 'appendChild', {
              apply(f, t, args){
                const e = args[0];
                if(e === nop) return nop;

                if(e.tagName === 'VIDEO'){
                  e.autoplay = false;
                  e.currentTime = 0;
                }

                args[0] = e;
                const result = f.apply(t, args);

                return result;
              }
            });
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          const whiteList = [
            'https://www.youtube.com/',
          ];

          if(!whiteList.some(a => url.startsWith(a))){
            proxify(Document.prototype, 'createElement', {
              apply(f, t, args){
                if(String(args[0]).toLowerCase().trim() === 'iframe')
                  return nop;

                return f.apply(t, args);
              }
            });
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        proxify(w, 'Promise', {
          construct(f, args){
            var promise = new f(...args);
            return promise.catch(nop);
          }
        });

        proxify(w, 'eval', {
          apply(f, t, args){
            if(`${args[0]}`.includes('payload')) return nop;
            // return new Function(args[0])();
            return f(args[0]);
          }
        });

        proxify(w, 'fetch', {
          apply(f, t, args){
            var promise = f.apply(t, args);
            promise.catch(nop);
            return promise;
          }
        });

        proxify(w.Function.prototype, 'toString', {
          apply(f, t, args){
            if(symbol in t) return t[symbol];
            return f.apply(t, args);
          }
        });

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        {
          const blackList = [
            'https://twitter.com/',
          ];

          if(blackList.some(a => url.startsWith(a))){
            const proto = HTMLVideoElement.prototype;
            const mutedDesc = Object.getOwnPropertyDescriptor(proto, 'muted');

            proxify(proto, 'play', {
              apply(f, t, args){
                if(args[0] !== 'ublock') return nop;
                return f.apply(t, args);
              }
            });

            proxify(proto, 'pause', {
              apply(f, t, args){
                if(args[0] !== 'ublock') return nop;
                return f.apply(t, args);
              }
            });

            Object.defineProperty(proto, 'muted', {
              get(){
                return desc.get.call(this);
              },

              set(a){
                if(a && this.classList.contains('ublock-unmuted')) return;
                desc.set.call(this, a);
              },
            });
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        disableListeners();

        (proxify => {
          var textBlackList = [
          ];

          var textReplacement = 'ctx';

          var emojiReg = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+/g;

          proxify = ((proxify, ctx) => {
            return (prop, func) => {
              return proxify(ctx, prop, {
                apply: func,
              });
            };
          })(proxify, w.CanvasRenderingContext2D.prototype);

          proxify('measureText', filterText);
          proxify('strokeText', filterText);
          proxify('fillText', filterText);

          function filterText(f, g, args){
            var str = String(args[0]);
            var fs = g.fillStyle;

            str = str.replace(emojiReg, '');
            if(textBlackList.some(a => a.test(str))) str = textReplacement;

            args[0] = str;
            return f.apply(g, args);
          }

          function reload(){
            var style = document.body.style;

            style.setProperty('display', 'none', 'important');
            style.setProperty('visibility', 'hidden', 'important');
            style.setProperty('opacity', '0', 'important');
            
            window.location.reload();

            return nop;
          }
        })(proxify);

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(
          url.startsWith('https://www.youtube.com/') && !url.includes('&list=') ||
          url.startsWith('https://github.com/')
        ) (() => {
          proxify(w.Node.prototype, 'appendChild', {
            apply(f, t, args){
              var result = f.apply(t, args);
              var elem = args[0];

              if(elem.tagName === 'IFRAME'){
                try{
                  ublockFunc(elem.contentWindow, url);
                }catch(e){
                  // alert_(e.stack);
                }
              }

              return result;
            }
          });

          proxify(w.History.prototype, 'pushState', {
            apply(f, t, args){
              var url = args[2];

              top.location.href = url;
              w.document.body.innerHTML = '';

              return nop;
            }
          });

          proxify(w.History.prototype, 'replaceState', {
            apply(f, t, args){
              var url = args[2];

              if(url === w.location.href)
                return nop;

              top.location.href = url;
              w.document.body.innerHTML = '';

              return nop;
            }
          });
        })();

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function proxify(obj, prop, traps=null){
          var b = traps !== null;
          var proxy, t;

          if(b){
            t = obj[prop];
          }else{
            t = obj;
            traps = prop;
          }

          proxy = new w.Proxy(t, traps);
          proxy[symbol] = `${t}`;

          if(b){
            obj[prop] = proxy;
          }

          return proxy;
        }
      }

      function injectedWorkerFunc(){
        self.console_ = self.console;
        var log = self.console_.log.bind(self.console_);

        var symbol = Symbol('ublock');
        var toPrim = () => '1';
        var nopf = function(){};

        var nop = proxify(nopf, {
          getPrototypeOf(){ return null; },
          setPrototypeOf(){ return nop; },
          isExtensible(){ return false; },
          preventExtensions(){ return nop; },

          getOwnPropertyDescriptor(t, prop){
            if(prop === 'prototype')
              return Object.getOwnPropertyDescriptor(t, prop);

            return {
              writable: false,
              configurable: true,
            };
          },

          defineProperty(){ return nop; },
          has(){ return nop; },

          get(t, prop){
            if(prop === Symbol.toPrimitive) return toPrim;
            return nop;
          },

          set(){ return true; },
          deleteProperty(){ return nop; },
          ownKeys(){ return ['prototype']; },
          apply(){ return nop; },
          construct(){ return nop; },
        });

        [
          'Worker',
        ].forEach(a => {
          a = a.split`.`;

          var b = a.pop();
          var obj = a.reduce((a, b) => a[b], self);

          Object.defineProperty(obj, b, {
            value: nop,
            writable: false,
          });
        });

        function proxify(obj, prop, traps = null){
          var b = traps !== null;
          var proxy, t;

          if(b){
            t = obj[prop];
          }else{
            t = obj;
            traps = prop;
          }

          proxy = new Proxy(t, traps);
          proxy[symbol] = `${t}`;

          if(b){
            obj[prop] = proxy;
          }

          return proxy;
        }
      }
    };

    ublockFunc();
  };

  var code = `(${script})();`;
  var elem = document.documentElement;

  code = code.replace(/STYLE_URL/g, `'${STYLE_URL}'`);

  elem.setAttribute('onreset', code);
  elem.dispatchEvent(new CustomEvent('reset'));
  elem.removeAttribute('onreset');
})();