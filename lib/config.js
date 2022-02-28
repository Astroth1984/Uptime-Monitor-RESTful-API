/*
 * Create and exportconfiguration variables
 *
 */

// var enivironments = {
//     'staging': {
//         'port': 3000,
//         'envName': 'staging'
//     }
//     'production': {
//         'port': 5000,
//         'envName': 'production'
//     }
// }


// Container for all the environment
var environments = {};

// Staging(default) envirenment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone': '+15005550006'
    }
};

// Production envirenment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsAlsoASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': '',
        'authToken': '',
        'fromPhone': ''
    }
};

// Determine which envirenment was passed as a command-line argument
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

/*
 *
 * Check that the currentEnv is one of the environments object
 * if not set to default env which is staging env
 *
 */
var envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export the module

module.exports = envToExport;