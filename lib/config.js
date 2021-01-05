/*
 * Configurattions of the app
 */

// Dependencies

// Instantiate config object
const config = {
    port: 3000,
    hashingSecret: 'ThisIsASecret',
    stripe: {
        testSecretKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
    },
    mailgun: {
        apiKey: process.env.NODE_MAILGUN_API_KEY,
        sandboxDomainName: process.env.NODE_MAILGUN_DOMAIN_NAME,
    },
};

// Export module
module.exports = config;
