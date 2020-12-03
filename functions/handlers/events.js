const {db} = require('../util/admin');
const {isEmpty, isZipcode} = require('../util/validators');

exports.getUsersEvents = (request, response) =>
{
    if(request.user.type !== 'client')
        return response.status(500).json({error: 'Must be of type client to get the users events'});

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
            let thisDocumentData = doc.data(); 
            thisDocumentData.eventID = doc.id; 
            events.push(thisDocumentData); 
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

    let errors = {}
    if(!isZipcode(newEvent.zipcode))
        errors.zipcode = 'Invalid zipcode format'
    if(new Date().toISOString() > newEvent.eventDate)
        errors.eventDate = 'Event date must be some time in the future'
    if(isEmpty(newEvent.title))
        errors.title = 'Event name cannot be empty'
    if(newEvent.services.length === 0)
        errors.serviceType = 'Must submit one or more services'

    newEvent.services.forEach(service =>
    {
        if(!service.serviceType || service.serviceType === null || isEmpty(service.serviceType))
        {
            errors.serviceType = 'One or more services missing'
        }
    })
    

    if(Object.keys(errors).length > 0)
    {
        return response.status(400).json(errors); 
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