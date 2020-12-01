# parti-functions

`part-functions` is the API for all of the backend functionalities of the Parti web application.

To visualize the structure of the database, check out the file `dbschema.js`

# `User` Route API's

## POST: `/signup`

This endpoint will create a new account. No authorization is needed to run this endpoint. The POST Request body must contain the following parameters:

`[userHandle, fullName, email, password, confirmPassword, type, zipcode]`

- password and confirmPassword must be same
- userHandle and email must not already be taken
- type is either `client` or `service`

POST request full example:

```
{
    "userHandle": "matt8p",
    "fullName": "Matthew Wang",
    "email": "matt8p@gmail.com",
    "password": "pass123",
    "confirmPassword": "pass123",
    "type": "client",
    "zipcode": "85286"
}
```

The endpoint response is the user's bearer token.

```
{ "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhZDBjYjdjMGY1NTkwMmY5N2RjNTI0NWE4ZTc5NzFmMThkOWM3NjYiLCJ0eXAiOiJKV1QifQ."
}
```

## POST: `/login`

This endpoint will validate a login. No authorization is needed to run this endpoint. The POST request body must contain the following parameters:

`[email, password]`

POST request full example:

```
{
    "email": "matt8p@gmail.com",
    "password": "pass123"
}
```

- Both fields cannot be empty

If successful, the response will return the user's bearer token.

```
{
    "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhZDBjYjdjMGY1NTkwMmY5N2RjNTI0NWE4ZTc5NzFmMThkOWM3NjYiLCJ0eXAiOiJKV1QifQ."
}
```

## POST: `/user`

This endpoint will retrieve the data of a given userHandle. The POST request body must contain the following parameters:

`[userHandle]`

POST request full example:

```
{
    "userHandle": "matt8p"
}
```

If successfull the response will return the user's basic information

```
{
    "user": {
        "fullName": "Matthew Wang",
        "events": [],
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/9242079.JPG?alt=media",
        "type": "client",
        "zipcode": "85286",
        "createdAt": "2020-11-30T22:18:17.526Z",
        "email": "matt8p@gmail.com",
        "userHandle": "matt8p",
        "userID": "eTD9baSx9CMehSapCTjaaw5DJDI3"
    }
}
```

## POST: `/user/image`

This endpoint will retrieve a photo file of type png or jpg, upload it to Firebase storage, and save the photo url to the user's profile. POST request body must contain authentication through Bearer token.

**Upload the photo through url encoded**

If successful, the response will return:

```
{
    "message": "Image uploaded successfully",
    "url": "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/9242079.JPG?alt=media"
}
```

# `Events` Route API's

## POST: `/events`

Creates a new event. In order to use this endpoint, you must authorize with a bearer token given through login. This will create a new event in the Firestore database.

Example Body:

```
{
	"title": "Matt's Birthday",
	"description": "Matt's 20th Birthday",
	"eventDate": "2021-01-12T00:00:00",
	"zipcode": "85286",
	"services": [
		{
			"serviceType": "DJ",
			"description": "I need a DJ for my party",
			"vendorFound": false,
			"service": {}
		}
	]
}
```

Example Response:

```
{
    "message": "New event nIljOG40icYuGvq4ZSA5 successfully created"
}
```

## POST: `/events/user`

Call the `/events/user` API to get a list of all of the events for a given user. A Bearer token is required to specify who the user is.

Return structure:

```
[
    {
        "eventID": "DCkKbWVxGDbO8sVCpfuZ",
        "title": "Mom's Anniversary",
        "description": "Mom's 20th!",
        "createdAt": "2020-11-30T22:49:32.565Z",
        "eventDate": "2021-01-12T00:00:00",
        "zipcode": "85286",
        "services": [
            {
                "vendorFound": false,
                "service": {},
                "serviceType": "Photographer",
                "description": "I need a cool photographer"
            }
        ]
    },
    {
        "eventID": "nIljOG40icYuGvq4ZSA5",
        "title": "Matt's Birthday",
        "description": "Matt's 20th Birthday",
        "createdAt": "2020-11-30T22:46:59.721Z",
        "eventDate": "2021-01-12T00:00:00",
        "zipcode": "85286",
        "services": [
            {
                "description": "I need a DJ for my party",
                "serviceType": "DJ",
                "vendorFound": false,
                "service": {}
            }
        ]
    }
]
```

## POST: `/events/id`

Retrieve a list of events by the form ID. No authorization needed.

To retrieve a list of events by ID, pass an **array** of ids. Example body:

```
{
	"ids": ["DCkKbWVxGDbO8sVCpfuZ", "nIljOG40icYuGvq4ZSA5"]
}
```

The response will be the details of each event id:

```
[
    {
        "zipcode": "85286",
        "title": "Mom's Anniversary",
        "eventDate": "2021-01-12T00:00:00",
        "services": [
            {
                "vendorFound": false,
                "serviceType": "Photographer",
                "description": "I need a cool photographer",
                "service": {}
            }
        ],
        "userHandle": "matt8p",
        "description": "Mom's 20th!",
        "createdAt": "2020-11-30T22:49:32.565Z"
    },
    {
        "createdAt": "2020-11-30T22:46:59.721Z",
        "userHandle": "matt8p",
        "description": "Matt's 20th Birthday",
        "zipcode": "85286",
        "title": "Matt's Birthday",
        "services": [
            {
                "vendorFound": false,
                "service": {},
                "serviceType": "DJ",
                "description": "I need a DJ for my party"
            }
        ],
        "eventDate": "2021-01-12T00:00:00"
    }
]
```
