const {admin, db} = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const {isEmail, isEmpty, isZipcode} = require('../util/validators');
const { user } = require('firebase-functions/lib/providers/auth');

firebase.initializeApp(config); 

exports.signup = (request, response) =>
{
    let token;
    let userUID;
    const newUser = {
        userHandle: request.body.userHandle, 
        fullName: request.body.fullName, 
        email: request.body.email, 
        password: request.body.password, 
        confirmPassword: request.body.confirmPassword,
        type: request.body.type, 
        zipcode: request.body.zipcode
    };

    console.log(newUser); 
    errors = {};
    if(!isEmail(newUser.email))
        errors.email = 'Invalid email format'
    if(newUser.userHandle === isEmpty(newUser.userHandle))
        errors.userHandle = 'User handle cannot be empty'
    if(newUser.fullName === null || isEmpty(newUser.fullName))
        errors.fullName = 'Full Name cannot be empty'
    if(!isZipcode(newUser.zipcode))
        errors.zipcode = 'Invalid zipcode format';
    if(newUser.type !== 'client' && newUser.type !== 'service')
        errors.type = 'Type must be type client or service';
    if(newUser.password !== newUser.confirmPassword)
        errors.confirmPassword = 'Passwords must match';

    if(Object.keys(errors).length > 0)
        return response.status(400).json(errors);

    const dbPath = `/users/${newUser.userHandle}`;
    const noImg = 'no_img.png';

    db.doc(dbPath).get()
    .then(doc => {
        if(doc.exists){                                                                                 //Check if the username exists             
            return response.status(400).json({userHandle: `Handle ${newUser.userHandle} already exists`});
        } else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);      //Create new user 
        }
    })
    .then(data => {
        userUID = data.user.uid;
        return data.user.getIdToken();
    })
    .then(idToken => {
        token = idToken;

        let userInfoToDatabase = {
            userID: userUID,
            email: newUser.email, 
            userHandle: newUser.userHandle, 
            fullName: newUser.fullName, 
            zipcode: newUser.zipcode,
            type: newUser.type, 
            createdAt: new Date().toISOString(), 
            events: [], 
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
        }

        if(newUser.type === 'service')
        {
            userInfoToDatabase.reviews = 
            {
                numberOfReviews: 0, 
                averageStars: 0, 
                reviews: []
            }
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
        }else if(error.code === 'auth/weak-password')
        {
            return response.status(400).json({password: `Password too weak`})
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
    };

    let errors = {}
    if(isEmpty(user.email)) errors.email = 'Email must not be empty'; 
    if(isEmpty(user.password)) errors.password = 'Password must not be empty';

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
        response.status(500).json({error: err.code});
    });
}

exports.getUser = (request, response) =>
{
    const userHandle = request.body.userHandle; 
    if(userHandle.length == 0)
    {
        return response.status(500).json({error: 'User handle cannot be empty'});
    }

    const dbPath = `/users/${userHandle}`;

    db.doc(dbPath).get()
    .then(doc =>
    {
        if(!doc.exists)
        {
            return response.status(500).json({error: `userHandle ${userHandle} does not exist`})
        }else
        {
            return response.status(201).json({ user: doc.data() });
        }
    })
    .catch(err => 
    {
        console.log(err); 
        return response.status(500).json({error: err.code});
    })
}


exports.uploadProfileImage = (request, response) =>
{
    console.log('Upload Image'); 
    const BusBoy = require('busboy');
    const path = require('path'); 
    const os = require('os'); 
    const fs = require('fs'); 

    const busboy = new BusBoy({ headers: request.headers});

    let imageFileName;
    let imageToBeUploaded = {}; 

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) =>
    {
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png')
            return response.status(400).json({ error: 'Wrong file type submitted'});

        const imageExtention = filename.split('.')[filename.split('.').length - 1];     //Get the file type (.png, .jpt, ext)
        imageFileName = `${Math.round(Math.random() * 10000000)}.${imageExtention}`; 
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype }; 
        file.pipe(fs.createWriteStream(filepath)); 
    });

    let imageUrl;
    busboy.on('finish', () =>
    {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false, 
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => 
        {
            imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            return db.doc(`/users/${request.user.userHandle}`).update({ imageUrl }); 
        })
        .then( () => 
        {
            return response.json({ message: 'Image uploaded successfully' , url: `${imageUrl}`});
        })
        .catch(err =>
        {
            console.error(err); 
            return response.status(500).json({ error: err.code});
        })
    })
    busboy.end(request.rawBody); 
}