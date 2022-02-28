/*
 * Primary file for API
 *
 */

// Dependencies
var server = require('./lib/server');
// var workers = require('./lib/workers');

// Declare and container of the application
var app = {};


// init function
app.init = function() {
    // Start the Server
    server.init();

    // Start the workers
    // workers.init();
};

//Execute
app.init();

// Export the app for various tasks such testings
module.exports = app;