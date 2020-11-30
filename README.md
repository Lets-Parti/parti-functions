# parti-functions

`part-functions` is the API for all of the backend functionalities of the Parti web application.

To visualize the structure of the database, check out the file `dbschema.js`

# API's

## POST: `/signup`

This endpoint will create a new account. No authorization is needed to run this endpoint. The POST Request body must contain the following parameters:

`[userHandle, fullName, email, password, confirmPassword, type, zipcode]`

- password and confirmPassword must be same
- userHandle and email must not already be taken
- type is either `client` or `service`

POST request full example:

`{ "userHandle": "matt8p", "fullName": "Matthew Wang", "email": "matt8p@gmail.com", "password": "pass123", "confirmPassword": "pass123", "type": "client", "zipcode": "85286" }`

The endpoint response is the user's bearer token.

`{ "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhZDBjYjdjMGY1NTkwMmY5N2RjNTI0NWE4ZTc5NzFmMThkOWM3NjYiLCJ0eXAiOiJKV1QifQ." }`

## POST: `/login`

This endpoint will validate a login. No authorization is needed to run this endpoint. The POST request body must contain the following parameters:

`[email, password]`

POST request full example:

`{ "email": "matt8p@gmail.com", "password": "pass123" }`

- Both fields cannot be empty

If successful, the response will return the user's bearer token.

`{ "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhZDBjYjdjMGY1NTkwMmY5N2RjNTI0NWE4ZTc5NzFmMThkOWM3NjYiLCJ0eXAiOiJKV1QifQ." }`

## GET: `/events`

Call the `/events` API to get a list of all of the events in the database.

Return structure:

## POST: `/events`

Creates a new event. In order to use this endpoint, you must authorize with a bearer token given through login.

Example Body:

Example Response:
