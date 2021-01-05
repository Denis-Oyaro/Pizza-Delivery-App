/*
 * Entry point of app
 */

// Dependencies
const http = require('http');
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const { StringDecoder } = require('string_decoder');

// Instantiate http server
const httpServer = http.createServer((req, res) => {
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
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler
        const chosenHandler = router[trimmedPath] || handlers.notFound;

        // Construct the data object to send to handler
        const data = { trimmedPath, queryStringObject, method, headers, payload: helpers.parseJsonToObject(buffer) };

        // Route the request to the chosen handler
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof payload === 'object' && payload !== null ? payload : {};

            // Convert payload to string
            const payloadStr = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadStr);

            // If response status code is 200, log green, otherwise, log red
            if (statusCode === 200) {
                console.log('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode} ${payloadStr}`);
            } else {
                console.log('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode} ${payloadStr}`);
            }
        });
    });
});

// Start server
httpServer.listen(config.port, () => {
    console.log('\x1b[33m%s\x1b[0m', `listening on port ${config.port}`);
});

// Route requests
router = {
    users: handlers.users,
    tokens: handlers.tokens,
    menuItems: handlers.menuItems,
    shoppingCart: handlers.shoppingCart,
    orders: handlers.orders,
};
