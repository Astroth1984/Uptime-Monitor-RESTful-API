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


// init function
app.init = function(callback) {
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
        callback();
    }, 100)
};

//Selef invoking only if required directly
// if app is required from an external file, it wont be executed till we enter
// node index.js command
if (require.main === module) {
    app.init(function() {});
}


// Export the app for various tasks such testings
module.exports = app;