const functions = require('firebase-functions');
const express = require('express')

const { getAllEvents, createEvent } = require('./handlers/events');
const { signup, login } = require('./handlers/users');
const FirebaseAuth = require('./util/fbAuth')

const app = express()   


// events routes 
app.get('/events', getAllEvents); 
app.post('/events', FirebaseAuth, createEvent); 

// user routes 
app.post('/signup', signup); 
app.post('/login', login); 

exports.api = functions.https.onRequest(app)