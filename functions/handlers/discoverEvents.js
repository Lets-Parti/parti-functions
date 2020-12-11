// const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
// const { isEmail, isEmpty, isZipcode, containsSpecialCharacters } = require('../util/validators');
const axios = require('axios');
const {db} = require('../util/admin');
const {isEmpty, isZipcode} = require('../util/validators');

// exports.getNearbyServicess = (request, response) => {
//     let service = request.headers.service;

//     if (service.length > 0) {
//         db.collection('users')
//             .where('tags', 'array-contains', service)
//             .get()
//             .then(data => {
//                 let services = [];
//                 data.forEach(doc => {
//                     services.push(doc.data());
//                 })
//                 response.json(services);
//             })
//             .catch(err => {
//                 return response.status(500).json({ error: `Error: ${err.code}` });
//             })
//     } else {
//         db.collection('users')
//             .where('type', '==', 'service')
//             .get()
//             .then(data => {
//                 let services = [];
//                 data.forEach(doc => {
//                     services.push(doc.data());
//                 })
//                 response.json(services);
//             })
//             .catch(err => {
//                 return response.status(500).json({ error: `Error: ${err.code}` });
//             })
//     }
// }
// exports.getEventByIDs = (request, response) =>
// {
//     const eventIDs = request.body.ids;

//     db.collection('events')
//     .where('__name__', 'in', eventIDs)
//     .get()
//     .then((data) =>
//     {
//         let events = [] 
//         data.forEach((doc) =>
//         {
//             let thisDocumentData = doc.data(); 
//             thisDocumentData.eventID = doc.id; 
//             events.push(thisDocumentData); 
//         })
//         return response.json(events); 
//     })
//     .catch(err =>
//     {
//         console.error(err.code); 
//         return response.status(500).json({error: `Could not retrieve events for ids ${eventIDs}`});
//     })
// }
exports.getEventsForDiscover = (request, response) =>
{
        if(request.user.type !== 'service')
            return response.status(500).json({error: 'Must be of type service to get the users events'});
    
        const userHandle = request.user.userHandle; 
        const dbPath = `/users/${userHandle}`;
    
        db.doc(dbPath)
        .get()
        .then(doc =>
        {
            if(!doc.exists)
            {
                return response.status(500).json({error: `Database path ${dbPath} does not exist `});
            }else
            {
                const eventIDs = doc.data().events; 
    
                db.collection('events')
                .where('__name__', 'in', eventIDs)
                .get()
                .then((data) =>
                {
                    let events = [] 
                    data.forEach((doc) =>
                    {
                        let thisDocumentData = doc.data(); 
                        thisDocumentData.eventID = doc.id; 
                        events.push(thisDocumentData); 
                    })
    
                    events.sort((x, y) =>                                                                           //Sort the events by created date from newest to oldest 
                    {
                        if(x.createdAt < y.createdAt) return 1; 
                        if(x.createdAt > y.createdAt) return -1; 
                        return 0; 
                    })
    
                    return response.json(events); 
                })
                .catch(err =>
                {
                    console.error(err.code); 
                    return response.status(500).json({error: `Could not retrieve events for event ids ${eventIDs}`});
                })
            }
        })
        .catch(err =>
        {
            console.error(err.code); 
            return response.status(500).json({error: `Could not find events for ${userHandle}`});
        })
}