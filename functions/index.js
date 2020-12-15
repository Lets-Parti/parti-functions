const functions = require('firebase-functions');
const express = require('express');

const { createEvent, getUsersEvents } = require('./handlers/events');
const { signup, login, uploadProfileImage, getUserByHandle, getAuthenticatedUser, uploadMediaImages, updateUserProfile, deleteMediaImage } = require('./handlers/users');
const { discoverServices, discoverEvents } = require('./handlers/discover');
const { feedback } = require('./handlers/feedback');
const { createContract, signContract, deleteContract } = require('./handlers/contracts');
const FirebaseAuth = require('./util/fbAuth');

const app = express()

const cors = require('cors')
app.use(cors());

// events routes 
app.get('/events', FirebaseAuth, getUsersEvents);
app.post('/events', FirebaseAuth, createEvent);

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
app.get('/discover', discoverServices); 
app.get('/discover/events', FirebaseAuth, discoverEvents); 

//feedback routes
app.post('/feedback', feedback);

//contract routes 
app.post('/contract', FirebaseAuth, createContract);
app.post('/contract/sign', FirebaseAuth, signContract);
app.post('/contract/delete', FirebaseAuth, deleteContract); 

exports.api = functions.https.onRequest(app)

