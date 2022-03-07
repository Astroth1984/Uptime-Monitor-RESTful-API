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
        <li>- Starting HTTP Server</li>
        <li>- Starting HTTPS Server</li>
        <li>- Setting up Diffrent dev Envirenments</li>
        <li>- Connecting To Twilio API</li>
        <li>- Logging Data To files</li>
        <li>- User Token Creation & Verification</li>
        <li>- CRUD Operations</li>
    </ul>
    <li>Building the App GUI</li>
    <li>Debugging</li>
    <li>Admin CLI</li>
    <li>Gaining Stability</li>
    <ul>
        <li>Handling Thrown Errors</li>
        <li>Unit Tests</li>
        <li>Integration Tests</li>
        <li>Generating Tests Report</li>
    </ul>
    <li>Gaining Performance</li>
    <ul>
        <li>Performance Hooks</li>
        <li>Using Cluster</li>
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

