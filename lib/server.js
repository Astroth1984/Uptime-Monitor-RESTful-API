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
var util = require('util');
/*
 * NODE_DEBUG=server
 *
 */
var debug = util.debuglog('server');



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

        // If the request is within the public directory use to the public handler instead
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };
        debug(data.method);

        // Route the request to the handler specified in the router
        try {
            chosenHandler(data, function(statusCode, payload, contentType) {
                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);

            });
        } catch (e) {
            debug(e);
            server.processHandlerResponse(res, method, trimmedPath, 500, { 'Error': 'An unknown error occurred' }, 'json');
        }
    });

};

// Process the response from the handler
server.processHandlerResponse = function(res, method, trimmedPath, statusCode, payload, contentType) {
    // Determine the type of response (fallback to JSON)
    contentType = typeof(contentType) == 'string' ? contentType : 'json';
    /*
     * use the status code called back by the handler
     * or the default to 200
     */
    statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

    // Return the response-parts that are content specific
    var payloadString = '';
    if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload)
    }
    if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof(payload) == 'string' ? payload : '';
    }
    /**
     *  typeof(payload) !== 'undefined' : because typeof payload for
     * image - css - icon is a Buffer not string
     */
    if (contentType == 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'png') {
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }

    // Return the response-parts that are common to all content-types
    res.writeHead(statusCode);
    res.end(payloadString);



    // if the response is 200 print green, otherwise print red
    if (statusCode === 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
    } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
    }
};


// Define the request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'examples/error': handlers.exampleError
};

// Init Script
server.init = function() {
    // Start the HTTP Server
    server.httpServer.listen(config.httpPort, function() {
        console.log('\x1b[36m%s\x1b[0m', 'http server is up and running now on port ' + config.httpPort + ' in ' + config.envName + ' environment');
    });

    // Start the HTTPS Server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('\x1b[35m%s\x1b[0m', 'https server is up and running now on port ' + config.httpsPort + ' in ' + config.envName + ' environment');

    });
}


// Export the module
module.exports = server;