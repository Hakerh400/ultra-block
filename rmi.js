'use strict';

const rmi = (...args){
  return new Promise((resolve, reject) => {
    try{
      let host = RMI_HOST;
      let port = RMI_PORT;

      if(typeof args[0] === 'object'){
        const opts = args.shift();

        if(O.has(opts, 'host')) host = opts.host;
        if(O.has(opts, 'port')) port = opts.port;
      }

      const method = args.shift();
      O.assert(typeof method === 'string');
      O.assert(/^(?:\.[a-zA-Z0-9]+)+$/.test(`.${method}`));

      const req = JSON.stringify([method.split('.'), args]);
      const xhr = new window.XMLHttpRequest();

      xhr.onreadystatechange = () => {
        try{
          if(xhr.readyState !== 4) return;

          const {status} = xhr;

          if(status !== 200){
            if(status === 0)
              throw new TypeError(`RMI server is unavailable`);

            throw new TypeError(`RMI server responded with status code ${status}`);
          }

          const res = JSON.parse(xhr.responseText);

          if(res[0])
            throw new O.RMIError(res[1]);

          resolve(res[1]);
        }catch(err){
          reject(err);
        }
      };

      xhr.open('POST', `http://${host}:${port}/`);
      xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
      xhr.send(req);
    }catch(err){
      reject(err);
    }
  });
};

module.exports = rmi;