const SSR = require('./ssr.js');
const isBot = require('isbot');

function SeoSSR(opt){
    opt = opt || {};
    let  localPort = opt.localPort || 80;
    let host = opt.host || 'localhost';
    let staticDir = opt.staticDir || 'static';
    return function(req, res, next){
        var UA = req.headers['user-agent'];
        var isStaticRequest = req.url.indexOf(staticDir+'/') > -1;
        if(UA && isBot(UA) && !isStaticRequest){
          var requestUrl = 'http://'+host+':'+localPort+req.url;
          (async () => {
            try{
              var results = await SSR(requestUrl);
              console.log('return by ssr service', requestUrl)
              res.send(results.html);
            }catch(e){
              console.log('ssr failed', e);
              res.status(500).send('Server error');
            }
          })();
          return;
        } 
        next();
   }
}

module.exports = SeoSSR;