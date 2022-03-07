# Uptime-Monitor-RESTful-API

## Description :

##### The Uptime Monitoring Application is developped with Node.js and the built-in libraries, with no npm dependencies, nor external APIs. This project was built using two main patterns : 
##### - Event Handling Paradigm
##### - Nodeks Callback Pattern
##### The use cases of the project are like follow:

- 1. The API listens on a PORT and accepts incoming HTTP requests for POST, GET, PUT, DELETE, and HEAD.
- 2. The API allows a client to connect, then create a new user, then edit ort delete that user.
- 3. The API allows a user to "sign in" which gives them a token that they can use subsequent authenticated requests.
- 4. The API allows the user to "sign out" which invalidates their token.
- 5. The API allows a signed-in user to use their token to create a new "check".
- 6. The API allows a signed-in user to edit or delete any of their checks.
- 7. In the background, workers perform all the checks at the appropriate times, and send alerts to the users when a check changes its state from "up" to "down", or visa versa.

##### Topics discussed in this project : 
<ol>
    <li>Building RESTful API</li>
    <ul>
        <li> Starting HTTP Server</li>
        <li> Starting HTTPS Server</li>
        <li> Setting up Diffrent dev Envirenments</li>
        <li> Connecting To Twilio API</li>
        <li> Logging Data To files</li>
        <li> User Token Creation & Verification</li>
        <li> CRUD Operations</li>
    </ul>
    <li>Building the App GUI</li>
    <li>Debugging</li>
    <li>Admin CLI</li>
    <li>Gaining Stability</li>
    <ul>
        <li> Handling Thrown Errors</li>
        <li> Unit Tests</li>
        <li> Integration Tests</li>
        <li> Generating Tests Report</li>
    </ul>
    <li>Gaining Performance</li>
    <ul>
        <li> Performance Hooks</li>
        <li> Using Cluster</li>
    </ul>
</ol>

## Building the RESTful API

### Starting http Server

The http Server is created with the http module :
````javascript
server.httpServer = http.createServer(function(req, res) {
    server.unifiedServer(req, res);
});
````
then we have it listen on the port 3000 :
````javascript
server.httpServer.listen(config.httpPort, function() {
        console.log('\x1b[36m%s\x1b[0m', 'http server is up and running now on port ' + config.httpPort + ' in ' + config.envName + ' environment');
    });
````

the function `server.unifiedServer(req, res)` is the method that will handle requests and responses like parsing the Url, Stringfying the data, creating the payload objects ... etc.

### Starting https Server

Before creating the https server, enter the following cammand : 
`openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 keyout key.pem -out cert.pem`
to create [key.pem](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/https/key.pem) and [cert.pem](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/https/cert.pem) files. Those files will serve us as Https server options or configurations for the https server.

````javascript
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};
````
Put the generated files in an object, and then inject it to server creation process like so :
````javascript
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
    server.unifiedServer(req, res);
});
````
And then start the server, listening on port 3001
````javascript
server.httpsServer.listen(config.httpsPort, function() {
        console.log('\x1b[35m%s\x1b[0m', 'https server is up and running now on port ' + config.httpsPort + ' in ' + config.envName + ' environment');

    });
````

### Setting up Diffrent dev Envirenments

We have defined three diffrent envirenments in [config.js](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/lib/config.js), the staging, production and testing envirenment, each one of them runs on diffrent port, to split the contexte usage of each one.

_Staging Envirenment_
````javascript
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
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'Astroth1984-Company, Inc.',
        'yearCreated': '2022',
        'baseUrl': 'http://localhost:3000/'
    }
};
````

_Production Envirenment_
````javascript
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
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'Astroth1984-Company, Inc.',
        'yearCreated': '2022',
        'baseUrl': 'http://localhost:5000/'
    }
};
````

_Testing Envirenment_
````javascript
environments.testing = {
    'httpPort': 4000,
    'httpsPort': 4001,
    'envName': 'testing',
    'hashingSecret': 'thisIsAlsoASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': '',
        'authToken': '',
        'fromPhone': ''
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'Astroth1984-Company, Inc.',
        'yearCreated': '2022',
        'baseUrl': 'http://localhost:5000/'
    }
};
````

And to specify which Envirenment to call while execution : `NODE_ENV=<envName> node index.js`.

## Connecting to Twilio API

Within the [helpers.js]() file, we have create `sendToTwilioSms()` function that sends SMS to clients via Twilio, by also using the keys set up for Twilio configuration in `config.js`:

````javascript
    helpers.sendTwilioSms = function(phone, msg, callback) {
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if (phone && msg) {
        // Configure the request payload hat would be sent to Twilio
        var payload = {
            'From': config.twilio.fromPhone,
            'To': '+1' + phone,
            'Body': msg
        };

        // Strigfy the payload
        var stringPayload = querystring.stringify(payload);

        var requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        var req = https.request(requestDetails, function(res) {
            // Grab the status of the sent request
            var status = res.statusCode;
            // Callback successfully if the request went through
            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code returned was ' + status);
            }
        });

        // Bind to the error event so it doesn't get thrown
        /*
         * Keep the thread alive
         */
        req.on('error', function(e) {
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given params were missing, or invalid');
    }
}
````

## Routes

````javascript
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.public,
    'examples/error': handlers.exampleError
}
````

## Handlers

By calling a specific route, the corressponding handler will be called, and serves us what ever it's designed to do, like rendering an **HTML-Content**, or **JSON Object** or even **CSS**, **png**, **jgep** ...

### JSON API Handlers

This type of handlers, serve or handle Json payload, according to the called service or the queiry string filled.

**_Service 1: api/users/_** [POST]
**_Service 1: api/users/_** [GET] `localhost:3000/api/users?phone=<userPhone>`
**_Service 1: api/users/_** [PUT]
**_Service 1: api/users/_** [DELETE] `localhost:3000/api/users?phone=<userPhone>`


**_Service 2: api/tokens/_** [POST]
**_Service 2: api/tokens/_** [GET] `localhost:3000/api/tokens?id=<tokenId>`
**_Service 2: api/tokens/_** [PUT]
**_Service 2: api/tokens/_** [DELETE] `localhost:3000/api/tokens?id=<tokenId>`


**_Service 3: api/checks/_** [POST]
**_Service 3: api/checks/_** [GET] `localhost:3000/api/checks?id=<checkId>`
**_Service 3: api/check/_** [PUT]
**_Service 3: api/checks/_** [DELETE] `localhost:3000/api/checks?id=<checkId>`

### HTML Handlers

Those handlers render HTML-Content, and their use will be shown in **Building the App GUI**.

For more details about the handlers, check the [handlers.js](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/lib/handlers.js) file.

## User Token Creation & Verification

To create a Token Id, we have used `createRandomString()` and assign it to _Token object_
````javascript
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the possible characters that could be alphanumeric
        var possibleCharacters = 'abcdefghijklmnopkrstuvwxyz0123456789';

        // Start the final string
        var str = '';
        for (i = 0; i < strLength; i++) {
            // Get random character from possibleCharacters
            var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            // Append this character to the end of the string
            str += randomChar;
        }

        // Return the final string
        return str;

    } else {
        return false;
    }
}
````

And then Verify the validation of the token with each Request sent to the server

````javascript
handlers._tokens.verifyToken = function(id, phone, callback) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};
````






