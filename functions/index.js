const functions = require('firebase-functions');
const admin = require('firebase-admin')
const express = require('express')
const firebase = require('firebase')

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
admin.initializeApp()

const db = admin.firestore()                                                //Firestore database object 
const app = express()   

const stringIsEmpty = (string) =>                                           //Check if string is empty
{   
    return String(string).length <= 0
}

const isZipcode = (zipcode) =>
{
    const regex = /^[0-9]{5}(?:-[0-9]{4})?$/;
    return regex.test(String(zipcode))
}

const isEmail = (email) =>                                                  //Check if it's a valid email
{
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase()) 
}

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



// URL: /api/signup
// TYPE: POST request 
// JSON: 
// {
// 	"email": "example@example.com",
// 	"password": "pass123", 
// 	"confirmPassword": "pass123",
// 	"userHandle": "example",
// 	"type": "client",
// 	"zipcode": "12345"
// }
app.post('/signup', (request, response) =>
{
    let token
    let userUID
    const newUser = {
        email: request.body.email, 
        password: request.body.password, 
        confirmPassword: request.body.confirmPassword,
        userHandle: request.body.userHandle, 
        type: request.body.type, 
        zipcode: request.body.zipcode
    }

    errors = {}
    if(!isEmail(newUser.email))
        errors.email = 'Invalid email format'
    if(stringIsEmpty(newUser.userHandle))
        errors.userHandle = 'User handle cannot be empty'
    if(!isZipcode(newUser.zipcode))
        errors.zipcode = 'Invalid zipcode format'
    if(newUser.type !== 'client' && newUser.type !== 'service')
        errors.type = 'Type must be type client or service'
    if(newUser.password !== newUser.confirmPassword)
        errors.password = 'Passwords must match'

    if(Object.keys(errors).length > 0)
        return response.status(400).json(errors)


    const dbPath = `/users/${newUser.userHandle}`
    db.doc(dbPath).get()
    .then(doc => {
        if(doc.exists){                                 
            return response.status(400).json({handle: `Handle ${newUser.userHandle} already exists`})
        } else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        userUID = data.user.uid
        return data.user.getIdToken()
    })
    .then(idToken => {
        token = idToken

        const userInfoToDatabase = {
            userID: userUID,
            email: newUser.email, 
            userHandle: newUser.userHandle, 
            zipcode: newUser.zipcode,
            type: newUser.type, 
            createdAt: new Date().toISOString(), 
            events: []
        }

        return db.doc(dbPath).set(userInfoToDatabase)
    })
    .then(() => {
        return response.status(201).json({token})
    })
    .catch(error => {
        console.error(error) 
        if(error.code === 'auth/email-already-in-use'){
            return response.status(400).json({email: `Email ${newUser.email} is already in use`})
        }else {
            return response.status(500).json({error: error.code})
        }
    })
})

exports.api = functions.https.onRequest(app)