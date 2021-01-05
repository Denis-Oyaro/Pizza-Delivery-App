/*
 * Module for storing and editting data
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '..', '.data/');

// write data to a file
lib.create = function (dir, file, data, callback) {
    // Open the file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', function (err, fd) {
        if (err) {
            callback('Could not create new file. It may already exist');
        } else {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write to file
            fs.writeFile(fd, stringData, function (err) {
                if (err) {
                    callback('Error writing to new file');
                } else {
                    // Close file
                    fs.close(fd, function (err) {
                        if (err) {
                            callback('Error closing new file');
                        } else {
                            callback(false);
                        }
                    });
                }
            });
        }
    });
};

// Read data from a file
lib.read = function (dir, file, callback) {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', function (err, data) {
        if (err) {
            callback(err, data);
        } else {
            callback(false, helpers.parseJsonToObject(data));
        }
    });
};

// Update data inside a file
lib.update = function (dir, file, data, callback) {
    // Open the file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', function (err, fd) {
        if (err) {
            callback('Could not open the file for updating. It may not exist yet');
        } else {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fd, function (err) {
                if (err) {
                    callback('Error truncating file');
                } else {
                    // Write to file
                    fs.writeFile(fd, stringData, function (err) {
                        if (err) {
                            callback('Error writing to existing file');
                        } else {
                            // Close file
                            fs.close(fd, function (err) {
                                if (err) {
                                    callback('Error closing existing file');
                                } else {
                                    callback(false);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

// Delete a file
lib.delete = function (dir, file, callback) {
    // Unlink the file
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
        if (err) {
            callback('Error deleting file');
        } else {
            callback(false);
        }
    });
};

// List all the items in a directory
lib.list = function (dir, callback) {
    fs.readdir(`${lib.baseDir}${dir}/`, function (err, data) {
        if (!err && data && data.length > 0) {
            const trimmedFilenames = [];
            data.forEach(function (filename) {
                trimmedFilenames.push(filename.replace('.json', ''));
            });
            callback(false, trimmedFilenames);
        } else {
            callback(err, data);
        }
    });
};

// Export the module
module.exports = lib;
