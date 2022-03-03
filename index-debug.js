/*
 * Primary file for API
 *
 */

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
var exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// Declare and container of the application
var app = {};


// init function
app.init = function() {
    // Debigger breakpoint
    debugger;

    // Start the Server
    server.init();
    debugger;

    // Start the workers
    debugger;
    workers.init();
    debugger;

    // Start the CLI
    /*
     *  But make sure it starts last
     */
    debugger;
    setTimeout(function() {
        cli.init();
    }, 100);
    debugger;

    debugger;
    var testVariable = 1;
    console.log('Assigned testVariable');
    debugger;
    testVariable++;
    console.log('IncrementtestVariable');
    debugger;
    testVariable = testVariable * testVariable;
    console.log('Square testVariable');
    debugger;
    testVariable = testVariable.toString();
    console.log('Converted testVariable to string');
    debugger;


    // Call the init script that will throw
    exampleDebuggingProblem.init();
    console.log('Call exampleDebuggingProblem library');
    debugger;
};

//Execute
app.init();

// Export the app for various tasks such testings
module.exports = app;