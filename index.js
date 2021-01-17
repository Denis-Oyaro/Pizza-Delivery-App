/*
 * Entry point of application
 */

// Dependencies
const server = require('./lib/server');
const cli = require('./lib/cli');

// Container of app
const app = {};

// Init function
app.init = function () {
    // Start server
    server.init();

    // Start cli, but make sure it starts last
    setTimeout(() => {
        cli.init();
    }, 50);
};

// Start app
app.init();

// Export module
module.exports = app;
