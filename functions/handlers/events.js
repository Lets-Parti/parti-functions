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
            })
        })
        return response.json(events)
    }).catch((error) => console.log(error))
}

exports.createEvent = (request, response) => 
{
    if(request.user.type !== 'client')
    {
        return response.status(500).json({error: 'Account type must be client to create an event.'})
    }

    const newEvent = {
        title: request.body.title, 
        description: request.body.description, 
        createdAt: new Date().toISOString(), 
        userHandle: request.user.userHandle
    }

    db.collection('events')
    .add(newEvent)
    .then((doc) =>
    { 
        let eventID = doc.id

        const dbPath = `/users/${newEvent.userHandle}`;
    
        db.doc(dbPath).get()                                                                        //Retrieve current user's events
        .then(data =>
        {
            let currentData = data.data();              
            currentData.events.push(eventID);                                                       //Add new event    
    
            db.doc(dbPath).set(currentData)                                                         //Set the current data 
            .then(() =>
            {
                return response.status(201).json({message: `Successfully created event ${eventID}`})
            })
            .catch(err =>
            {
                console.error('Failed to insert event to the /users database');
                return response.status(500).json({error: `Failed to insert event to /users database ${err}`});
            })
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