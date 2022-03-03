/*
 *
 *  API Test
 *
 */

// Dependencies
var app = require('./../index');
var assert = require('assert');
var http = require('http');
var config = require('./../lib/config');


// Holder for the tests
var api = {};

// Helpers
var helpers = {};
helpers.makeGetRequest = function(path, callback) {
    // Configure the request detailes
    var requestDetails = {
        'protocol': 'http:',
        'hostname': 'localhost',
        'port': config.httpPort,
        'method': 'GET',
        'path': path,
        'headers': {
            'Content-Type': 'application/json'
        }
    }

    // Send the request
    var req = http.request(requestDetails, function(res) {
        callback(res);
    });
    req.end();
};

// the main init() should be run without throwing an error
api['app.init should start without throwing'] = function(done) {
    assert.doesNotThrow(function() {
        app.init(function(err) {
            done();
        });
    }, TypeError);
};

// Make request to /ping
api['/ping should respond to GET with 200 status code'] = function(done) {
    helpers.makeGetRequest('/ping', function(res) {
        assert.equal(res.statusCode, 200);
        done();
    });
}

// Make request to /api/users
// 400 : required field is missing (phone)
api['/api/users should respond to GET with 400 status code'] = function(done) {
    helpers.makeGetRequest('/api/users', function(res) {
        assert.equal(res.statusCode, 400);
        done();
    });
}

// Make request to random path
api['random path should respond to GET with 404 status code'] = function(done) {
    helpers.makeGetRequest('/this/path/isInvalid', function(res) {
        assert.equal(res.statusCode, 404);
        done();
    });
}



// Export the test api to the Runner
module.exports = api;