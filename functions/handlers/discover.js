const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const staticData = require('../util/static-data')
const { isEmail, isEmpty, isZipcode, containsSpecialCharacters } = require('../util/validators');
const axios = require('axios');

exports.discoverServices = (request, response) => {
    const service = request.headers.service;
    const page = parseInt(request.headers.page); 
    const tagArray = service.split(',');

    if(page === null)
        return response.status(500).json({error: 'Must specify page in the header'});
    if(page <= 0)
        return response.status(500).json({error: 'Page must be greater than 0'}); 

    const limit = page === 1 ? 1 : staticData.SERVICES_PER_PAGE * (page - 1);

    if (service.length > 0) {
        db.collection('users')
            .where('type', '==', 'service')
            .limit(limit)
            .get()
            .then(documentSnapshots => {
                var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                db.collection("users")
                    .where('type', '==', 'service')
                    .startAt(lastVisible)
                    .limit(staticData.SERVICES_PER_PAGE + 1)
                    .get()
                    .then(data =>
                    {
                        let services = [];
                        data.forEach(doc => {
                            let serviceTags = doc.data().tags;
                            const filteredArray = tagArray.filter(value => serviceTags.includes(value));
                            if (tagArray.length === filteredArray.length)
                                services.push(doc.data());
                        })
                        if(page === 1){
                            services.pop();
                        }else{
                            services.shift(); 
                        }

                        return response.status(201).json(services);
                    })
                .catch(err =>
                {
                    return response.status(500).json({ error: `Error: ${err.code}` });
                })
            })
            .catch(err => {
                return response.status(500).json({ error: `Error: ${err.code}` });
            })
    } else {
        db.collection('users')
            .where('type', '==', 'service')
            .limit(limit)
            .get()
            .then(documentSnapshots => {
                var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                db.collection("users")
                    .where('type', '==', 'service')
                    .startAt(lastVisible)
                    .limit(staticData.SERVICES_PER_PAGE + 1)
                    .get()
                    .then(data =>
                    {
                        let services = [];
                        data.forEach(doc => 
                        {
                            services.push(doc.data());
                        })
                        if(page === 1){
                            services.pop();
                        }else{
                            services.shift(); 
                        }
                        return response.status(201).json(services);
                    })
                .catch(err =>
                {
                    return response.status(500).json({ error: `Error: ${err.code}` });
                })
            })
            .catch(err => {
                return response.status(500).json({ error: `Error: ${err.code}` });
            })
    }
}

exports.discoverEvents = (request, response) => {
    if (request.user.type !== 'service')
        return response.status(500).json({ error: 'Must be of type service to get events' });
    
    const tags = request.user.tags;
    const today = new Date().toISOString();

    db.collection('events')
        .where('eventDate', '>', today)
        .get()
        .then(data => {
            let services = [];

            data.forEach((doc) => {
                let servicesRequested = []
                let eventData = doc.data();
                delete eventData.eventID;

                eventData.services.forEach(service => {
                    servicesRequested.push(service.serviceType);
                    if (service.service) {
                        service.service.userHandle = 'redacted'
                        service.service.contractID = 'redacted'
                    }
                });
                const filteredArray = tags.filter(value => servicesRequested.includes(value));
                if (filteredArray.length > 0) {
                    services.push(eventData);
                }
            })
            response.json(services);
        })
        .catch(err => {
            return response.status(500).json({ error: 'shit went south' });
        })
}
