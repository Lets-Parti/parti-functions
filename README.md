# parti-functions

`part-functions` is the API for all of the backend functionalities of the Parti web application.

To visualize the structure of the database, check out the file `dbschema.js`

# `User` Route API's

## POST: `/signup`

**Create a new account and return token**. No authorization is needed to run this endpoint. The POST Request body must contain the following parameters:

`[userHandle, fullName, email, phone, password, confirmPassword, type, zipcode]`

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
    "phone": "4805678238",
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
    "phone": "4805678238"
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
        "phone": "123-456-7899",
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

```
{
    "message": "Image ploaded successfully",
    "url": "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/808hertz-1201376-mediaImage.png?alt=media"
}
```

## POST: `/user/services/media/delete`

**Delete an image from the user's media**. POST request must contain Bearer token of a service account. The body must contain a variable index that points to which index in the array of `mediaImages` you want to delete

Sample input:

```
{
    "index": 0
}
```

If successful, the response will return:

```
{
    "message": "file xxx deleted from doc",
}
```

## POST: `/account/edit`

**Update the user profile of the current user logged in**. POST request must contain a Bearer token of an account or service.

Sample body for client:

```
{
    "zipcode": "00001",
    "phone": "1234567899",
    "fullName": "Cool Entertainment LLC"
}
```

Sample body for service:

```
{
    "zipcode": "00001",
    "fullName": "Cool Entertainment LLC",
    "phone": "1234567899",
    "tags": ["DJ", "Photography"],
    "bio": "Best company"
}
```

Sample response:

```
{
    "message": "(User/Service) 808hertz updated with new information"
}
```

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
			"service": null
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
                "service": null,
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
                "service": null
            }
        ]
    }
]
```

## GET `/events/:eventID`

** Get event information by eventID **. A Bearer token is required. If a service calls the API, the service names will be redacted. If a client calls the API, it will only return the event if the event belongs to the client.

```
    {
        "eventID": "DCkKbWVxGDbO8sVCpfuZ",
        "title": "Mom's Anniversary",
        "description": "Mom's 20th!",
        "createdAt": "2020-11-30T22:49:32.565Z",
        "eventDate": "2021-01-12T00:00:00",
        "zipcode": "85286",
        "services": [
            {
                "service": null,
                "serviceType": "Photographer",
                "description": "I need a cool photographer"
            }
        ]
    }
```

## GET: `/discover`

To retrieve a list of services nearby, use the `/discover` API
This GET request requires a header with key `service`. It will then return a list of services that contain the tags that the user inputs. If no tags are entered, then the search displays all services. The search query gets narrower with the tags intersection as more tags are inputted by the user. The array is formed by comma separation.

Example: service: "DJ, Food Truck"

```
[
    {
        "mediaImages": [
            "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/808hertz-9107710-mediaImage.jpg?alt=media",
            "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/808hertz-4941894-mediaImage.jpg?alt=media",
            "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/808hertz-9097559-mediaImage.jpg?alt=media",
            "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/808hertz-4754311-mediaImage.jpeg?alt=media",
            "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/808hertz-802409-mediaImage.jpg?alt=media"
        ],
        "zipcode": "85286",
        "bio": "We are 808Hertz Entertainment LLC, a professional entertainment service in the Arizona valley. Our service provides quality DJ, lighting, and event photography to turn your event into an unforgettable time of your life. We are students at Arizona State University who turned our musical inclination into a DJ service with much more, and we want you to experience our passion in every song we play. We also provide professional photography services as well!",
        "createdAt": "2020-12-09T18:50:12.956Z",
        "userHandle": "808hertz",
        "email": "808hertz@gmail.com",
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/808hertz-profileImage.jpg?alt=media",
        "events": [],
        "userID": "hH72cr8FK0d48efuxdP3Gm8v3Y72",
        "tags": [
            "DJ",
            "Photography",
            "Food Truck",
            "Live Band",
            "Food Catering"
        ],
        "reviews": {
            "numberOfReviews": 0,
            "averageStars": 0,
            "reviews": []
        },
        "service": "DJ",
        "phone": "480-480-4800",
        "type": "service",
        "fullName": "808Hertz Entertainment "
    }
]
```

## GET: `/discover/events`

To allow services to retrieve a list of events requiring services that they provide Use the `/discover/events` API

This API requires a bearer token of a service type account. This API will find intersection between the service's tags and a list of services the events require. It filters out events that are expired.

Example: 808Hertz's tags is `[Food Truck]`. This will scan for all events in the DB that are asking for Food Trucks

```
{[
    {
        "userHandle": "Heller",
        "createdAt": "2020-12-05T20:02:12.452Z",
        "services": [
            {
                "serviceType": "DJ",
                "description": "Must be familiar with bar mitzvahs",
                "service": null
            },
            {
                "serviceType": "Food Truck",
                "description": "Food truck that can serve kosher food",
                "service": null
            }
        ],
        "title": "Isaac's Bar Mitzvah",
        "zipcode": "20778",
        "eventDate": "2020-12-25T19:56:00.000Z",
        "description": "Isaac's Bar Mitzvah, it's going to be wild!!"
    }
]}

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

# `Contract` Route API's

## POST: `/contracts`

** Create a new contract **. The API requires a Bearer token of type 'service' (Only services can create contracts).
Provide the client's handle, eventID, fees, tags (what service(s) are provided?), and contract body

```
{
    "clientHandle": "matt8p",
    "eventID": "14GJ9yOUFbTQwwny6Iee",
    "fees": [
        {"name": "DJ Services", "cost": 800},
        {"name": "Service Fee", "cost": 325}
    ],
    "tags": ["DJ", "Photography"],
    "body": "We will provide a lot "
}
```

Successful response:

```
{
    "message": "Contract ABCDS23dgdsjklas successfully created"
}
```

## GET: `/contracts`

** Get all contracts associated with the user **. The API requires a bearer token of a type 'service' or 'client'. It will query through the `/contracts` collection to find contracts that are associated with that person. It will also return the total cost of all fees in the contract.

Sample response:

```
[
    {
        "tags": [
            "DJ",
            "Food Truck"
        ],
        "contractID": "PAzKOLBnrpcOMRoBFeLL",
        "createdAt": "2020-12-15T22:57:30.613Z",
        "serviceHandle": "808hertz",
        "fees": [
            {
                "name": "DJ Services",
                "cost": 800
            },
            {
                "name": "Food Truck",
                "cost": 325
            }
        ],
        "signed": true,
        "body": "We will provide a lot ",
        "clientMemo": "",
        "eventID": "eZYlRB3mXVZ2Hyz49gw0",
        "eventDate": "2021-01-12T00:00:00",
        "serviceMemo": "",
        "clientHandle": "matt8p",
        "active": false,
        "totalCost": 1125
    }
]
```

## POST: `/contracts/sign`

** Sign a contract **. The API requires a Bearer token of type 'client'. (Only clients can sign a contract). The input is the contractID that is being approved.

Sample input:

```
{
    "contractID": "v5AFaMcYsIOGfjKdoJ0i"
}
```

## POST: `/contracts/delete`

** Delete a contract **. The API requires a Bearer token of any type. Only those whose handles are on the contract can delete the contract. Deleting the contract will set the contract's `active` field to false. It will then remove the contract from its placement in `events`

Sample input:

```
{
    "contractID": "v5AFaMcYsIOGfjKdoJ0i"
}
```

# Connect API

## POST: `/connect`

** Create a connect with a user **
Sample Input

```
{
    "body": "Hello!",
    "userHandle": "matt8p"  (Whoever you're sending the connect to)
}

# Betas API

## POST: `/beta`

** Create a beta signup ** Call the API to create a beta signup

Sample Input:

```

{
"fullName": "Matthew Wang",
"email": "matt8p@gmail.com",
"phone": "4807412412",
"company": "808Hertz"
}

```

```
