# parti-functions

`part-functions` is the API for all of the backend functionalities of the Parti web application.

To visualize the structure of the database, check out the file `dbschema.js`

# `User` Route API's

## POST: `/signup`

**Create a new account and return token**. No authorization is needed to run this endpoint. The POST Request body must contain the following parameters:

`[userHandle, fullName, email, password, confirmPassword, type, zipcode]`

- password and confirmPassword must be same
- userHandle and email must not already be taken
- type is either `client` or `service`

POST request full example:

For 'client' type accounts

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

For 'service' type accounts

```
{
    "userHandle": "808hz",
    "fullName": "808Hertz Entertainment",
    "email": "808hertz@gmail.com",
    "password": "pass123",
    "confirmPassword": "pass123",
    "bio": "We are the best entertainment company in the valley",
    "type": "service",
    "zipcode": "85286"
}
```

The endpoint response is the user's bearer token.

```
{ "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhZDBjYjdjMGY1NTkwMmY5N2RjNTI0NWE4ZTc5NzFmMThkOWM3NjYiLCJ0eXAiOiJKV1QifQ."
}
```

## POST: `/login`

**Validate a login and return token**. No authorization is needed to run this endpoint. The POST request body must contain the following parameters:

`[email, password]`

POST request full example:

```
{
    "emailOrHandle": "matt8p@gmail.com",
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

## GET: `/user`

\*Retrieve user info of the current authenticated user\*\*. User must be logged in to call the request. The request will return profile data in JSON format

## GET: `/user/:handle`

**Retrieve user info of a given handle**. The GET request must have a param userhandle. For example, call the endponit `user/808hertz` to retrieve data for account 808hertz

If successfull the response will return the user's basic information

```
{
    "user": {
        "email": "808hertz@gmail.com",
        "reviews": {
            "reviews": [],
            "averageStars": 0,
            "numberOfReviews": 0
        },
        "fullName": "808Hertz Entertainment",
        "userID": "hH72cr8FK0d48efuxdP3Gm8v3Y72",
        "type": "service",
        "mediaImages": [],
        "bio": "808Hertz is the best entertainment company in the valley. We provide services such as DJing and Photography ",
        "service": "Photography",
        "zipcode": "85286",
        "tags": [
            "DJ"
        ],
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/no_img.png?alt=media",
        "events": [],
        "userHandle": "808hertz",
        "createdAt": "2020-12-09T18:50:12.956Z"
    }
}
```

## POST: `/user/image`

**Upload a jpg or png file as user's profile image**. POST request body must contain authentication through Bearer token.

**Upload the photo through url encoded**. It will then set the imageUrl as the url

If successful, the response will return:

```
{
    "message": "Image uploaded successfully",
    "url": "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/9242079.JPG?alt=media"
}
```

## POST: `/user/services/media`

**Upload a jpg or png to the profile's media**. POST request must contain Bearer token of a service account. **Upload the photo through url encoded**. This will add the photo to storage, then add the photo url to the mediaImages array in the service account

If successful, the response will return:

# `Events` Route API's

## POST: `/events`

**Creates a new event**. In order to use this endpoint, you must authorize with a bearer token given through login. This will create a new event in the Firestore database.

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

## GET: `/events`

**Get the list of events of a given user**. A Bearer token is required to specify who the user is.

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

## GET: `/discover`

To retrieve a list of services nearby, use the `/discover` API
This GET request requires a header with key `service`. It will then return a list of services that contain the header service value in the account tag.

Example: service: "DJ"

```
[
    {
        "fullName": "808Hertz Entertainment",
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/no_img.png?alt=media",
        "email": "808hertz@gmail.com",
        "userID": "eJl8n5Rjczbc7DBnvbLzmGu2CZd2",
        "type": "service",
        "userHandle": "808hz",
        "tags": [
        "DJ",
        "Lighting",
        "Photography"
        ],
        "bio": "We are the best entertainment company in the valley",
        "events": [],
        "zipcode": "85286",
        "createdAt": "2020-12-07T00:29:05.790Z",
        "reviews": {
        "reviews": [],
        "averageStars": 0,
        "numberOfReviews": 0
        }
    }
]
```

## GET: `/feedback`

To send feedback about your experience using the Parti app, use the `/feedback` API

The API takes as input a required text field, an optional phone number and option email. The phone number is put into the form xxx-xxx-xxxx as long as the input has 10 digits.
The API also accounts for users trying to manually separate the area code and certain digits with parenthesis and hyphens.

Example:

```
[
    {
        "info": "I really enjoy using Parti",
        "emailOrHandle": "test123@gmail.com",
        "phone": "8493494834"
    }
]

```

Response:

```
{
    "message": "Feedback NVuPlCH9UG0Sv35HuruN created"
}

```

Database:

```
[
    {
        "info": "I really enjoy using Parti",
        "emailOrHandle": "test123@gmail.com",
        "phone": "849-349-4834"
    }
]
```
