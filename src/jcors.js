
    var http = require('http'),
        httpProxy = require('http-proxy');

    // Create a proxy server with custom application logic
    var proxy = httpProxy.createProxyServer({});

    // 
    //  Utility functions
    //
    
    // get headers from original request
    var getHeaders = function(req){
        var headers;
        if (req.headers['access-control-request-headers']) {
            headers = req.headers['access-control-request-headers'];
        } else {
            headers = 'accept, accept-charset, accept-encoding, accept-language, authorization, content-length, content-type, host, origin, proxy-connection, referer, user-agent, x-requested-with';
            var _ref = req.headers;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                header = _ref[_i];
                if (req.indexOf('x-') === 0) {
                    headers += ", " + header;
                }
            }
        }
    }

    // TODO:  add http protocol handling
    // parse the target from the original request
    var parseReqToTarget = function(req){
        var _ref1 = req.url.match(/\/([^\/]*)(.*)/);
        var ignore = _ref1[0];
        var hostname = _ref1[1];
        var url = _ref1[2].length==0 ? '/' : _ref1[2]; // if url is blank then go to root
        _ref2 = hostname.split(':'), host = _ref2[0], port = _ref2[1];
        target = {
          host: host,
          port: port || "",
          url: url,
          targetStr:  "http://"+host+ ((port && port.length>0) ? ":" + port : "")
        };
        return target;
    };

    //
    //  proxy event handling
    //
    proxy.on('proxyRes', function(proxyRes, req, res, options){
        console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
        var resultHeaders=getHeaders(proxyRes);
        var cors_headers = {
            'access-control-allow-methods': 'HEAD, POST, GET, PUT, PATCH, DELETE',
            'access-control-max-age': '86400',
            'access-control-allow-headers': resultHeaders,
            'access-control-allow-credentials': 'true',
            'access-control-allow-origin': req.headers.origin || '*'
        };
        for (key in cors_headers) {
          value = cors_headers[key];
          res.setHeader(key, value);
        }
        console.log('Modified Response from the target', JSON.stringify(res._headers, true, 2));
    });

    proxy.on('error', function (err, req, res) {
      console.log("err.message:  "+err.message)
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });
      res.end('ERROR !!!'
        +'\n\n Message:  '+err.message
        +'\n\n request: '+JSON.stringify(req.headers, true, 2)
        +'\n\n response: '+JSON.stringify(res.headers, true, 2));
    });

    
    //
    //  Create/start proxy server
    //
    var server = http.createServer(function(req, res) {

      // get the proxy target
      var target = parseReqToTarget(req);
      req.url = target.url;
      console.log("parsed target: "+JSON.stringify(target));
      
      // do it!
      proxy.web(req, res, { target: target.targetStr });
    });
    
    console.log("listening on port 5050")
    server.listen(5050);

    // Create your target server for testing
    http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
      res.end();
    }).listen(9008);


