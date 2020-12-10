const functions = require('firebase-functions');
const express = require('express');

const { getAllEvents, createEvent, getEventByID, getUsersEvents } = require('./handlers/events');
const { signup, login, uploadProfileImage, getUserByHandle, getAuthenticatedUser, uploadMediaImages } = require('./handlers/users');
const { getNearbyServices } = require('./handlers/discover');
const { getNearbyServicess } = require('./handlers/discoverEvents');
const { getEventByIDs } = require('./handlers/discoverEvents');
const { feedback } = require('./handlers/feedback');
const FirebaseAuth = require('./util/fbAuth');

const app = express()

const cors = require('cors')
app.use(cors());
// events routes 
app.get('/events', FirebaseAuth, getUsersEvents);
app.post('/events/id', getEventByID);
app.post('/events', FirebaseAuth, createEvent);

// user routes 
app.post('/signup', signup);
app.post('/login', login);
app.get('/user/:userhandle', getUserByHandle);
app.get('/user', FirebaseAuth, getAuthenticatedUser);

app.post('/user/image', FirebaseAuth, uploadProfileImage);
app.post('/user/services/media', FirebaseAuth, uploadMediaImages);

// discover routes
app.get('/discover', getNearbyServices);
// app.get('/discoverEvents', getNearbyServicess);
app.get('/discoverEvents', getEventByIDs);

//feedback routes
app.post('/feedback', feedback);

exports.api = functions.https.onRequest(app)

