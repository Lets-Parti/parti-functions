const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { isEmail, isEmpty, getDigits, isPhone, isZipcode, containsSpecialCharacters } = require('../util/validators');
const { user, service } = require('firebase-functions/lib/providers/auth');

exports.feedback = (request, response) => {
    const feedback_data = {
        info: request.body.info,
        emailOrHandle: request.body.emailOrHandle,
        phone: request.body.phone
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
    // if (isEmpty(user.emailOrHandle)) errors.emailOrHandle = 'Form must not be empty';
    // if (isEmpty(user.password)) errors.password = 'Password must not be empty';

    // if (Object.keys(errors).length > 0) return response.status(400).json(errors);

    // if (!isEmail(user.emailOrHandle))                                            //Handle authentication if it is a handle
    // {
    //     const dbPath = `/users/${user.emailOrHandle}`
    //     db.doc(dbPath).get()
    //         .then(doc => {
    //             if (!doc.exists) {
    //                 return response.status(500).json({ emailOrHandle: 'Username not found' })
    //             } else {
    //                 firebase.auth()
    //                     .signInWithEmailAndPassword(doc.data().email, user.password)
    //                     .then(data => {
    //                         return data.user.getIdToken();
    //                     })
    //                     .then(token => {
    //                         return response.status(201).json({ token })
    //                     })
    //                     .catch(err => {
    //                         if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
    //                             response.status(500).json({ auth: 'Invalid credentials. Please try again' });
    //                         } else {
    //                             response.status(500).json({ error: err.code })
    //                         }
    //                     });
    //             }
    //         })
    //         .catch(err => {
    //             response.status(500).json({ error: err.code })
    //         })
    // } else                                                                       //Handle authentication if it is email 
    // {
    //     firebase.auth()
    //         .signInWithEmailAndPassword(user.emailOrHandle, user.password)
    //         .then(data => {
    //             return data.user.getIdToken();
    //         })
    //         .then(token => {
    //             return response.status(201).json({ token })
    //         })
    //         .catch(err => {
    //             if (err.code === 'auth/user-not-found') {
    //                 response.status(500).json({ auth: 'Invalid credentials. Please try again' });
    //             } else {
    //                 response.status(500).json({ error: err.code })
    //             }
    //         });
    // }
}