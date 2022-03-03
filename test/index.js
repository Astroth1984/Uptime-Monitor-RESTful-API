/*
 *
 *  Test Runner
 */

// Dependencies
var helpers = require('./../lib/helpers');
// A library that assurts that something should equal something else
var assert = require('assert');


// Application Logic for the test Runner
_app = {};

// Container for the testings
_app.tests = {
    'unit': {}
};

// Assurt that helpers getANumer function is returning a number
_app.tests.unit['helpers.getANumber should return a number'] = function(done) {
    var val = helpers.getANumber();
    assert.equal(typeof(val), 'number');
    done();
};

// Assurt that helpers getANumer function is returning 666
_app.tests.unit['helpers.getANumber should return 666'] = function(done) {
    var val = helpers.getANumber();
    assert.equal(val, 666);
    done();
};

// Assurt that helpers getANumer function is returning 6
_app.tests.unit['helpers.getANumber should return 6'] = function(done) {
    var val = helpers.getANumber();
    assert.equal(val, 6);
    done();
};

// Count all the Tests
_app.countTests = function() {
    var counter = 0;
    for (var key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            var subTests = _app.tests[key];
            for (var testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++;
                }
            }
        }
    }
    return counter;
};

// Run all the tests collecting errors and successes
_app.runTests = function() {
    var errors = [];
    var successes = 0;
    var limit = _app.countTests();
    var counter = 0;

    for (var key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            var subTests = _app.tests[key];
            for (var testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    // Closure
                    // To encapsulate all the test specific variables without this nested loops
                    // Overriding each other variables
                    (function() {
                        var tempTestName = testName;
                        var testValue = subTests[testName];

                        // Call the test
                        try {
                            // done() callback
                            testValue(function() {
                                // if it calls back without throwing then it s successeded
                                // Log it in green
                                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                                counter++;
                                successes++;
                                if (counter == limit) {
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            });
                        } catch (e) {
                            // If it throws, then it failed.
                            // Capture the error thrown and log it in red
                            errors.push({
                                'name': testName,
                                'error': e
                            });

                            console.log('\x1b[31m%s\x1b[0m', tempTestName);
                            counter++;
                            if (counter == limit) {
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }

};


// Produce a test outcome Report
_app.produceTestReport = function(limit, successes, errors) {
    console.log('');
    console.log('\x1b[35m%s\x1b[0m', '=================================== BEGIN TEST REPORT ===============================');
    console.log('');
    console.log('\x1b[45m%s\x1b[0m', 'Total Tests: ', limit);
    console.log('\x1b[42m%s\x1b[0m', 'Pass: ', successes);
    console.log('\x1b[41m%s\x1b[0m', 'Fail: ', errors.length);
    console.log('');

    // If there are Errors print them in Details
    if (errors.length > 0) {
        console.log('\x1b[31m%s\x1b[0m', '---------------------- BEGIN ERROR DETAILS ----------------------');
        console.log('');
        errors.forEach(function(testError) {
            console.log('');
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error);
            console.log('');
        });

        console.log('\x1b[31m%s\x1b[0m', '---------------------- END ERROR DETAILS ----------------------');
    };

    console.log('');
    console.log('\x1b[35m%s\x1b[0m', '=================================== END TEST REPORT ===============================');
};

// Run the Tests
_app.runTests();