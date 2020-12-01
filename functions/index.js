const functions = require('firebase-functions');
const express = require('express')

const { getAllEvents, createEvent, getEventByID, getUsersEvents } = require('./handlers/events');
const { signup, login, uploadProfileImage, getUser} = require('./handlers/users');
const FirebaseAuth = require('./util/fbAuth');

const app = express()   

// events routes 
app.post('/events/user', FirebaseAuth, getUsersEvents);
app.post('/events/id', getEventByID);
app.post('/events', FirebaseAuth, createEvent); 

// user routes 
app.post('/signup', signup); 
app.post('/login', login); 
app.post('/user/image', FirebaseAuth, uploadProfileImage); 
app.post('/user', getUser);


exports.api = functions.https.onRequest(app)

