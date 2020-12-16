const {db} = require('../util/admin');
const {isEmpty, isZipcode, eventDescriptionLimit, serviceRequestLimit, eventTitleLimit} = require('../util/validators');

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
        if(eventTitleLimit(newEvent.title))
        errors.title = 'Event title cannot exceed 60 characters'
    if(eventDescriptionLimit(newEvent.description))
        errors.description = 'Event description cannot exceed 500 characters'
    // if(serviceRequestLimit(newEvent.services.description))
    //     errors.services.description = 'Requested service description cannot exceed 220 characters'
    if(newEvent.services.length === 0)
        errors.serviceType = 'Must submit one or more services'

    let serviceTypes = []; 
    newEvent.services.forEach(service =>
    {
        if(serviceTypes.includes(service.serviceType))
            errors.serviceType = 'Cannot have duplicate services'
        if(!service.serviceType || service.serviceType === null || isEmpty(service.serviceType))
        {
            errors.serviceType = 'Cannot leave service empty'
        }
        serviceTypes.push(service.serviceType); 
    })
    
    if(Object.keys(errors).length > 0)
    {
        return response.status(400).json(errors); 
    }

    let eventID; 
    db.collection('events')
    .add(newEvent)
    .then((doc) =>
    { 
        eventID = doc.id;
        console.log(eventID); 
        return db.doc(`/events/${eventID}`).update({eventID});              //Insert Event ID 
    })
    .then(() =>
    {
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

