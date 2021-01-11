const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors')

const { createEvent, getUsersEvents, getEventByID } = require('./handlers/events');
const { signup, login, uploadProfileImage, getUserByHandle, getAuthenticatedUser, uploadMediaImages, updateUserProfile, deleteMediaImage, userHandleLowerCase } = require('./handlers/users');
const { discoverServices, discoverEvents } = require('./handlers/discover');
const { feedback } = require('./handlers/feedback');
const { addReview, editReview } = require('./handlers/review');
const { createContract, signContract, deleteContract, getUserContracts } = require('./handlers/contracts');
const { createConnect, getConnects } = require('./handlers/connect')
const FirebaseAuth = require('./util/fbAuth');
const { createBeta } = require('./handlers/beta');
const { getUpdates } = require('./handlers/newsletter');

const app = express()
app.use(cors());

// events routes 
app.get('/events', FirebaseAuth, getUsersEvents);
app.get('/events/:eventID', FirebaseAuth, getEventByID);
app.post('/events', FirebaseAuth, createEvent);

// user routes 
app.post('/signup', signup);
app.post('/login', login);
app.get('/user/:userhandle', getUserByHandle);
app.get('/user', FirebaseAuth, getAuthenticatedUser);
// app.post('/lowercase', userHandleLowerCase);

//TODO: Matt & Aaric
app.post('/account/edit', FirebaseAuth, updateUserProfile)

app.post('/user/image', FirebaseAuth, uploadProfileImage);
app.post('/user/services/media', FirebaseAuth, uploadMediaImages);
app.post('/user/services/media/delete', FirebaseAuth, deleteMediaImage);

// TODO: Aaric is working on this
app.post('/review', FirebaseAuth, addReview);
app.post('/review/edit', FirebaseAuth, editReview)

// discover routes
app.get('/discover', discoverServices); 
app.get('/discover/events', FirebaseAuth, discoverEvents); 

//feedback routes
app.post('/feedback', feedback);

//contract routes 
app.post('/contracts', FirebaseAuth, createContract);
app.get('/contracts', FirebaseAuth, getUserContracts);
app.post('/contracts/sign', FirebaseAuth, signContract);
app.post('/contracts/delete', FirebaseAuth, deleteContract); 

//connect routes 
app.post('/connect', FirebaseAuth, createConnect)
app.get('/connect', FirebaseAuth, getConnects)

//beta routes
app.post('/beta', createBeta);
app.post('/newsletter', getUpdates)

exports.api = functions.https.onRequest(app)

