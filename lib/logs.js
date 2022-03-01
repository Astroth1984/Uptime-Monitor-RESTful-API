/*
 * Library for storing and rotating logs
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');
// Compress and decompress files
var zlib = require('zlib');

// Container for module (to be exported)
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file. Create the file if it does not exist
lib.append = function(file, str, callback) {
    // Open the file for appending
    /*
     * a flag : Open file to append. File is created if it doesn’t exists
     * fs.open(filename, flags, mode, callback)
     * mode : It sets to default as readwrite r+-
     */
    fs.open(lib.baseDir + file + '.log', 'a', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // Append to file and close it
            fs.appendFile(fileDescriptor, str + '\n', function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing file that was being appended');
                        }
                    });
                } else {
                    callback('Error appending to file');
                }
            });
        } else {
            callback('Could open file for appending');
        }
    });
};

// List all the logs, and optionally include the compressed logs
lib.list = function(includeCompressedLogs, callback) {
    fs.readdir(lib.baseDir, function(err, data) {
        if (!err && data && data.length > 0) {
            // FileNames with no .log extension
            var trimmedFileNames = [];
            data.forEach(function(fileName) {

                // Add the .log files
                if (fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }

                /* Add the.gz files
                 * zlib for compressing files
                 * base 64 to read them later
                 */
                if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }

            });
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};

// Compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = function(logId, newFileId, callback) {
    var sourceFile = logId + '.log';
    var destFile = newFileId + '.gz.b64';

    // Read the source file
    // string content of the file : inputString
    fs.readFile(lib.baseDir + sourceFile, 'utf8', function(err, inputString) {
        if (!err && inputString) {
            // Compress the data using gzip
            zlib.gzip(inputString, function(err, buffer) {
                if (!err && buffer) {
                    // Send the data to the destination file
                    // wx flag : for writing
                    fs.open(lib.baseDir + destFile, 'wx', function(err, fileDescriptor) {
                        if (!err && fileDescriptor) {
                            // Write to the destination file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), function(err) {
                                if (!err) {
                                    // Close the destination file
                                    fs.close(fileDescriptor, function(err) {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback(err);
                                        }
                                    });
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err);
                }
            });

        } else {
            callback(err);
        }
    });
};


// Truncate a log file
lib.truncate = function(logId, callback) {
    fs.truncate(lib.baseDir + logId + '.log', 0, function(err) {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

// Export the module
module.exports = lib;