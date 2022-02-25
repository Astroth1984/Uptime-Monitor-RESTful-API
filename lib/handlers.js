/*
 * Request handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// Define all the handlers
var handlers = {};

// Users
handlers.users = function(data, callback) {
    var acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        /**
         * 405 : http status code for method not allowed
         */
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {}

// Users - Post
/**
 *
 * @TODO
 * Required Data:
 * @param: {firstName, lastName, phone, password, tosAgreement}
 * Optional data : none
 */
handlers._users.post = function(data, callback) {
    // Check all the required fields are filled out
    /*
     * trim() removes whitespace from both sides of a string
     */
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure the the user doesn't already exist
        // Handle phone as a user _id
        _data.read('users', phone, function(err, data) {
            // if err then user doesn't exist
            if (err) {
                /**
                 * Hash the password
                 * with hash() built-in node function
                 */
                var hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // Create the User object
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Store the created user
                    // Inside phone.json file
                    _data.create('users', phone, userObject, function(err) {
                        if (!err) {
                            // The HTTP Status 200 status code : the request has been processed successfully on server.
                            callback(200);
                        } else {
                            console.Console(err);
                            // 500 Internal Server Error
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });

                } else {
                    callback(500, {
                        'Error': 'Could not hash the user\'s password'
                    });
                };

            } else {
                callback(400, { 'Error': 'A user with that phone number already exists' });
            }
        });

    } else {
        /*
         * 400 client error, for sending invalid request
         */
        callback(400, { 'Error': 'Missing requiered fields' });
    }
};

// Users - Get
// Required data: phone
// Optional data: none
/*
 * @TODO:
 */
// Only let an authenticated user access their object. Dont let them access anyone elses.
handlers._users.get = function(data, callback) {
    // Check that phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone : false;
    if (phone) {
        // lookup the user
        _data.read('users', phone, function(err, data) {
            if (!err && data) {
                // Remove user hashedPassword before returning response
                delete data.hashedPassword;
                // Status Code 200 : request has succeeded
                callback(200, data);
            } else
                callback(404);
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Users - Put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user up their object. Dont let them access update elses
handlers._users.put = function(data, callback) {
    // Check for the requiered field
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone : false;


    // Check for the optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Eror if the phone is invalid
    if (phone) {

        // Error if nothing sent to update
        if (firstName || lastName || password) {
            // lookup the user
            _data.read('users', phone, function(err, userData) {
                if (!err && userData) {
                    // Update the necessary fields
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Store the new updates
                    _data.update('users', phone, userData, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not update the user' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Specified user does not exist' });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update' })
        };

    } else {
        callback(400, { 'Error': 'Missing Required fields' })
    };

};

// Users - Delete
// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function(data, callback) {
    // Check that phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // Lookup the user
        _data.read('users', phone, function(err, data) {
            if (!err && data) {
                _data.delete('users', phone, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified user' });
                    }
                });
            } else {
                callback(400, { 'Error': 'Could not find the specified user.' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
};

// Ping handler
handlers.ping = function(data, callback) {
    callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};


// Export the module
module.exports = handlers;