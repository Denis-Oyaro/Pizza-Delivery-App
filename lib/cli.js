/*
 * CLI-Related tasks
 */

// Dependencies
const readline = require('readline');
const util = require('util');
const EventEmitter = require('events');
class _events extends EventEmitter {}
const e = new _events();
const os = require('os');
const v8 = require('v8');
const _data = require('./data');
const helpers = require('./helpers');

// Instantiate the CLI module object
const cli = {};

// Input handlers (event handlers)
e.on('man', (str) => {
    cli.responders.help();
});

e.on('help', (str) => {
    cli.responders.help();
});

e.on('exit', function (str) {
    cli.responders.exit();
});

e.on('list users', function (str) {
    cli.responders.listUsers();
});

e.on('more user info', function (str) {
    cli.responders.moreUserInfo(str);
});

e.on('list orders', function (str) {
    cli.responders.listOrders(str);
});

e.on('more order info', function (str) {
    cli.responders.moreOrderInfo(str);
});

e.on('list menu items', function (str) {
    cli.responders.listMenuItems();
});

e.on('more menu item info', function (str) {
    cli.responders.moreMenuItemInfo(str);
});

// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function () {
    const commands = {
        exit: 'Kill the CLI (and the rest of the application)',
        man: 'Show this help page',
        help: 'Alias of the "man" command',
        'list users': 'Show a list of all the users in the system who have signed up in the last 24 hours',
        'more user info --(userId)': 'Show details of a specific user',
        'list orders': 'Show a list of all the orders in the system, placed in the last 24 hours',
        'more order info --(orderId)': 'Show details of a specified order',
        'list menu items': 'Show a list of all the current menu items in the system',
        'more menu item info --(menuItemId)': 'Show details of a specified menu item',
    };

    // Show a header for the help page that is as wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show each command, followed by its explanation, in yellow and white respectively
    for (const key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            const padding = 60 - line.length;
            for (let i = 0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace(1);
        }
    }

    cli.verticalSpace(1);

    // End with another horizontal line
    cli.horizontalLine();
};

// Create a vertical space
cli.verticalSpace = function (lines) {
    lines = typeof lines === 'number' && lines > 0 ? lines : 1;
    for (let i = 0; i < lines; i++) {
        console.log('');
    }
};

// Create a horizontal line across the screen
cli.horizontalLine = function () {
    // Get the available screen size
    const width = process.stdout.columns;

    let line = '';
    for (let i = 0; i < width; i++) {
        line += '-';
    }

    console.log(line);
};

// Create centered text on the screen
cli.centered = function (str) {
    str = typeof str === 'string' ? str.trim() : '';

    // Get the available screen size
    const width = process.stdout.columns;

    // Calculate the left padding there should be
    const leftPadding = Math.floor((width - str.length) / 2);

    // Put in left-padded spaces before the string itself
    let line = '';
    for (let i = 0; i < leftPadding; i++) {
        line += ' ';
    }
    line += str;

    console.log(line);
};

// Exit
cli.responders.exit = function () {
    process.exit(0);
};

// List users
cli.responders.listUsers = function () {
    _data.list('users', function (err, userIds) {
        if (!err && userIds && userIds.length > 0) {
            cli.verticalSpace(1);
            userIds.forEach((userId) => {
                _data.read('users', userId, function (err, userData) {
                    // Continue if no errors, there's userData, and the time user signed up is in the last 24 hours
                    if (!err && userData && Date.now() - userData.signedUp <= 24 * 60 * 60 * 1000) {
                        let line = `Name: ${userData.firstname} ${userData.lastname} Email: ${userData.email} SignedUp: ${userData.signedUp}`;
                        console.log(line);
                        cli.verticalSpace(1);
                    }
                });
            });
        }
    });
};

// More user info
cli.responders.moreUserInfo = function (str) {
    // Get user id from the provided string
    const arr = str.split('--');
    const userId = arr.length > 1 && typeof arr[1] === 'string' ? arr[1].trim() : '';
    if (userId) {
        // Look up the user
        _data.read('users', userId, function (err, userData) {
            if (!err && userData) {
                // Remove the hashed password
                delete userData.hashedPassword;

                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(userData, { colors: true });
                cli.verticalSpace();
            }
        });
    }
};

// List recent orders
cli.responders.listOrders = function (str) {
    _data.list('orders', function (err, orderIds) {
        if (!err && orderIds && orderIds.length > 0) {
            cli.verticalSpace(1);
            orderIds.forEach((orderId) => {
                _data.read('orders', orderId, function (err, orderData) {
                    // Continue if no errors, there's orderData, and order placed within last 24 hours
                    if (!err && orderData && Date.now() - orderData.date <= 24 * 60 * 60 * 1000) {
                        let line = `Id: ${orderData.id} Date: ${orderData.date}`;
                        console.log(line);
                        cli.verticalSpace(1);
                    }
                });
            });
        }
    });
};

// More order info
cli.responders.moreOrderInfo = function (str) {
    // Get order id from the provided string
    const arr = str.split('--');
    const orderId = arr.length > 1 && typeof arr[1] === 'string' ? arr[1].trim() : '';
    if (orderId) {
        // Look up the order
        _data.read('orders', orderId, function (err, orderData) {
            if (!err && orderData) {
                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(orderData, { colors: true });
                cli.verticalSpace();
            }
        });
    }
};

// List menu items
cli.responders.listMenuItems = function () {
    _data.list('menuItems', function (err, menuItemIds) {
        if (!err && menuItemIds && menuItemIds.length > 0) {
            cli.verticalSpace(1);
            menuItemIds.forEach((menuItemId) => {
                _data.read('menuItems', menuItemId, function (err, menuItemData) {
                    let line = `Id: ${menuItemData.id} Name: ${menuItemData.name}`;
                    console.log(line);
                    cli.verticalSpace(1);
                });
            });
        }
    });
};

// More menu item info
cli.responders.moreMenuItemInfo = function (str) {
    // Get filename from the provided string
    const arr = str.split('--');
    const menuItemId = arr.length > 1 && typeof arr[1] === 'string' ? arr[1].trim() : '';
    if (menuItemId) {
        // Look up the menu item
        _data.read('menuItems', menuItemId, function (err, menuItemData) {
            if (!err && menuItemData) {
                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(menuItemData, { colors: true });
                cli.verticalSpace();
            }
        });
    }
};

// Input processor
cli.processInput = function (str) {
    str = typeof str === 'string' ? str.trim() : '';

    // Only process the input if the user wrote something, otherwise, ignore it
    if (str) {
        // Codify the unique strings that identify the unique questions allowed to be asked
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'list users',
            'more user info',
            'list orders',
            'more order info',
            'list menu items',
            'more menu item info',
        ];

        // Go through the possible inputs, emit an event when a match is found
        const matchFound = uniqueInputs.some((input) => {
            if (str.toLowerCase().includes(input)) {
                // Emit an event matching the unique input, and include the full string given by the user
                e.emit(input, str);
                return true;
            }
        });

        // If no match is found, tell the user to try again
        if (!matchFound) {
            console.log('Sorry, try again');
        }
    }
};

// Init script
cli.init = function () {
    // Send the start message to the console in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The cli is running');

    // Start the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> ',
    });

    // Create an intial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', (str) => {
        // Send to the input processor
        cli.processInput(str);

        // Re-Initialize the prompt afterwards
        _interface.prompt();
    });

    // If the user stops the CLI - kill the associated process
    _interface.on('close', () => {
        process.exit(0);
    });
};

// Export the module
module.exports = cli;
