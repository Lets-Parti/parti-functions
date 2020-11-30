const {db} = require('../util/admin');

exports.getAllEvents = (request, response) =>
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
                createdAt: doc.data().createdAt,
                eventDate: doc.data().eventDate, 
                zipcode: doc.data().zipcode,
                services: doc.data().services
            })
        })
        return response.json(events)
    }).catch((err) => 
    {
        console.error(err.code)
        return response.status(500).json({error: `Could not retrieve events ${err.code}`});
    })
}

exports.getEventByID = (request, response) =>
{
    const eventIDs = request.body.ids;

    db.collection('events')
    .where('__name__', 'in', eventIDs)
    .get()
    .then((data) =>
    {
        let events = [] 
        data.forEach((doc) =>
        {
            events.push(doc.data()); 
        })
        return response.json(events); 
    })
    .catch(err =>
    {
        console.error(err.code); 
        return response.status(500).json({error: `Could not retrieve events for ids ${eventIDs}`});
    })
}


exports.createEvent = (request, response) => 
{
    if(request.user.type !== 'client')
    {
        return response.status(500).json({error: 'Account type must be client to create an event.'})
    }

    const newEvent = {
        title: request.body.title, 
        userHandle: request.user.userHandle,
        description: request.body.description, 
        createdAt: new Date().toISOString(), 
        eventDate: request.body.eventDate,
        zipcode: request.body.zipcode,
        services: request.body.services
    }

    db.collection('events')
    .add(newEvent)
    .then((doc) =>
    { 
        let eventID = doc.id;
        const userDBPath = `/users/${newEvent.userHandle}`;
    
        db.doc(userDBPath).get()                                                                        //Retrieve current user's events
        .then(data =>
        {
            let currentData = data.data();              
            currentData.events.push(eventID);                                                           //Add new event    
            return db.doc(userDBPath).update({events : currentData.events})                             //Set the current data 
        })
        .then(() =>
        {
            response.status(201).json({ message: `New event ${eventID} successfully created`});
        })
        .catch(err =>
        {
            console.error('Could not retrieve data from /users database');
            response.status(500).json({error:  `Failed to retrieve data from /users database ${err}`});
        })
    })
    .catch(err => 
    {
        console.error('error')
        return response.status(500).json({error: `Failed to add new event to /events database ${err}`})
    })
}