jcors
=====

This is a proxy server which adds CORS headers to inbound requests

e.g.  http://server.com/anotherservice.com/data.json

where 'server.com' is the hosting server and another 'services.com/data.json'
is the location of data that needs to be loaded by the client app.  The response
from server.com will contain CORS headers


setup
=====

npm install //install the required packages

node src/jcors.js // starts servers


references
=====

Code gratuitously borrowed from:

https://github.com/gr2m/CORS-Proxy
https://github.com/nodejitsu/node-http-proxy