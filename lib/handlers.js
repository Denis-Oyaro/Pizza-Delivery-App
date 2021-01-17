/*
 * Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define request handlers
const handlers = {};

/*
 * HTML Handlers
 *
 */

// Index handler
handlers.index = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Pizza Delievery - Made Simple',
            'head.description': 'We offer the most convenient pizza delivery service.',
            'body.class': 'index',
        };

        // Read in content template as a string
        helpers.getTemplate('index', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Account Create Handler
handlers.accountCreate = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Create an account',
            'head.description': 'Signup is easy, and only takes a few seconds.',
            'body.class': 'accountCreate',
        };

        // Read in content template as a string
        helpers.getTemplate('accountCreate', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Create new session
handlers.sessionCreate = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Login to Your Account',
            'head.description': 'Please enter your email and password to access your account.',
            'body.class': 'sessionCreate',
        };

        // Read in content template as a string
        helpers.getTemplate('sessionCreate', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Session has been deleted
handlers.sessionDeleted = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Logged Out',
            'head.description': "You have been logged out of you're account",
            'body.class': 'sessionDeleted',
        };

        // Read in content template as a string
        helpers.getTemplate('sessionDeleted', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Edit your account
handlers.accountEdit = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Account Settings',
            'body.class': 'accountEdit',
        };

        // Read in content template as a string
        helpers.getTemplate('accountEdit', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Account has been deleted
handlers.accountDeleted = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Account Deleted',
            'head.description': 'Your account has been deleted.',
            'body.class': 'accountDeleted',
        };

        // Read in content template as a string
        helpers.getTemplate('accountDeleted', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Favicon Handler
handlers.favicon = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Read in the favicon's data
        helpers.getStaticAsset('favicon.ico', function (err, data) {
            if (err) {
                callback(404);
            } else {
                // Callback the data
                callback(200, data, 'favicon');
            }
        });
    } else {
        callback(405);
    }
};

// Public Assets Handler
handlers.public = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Get the filename being requested
        const trimmedAssetName = data.trimmedPath.replace('public/', '');
        if (trimmedAssetName.length > 0) {
            // Read in the asset's data
            helpers.getStaticAsset(trimmedAssetName, function (err, data) {
                if (err) {
                    callback(404);
                } else {
                    // Determine content type (default to plain text)
                    let contentType = 'plain';
                    if (trimmedAssetName.includes('.css')) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.includes('.png')) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.includes('.jpg')) {
                        contentType = 'jpg';
                    }

                    if (trimmedAssetName.includes('.ico')) {
                        contentType = 'favicon';
                    }

                    // Callback the data
                    callback(200, data, contentType);
                }
            });
        } else {
            callback(404);
        }
    } else {
        callback(405);
    }
};

// Dashboard (view all menu items and current items in shopping cart)
handlers.menuItemsAndShoppingCartList = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Dashboard',
            'body.class': 'menuItemsAndShoppingCartList',
        };

        // Read in content template as a string
        helpers.getTemplate('menuItemsAndShoppingCartList', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Create order
handlers.orderCreate = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Place your order',
            'body.class': 'orderCreate',
        };

        // Read in content template as a string
        helpers.getTemplate('orderCreate', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Order success
handlers.orderSuccess = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Order placed successfully',
            'body.class': 'orderSuccess',
        };

        // Read in content template as a string
        helpers.getTemplate('orderSuccess', templateData, function (err, str) {
            if (err) {
                callback(500, undefined, 'html');
            } else {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, fullStr) {
                    if (err) {
                        callback(500, undefined, 'html');
                    } else {
                        // Return page as html
                        callback(200, fullStr, 'html');
                    }
                });
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

/*
 * JSON API Handlers
 *
 */

// Users handler
handlers.users = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the users sub methods
handlers._users = {};

// Users - post
// Required data: firstname, lastname, email, streetAddress, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
    // Check that all required fields are filled out
    const firstname = typeof data.payload.firstname === 'string' ? data.payload.firstname.trim() : '';
    const lastname = typeof data.payload.lastname === 'string' ? data.payload.lastname.trim() : '';
    const email = typeof data.payload.email === 'string' ? data.payload.email.trim() : '';
    const streetAddress = typeof data.payload.streetAddress === 'string' ? data.payload.streetAddress.trim() : '';
    const password = typeof data.payload.password === 'string' ? data.payload.password.trim() : '';
    const tosAgreement = typeof data.payload.tosAgreement === 'boolean' ? data.payload.tosAgreement : false;

    if (firstname && lastname && helpers.validateEmail(email) && streetAddress && password && tosAgreement) {
        // Make sure the user doesn't already exist
        _data.read('users', email, function (err, data) {
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);

                // Create the user object
                if (hashedPassword) {
                    const userObject = { firstname, lastname, email, streetAddress, hashedPassword, tosAgreement: true };
                    userObject.signedUp = Date.now();

                    // Store the user
                    _data.create('users', email, userObject, function (err) {
                        if (err) {
                            callback(500, { Error: 'Could not create the new user' });
                        } else {
                            callback(200);
                        }
                    });
                } else {
                    callback(500, { Error: "Could not hash the user's password" });
                }
            } else {
                // User already exists
                callback(400, { Error: 'A user with that email already exists' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required fields' });
    }
};

// Users - get
// Required data: email
// Optional data: none
handlers._users.get = function (data, callback) {
    // Check that the email is valid
    const email = typeof data.queryStringObject.get('email') === 'string' ? data.queryStringObject.get('email').trim() : '';
    if (helpers.validateEmail(email)) {
        // Get the token from the headers
        const token = typeof data.headers.token === 'string' ? data.headers.token : '';

        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Look up the user
                _data.read('users', email, function (err, data) {
                    if (err) {
                        callback(404);
                    } else {
                        // Remove the hashed password from the object before returning it to the requester
                        delete data.hashedPassword;
                        // return object to requester
                        callback(200, data);
                    }
                });
            } else {
                callback(403, { Error: 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Users - put
// Required data: email
// Optional data: firstname, lastname,streetAddress, password (at least one must be specified)
handlers._users.put = function (data, callback) {
    // Check for the required field
    const email = typeof data.payload.email === 'string' ? data.payload.email.trim() : '';

    // Check for the optional fields
    const firstname = typeof data.payload.firstname === 'string' ? data.payload.firstname.trim() : '';
    const lastname = typeof data.payload.lastname === 'string' ? data.payload.lastname.trim() : '';
    const password = typeof data.payload.password === 'string' ? data.payload.password.trim() : '';
    const streetAddress = typeof data.payload.streetAddress === 'string' ? data.payload.streetAddress.trim() : '';

    // Error if email is invalid
    if (helpers.validateEmail(email)) {
        // Get the token from the headers
        const token = typeof data.headers.token === 'string' ? data.headers.token : '';

        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Error if nothing is sent to update
                if (firstname || lastname || password || streetAddress) {
                    // look up user
                    _data.read('users', email, function (err, userData) {
                        if (err) {
                            callback(400, { Error: 'The specified user does not exist' });
                        } else {
                            // update necessary fields
                            userData.firstname = firstname || userData.firstname;
                            userData.lastname = lastname || userData.lastname;
                            userData.streetAddress = streetAddress || userData.streetAddress;
                            userData.hashedPassword = helpers.hash(password) || userData.hashedPassword;

                            // Store the new updates
                            _data.update('users', email, userData, function (err) {
                                if (err) {
                                    callback(500, { Error: 'Could not update the user' });
                                } else {
                                    callback(200);
                                }
                            });
                        }
                    });
                } else {
                    callback(400, { Error: 'Missing fields to update' });
                }
            } else {
                callback(403, { Error: 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Users - delete
// Required field: email
handlers._users.delete = function (data, callback) {
    // Check that the email is valid
    const email = typeof data.queryStringObject.get('email') === 'string' ? data.queryStringObject.get('email').trim() : '';
    if (helpers.validateEmail(email)) {
        // Get the token from the headers
        const token = typeof data.headers.token === 'string' ? data.headers.token : '';

        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // Look up the user
                _data.read('users', email, function (err, userData) {
                    if (err) {
                        callback(400, { Error: 'Could not find the specified user' });
                    } else {
                        // Delete user
                        _data.delete('users', email, function (err) {
                            if (err) {
                                callback(500, { Error: 'Could not delete the specified user' });
                            } else {
                                callback(200);
                            }
                        });
                    }
                });
            } else {
                callback(403, { Error: 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Tokens handler
handlers.tokens = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the tokens sub methods
handlers._tokens = {};

// Tokens - post
// Required data: email, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
    // Check that required fields are filled out
    const email = typeof data.payload.email === 'string' ? data.payload.email.trim() : '';
    const password = typeof data.payload.password === 'string' ? data.payload.password.trim() : '';

    if (helpers.validateEmail(email) && password) {
        // Look up the user who matches that email
        _data.read('users', email, function (err, userData) {
            if (err) {
                callback(400, { Error: 'Could not find the specified user' });
            } else {
                // Hash the sent password and compare it to the password in userData object
                if (helpers.hash(password) === userData.hashedPassword) {
                    // If valid, create a new token with a random name. Set expiration date 1 hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = { id: tokenId, expires, email };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, function (err) {
                        if (err) {
                            callback(500, { Error: 'Could not create the new token' });
                        } else {
                            callback(200, tokenObject);
                        }
                    });
                } else {
                    callback(401, { Error: "Password did not match the specified user's stored password" });
                }
            }
        });
    } else {
        callback(400, { Error: 'Missing required field(s)' });
    }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
    // Check that the id is valid
    const id =
        typeof data.queryStringObject.get('id') === 'string' && data.queryStringObject.get('id').trim().length === 20
            ? data.queryStringObject.get('id').trim()
            : '';
    if (id) {
        // Look up the token
        _data.read('tokens', id, function (err, tokenData) {
            if (err) {
                callback(404);
            } else {
                // return object to requester
                callback(200, tokenData);
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
    // Check that the id and extend is valid
    const id = typeof data.payload.id === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : '';
    const extend = typeof data.payload.extend === 'boolean' ? data.payload.extend : false;

    if (id && extend) {
        // Look up the token
        _data.read('tokens', id, function (err, tokenData) {
            if (err) {
                callback(400, { Error: 'The specified token does not exist' });
            } else {
                // Check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', id, tokenData, function (err) {
                        if (err) {
                            callback(500, { Error: "Could not update the token's expiration" });
                        } else {
                            callback(200);
                        }
                    });
                } else {
                    callback(400, { Error: 'The token has expired, and cannot be extended' });
                }
            }
        });
    } else {
        callback(400, { Error: 'Missing required field(s) or field(s) are invalid' });
    }
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function (data, callback) {
    // Check that the id is valid
    const id =
        typeof data.queryStringObject.get('id') === 'string' && data.queryStringObject.get('id').trim().length === 20
            ? data.queryStringObject.get('id').trim()
            : '';
    if (id) {
        // Look up the token
        _data.read('tokens', id, function (err, data) {
            if (err) {
                callback(400, { Error: 'Could not find the specified token' });
            } else {
                // Delete token
                _data.delete('tokens', id, function (err) {
                    if (err) {
                        callback(500, { Error: 'Could not delete the specified token' });
                    } else {
                        callback(200);
                    }
                });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, email, callback) {
    if (!id || !email) {
        callback(false);
    } else {
        // look up the token
        _data.read('tokens', id, function (err, tokenData) {
            if (err) {
                callback(false);
            } else {
                // Check that the token is for the given user, and has not expired
                const tokenValid = tokenData.email === email && tokenData.expires > Date.now();
                callback(tokenValid);
            }
        });
    }
};

// Menu items handler
handlers.menuItems = function (data, callback) {
    const acceptableMethods = ['get'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._menuItems[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the menuItems sub methods
handlers._menuItems = {};

// menuItems - get (Returns all menu items, or a specified menu item)
// Required data: none (only need a valid token in header)
// Optional data: none
handlers._menuItems.get = function (data, callback) {
    // Get the token from the headers
    const token = typeof data.headers.token === 'string' ? data.headers.token : '';
    const id = typeof data.queryStringObject.get('id') === 'string' ? data.queryStringObject.get('id') : '';

    // Verify that the given token is valid
    if (token) {
        _data.read('tokens', token, function (err, tokenData) {
            if (err) {
                callback(403, { Error: 'Specified token does not exist' });
            } else {
                // Check that the token has not expired
                const tokenValid = tokenData.expires > Date.now();
                if (tokenValid) {
                    //Check whether to get a specific menu item or all menu items
                    if (id) {
                        // Look up menu item
                        _data.read('menuItems', id, function (err, menuItemData) {
                            if (err) {
                                callback(404);
                            } else {
                                // return object to requester
                                callback(200, menuItemData);
                            }
                        });
                    } else {
                        // Get list of all menu item ids
                        _data.list('menuItems', function (err, menuItemIds) {
                            if (!err && menuItemIds && menuItemIds.length > 0) {
                                const menuItems = [];
                                const itemsToRetrieve = menuItemIds.length;
                                let retrievedItems = 0;
                                let retrievalErrors = false;

                                // Retrieve each menu item
                                menuItemIds.forEach((itemId) => {
                                    _data.read('menuItems', itemId, function (err, data) {
                                        if (err) {
                                            retrievalErrors = true;
                                        } else {
                                            menuItems.push(data);
                                        }

                                        retrievedItems += 1;

                                        if (retrievedItems === itemsToRetrieve) {
                                            if (retrievalErrors) {
                                                callback(500, { Error: 'Error retrieving one or more menu items' });
                                            } else {
                                                callback(200, { items: menuItems });
                                            }
                                        }
                                    });
                                });
                            } else {
                                callback(500, { Error: 'Error accessing menu items' });
                            }
                        });
                    }
                } else {
                    callback(403, { Error: 'Token has expired' });
                }
            }
        });
    } else {
        callback(403, { Error: 'Missing required token in header, or token is invalid' });
    }
};

// Shopping cart handler
handlers.shoppingCart = function (data, callback) {
    const acceptableMethods = ['post', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._shoppingCart[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the shopping cart sub methods
handlers._shoppingCart = {};

// ShoppingCart - post
// Required data: email, menuItemId
// Optional data: none
handlers._shoppingCart.post = function (data, callback) {
    // Check that required fields are filled out
    const email = typeof data.payload.email === 'string' ? data.payload.email.trim() : '';
    const menuItemId = typeof data.payload.menuItemId === 'string' ? data.payload.menuItemId.trim() : '';

    if (helpers.validateEmail(email) && menuItemId) {
        // Get the token from the headers
        const token = typeof data.headers.token === 'string' ? data.headers.token : '';

        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // look up user
                _data.read('users', email, function (err, userData) {
                    if (err) {
                        callback(400, { Error: 'The specified user does not exist' });
                    } else {
                        // Look up menu item
                        _data.read('menuItems', menuItemId, function (err, menuItemData) {
                            if (err) {
                                callback(400, { Error: 'The specified menu item does not exist' });
                            } else {
                                // Add item to user's shopping cart
                                userData.shoppingCart = userData.shoppingCart || [];
                                userData.shoppingCart.push(menuItemId);

                                // Store the new updates
                                _data.update('users', email, userData, function (err) {
                                    if (err) {
                                        callback(500, { Error: "Could not add menu item to user's shopping cart" });
                                    } else {
                                        callback(200);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                callback(403, { Error: 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field(s)' });
    }
};

// ShoppingCart - delete
// Required data: email, menuItemId
// Optional data: none
handlers._shoppingCart.delete = function (data, callback) {
    // Check that required fields are filled out
    const email = typeof data.payload.email === 'string' ? data.payload.email.trim() : '';
    const menuItemId = typeof data.payload.menuItemId === 'string' ? data.payload.menuItemId.trim() : '';

    if (helpers.validateEmail(email) && menuItemId) {
        // Get the token from the headers
        const token = typeof data.headers.token === 'string' ? data.headers.token : '';

        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // look up user
                _data.read('users', email, function (err, userData) {
                    if (err) {
                        callback(400, { Error: 'The specified user does not exist' });
                    } else {
                        // Look up menu item
                        _data.read('menuItems', menuItemId, function (err, menuItemData) {
                            if (err) {
                                callback(400, { Error: 'The specified menu item does not exist' });
                            } else {
                                // Remove item from user's shopping cart
                                userData.shoppingCart = userData.shoppingCart || [];
                                if (userData.shoppingCart.indexOf(menuItemId) > -1) {
                                    userData.shoppingCart.splice(userData.shoppingCart.indexOf(menuItemId), 1);

                                    // Store the new updates
                                    _data.update('users', email, userData, function (err) {
                                        if (err) {
                                            callback(500, { Error: "Could not remove menu item from user's shopping cart" });
                                        } else {
                                            callback(200);
                                        }
                                    });
                                } else {
                                    callback(400, { Error: "Menu item is not in user's shopping cart" });
                                }
                            }
                        });
                    }
                });
            } else {
                callback(403, { Error: 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field(s)' });
    }
};

// Orders handler
handlers.orders = function (data, callback) {
    const acceptableMethods = ['post'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._orders[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the orders sub methods
handlers._orders = {};

// Orders - post
// Required data: email, cardNumber, cardName
// Optional data: none
handlers._orders.post = function (data, callback) {
    // Check that required fields are filled out
    const email = typeof data.payload.email === 'string' ? data.payload.email.trim() : '';
    const cardNumber = typeof data.payload.cardNumber === 'string' ? data.payload.cardNumber.trim() : '';
    const cardName = typeof data.payload.cardName === 'string' ? data.payload.cardName.trim() : '';

    if (helpers.validateEmail(email) && cardNumber && cardName) {
        // Get the token from the headers
        const token = typeof data.headers.token === 'string' ? data.headers.token : '';

        // Verify that the given token is valid for the email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            if (tokenIsValid) {
                // look up user
                _data.read('users', email, function (err, userData) {
                    if (err) {
                        callback(400, { Error: 'The specified user does not exist' });
                    } else {
                        // Check if user has items in shopping cart
                        const shoppingCart = userData.shoppingCart;

                        if (shoppingCart && shoppingCart.length > 0) {
                            // Get cart items
                            let orderItems = [];
                            let retrievalErrors = false;
                            let retrievedItems = 0;
                            const itemsToRetrieve = shoppingCart.length;

                            shoppingCart.forEach((itemId) => {
                                _data.read('menuItems', itemId, function (err, itemData) {
                                    if (err) {
                                        retrievalErrors = true;
                                    } else {
                                        // Append item to orderItems
                                        orderItems.push(itemData);
                                    }

                                    retrievedItems += 1;

                                    // After retrieving the last shopping cart item
                                    if (retrievedItems === itemsToRetrieve) {
                                        if (retrievalErrors) {
                                            callback(500, { Error: 'Could not process order. Error in retrieving one or more shopping cart items' });
                                        } else {
                                            // Process the payment of order
                                            helpers.processOrderPayment(orderItems, cardNumber, cardName, function (err) {
                                                if (err) {
                                                    callback(500, { Error: 'Could not process order. Payment did not go through' });
                                                } else {
                                                    // Clear user's shopping cart
                                                    userData.shoppingCart = [];

                                                    // Save new user changes
                                                    _data.update('users', email, userData, function (err) {
                                                        if (err) {
                                                            console.log(
                                                                "Error: Could not clear user's shopping cart after successfully processing order payment"
                                                            );
                                                        }

                                                        // Create order record
                                                        const orderId = helpers.createRandomString(20);
                                                        const orderDate = Date.now();
                                                        const orderObject = { id: orderId, user: email, items: orderItems, date: orderDate };

                                                        // Save order record to system
                                                        _data.create('orders', orderId, orderObject, function (err) {
                                                            if (err) {
                                                                console.log(
                                                                    'Error: Could not create a record of the order in the system after successfully processing order payment'
                                                                );
                                                            }

                                                            // Email order receipt to user
                                                            helpers.emailOrderReceipt(orderItems, email, function (err) {
                                                                let successMessage = 'Order created successfully.';
                                                                if (err) {
                                                                    console.log('Error emailing order receipt:', err);
                                                                } else {
                                                                    successMessage += ' Check your email for your order receipt';
                                                                }

                                                                // send response acknowledging payment was made successfully
                                                                callback(200, { Success: successMessage });
                                                            });
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            });
                        } else {
                            callback(400, { Error: 'Could not process order. Shopping cart is empty' });
                        }
                    }
                });
            } else {
                callback(403, { Error: 'Missing required token in header, or token is invalid' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field(s)' });
    }
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Export the module
module.exports = handlers;
