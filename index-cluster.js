/*
 * Primary file for API
 *
 */

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
var cluster = require('cluster');
var os = require('os');

// Declare and container of the application
var app = {};


// init function
app.init = function(callback) {

    /*
     * the Workers and Cli should start on the master thread
     */

    // If we are on the master thread start the background workers and the Cli
    if (cluster.isMaster) {
        // Start the workers
        workers.init();

        // Start the CLI
        /*
         *  But make sure it starts last
         */
        setTimeout(function() {
            cli.init();
            callback();
        }, 100);

        // Fork this process to enter the else block
        //loop as the number of times as the CPUs
        /*
         * The fisrt time this file is executed, cluster.isMaster gets called
         * The second Time this file is executed will know its a fork so the else block is executed
         *
         */
        for (var i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }

    } else {
        // If we are not on the master thread start http Server
        server.init();
    }

};

//Selef invoking only if required directly
// if app is required from an external file, it wont be executed till we enter
// node index.js command
if (require.main === module) {
    app.init(function() {});
}


// Export the app for various tasks such testings
module.exports = app;