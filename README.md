# Uptime-Monitor-RESTful-API

## Description :

##### The Uptime Monitoring Application is developped with Node.js and the built-in libraries, with no npm dependencies, nor external APIs. This project was built using two main patterns : 
##### - Event Handling Paradigm
##### - Node.js Callback Pattern
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
![servers](images/start_servers.PNG)

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

![production](images/production_env.PNG)

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
![users post](images/POST_users.PNG)

**_Service 1: api/users/_** [GET] `localhost:3000/api/users?phone=<userPhone>`
![users get](images/GET_users.PNG)

**_Service 1: api/users/_** [PUT]
![users put](images/PUT_users.PNG)

**_Service 1: api/users/_** [DELETE] `localhost:3000/api/users?phone=<userPhone>`
![users delete](images/DELETE_users.PNG)




**_Service 2: api/tokens/_** [POST]
![tokens post](images/POST_tokens.PNG)

**_Service 2: api/tokens/_** [GET] `localhost:3000/api/tokens?id=<tokenId>`
![tokens get](images/GET_tokens.PNG)

**_Service 2: api/tokens/_** [PUT]
![tokens put](images/PUT_tokens.PNG)

**_Service 2: api/tokens/_** [DELETE] `localhost:3000/api/tokens?id=<tokenId>`
![tokens delete](images/DELETE_tokens.PNG)




**_Service 3: api/checks/_** [POST]
![checks post](images/POST_checks.PNG)

**_Service 3: api/checks/_** [GET] `localhost:3000/api/checks?id=<checkId>`
![checks get](images/GET_checks.PNG)

**_Service 3: api/check/_** [PUT]
![checks put](images/PUT_checks.PNG)

**_Service 3: api/checks/_** [DELETE] `localhost:3000/api/checks?id=<checkId>`
![checks delete](images/DELETE_checks.PNG)

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

## Building the App GUI

### Page 1: Index
![index](images/index.PNG)


### Page 2: Create An Account
![create account](images/create_an_accout.png)


### Page 3: Create A Session
![create session](images/create_session.PNG)


### Page 4: Deleted Session
![delete session](images/deleted-session.png)


### Page 5: Edit Account
![edit account](images/edit_account.png)


### Page 6: Deleted Account
![delete account](images/delete_account.png)


### Page 7: Create A Check
![create check](images/create_check.png)


### Page 8: Dashboard
![dashboard](images/dashboard.png)


### Page 9: Edit A Check
![edit check](images/edit_check.png)



## Debugging

For best and practical purposes, we have split our debugging envirenments according to the tasks we want to debug. To specify the debugging envirenment : `NODE_DEBUG=<dubugg_env> node index.js`

### NODE_DEBUG=server

![server](images/debug_server.PNG)

### NODE_DEBUG=workers

![workers](images/debug_workers.PNG)

### index-debug.js

In this file, we have point out diffrent breakpoints to log out steps, using `debugger;`. In the debugger Terminal we continue by calling `cont` to move to the next breakpoint.

````javascript
debugger;
    setTimeout(function() {
        cli.init();
    }, 100);
    debugger;

    debugger;
    var testVariable = 1;
    console.log('Assigned testVariable');
    debugger;
    testVariable++;
    console.log('IncrementtestVariable');
    debugger;
    testVariable = testVariable * testVariable;
    console.log('Square testVariable');
    debugger;
    testVariable = testVariable.toString();
    console.log('Converted testVariable to string');
    debugger;
````

Note that if we run the file using `node index-debug.js` it will throw an error and kill the process, because ` exampleDebuggingProblem.init();` uses an undefined variable. So to debugge the file line by line we run instead : `node inspect index-debug.js`

![index-debug](images/debug_inspect.PNG)

## Admin CLI

Is a back-office Command Line Interface,developped using event-handling-paradigm that allows admin to execute commands in the _Shell_ to view/edit all the data in the system. We have defined multiple commands for the admin to use, and administrate the application.

### man/help
![man](images/man.PNG)


### stats
![stats](images/stats.PNG)


### list users
![list users](images/list_users.PNG)


### more info user --{userId}
![userId](images/more_user_info.PNG)


### list checks / list checks --up --down

List of checks with status up are in green, and the ones with status down are in red. We have also narrow the results by specifying the type of checks we looking for by adding the flag **--up** or **--down--** to the command

![list checks](images/list_checks.PNG)


### more check info --{checkId}
![check info](images/more_check_info.PNG)


### list logs
![list](images/list_logs.PNG)


### more log info --{logFileName}

By running the command, if the user is calling a compressed log, the backgrownd workers will decompress the _zip_ and log the results.

![more log info](images/more_log_info.PNG)


## Gaining Stability

In this main section, we have followed some best practices in wokring with node.js to make our code bullet-proof, and keep our thread alive even if it countered errors during the execution, such as : 
 - Creating, using, and catching thrown errors.
 - Advanced use of the debugger.
 - Using "strict" flag to lint our code.
 - Adding a test runner, unit test, and integration tests.

To verify, check and validate our created tests, we make use of a powerful Node.js built-in library called [assert](https://nodejs.org/api/assert.html), afterwards we send the script to the [Test Runner](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/test/index.js) in the test folder, which will log out the test results on the console.

By calling the test folder we have overrided the NODE_ENV to be automatically the _testing envirenment_ : `process.env.NODE_ENV = 'testing';`

### Unit Tests

We have create some of our own unit tests in [unit.js](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/test/unit.js) file:

- logs.list should callback a false error and an array of log names
- helpers.getANumber should return 6.
- logs.truncate should not throw an error if logId does not exist. it should callback an err instead.
- exampleDebuggingProblem.init() should not throw when called.

### Integration Tests

Those kind of test are located in the [api.js](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/test/api.js) file. Where we have identified the output of some requests that we are willing to acheive or expect:

- app.init should start without throwing
- /ping should respond to GET with 200 status code
- /api/users should respond to GET with 400 status code
- random path should respond to GET with 404 status code

![test](images/tests.PNG)

### Generating Tests Repport

When the Test Runner exists, we get a final repport and more details about the tests that we have created:

- Total Tests.
- Tests failed : shown in red.
- Tests passed : shown in green.
- Details about the failed Tests by indecating the issue.

![test](images/test_repport.PNG)


## Gaining Performance

### Performance Hooks

It's a way to benchmark our code and to time the execution of diffrent procedures. For that we did plenty of performance tests to check out the duration of execution of multiple block on our code. For that main purpose we have used the Node.js Built-in library [Performance Hooks](https://nodejs.org/api/perf_hooks.html) like so : `var _performance = require('perf_hooks').performance;`.

As an exapmle we measured the performance of **Creating a Session** or the POST handler for creating a token.
The benchmarking we've used is : 
````javascript
_performance.mark('entered function');
````
And we give a name to the performance mark, and to gather all the measurmants :
````javascript
 _performance.measure('Beginning to end', 'entered function', 'storing token complete');
 _performance.measure('Validating user inputs', 'entered function', 'inputs validated');
 _performance.measure('User lookup', 'beginning user lookup', 'user lookup complete');
 _performance.measure('Password hashing', 'beginning password hashing', 'password hashing complete');
 _performance.measure('Token data creation', 'creating data for token', 'beginning storing token');
 _performance.measure('Token storing', 'beginning storing token', 'storing token complete');
````
Finally to render the outputs, we used 
````javascript
// Log out all the measurements 
var measurements = _performance.getEntriesByType('measure');
measurements.forEach(function(measurement) {
      debug('\x1b[36m%s\x1b[0m', measurement.name + ' : ' + measurement.duration + ' ms');
});
````
_Performance Outputs: _

![performance](images/performance.PNG)

### Cluster

Node.js Cluster Module is used to spread the work of our application across all the CPUs available on whatever system the application is running on. To call this module we are obliged to do some major changes on the index.js file, and so we can keep track of the changes, we have duprecated the index.js in [index-cluster.js](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/index-cluster.js) file, and log out the changes.

````javascript
app.init = function(callback) {
    if (cluster.isMaster) {
        workers.init();
        setTimeout(function() {
            cli.init();
            callback();
        }, 100);
        for (var i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }
    } else {
        server.init();
    }
};
````
As shown in the code above, the hadnling of reaquests `server.init()` is spread on the number of CPUs in the system, while the **ADMIN CLI** and the **Background Workers** are running only once on one CPU thanks to `cluster.isMaster`, and obviously we have to fork the cluster so that the else block is executed .

_Cluster Outputs_

![cluster](images/cluster.PNG)


## Node Js Modules used 

- Assertion testing
- Asynk hooks
- Buffer
- Child processes
- Cluster
- Crypto
- Debugger
- DNS
- Errors
- Events
- File system
- Globals
- HTTP
- HTTPS
- HTTP2
- Net
- OS
- Path
- Performance hooks
- Process
- Query strings
- Readline
- REPL
- Stream
- String decoder
- UDP/Datagram
- URL
- Utilities
- V8
- VM
- Zlib


