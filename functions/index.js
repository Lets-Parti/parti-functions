const functions = require('firebase-functions');
const express = require('express')

const { getAllEvents, createEvent, getEventByID, getUsersEvents } = require('./handlers/events');
const { signup, login, uploadProfileImage, getUserByHandle, getAuthenticatedUser} = require('./handlers/users');
const FirebaseAuth = require('./util/fbAuth');

const app = express()   

// events routes 
app.get('/events/user', FirebaseAuth, getUsersEvents);
app.post('/events/id', getEventByID);
app.post('/events', FirebaseAuth, createEvent); 

// user routes 
app.post('/signup', signup); 
app.post('/login', login); 
app.post('/user/image', FirebaseAuth, uploadProfileImage); 
app.post('/user/handle', getUserByHandle);
app.get('/user', FirebaseAuth, getAuthenticatedUser); 


exports.api = functions.https.onRequest(app)

