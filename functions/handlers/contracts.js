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
        clientHandle: request.body.clientHandle, 
        eventID: request.body.eventID, 
        signed: false, 
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
        
        return response.status(201).json({message: 'event found'});
    })
    .catch(err =>
    {
    
        return response.status(500).json(err); 
    })
}