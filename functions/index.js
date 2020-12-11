const functions = require('firebase-functions');
const express = require('express');

const { createEvent, getUsersEvents, discoverEvents } = require('./handlers/events');
const { signup, login, uploadProfileImage, getUserByHandle, getAuthenticatedUser, uploadMediaImages, updateUserProfile, deleteMediaImage } = require('./handlers/users');
const { getNearbyServices } = require('./handlers/discover');
const { feedback } = require('./handlers/feedback');
const FirebaseAuth = require('./util/fbAuth');

const app = express()

const cors = require('cors')
app.use(cors());

// events routes 
app.get('/events', FirebaseAuth, getUsersEvents);
app.post('/events', FirebaseAuth, createEvent);

//TODO: Jake & Anish
app.get('/events/discover', FirebaseAuth, discoverEvents); 

// user routes 
app.post('/signup', signup);
app.post('/login', login);
app.get('/user/:userhandle', getUserByHandle);
app.get('/user', FirebaseAuth, getAuthenticatedUser);
//TODO: Matt & Aaric
app.post('/account/edit', FirebaseAuth, updateUserProfile)

app.post('/user/image', FirebaseAuth, uploadProfileImage);
app.post('/user/services/media', FirebaseAuth, uploadMediaImages);
app.post('/user/services/media/delete', FirebaseAuth, deleteMediaImage);

// discover routes
app.get('/discover', getNearbyServices);

//feedback routes
app.post('/feedback', feedback);

exports.api = functions.https.onRequest(app)

