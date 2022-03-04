/*
 *
 *  Test Runner
 */


// Override NODE_ENV variable
process.env.NODE_ENV = 'testing';


// Application Logic for the test Runner
_app = {};

// Container for the testings
_app.tests = {};

// Add on the unit tests as a dependency
_app.tests.unit = require('./unit');
// Add on the API tests as a dependency
_app.tests.api = require('./api');

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
    var spacesLimit = '';
    var spacesFail = '';
    var spacesPass = '';
    for (var j = 0; j < successes; j++) {
        spacesPass += ' ';
    }
    for (var k = 0; k < limit; k++) {
        spacesLimit += ' ';
    }
    for (var l = 0; l < errors.length; l++) {
        spacesFail += ' ';
    }

    console.log('');
    console.log('\x1b[35m%s\x1b[0m', '=================================== BEGIN TEST REPORT ===============================');
    console.log('');
    console.log('\x1b[45m%s\x1b[0m', 'Total Tests:' + spacesLimit + '', limit);
    console.log('\x1b[42m%s\x1b[0m', 'Pass:' + spacesPass + '', successes);
    console.log('\x1b[41m%s\x1b[0m', 'Fail:' + spacesFail + '', errors.length);
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

    // Kill the server after running all tests
    process.exit(0);
};

// Run the Tests
_app.runTests();