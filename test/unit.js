/**
 *
 *  Unit Tests file
 *
 */


// Dependencies
var helpers = require('./../lib/helpers');
// A library that assurts that something should equal something else
var assert = require('assert');
var logs = require('./../lib/logs');
var exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem');

// Holder for tests
var unit = {};


// Assurt that helpers getANumer function is returning a number
unit['helpers.getANumber should return a number'] = function(done) {
    var val = helpers.getANumber();
    assert.equal(typeof(val), 'number');
    done();
};

// Assurt that helpers getANumer function is returning 666
unit['helpers.getANumber should return 666'] = function(done) {
    var val = helpers.getANumber();
    assert.equal(val, 666);
    done();
};

// Assurt that helpers getANumer function is returning 6
unit['helpers.getANumber should return 6'] = function(done) {
    var val = helpers.getANumber();
    assert.equal(val, 6);
    done();
};


// Logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = function(done) {
    logs.list(true, function(err, logFileNames) {
        assert.equal(err, false);
        // ok : truthy
        assert.ok(logFileNames instanceof Array);
        assert.ok(logFileNames.length > 1);
        done();

    });
};

// Logs.truncate should not throw if logId not correct
unit['logs.truncate should not throw an error if logId does not exist. it should callback an err instead'] = function(done) {
    assert.doesNotThrow(function() {
        logs.truncate('I do not match any log id', function(err) {
            assert.ok(err);
            done();
        });
    }, TypeError);
};

// exampleDebugging should not throw (but it does)
unit['exampleDebuggingProblem.init() should not throw when called'] = function(done) {
    assert.doesNotThrow(function() {
        exampleDebuggingProblem.init();
        done();
    }, TypeError);
};


// Export the tests to the Runner
module.exports = unit;