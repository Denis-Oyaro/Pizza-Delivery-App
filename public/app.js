/*
 * Frontend logic for the application
 */

// Container for the frontend application
const app = {};

// Config
app.config = {
    sessionToken: false,
};

// AJAX client for the Restful API
app.client = {};

// Interface for making API calls
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {
    // Set defaults
    headers = typeof headers === 'object' && headers !== null ? headers : {};
    path = typeof path === 'string' ? path : '/';
    method = typeof method === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method : 'GET';
    queryStringObject = typeof queryStringObject === 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof payload === 'object' && payload !== null ? payload : {};
    callback = typeof callback === 'function' ? callback : false;

    // For each query string parameter sent, add it to the path
    let requestUrl = path + '?';
    let counter = 0;
    for (const queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;

            // If at least one query string has already been added, prepend new ones with an ampersand (&)
            if (counter > 1) {
                requestUrl += '&';
            }

            // Add the key and value
            requestUrl += queryKey + '=' + queryStringObject[queryKey];
        }
    }

    // Form the http request as a JSON type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // For each header sent, add it to the request
    for (const headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // If there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    // When the response comes back, handle it
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const responseReturned = xhr.responseText;

            // If callback requested
            if (callback) {
                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }
            }
        }
    };

    // Send the payload as JSON
    const payloadStr = JSON.stringify(payload);
    xhr.send(payloadStr);
};

// Bind the forms
app.bindForms = function () {
    if (document.querySelector('form')) {
        var allForms = document.querySelectorAll('form');
        for (var i = 0; i < allForms.length; i++) {
            allForms[i].addEventListener('submit', function (e) {
                // Stop it from submitting
                e.preventDefault();
                var formId = this.id;
                var path = this.action;
                var method = this.method.toUpperCase();

                // Hide the error message (if it's currently shown due to a previous error)
                document.querySelector('#' + formId + ' .formError').style.display = 'none';

                // Hide the success message (if it's currently shown due to a previous error)
                if (document.querySelector('#' + formId + ' .formSuccess')) {
                    document.querySelector('#' + formId + ' .formSuccess').style.display = 'none';
                }

                // Turn the inputs into a payload
                var payload = {};
                var elements = this.elements;
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].type !== 'submit') {
                        // Determine class of element and set value accordingly
                        var classOfElement =
                            typeof elements[i].classList.value === 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
                        var valueOfElement =
                            elements[i].type === 'checkbox' && !classOfElement.includes('multiselect')
                                ? elements[i].checked
                                : !classOfElement.includes('intval')
                                ? elements[i].value
                                : parseInt(elements[i].value);
                        var elementIsChecked = elements[i].checked;
                        // Override the method of the form if the input's name is _method
                        var nameOfElement = elements[i].name;
                        if (nameOfElement === '_method') {
                            method = valueOfElement;
                        } else {
                            // Create an payload field named "method" if the elements name is actually httpmethod
                            if (nameOfElement === 'httpmethod') {
                                nameOfElement = 'method';
                            }

                            // Create a payload field named "id" if the elements name is actually uid
                            if (nameOfElement === 'uid') {
                                nameOfElement = 'id';
                            }

                            // If the element has the class "multiselect" add its value(s) as array elements
                            if (classOfElement.includes('multiselect')) {
                                if (elementIsChecked) {
                                    payload[nameOfElement] =
                                        typeof payload[nameOfElement] === 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                                    payload[nameOfElement].push(valueOfElement);
                                }
                            } else {
                                payload[nameOfElement] = valueOfElement;
                            }
                        }
                    }
                }

                // If the method is DELETE, the payload should be a queryStringObject instead
                var queryStringObject = method === 'DELETE' ? payload : {};

                // Call the API
                app.client.request(undefined, path, method, queryStringObject, payload, function (statusCode, responsePayload) {
                    // Display an error on the form if needed
                    if (statusCode !== 200) {
                        if (statusCode === 403 || statusCode === 401) {
                            // log the user out
                            app.logUserOut();
                        } else {
                            // Try to get the error from the api, or set a default error message
                            var error = typeof responsePayload.Error === 'string' ? responsePayload.Error : 'An error has occured, please try again';

                            // Set the formError field with the error text
                            document.querySelector('#' + formId + ' .formError').innerHTML = error;

                            // Show (unhide) the form error field on the form
                            document.querySelector('#' + formId + ' .formError').style.display = 'block';
                        }
                    } else {
                        // If successful, send to form response processor
                        app.formResponseProcessor(formId, payload, responsePayload);
                    }
                });
            });
        }
    }
};

// Form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
    var functionToCall = false;
    // If account creation was successful, try to immediately log the user in
    if (formId === 'accountCreate') {
        // Take the email and password, and use it to log the user in
        var newPayload = {
            email: requestPayload.email,
            password: requestPayload.password,
        };

        app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function (newStatusCode, newResponsePayload) {
            // Display an error on the form if needed
            if (newStatusCode !== 200) {
                // Redirect user to login
                window.location = 'session/create';
            } else {
                // If successful, set the token and redirect the user
                app.setSessionToken(newResponsePayload);
                window.location = 'menuItemsAndShoppingCart/all';
            }
        });
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId === 'sessionCreate') {
        app.setSessionToken(responsePayload);
        window.location = 'menuItemsAndShoppingCart/all';
    }

    // If forms saved successfully and they have success messages, show them
    var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2'];
    if (formsWithSuccessMessages.indexOf(formId) > -1) {
        document.querySelector('#' + formId + ' .formSuccess').style.display = 'block';
    }

    // If the user just deleted their account, redirect them to the account-delete page
    if (formId === 'accountEdit3') {
        app.logUserOut(false);
        window.location = '/account/deleted';
    }

    // If the user just placed an order, redirect them to order success page
    if (formId === 'orderCreate') {
        window.location = 'order/success';
    }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {
    var tokenString = localStorage.getItem('token');
    if (typeof tokenString === 'string') {
        try {
            var token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof token === 'object' && token !== null) {
                app.setLoggedInClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {
    var target = document.querySelector('body');
    if (add) {
        target.classList.add('loggedIn');
    } else {
        target.classList.remove('loggedIn');
    }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function (token) {
    if (typeof token === 'object' && token !== null) {
        app.config.sessionToken = token;
        var tokenString = JSON.stringify(token);
        localStorage.setItem('token', tokenString);
        app.setLoggedInClass(true);
    } else {
        app.config.sessionToken = false;
        localStorage.removeItem('token');
        app.setLoggedInClass(false);
    }
};

// Renew the token
app.renewToken = function (callback) {
    var currentToken = typeof app.config.sessionToken === 'object' && app.config.sessionToken !== null ? app.config.sessionToken : false;
    if (currentToken) {
        // Update the token with a new expiration
        var payload = {
            id: currentToken.id,
            extend: true,
        };
        app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function (statusCode, responsePayload) {
            // Display an error on the form if needed
            if (statusCode === 200) {
                // Get the new token details
                var queryStringObject = { id: currentToken.id };
                app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                    // Display an error on the form if needed
                    if (statusCode === 200) {
                        app.setSessionToken(responsePayload);
                        callback(false);
                    } else {
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            } else {
                app.setSessionToken(false);
                callback(true);
            }
        });
    } else {
        app.setSessionToken(false);
        callback(true);
    }
};

// Loop to renew token often
app.tokenRenewalLoop = function () {
    setInterval(function () {
        app.renewToken(function (err) {
            if (!err) {
                console.log('Token renewed successfully @ ' + Date.now());
            }
        });
    }, 1000 * 60);
};

// Bind the logout button
app.bindLogoutButton = function () {
    document.getElementById('logoutButton').addEventListener('click', function (e) {
        // Stop it from redirecting anywhere
        e.preventDefault();

        // Log the user out
        app.logUserOut();
    });
};

// Log the user out then redirect them
app.logUserOut = function (redirectUser) {
    // Set redirectUser to default to true
    redirectUser = typeof redirectUser == 'boolean' ? redirectUser : true;

    // Get the current token id
    var tokenId = typeof app.config.sessionToken.id === 'string' ? app.config.sessionToken.id : false;

    // Send the current token to the tokens endpoint to delete it
    var queryStringObject = {
        id: tokenId,
    };
    app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, function (statusCode, responsePayload) {
        // Set the app.config token as false
        app.setSessionToken(false);

        // Send the user to the logged out page
        if (redirectUser) {
            window.location = '/session/deleted';
        }
    });
};

// Add item to shopping cart
app.addItemToshoppingCart = function (itemId) {
    // Get the logged in user's email
    var email = typeof app.config.sessionToken.email === 'string' ? app.config.sessionToken.email : false;

    // Send the current token to the tokens endpoint to delete it
    const payload = {
        email,
        menuItemId: itemId,
    };
    app.client.request(undefined, 'api/shoppingCart', 'POST', undefined, payload, function (statusCode, responsePayload) {
        if (statusCode === 200) {
            window.location = 'menuItemsAndShoppingCart/all';
        } else {
            console.log('error adding item');
        }
    });
};

// Remove item from shopping cart
app.removeItemFromshoppingCart = function (itemId) {
    // Get the logged in user's email
    var email = typeof app.config.sessionToken.email === 'string' ? app.config.sessionToken.email : false;

    // Send the current token to the tokens endpoint to delete it
    const payload = {
        email,
        menuItemId: itemId,
    };
    app.client.request(undefined, 'api/shoppingCart', 'DELETE', undefined, payload, function (statusCode, responsePayload) {
        if (statusCode === 200) {
            window.location = 'menuItemsAndShoppingCart/all';
        } else {
            console.log('error removing item');
        }
    });
};

// Load data on the page
app.loadDataOnPage = function () {
    // Get the current page from the body class
    var bodyClasses = document.querySelector('body').classList;
    var primaryClass = typeof bodyClasses[0] === 'string' ? bodyClasses[0] : false;

    // Logic for account settings page
    if (primaryClass === 'accountEdit') {
        app.loadAccountEditPage();
    }

    // Logic for dashboard page
    if (primaryClass === 'menuItemsAndShoppingCartList') {
        app.loadMenuItemsAndShoppingCartListPage();
    }
};

// Load the account edit page specifically
app.loadAccountEditPage = function () {
    // Get the phone number from the current token, or log the user out if none is there
    var email = typeof app.config.sessionToken.email === 'string' ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the user data
        const queryStringObject = {
            email,
        };
        app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
            if (statusCode === 200) {
                // Put the data into the forms as values where needed
                document.querySelector('#accountEdit1 .firstNameInput').value = responsePayload.firstname;
                document.querySelector('#accountEdit1 .lastNameInput').value = responsePayload.lastname;
                document.querySelector('#accountEdit1 .displayEmailInput').value = responsePayload.email;
                document.querySelector('#accountEdit1 .streetAddressInput').value = responsePayload.streetAddress;

                // Put the hidden email field into both forms
                const hiddenEmailInputs = document.querySelectorAll('input.hiddenEmailInput');
                for (var i = 0; i < hiddenEmailInputs.length; i++) {
                    hiddenEmailInputs[i].value = responsePayload.email;
                }
            } else {
                // If the request comes back as something other than 200, log the user out (on the assumption that the api is temporarily down or the users token is bad)
                app.logUserOut();
            }
        });
    } else {
        app.logUserOut();
    }
};

// Load the dashboard page specifically
app.loadMenuItemsAndShoppingCartListPage = function () {
    // Get the email from the current token, or log the user out if none is there
    var email = typeof app.config.sessionToken.email === 'string' ? app.config.sessionToken.email : false;
    if (email) {
        // Fetch the menu items
        app.client.request(undefined, 'api/menuItems', 'GET', undefined, undefined, function (statusCode, responsePayload) {
            if (statusCode === 200) {
                const menuItems =
                    typeof responsePayload === 'object' && responsePayload.items instanceof Array && responsePayload.items.length > 0
                        ? responsePayload.items
                        : [];

                if (menuItems.length > 0) {
                    // Sort menu items in ascending order
                    menuItems.sort(compareItems);

                    // Make the menu items into table rows
                    menuItems.forEach((menuItem) => {
                        var table = document.getElementById('menuItemsListTable');
                        var tr = table.insertRow(-1);
                        var td0 = tr.insertCell(0);
                        var td1 = tr.insertCell(1);
                        var td2 = tr.insertCell(2);
                        var td3 = tr.insertCell(3);
                        td0.innerHTML = menuItem.name;
                        td1.innerHTML = menuItem.price;
                        td2.innerHTML = menuItem.currency.toUpperCase();
                        td3.innerHTML =
                            '<button value="' + menuItem.id + '" style="cursor:pointer;font-size:16px" class="AddItemButton"' + '>Add Item</button>';
                    });

                    // Add event listener for add item buttons
                    const AddItemButtons = document.getElementsByClassName('AddItemButton');
                    for (let i = 0; i < AddItemButtons.length; i++) {
                        AddItemButtons[i].addEventListener('click', function (e) {
                            // Stop it from redirecting anywhere
                            e.preventDefault();

                            // Add item to cart
                            app.addItemToshoppingCart(e.target.value);
                        });
                    }
                } else {
                    // Show 'there no menu items' message
                    document.getElementById('noMenuItemsMessage').style.display = 'table-row';
                }

                const queryStringObject = {
                    email,
                };

                // Retrieve the logged in user
                app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                    if (statusCode === 200) {
                        // Determine how many items in shopping cart the user has
                        const shoppingCartItems =
                            typeof responsePayload.shoppingCart === 'object' &&
                            responsePayload.shoppingCart instanceof Array &&
                            responsePayload.shoppingCart.length > 0
                                ? responsePayload.shoppingCart
                                : [];
                        let itemsRetrieved = 0;
                        if (shoppingCartItems.length > 0) {
                            // Show each item in the shopping cart in a new row in the table
                            shoppingCartItems.forEach(function (shoppingCartItemId) {
                                // Get the data for the shopping cart item
                                const newQueryStringObject = {
                                    id: shoppingCartItemId,
                                };
                                app.client.request(undefined, 'api/menuItems', 'GET', newQueryStringObject, undefined, function (statusCode, responsePayload) {
                                    if (statusCode === 200) {
                                        var shoppingCartItem = responsePayload;
                                        // Make the check data into a table row
                                        var table = document.getElementById('shoppingCartListTable');
                                        var tr = table.insertRow(-1);
                                        var td0 = tr.insertCell(0);
                                        var td1 = tr.insertCell(1);
                                        var td2 = tr.insertCell(2);
                                        var td3 = tr.insertCell(3);
                                        td0.innerHTML = shoppingCartItem.name;
                                        td1.innerHTML = shoppingCartItem.price;
                                        td2.innerHTML = shoppingCartItem.currency.toUpperCase();
                                        td3.innerHTML =
                                            '<button value="' +
                                            shoppingCartItem.id +
                                            '" style="cursor:pointer;font-size:16px" class="RemoveItemButton"' +
                                            '>Remove Item</button>';
                                    } else {
                                        console.log('Error trying to load shopping cart item with ID: ', shoppingCartItemId);
                                    }

                                    itemsRetrieved++;

                                    // After retrieving the last item in shopping cart
                                    if (itemsRetrieved === shoppingCartItems.length) {
                                        // Add event listener for remove item buttons
                                        const removeItemButtons = document.getElementsByClassName('RemoveItemButton');
                                        for (let i = 0; i < removeItemButtons.length; i++) {
                                            removeItemButtons[i].addEventListener('click', function (e) {
                                                // Stop it from redirecting anywhere
                                                e.preventDefault();

                                                // Remove item from cart
                                                app.removeItemFromshoppingCart(e.target.value);
                                            });
                                        }

                                        // Show the createOrder CTA
                                        document.getElementById('createOrderCTA').style.display = 'block';
                                    }
                                });
                            });
                        } else {
                            // Show 'you have no shopping cart items' message
                            document.getElementById('noShoppingCartItemsMessage').style.display = 'table-row';
                        }
                    } else {
                        // If the request comes back as something other than 200, log the user out (on the assumption that the api is temporarily down or the users token is bad)
                        app.logUserOut();
                    }
                });
            } else {
                console.log('Error trying to load menu items');
            }
        });
    } else {
        app.logUserOut();
    }
};

// Compare function for sorting items
function compareItems(item1, item2) {
    if (item1.name < item2.name) {
        return -1;
    }
    if (item1.name > item2.name) {
        return 1;
    }
    // item1.name must be equal to item2.name
    return 0;
}

// Init (bootstrapping)
app.init = function () {
    // Bind all form submissions
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // Get the token from localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();

    // Load data on page
    app.loadDataOnPage();
};

// Call the init processes after the window loads
window.onload = function () {
    app.init();
};
