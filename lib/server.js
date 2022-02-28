/*
 *
 * Server - Related Tasks
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// Instantiate the server module object
var server = {};

// Instantiate the HTTP Server
server.httpServer = http.createServer(function(req, res) {
    server.unifiedServer(req, res);
});


// Instantiate the HTTPS Server
/*
 *
 * key, cert to create a secure https server when it starts
 *
 */
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
    server.unifiedServer(req, res);
});


// All the logic for both http and https server
server.unifiedServer = function(req, res) {
    // Get the URL and parse it
    /*
     * true : To call Query String module
     */
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    // Get the payload,if any
    /*
     * Payload is a stream of data
     */
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    /**
     * append data to the buffer through string decoder
     * bind event handler with .on keyword
     */
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        /**
         * Check the router for a matching path for a handler.
         * If one is not found,
         * use the notFound handler instead.
         */
        var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };
        console.log(data.method);

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {

            /*
             * use the status code called back by the handler
             * or the default to 200
             */
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            /*
             * use the payload called back by the handler
             * or the default to an empty object
             */
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            // the payload sent by the handler
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log("Returning this response: ", statusCode, payloadString);

        });
    });

}


// Define the request router
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};

// Init Script
server.init = function() {
    // Start the HTTP Server
    server.httpServer.listen(config.httpPort, function() {
        console.log('The server is up and running now on port ' + config.httpPort);
    });

    // Start the HTTPS Server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('The server is up and running now on port ' + config.httpsPort);
    });
}


// Export the module
module.exports = server;