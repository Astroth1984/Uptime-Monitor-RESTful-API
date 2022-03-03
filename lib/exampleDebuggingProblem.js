/*
 *
 * Library demonstrates something throwing when its init() is called
 *
 */

// Dependencies


// Container for the module
var example = {};


// Init function
example.init = function() {
    // this an error created intintionally for testing purposes
    // Error bar is not defined
    var testVariable = undefinedVariable;
};


// Export the module
module.exports = example;