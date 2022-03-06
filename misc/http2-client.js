/*
 *
 *  Example HTTP2 Client
 *
 */

// Dependencies
var http2 = require('http2');

// Create client
var client = http2.connect('http://localhost:6000');

// Create a Request
var req = client.request({
    ':path': '/',
});

// When a message is received, add the pieces of it together till you reach the end
var str = '';
req.on('data', function(chunk) {
    str += chunk;
});

// When the message ends log it out
req.on('end', function() {
    console.log(str);
});


// End the request
req.end();