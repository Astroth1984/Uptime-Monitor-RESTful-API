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
    'envName': 'staging'
};

// Production envirenment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
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