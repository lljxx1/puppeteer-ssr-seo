# puppter-ssr-seo
express middleware


### exmaple

``` js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var compression = require('compression');
var history = require('connect-history-api-fallback');
var SeoSSR = require('puppter-ssr-seo');
var listenPort = 8096;

app.disable('x-powered-by');

app.use(SeoSSR({
  localPort: listenPort
}));

const staticFileMiddleware = express.static('dist');
app.use(staticFileMiddleware);
app.use(history({
  disableDotRule: true,
  verbose: true
}));

app.use(staticFileMiddleware);
app.use(compression());
server.listen(listenPort);
```