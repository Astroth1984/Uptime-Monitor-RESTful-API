/*
 *
 *  Example HTTP2 Server
 *
 */

// Dependencies
var http2 = require('http2');

// Init the Server
var server = http2.createServer();

// On a stream, send back a hello world html
server.on('stream', function(stream, headers) {
    stream.respond({
        'status': 200,
        'content-type': 'text/html'
    });
    stream.end('<html><body><p>Hello World !</p></body></html>');
});

// Listen onport 6000
server.listen(6000);