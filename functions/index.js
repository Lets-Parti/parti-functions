const functions = require('firebase-functions');
const express = require('express'); 

const { getAllEvents, createEvent, getEventByID, getUsersEvents } = require('./handlers/events');
const { signup, login, uploadProfileImage, getUserByHandle, getAuthenticatedUser, uploadMediaImages} = require('./handlers/users');
const { getNearbyServices } = require('./handlers/discover');
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
app.post('/user/handle', getUserByHandle);
app.get('/user', FirebaseAuth, getAuthenticatedUser); 

app.post('/user/image', FirebaseAuth, uploadProfileImage); 
app.post('/user/services/media', FirebaseAuth, uploadMediaImages);

// discover routes
app.get('/discover', getNearbyServices);

exports.api = functions.https.onRequest(app)

