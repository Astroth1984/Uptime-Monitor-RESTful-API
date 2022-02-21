/*
 * Primary file for the API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
var server = http.createServer((req, res) => {

    // Get the URL and parse it
    /*
     * true : To call Query String module
     */
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the Query string as an Object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the Headers as an Object
    var headers = req.headers;

    // Get the payload, if any
    /*
     * Payload is a stream of data
     */
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    /**
     * append data to the buffer through string decoder
     * bind event handler with .on keyword
     */
    req.on('data', data => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Send the response
        res.end('Hello World!\n');

        // Log the requested path
        console.log('Request received with this payload: ', buffer);
    });
});

// Start the server, and have listen on port 3000
server.listen(3000, function() {
    console.log('Server is listening on port 3000')
});