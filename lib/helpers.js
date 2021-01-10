/*
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const querystring = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return '';
    }
};

// Parse a json string to an object in all cases without throwing
helpers.parseJsonToObject = function (jsonStr) {
    let obj;
    try {
        obj = JSON.parse(jsonStr);
    } catch (err) {
        obj = {};
    }
    return obj;
};

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function (strLength) {
    strLength = typeof strLength === 'number' && strLength > 0 ? strLength : 0;

    if (strLength) {
        // Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';
        for (let i = 0; i < strLength; i++) {
            // Get a random character from the possibleCharacters string
            const randomChar = possibleCharacters[Math.floor(Math.random() * possibleCharacters.length)];

            // Append this character to the final string
            str += randomChar;
        }

        // Return the final string
        return str;
    } else {
        return '';
    }
};

// Validate email address
helpers.validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Process payment of user's order
helpers.processOrderPayment = function (orderItems, cardNumber, cardName, callback) {
    // Calculate order amount
    const orderAmount = helpers.getOrderAmount(orderItems);

    // Send payment to stripe
    helpers.sendStripePayment(orderAmount, cardNumber, cardName, function (err) {
        if (err) {
            callback('Error processing payment with stripe');
        } else {
            callback(false);
        }
    });
};

// Get total amount of order
helpers.getOrderAmount = function (orderItems) {
    if (!orderItems || orderItems.length === 0) {
        return 0;
    }

    let orderAmount = 0;
    orderItems.forEach((item) => {
        orderAmount += item.price;
    });

    return orderAmount;
};

// Send payment to Stripe
helpers.sendStripePayment = function (orderAmount, cardNumber, cardName, callback) {
    // Validate the parameters
    orderAmount = typeof orderAmount === 'number' ? orderAmount : 0;
    cardNumber = typeof cardNumber === 'string' ? cardNumber.trim() : '';
    cardName = typeof cardName === 'string' ? cardName.trim() : '';

    if (orderAmount && cardNumber && cardName) {
        // Configure the request payload
        //Note: Since we are using a test token card (tok_amex), the card name and card number is irrelevant here.
        // They were requested to simulate supplying payment information.
        const payload = {
            amount: orderAmount * 100, // amount in cents
            currency: 'usd',
            source: 'tok_amex',
        };

        // Stringify the payload
        const payloadStr = querystring.stringify(payload);

        // Configure the request details
        const requestDetails = {
            protocol: 'https:',
            hostname: 'api.stripe.com',
            method: 'POST',
            path: '/v1/charges',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payloadStr),
                Authorization: `Bearer ${config.stripe.testSecretKey}`,
            },
        };

        // Instantiate the request object
        const req = https.request(requestDetails, function (res) {
            // Get the response status code
            const status = res.statusCode;
            // Callback successfully if the response status is success
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        // Bind to the error event so that it doesn't get thrown
        req.on('error', function (e) {
            callback(e);
        });

        // Add the payload
        req.write(payloadStr);

        // End the request
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

// Email order receipt
helpers.emailOrderReceipt = function (orderItems, email, callback) {
    // craft order message
    const orderMessage = helpers.craftOrderReceiptMsg(orderItems);

    // send mailgun email
    helpers.sendMailgunEmail(orderMessage, email, function (err) {
        if (err) {
            callback('Error emailing order receipt');
        } else {
            callback(false);
        }
    });
};

// Craft order receipt message
helpers.craftOrderReceiptMsg = function (orderItems) {
    // Get order total
    const orderTotal = helpers.getOrderAmount(orderItems);
    let msg = 'Below is a summary of your order:\n\nItem\t\t\t\t\t\tAmount\n';

    orderItems.forEach((item) => {
        msg += item.name + '\t\t\t\t\t\t' + '$' + item.price + '\n';
    });

    msg += '\n\n';
    msg += 'Total amount:' + '\t\t\t\t\t\t' + '$' + orderTotal;

    return msg;
};

// send mailgun email
helpers.sendMailgunEmail = function (orderMessage, email, callback) {
    // Validate the parameters
    orderMessage = typeof orderMessage === 'string' ? orderMessage.trim() : '';
    email = typeof email === 'string' ? email.trim() : '';

    if (helpers.validateEmail(email) && orderMessage) {
        // Configure the request payload
        const payload = {
            from: `Test User <mailgun@${config.mailgun.sandboxDomainName}>`,
            to: email,
            subject: 'Order Receipt',
            text: orderMessage,
        };

        // Stringify the payload
        const payloadStr = querystring.stringify(payload);

        // Configure the request details
        const requestDetails = {
            protocol: 'https:',
            hostname: 'api.mailgun.net',
            method: 'POST',
            path: `/v3/${config.mailgun.sandboxDomainName}/messages`,
            auth: `api:${config.mailgun.apiKey}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payloadStr),
            },
        };

        // Instantiate the request object
        const req = https.request(requestDetails, function (res) {
            // Get the response status code
            const status = res.statusCode;
            // Callback successfully if the response status is success
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        // Bind to the error event so that it doesn't get thrown
        req.on('error', function (e) {
            callback(e);
        });

        // Add the payload
        req.write(payloadStr);

        // End the request
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

// Get the string content of a template
helpers.getTemplate = function (templateName, data, callback) {
    // Sanity-check parameters
    templateName = typeof templateName === 'string' ? templateName.trim() : '';
    data = typeof data === 'object' && data !== null ? data : {};

    if (templateName) {
        const templateDir = path.join(__dirname, '..', 'templates/');
        fs.readFile(`${templateDir}${templateName}.html`, 'utf8', function (err, str) {
            if (!err && str && str.length > 0) {
                // Do interpolation on the string
                const finalStr = helpers.interpolate(str, data);
                callback(false, finalStr);
            } else {
                callback('No template could be found');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};

// Add the universal header and footer to a string, and pass the provided data object to
// the header and footer for interpolation
helpers.addUniversalTemplates = function (str, data, callback) {
    // Sanity-check parameters
    str = typeof str === 'string' && str.length > 0 ? str : '';
    data = typeof data === 'object' && data !== null ? data : {};

    // Get the header
    helpers.getTemplate('_header', data, function (err, headerStr) {
        if (err) {
            callback('Could not find the header template');
        } else {
            // Get the footer
            helpers.getTemplate('_footer', data, function (err, footerStr) {
                if (err) {
                    callback('Could not find the footer template');
                } else {
                    // Add them all together
                    const fullStr = headerStr + str + footerStr;
                    callback(false, fullStr);
                }
            });
        }
    });
};

// Take a given string and a data object, and find/replace all the keys within it
helpers.interpolate = function (str, data) {
    // Sanity-check parameters
    str = typeof str === 'string' && str.length > 0 ? str : '';
    data = typeof data === 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data object, prepending their key name with "global"
    for (const keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }

    // For each key in the data object, insert its value into the string at the corresponding placeholder
    for (const key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
            // Do the replacement
            const find = '{' + key + '}';
            const replace = data[key];
            str = str.replace(find, replace);
        }
    }

    return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function (filename, callback) {
    // Sanity-check filename
    filename = typeof filename === 'string' && filename.length > 0 ? filename : '';
    if (filename) {
        const publicDir = path.join(__dirname, '..', 'public/');

        //Read asset content
        fs.readFile(`${publicDir}${filename}`, function (err, data) {
            if (err) {
                callback('No file could be found');
            } else {
                callback(false, data);
            }
        });
    } else {
        callback('A valid filename was not specified');
    }
};

// Export the module
module.exports = helpers;
