const functions = require('firebase-functions');
const admin = require('firebase-admin')
const express = require('express')

admin.initializeApp()
const db = admin.firestore() 

const app = express()

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
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
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

exports.api = functions.https.onRequest(app)