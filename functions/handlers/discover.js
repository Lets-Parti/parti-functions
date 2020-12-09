const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { isEmail, isEmpty, isZipcode, containsSpecialCharacters } = require('../util/validators');
const axios = require('axios');

exports.getNearbyServices = (request, response) => {
    let service = request.headers.service;

    if (service.length > 0) {
        db.collection('users')
            .where('tags', 'array-contains', service)
            .get()
            .then(data => {
                let services = [];
                data.forEach(doc => {
                    services.push(doc.data());
                })
                response.json(services);
            })
            .catch(err => {
                return response.status(500).json({ error: `Error: ${err.code}` });
            })
    } else {
        db.collection('users')
            .where('type', '==', 'service')
            .get()
            .then(data => {
                let services = [];
                data.forEach(doc => {
                    services.push(doc.data());
                })
                response.json(services);
            })
            .catch(err => {
                return response.status(500).json({ error: `Error: ${err.code}` });
            })
    }
}