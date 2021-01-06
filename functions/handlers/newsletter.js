const {admin, db} = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const {isEmail, isEmpty, isZipcode, containsSpecialCharacters, isPhone, getDigits} = require('../util/validators');

exports.getUpdates = (request, response) =>
{
    let dataSentToDB = {
        fullName: request.body.fullName, 
        email: request.body.email, 
        phone: request.body.phone, 
        company: request.body.company, 
        createdAt: new Date().toISOString(), 
    }

    db.collection('newsletter').add(dataSentToDB)
    .then(() =>
    {
        return response.status(201).json({message: `${dataSentToDB.fullName} successfully joined!`})
    })
    .catch(err =>
    {
        return response.status(500).json({err});
    })
}