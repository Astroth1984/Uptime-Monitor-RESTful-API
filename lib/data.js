/*
 *
 * A library for storing and editing data
 *
 */

// Dependenciesvar
var fs = require('fs');
/*
 *  Normalize the path to different directories
 */
var path = require('path');

// Container for the module (to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Function to write data to a file
lib.create = function(dir, file, data, callback) {
    // Open the file for writing data
    /*
     * wx flag for writing
     */
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Convert data to string to write it to file
            var stringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            });

        } else {
            callback('Could not create new file, it may already exists');
        }
    });
};

// Read data from a file
lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data) {
        callback(err, data);
    });
};


// Update data inside a file
/*
 * r+ tag to open and write into file
 * throw an err if file doesn't created yet
 */
lib.update = function(dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Convert data to string to write it to file
            var stringData = JSON.stringify(data);

            // Truncate a file to check if the updates are already has been added
            fs.ftruncate(fileDescriptor, function(err) {
                if (!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if (!err) {
                            fs.close(fileDescriptor, function(err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file');
                                }
                            })
                        } else {
                            callback('Error writing to existing file');
                        }
                    });

                } else {
                    callback('Error truncating file');
                }
            })
        } else {
            callback('Could not open file for updating, it may not exist yet');
        }
    });
};


// Delete file
lib.delete = function(dir, file, callback) {
    // Unlink file from file system
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err) {
        if (!err) {
            callback(false)
        } else {
            callback('Error deleting the file');
        }
    })
}




// Export the module
module.exports = lib;