/*
 * Primary file for the API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');

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

    // Get the HTTP method
    var method = req.method.toLocaleLowerCase();

    // Send the response
    res.end('Hello World!\n');

    // Log the requested path
    console.log('Request received on path: ' + trimmedPath + ' with this method: ' + method);


});

// Start the server, and have listen on port 3000
server.listen(3000, function() {
    console.log('Server is listening on port 3000')
});