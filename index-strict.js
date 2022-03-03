/*
 * Primary file for API
 *
 */

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');

// Declare and container of the application
var app = {};

// Declare a globale that strict mode should catch
testVariable = 'test strict mode';


// init function
app.init = function() {
    // Start the Server
    server.init();

    // Start the workers
    workers.init();

    // Start the CLI
    /*
     *  But make sure it starts last
     */
    setTimeout(function() {
        cli.init();
    }, 100)
};

//Execute
app.init();

// Export the app for various tasks such testings
module.exports = app;