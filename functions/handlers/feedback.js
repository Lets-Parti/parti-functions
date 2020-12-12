const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { isEmail, isEmpty, getDigits, isPhone, isZipcode, containsSpecialCharacters } = require('../util/validators');
const { user, service } = require('firebase-functions/lib/providers/auth');

exports.feedback = (request, response) => 
{
    const feedback_data = {
        info: request.body.info,
        emailOrHandle: request.body.emailOrHandle,
        phone: request.body.phone, 
        createdAt: new Date().toISOString()
    };
    
    let errors = {}
    if (isEmpty(feedback_data.info))
        errors.info = 'Info cannot be empty'
    
    if (!isEmpty(feedback_data.emailOrHandle) && !isEmail(feedback_data.emailOrHandle))
        errors.emailOrHandle = "Must be a valid email type"
        

    if (!isEmpty(feedback_data.phone) && !isPhone(feedback_data.phone)){
        errors.phone = "Must have 10 digits"
    }

    if (Object.keys(errors).length > 0) {
        return response.status(500).json(errors);
    }

    if (!isEmpty(feedback_data.phone)){
        feedback_data.phone = getDigits(feedback_data.phone);
    }

    db.collection('feedback')
    .add(feedback_data)
    .then((doc) => {
        let feedback_ID = doc.id;
        return response.status(201).json({ message: `Feedback ${feedback_ID} created` })
    })
    .catch(err => {
        return response.status(500).json({ error: 'Failed to create a feedback form' })
    })
}