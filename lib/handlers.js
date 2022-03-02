/*
 * Request handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

// Define all the handlers
var handlers = {};


/*
 *
 * HTML Handlers
 *
 */

// Index Handler
handlers.index = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method.toLowerCase() == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we\'ll send you a text to let you know',
            'body.class': 'index'
        };


        // Read in a template as a string
        /*
         * str : actual template data (content of the template)
         */
        helpers.getTemplate('index', templateData, function(err, str) {
            if (!err && str) {
                // Add the universal header & footer
                helpers.addUniversalTemplates(str, templateData, function(err, str) {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
        // Return that template as HTML
    } else {
        callback(405, undefined, 'html');
    }
};

// Favicon handler
handlers.favicon = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method.toLowerCase() == 'get') {
        // Read in the favicon's data
        helpers.getStaticAsset('favicon.ico', function(err, data) {
            if (!err && data) {
                // Callback the data
                callback(200, data, 'favicon');
            } else {
                callback(500);
            }
        });
    } else {
        callback(405);
    }
};

// Public assets
handlers.public = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method.toLowerCase() == 'get') {
        // Get the filename being requested
        var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if (trimmedAssetName.length > 0) {
            // Read in the asset's data
            helpers.getStaticAsset(trimmedAssetName, function(err, data) {
                if (!err && data) {

                    // Determine the content type (default to plain text)
                    var contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    // Callback the data
                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        } else {
            callback(404);
        }

    } else {
        callback(405);
    }
};

/*
 * JSON API Handlers
 *
 *
 */

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

        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid from phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, { 'Error': 'Missing Required token in header, or token is invalid' })
            }
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

            // Get the token from the headers
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // Verify that the given token is valid from phone number
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
                if (tokenIsValid) {
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
                    callback(403, { 'Error': 'Missing Required token in header, or token is invalid' });
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

        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid from phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function(err, userData) {
                    if (!err && userData) {
                        _data.delete('users', phone, function(err) {
                            if (!err) {
                                // Delete all of the checks associated with the deleted user
                                var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                var checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    var checksDeleted = 0;
                                    var deletionErrors = false;

                                    // Loop through the checks to delete
                                    userChecks.forEach(function(checkId) {
                                        // Delete the check
                                        _data.delete('checks', checkId, function(err) {
                                            if (err) {
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { 'Error': "Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfully." });
                                                }
                                            }
                                        });
                                    });

                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, { 'Error': 'Could not delete the specified user' });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'Could not find the specified user.' });
                    }
                });
            } else {
                callback(403, { 'Error': 'Missing Required token in header, or token is invalid' });
            }
        });

    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
};


// Tokens
// Redirect Request to the request method handler /toekns
handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for all the tokens methods
handlers._tokens = {};


// Tokens - POST
// Required data: phone, password
// Optional data: none

handlers._tokens.post = function(data, callback) {
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone && password) {
        // lookup the user that matches the phone number
        _data.read('users', phone, function(err, userData) {
            if (!err && userData) {
                // Hash the sent password, and compare it to the password stored in the user object
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token object
                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { 'Error': 'Could not create the new token' });
                        }
                    });

                } else {
                    callback(400, { 'Error': 'Password did not match the specified user\'s stored password' });
                }
            } else {
                callback(400, { 'Error': 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing Required field(s)' });
    }
};

// Tokens - GET
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback) {
    // Check that id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field, or field invalid' })
    }
};


// Tokens - PUT
// Required Data : id, extend
/**
 * @param { extend }: to extend the expiring token
 *
 */
// Optional data: none
handlers._tokens.put = function(data, callback) {
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if (id && extend) {
        // llokup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                // Check to make sure that the token hasn't already expired
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', id, tokenData, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                'Error': 'Could not update the Token\'s expiration'
                            });
                        };
                    });
                } else {
                    callback(400, { 'Error': 'the Token has already expired, and cannot be extended' })
                }
            } else {
                callback(400, { 'Error': 'Specified Token does not exist' })
            }
        });

    } else {
        callback(400, { 'Error': 'Missing required field(s) or field(s) are invalid' });
    }

};

// Tokens - DELETE
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback) {
    // Check that the id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                // Delete the token
                _data.delete('tokens', id, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified token' });
                    }
                });
            } else {
                callback(400, { 'Error': 'Could not find the specified token.' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
    // lookup the token
    _data.read('tokens', id, function(err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};


// Checks
// Redirect Request to the request method handler /checks
handlers.checks = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for all the checks methods
handlers._checks = {};

// Checks - POST
// Required data: protocol,url,method,successCodes,timeoutSeconds
// Optional data: none
handlers._checks.post = function(data, callback) {

    // Validate inputs
    var protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {

        // Get token from headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('tokens', token, function(err, tokenData) {
            if (!err, tokenData) {
                var userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, function(err, userData) {
                    if (!err && userData) {
                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                        // Verify that user has less than the number of max-checks per user (config.js - maxChecks)
                        if (userChecks.length < config.maxChecks) {

                            // Create a random id for the check
                            var checkId = helpers.createRandomString(20);

                            // Create a check Object includes userPhone
                            var checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            }

                            // Store the token object
                            _data.create('checks', checkId, checkObject, function(err) {
                                if (!err) {
                                    // Add checks id to the user's Object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // Save/Update the new user Data
                                    _data.update('users', userPhone, userData, function(err) {
                                        if (!err) {
                                            // Return the data about the new check
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, { 'Error': 'Could not update the user with the new check.' })
                                        }
                                    });

                                } else {
                                    callback(500, { 'Error': 'Could not create the new check' })
                                }
                            });


                        } else {
                            callback(400, { 'Error': 'The user already has the maximum number of checks (' + config.maxChecks + ').' });
                        }

                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' });
    }
};

// Checks - GET
// Required data: id
// Optional data: none
handlers._checks.get = function(data, callback) {
    // Check that id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the check
        _data.read('checks', id, function(err, checkData) {
            if (!err && checkData) {
                // Get the token that sent the request
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the given token is valid and belongs to the user who created the check
                console.log("This is check data", checkData);
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if (tokenIsValid) {
                        // Return check data
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field, or field invalid' })
    }
};

// Checks - PUT
// Required data: id
// Optional data: protocol,url,method,successCodes,timeoutSeconds (one must be sent)
handlers._checks.put = function(data, callback) {
    // Check for required field
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    // Check for optional fields
    var protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    // Error if id is invalid
    if (id) {
        // Error if nothing is sent to update
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // Lookup the check
            _data.read('checks', id, function(err, checkData) {
                if (!err && checkData) {
                    // Get the token that sent the request
                    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    // Verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                        if (tokenIsValid) {
                            // Update check data where necessary
                            if (protocol) {
                                checkData.protocol = protocol;
                            }
                            if (url) {
                                checkData.url = url;
                            }
                            if (method) {
                                checkData.method = method;
                            }
                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            // Store the new updates
                            _data.update('checks', id, checkData, function(err) {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, { 'Error': 'Could not update the check.' });
                                }
                            });
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Check ID did not exist.' });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update.' });
        }
    } else {
        callback(400, { 'Error': 'Missing required field.' });
    }
};

// Checks - DELETE
// Required data: id
// Optional data: none
handlers._checks.delete = function(data, callback) {
    // Check that id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the check
        _data.read('checks', id, function(err, checkData) {
            if (!err && checkData) {
                // Get the token that sent the request
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the given token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if (tokenIsValid) {

                        // Delete the check data
                        _data.delete('checks', id, function(err) {
                            if (!err) {
                                // Lookup the user's object to get all their checks
                                _data.read('users', checkData.userPhone, function(err, userData) {
                                    if (!err) {
                                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                        // Remove the deleted check from their list of checks
                                        var checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            // Re-save the user's data
                                            userData.checks = userChecks;
                                            _data.update('users', checkData.userPhone, userData, function(err) {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { 'Error': 'Could not update the user.' });
                                                }
                                            });
                                        } else {
                                            callback(500, { "Error": "Could not find the check on the user's object, so could not remove it." });
                                        }
                                    } else {
                                        callback(500, { "Error": "Could not find the user who created the check, so could not remove the check from the list of checks on their user object." });
                                    }
                                });
                            } else {
                                callback(500, { "Error": "Could not delete the check data." })
                            }
                        });
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(400, { "Error": "The check ID specified could not be found" });
            }
        });
    } else {
        callback(400, { "Error": "Missing valid id" });
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