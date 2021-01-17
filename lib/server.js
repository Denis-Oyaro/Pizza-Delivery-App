/*
 * Server process
 */

// Dependencies
const http = require('http');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const { StringDecoder } = require('string_decoder');

// Container for server
const server = {};

// Instantiate http server
server.http = http.createServer((req, res) => {
    // Get the url and parse
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.searchParams;

    // Get the http method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler
        let chosenHandler = server.router[trimmedPath] || handlers.notFound;

        // If the request is within the public directory, use the public handler instead
        if (trimmedPath.includes('public/')) {
            chosenHandler = handlers.public;
        }

        // Construct the data object to send to handler
        const data = { trimmedPath, queryStringObject, method, headers, payload: helpers.parseJsonToObject(buffer) };

        // Route the request to the chosen handler
        chosenHandler(data, function (statusCode, payload, contentType) {
            // Determine the type of response (fallback to JSON)
            contentType = typeof contentType === 'string' ? contentType : 'json';

            // Use the status code called back by the handler, or default to 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            // Return the response parts that are content specific
            let payloadStr = '';
            if (contentType === 'json') {
                res.setHeader('Content-Type', 'application/json');

                // Use the payload called back by the handler, or default to an empty object
                payload = typeof payload === 'object' && payload !== null ? payload : {};

                // Convert payload to string
                payloadStr = JSON.stringify(payload);
            }

            if (contentType === 'html') {
                res.setHeader('Content-Type', 'text/html');

                // Use the payload called back by the handler, or default to an empty string
                payloadStr = typeof payload === 'string' ? payload : '';
            }

            if (contentType === 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon');

                // Use the payload called back by the handler, or default to an empty string
                payloadStr = typeof payload !== 'undefined' ? payload : '';
            }

            if (contentType === 'css') {
                res.setHeader('Content-Type', 'text/css');

                // Use the payload called back by the handler, or default to an empty string
                payloadStr = typeof payload !== 'undefined' ? payload : '';
            }

            if (contentType === 'png') {
                res.setHeader('Content-Type', 'image/png');

                // Use the payload called back by the handler, or default to an empty string
                payloadStr = typeof payload !== 'undefined' ? payload : '';
            }

            if (contentType === 'jpg') {
                res.setHeader('Content-Type', 'image/jpeg');

                // Use the payload called back by the handler, or default to an empty string
                payloadStr = typeof payload !== 'undefined' ? payload : '';
            }

            if (contentType === 'plain') {
                res.setHeader('Content-Type', 'text/plain');

                // Use the payload called back by the handler, or default to an empty string
                payloadStr = typeof payload !== 'undefined' ? payload : '';
            }

            // Return the response parts that are common to all content types
            res.writeHead(statusCode);
            res.end(payloadStr);

            // If response status code is 200, log green, otherwise, log red
            if (statusCode === 200) {
                console.log('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
            } else {
                console.log('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
            }
        });
    });
});

// Server init function
server.init = function () {
    // Start server
    server.http.listen(config.port, () => {
        console.log('\x1b[33m%s\x1b[0m', `listening on port ${config.port}`);
    });
};

// Route requests
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'menuItemsAndShoppingCart/all': handlers.menuItemsAndShoppingCartList,
    'order/create': handlers.orderCreate,
    'order/success': handlers.orderSuccess,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/menuItems': handlers.menuItems,
    'api/shoppingCart': handlers.shoppingCart,
    'api/orders': handlers.orders,
};

// Export module
module.exports = server;
