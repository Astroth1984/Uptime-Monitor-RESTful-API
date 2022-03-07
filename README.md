# Uptime-Monitor-RESTful-API

## Description :

##### The Uptime Monitoring Application is developped with Node.js and the built-in libraries, with no npm dependencies, nor external APIs. The use cases of the project are like follow:

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

We have defined three diffrent envirenments in [config.js](https://github.com/Astroth1984/Uptime-Monitor-RESTful-API/blob/master/lib/config.js), the staging, production and testing envirenment, each one of them runs on diffrent port, to split the contexte usage of each one :

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

