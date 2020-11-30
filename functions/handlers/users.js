const {db} = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');

const {isEmail, stringIsEmpty, isZipcode} = require('../util/validators');

firebase.initializeApp(config); 

exports.signup = (request, response) =>
{
    let token
    let userUID
    const newUser = {
        email: request.body.email, 
        password: request.body.password, 
        confirmPassword: request.body.confirmPassword,
        userHandle: request.body.userHandle, 
        type: request.body.type, 
        zipcode: request.body.zipcode
    }

    errors = {}
    if(!isEmail(newUser.email))
        errors.email = 'Invalid email format'
    if(stringIsEmpty(newUser.userHandle))
        errors.userHandle = 'User handle cannot be empty'
    if(!isZipcode(newUser.zipcode))
        errors.zipcode = 'Invalid zipcode format'
    if(newUser.type !== 'client' && newUser.type !== 'service')
        errors.type = 'Type must be type client or service'
    if(newUser.password !== newUser.confirmPassword)
        errors.password = 'Passwords must match'

    if(Object.keys(errors).length > 0)
        return response.status(400).json(errors)

    const dbPath = `/users/${newUser.userHandle}`

    db.doc(dbPath).get()
    .then(doc => {
        if(doc.exists){                                                                                 //Check if the username exists             
            return response.status(400).json({handle: `Handle ${newUser.userHandle} already exists`})
        } else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)      //Create new user 
        }
    })
    .then(data => {
        userUID = data.user.uid
        return data.user.getIdToken()
    })
    .then(idToken => {
        token = idToken

        const userInfoToDatabase = {
            userID: userUID,
            email: newUser.email, 
            userHandle: newUser.userHandle, 
            zipcode: newUser.zipcode,
            type: newUser.type, 
            createdAt: new Date().toISOString(), 
            events: []
        }
        return db.doc(dbPath).set(userInfoToDatabase)
    })
    .then(() => {
        return response.status(201).json({token})
    })
    .catch(error => {
        console.error(error) 
        if(error.code === 'auth/email-already-in-use'){
            return response.status(400).json({email: `Email ${newUser.email} is already in use`})
        }else {
            return response.status(500).json({error: error.code})
        }
    })
}




exports.login = (request, response) =>
{
    const user = {
        email: request.body.email, 
        password: request.body.password
    }

    let errors = {}
    if(stringIsEmpty(user.email)) errors.email = 'Email must not be empty'; 
    if(stringIsEmpty(user.password)) errors.password = 'Password must not be empty';

    if(Object.keys(errors).length > 0) return response.status(400).json(errors); 

    firebase.auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data =>
    {
        return data.user.getIdToken(); 
    })
    .then(token => 
    {
        return response.status(201).json({token})
    })
    .catch(err =>
    {
        console.error(err); 
        response.status(500).json({error: err.code})
    });
}