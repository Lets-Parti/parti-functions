const {admin, db} = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const {isEmail, isEmpty, isZipcode, containsSpecialCharacters, isPhone, getDigits} = require('../util/validators');

exports.createContract = (request, response) =>
{
    const userType = request.user.type; 
    const serviceHandle = request.user.userHandle; 

    if(userType !== 'service')
        return response.status(500).json({type: 'User must be of type Service to create a contract'});
    
    const newContract = {
        serviceHandle, 
        createdAt: new Date().toISOString(),
        clientHandle: request.body.clientHandle, 
        eventID: request.body.eventID, 
        tags: request.body.tags, 
        signed: false, 
        active: true, 
        fees: request.body.fees, 
        body: request.body.body, 
        serviceMemo: '',
        clientMemo: ''
    }

    let errors = {}; 
    if(isEmpty(newContract.clientHandle))
        errors.clientHandle = 'Client Handle cannot be empty'
    if(newContract.fees.length == 0)
        errors.fees = 'Must include at least fee'   
    if(isEmpty(newContract.body))
        errors.contractBody = 'Contract body cannot be empty'
    if(isEmpty(newContract.eventID))
        errors.eventID = 'Event ID cannot be empty'
    if(!newContract.tags || newContract.tags.length === 0)
        errors.tags = 'Must contain at least 1 service provided'

    if(Object.keys(errors).length > 0)
        return response.status(500).json(errors); 
    
    let clientDBPath = `/users/${newContract.clientHandle}`;
    db.doc(clientDBPath).get()                              //Check if the clientHandle and eventID match up 
    .then(doc =>
    {
        if(!doc.exists)
            return response.status(500).json({clientHandle: 'Client user handle does not exist'});
        let clientEvents = doc.data().events; 
        if(!clientEvents.includes(newContract.eventID))
            return response.status(500).json({eventID: `Invalid event ID for user ${newContract.clientHandle}`}); 
        
        let contractID; 
        db.collection('contracts').add(newContract)
        .then(doc =>
        {
            contractID = doc.id; 
            return db.doc(`/contracts/${contractID}`).update({contractID});              //Insert Contract ID 
        })
        .then(() =>
        {
            return response.status(201).json({message: `Contract ${contractID} successfully created`});
        })
        .then(() =>
        {
            //TODO: Send a notification to the client that a contract has been created. 
        })
    })
    .catch(err =>
    {
        return response.status(500).json(err); 
    })
}

exports.signContract = (request, response) =>
{
    const userType = request.user.type; 
    const contractID = request.body.contractID; 

    if(userType !== 'client')
        return response.status(500).json({type: 'User must be of type client to sign a contract'});

    let eventID; 
    let contractTags; 
    let serviceHandle; 

    db.doc(`/contracts/${contractID}`).get()
    .then(doc =>
    {
        if(!doc.exists)
            return response.status(500).json({contractID: 'Contract ID does not exist'});
        eventID = doc.data().eventID; 
        contractTags = doc.data().tags; 
        serviceHandle = doc.data().serviceHandle; 
        return db.doc(`/contracts/${contractID}`).update({signed: true}); 
    })                                                               
    .then(() =>
    {
        db.doc(`/events/${eventID}`).get()
        .then(event =>
        {
            let services = event.data().services; 
            services.forEach(service =>
            {
                if(contractTags.includes(service.serviceType))
                {
                    service.service = {
                        "userHandle": serviceHandle, 
                        "contractID": contractID
                    }
                }
            })
            return db.doc(`/events/${eventID}`).update({services})
        })
        .then(() =>
        {
            return response.status(201).json({message: `Signed contract ${contractID}`}); 
        })
        .catch(err =>
        {
            return response.status(500).json(err); 
        })
    })
    .catch(err =>
    {
        return response.status(500).json(err); 
    })
}

exports.deleteContract = (request, response) =>
{
    const contractID = request.body.contractID; 
    let userHandle = request.user.userHandle; 
        
    let eventID; 
    db.doc(`/contracts/${contractID}`).get()
    .then(doc =>
    {
        if(!doc.exists)
            return response.status(500).json({contractID: `Contract ${contractID} does not exist`});

        eventID = doc.data().eventID; 
        if(doc.data().clientHandle !== userHandle && doc.data().serviceHandle !== userHandle)                           //Check that the person deleting contract is in the database 
            return response.status(500).json({userHandle: `User ${userHandle} cannot delete contract ${contractID}`});
        if(!doc.data().active)
            return response.status(500).json({contract: `Contract ${contractID} already inactive`});
        return db.doc(`/contracts/${contractID}`).update({active: false})
    })
    .then(() =>
    {
        db.doc(`/events/${eventID}`).get()
        .then(doc =>
        {
            let eventDate = doc.data().eventDate                                        
            if(new Date().toISOString() >= eventDate)                                                                   //Users cannot delete the contract after the event has occurred. 
            {
                db.doc(`/contracts/${contractID}`).update({active: true})
                .then(() =>
                {
                    return response.status(500).json({contract: 'Contract cannot be deleted after the event date has occurred'});
                })
            }

            let services = doc.data().services; 
            services.forEach(serv =>
            {
                if(serv.service !== null || serv.service.contractID === contractID)
                    serv.service = null; 
            })
            return db.doc(`/events/${eventID}`).update({services})
        })
        .then(() =>
        {
            return response.status(201).json({message: `Successfully deleted contract ${contractID}`});
        })
    })
    .catch(err =>
    {
        return response.status(500).json(err); 
    })
}
