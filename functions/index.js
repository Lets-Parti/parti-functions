const functions = require('firebase-functions');
const admin = require('firebase-admin')
const express = require('express')
const firebase = require('firebase')

admin.initializeApp()
const db = admin.firestore() 
const app = express()

const firebaseConfig = {
    apiKey: "AIzaSyAJvJxSfr3WrfxpHLVnEhfoPl_o3BdfRcM",
    authDomain: "lets-parti.firebaseapp.com",
    databaseURL: "https://lets-parti.firebaseio.com",
    projectId: "lets-parti",
    storageBucket: "lets-parti.appspot.com",
    messagingSenderId: "922483274193",
    appId: "1:922483274193:web:7576441a675d50bb8470f0",
    measurementId: "G-17JK2V8HFB"
  };

firebase.initializeApp(firebaseConfig)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
app.get('/events', (request, response) =>
{
    db.collection('events')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) =>
    {
        let events = []
        data.forEach((doc) =>
        {
            events.push({ 
                eventID: doc.id, 
                title: doc.data().title, 
                description: doc.data().description, 
                createdAt: doc.data.createdAt,
            })
        })
        return response.json(events)
    }).catch((error) => console.log(error))
})

//https://us-central1-lets-parti.cloudfunctions.net/createEvent
app.post('/createEvent', (request, response) => 
{
    const newEvent = {
        title: request.body.title, 
        description: request.body.description, 
        createdAt: new Date().toISOString()
    }

    db.collection('events')
        .add(newEvent)
        .then((doc) =>
        { 
            let documentID = doc.id
            let msg = "document " + documentID + " created successfully"
            response.json({message: msg})
        })
        .catch(error => 
        {
            response.status(500).json({error: 'something went wrong'})
            console.error('error')
        })
})

//Signup Route
let token, userId
app.post('/signup', (request, response) =>
{
    const newUser = {
        email: request.body.email, 
        password: request.body.password, 
        confirmPassword: request.body.confirmPassword, 
        handle: request.body.handle
    }

    //TODO: Validate
    const path = '/users/' + newUser.handle 

    db.doc(path).get()
    .then(doc => {
        if(doc.exists){
            return response.status(400).json({handle: 'this handle is already taken'})
        } else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        userId = data.user.uid
        return data.user.getIdToken()
    })
    .then(idToken => {
        token = idToken
        const userCredentials = {
            handle: newUser.handle, 
            email: newUser.email, 
            createdAt: new Date().toISOString(), 
            userId: userId
        }
        return db.doc(path).set(userCredentials)
    })
    .then(() => {
        return response.status(201).json({token})
    })
    .catch(error => {
        console.error(error) 
        if(error.code === 'auth/email-already-in-use'){
            return response.status(400).json({email: 'Email is already in use'})
        }else {
            return response.status(500).json({error: error.code})
        }
    })
})

exports.api = functions.https.onRequest(app)