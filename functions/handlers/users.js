const {admin, db} = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const {isEmail, isEmpty, isZipcode, containsSpecialCharacters, isPhone, getDigits, bioExceedLimit, usernameLimit, nameOfUserLimit} = require('../util/validators');

//Image upload modules
const BusBoy = require('busboy');
const path = require('path'); 
const os = require('os'); 
const fs = require('fs'); 

firebase.initializeApp(config); 

exports.signup = (request, response) =>
{
    let token;
    let userUID;
    
    const newUser = {
        userHandle: request.body.userHandle, 
        fullName: request.body.fullName, 
        email: request.body.email, 
        phone: request.body.phone, 
        zipcode: request.body.zipcode,
        password: request.body.password, 
        confirmPassword: request.body.confirmPassword,
        type: request.body.type, 
        bio: request.body.bio, 
        service: request.body.service, 
        city: "Greater Phoenix",
        state: "AZ"
    };

    console.log(newUser); 
    errors = {};
    if(!isEmail(newUser.email))                                             //Email error handling 
        errors.email = 'Invalid email format'
    if(!newUser.userHandle || isEmpty(newUser.userHandle))          //UserHandle error handling 
        errors.userHandle = 'Username cannot be empty'
    if(containsSpecialCharacters(newUser.userHandle))                       //UserHandle error handling 
        errors.userHandle = 'Username must not contain special characters'
    if(!newUser.fullName || isEmpty(newUser.fullName))              //FullName error handling 
        errors.fullName = 'Full Name cannot be empty'
    if(!isZipcode(newUser.zipcode))                                         //zipcode error handling 
        errors.zipcode = 'Invalid zipcode format';
    if(newUser.type !== 'client' && newUser.type !== 'service')             //type handling 
        errors.type = 'Type must be type client or service';
    if(newUser.type === 'service' && (!newUser.service || isEmpty(newUser.service)))    //type handling 
        errors.service = 'Service type cannot be left empty'
    if(newUser.password !== newUser.confirmPassword)                        //Password handling 
        errors.confirmPassword = 'Passwords must match';
    if(!isPhone(newUser.phone))
        errors.phone = 'Invalid phone number. (10-digit number)'
    if(newUser.bio && bioExceedLimit(newUser.bio))
        errors.bio = 'User bio cannot exceed 500 characters'
    if(nameOfUserLimit(newUser.fullName))
        errors.fullName = 'Full name cannot exceed 30 characters'
    if(usernameLimit(newUser.userHandle))
        errors.userHandle = 'Username cannot exceed 17 characters'
    
    if(Object.keys(errors).length > 0)
        return response.status(400).json(errors);

    newUser.phone = getDigits(newUser.phone); 
    newUser.userHandle = newUser.userHandle.toLowerCase();
    newUser.email = newUser.email.toLowerCase(); 

    const dbPath = `/users/${newUser.userHandle}`;
    const noImg = 'no_img.jpg';         

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
            phone: newUser.phone,
            userHandle: newUser.userHandle, 
            fullName: newUser.fullName, 
            zipcode: newUser.zipcode,
            type: newUser.type, 
            createdAt: new Date().toISOString(), 
            events: [], 
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
        }

        if(newUser.type === 'service')                              //Add extra information for service account types 
        {
            userInfoToDatabase.reviews = []
            userInfoToDatabase.bio = newUser.bio
            userInfoToDatabase.service = newUser.service
            userInfoToDatabase.tags = [newUser.service]             
            userInfoToDatabase.mediaImages = []
            userInfoToDatabase.website = ''
            userInfoToDatabase.instagram = '' 
            userInfoToDatabase.facebook = ''
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
        emailOrHandle: request.body.emailOrHandle, 
        password: request.body.password
    };
    user.emailOrHandle = user.emailOrHandle.toLowerCase();

    let errors = {}
    if(isEmpty(user.emailOrHandle)) errors.emailOrHandle = 'Form must not be empty'; 
    if(isEmpty(user.password)) errors.password = 'Password must not be empty';

    if(Object.keys(errors).length > 0) return response.status(400).json(errors); 
    
    if(!isEmail(user.emailOrHandle))                                            //Handle authentication if it is a handle
    {
        const dbPath = `/users/${user.emailOrHandle}`
        db.doc(dbPath).get()
        .then(doc => 
        {
            if(!doc.exists)
            {
                return response.status(500).json({emailOrHandle: 'Username not found'})
            }else                                                               
            {
                firebase.auth()
                .signInWithEmailAndPassword(doc.data().email, user.password)
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
                    if(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password')
                    {
                        response.status(500).json({auth: 'Invalid credentials. Please try again'});
                    }else
                    {
                        response.status(500).json({error: err.code})
                    }
                });
            }
        })
        .catch(err =>
        {
            response.status(500).json({error: err.code})
        })
    }else                                                                       //Handle authentication if it is email 
    {
        firebase.auth()
        .signInWithEmailAndPassword(user.emailOrHandle, user.password)
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
            if(err.code === 'auth/user-not-found')
            {
                response.status(500).json({auth: 'Invalid credentials. Please try again'});
            }else
            {
                response.status(500).json({error: err.code})
            }
        });
    }
}

exports.getUserByHandle = (request, response) =>
{
    const userHandle = request.params.userhandle; 
    
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
            let userData = doc.data(); 
            if(userData.type === 'service')
            {
                return response.status(201).json({user: doc.data()});
            }else
            {
                return response.status(201).json({message: 'Cannot retrieve client type users'});
            }
        }
    })
    .catch(err => 
    {
        console.log(err); 
        return response.status(500).json({error: err.code});
    })
}

exports.getAuthenticatedUser = (request, response) =>
{
    const userHandle = request.user.userHandle; 
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
    const userHandle = request.user.userHandle; 
    console.log('Upload Image'); 

    const busboy = new BusBoy({ headers: request.headers});

    let imageFileName;
    let imageToBeUploaded = {}; 

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) =>
    {
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png')
            return response.status(400).json({ error: 'Wrong file type submitted'});

        const imageExtention = filename.split('.')[filename.split('.').length - 1].toLowerCase();     //Get the file type (.png, .jpt, ext)
        imageFileName = `${userHandle}-profileImage.${imageExtention}`; 
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
            return response.json({ 
                message: 'Image uploaded successfully' , 
                url: `${imageUrl}`
            });
        })
        .catch(err =>
        {
            console.error(err); 
            return response.status(500).json({ error: err.code});
        })
    })
    busboy.end(request.rawBody); 
}

exports.uploadMediaImages = (request, response) =>
{
    const userHandle = request.user.userHandle; 
    const type = request.user.type; 

    if(type !== 'service')
        return response.status(500).json({type: 'User type must be of type service'});

    const busboy = new BusBoy({ headers: request.headers});

    let imageFileName;
    let imageToBeUploaded = {}; 

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) =>
    {
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png')
            return response.status(400).json({ error: 'Wrong file type submitted'});

        const imageExtention = filename.split('.')[filename.split('.').length - 1].toLowerCase();     //Get the file type (.png, .jpt, ext)
        const randomGeneratedNumber = Math.floor(Math.random() * Math.floor(10000000));
        imageFileName = `${userHandle}-${randomGeneratedNumber}-mediaImage.${imageExtention}`; 
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
            const dbPath = `/users/${userHandle}`;
            db.doc(dbPath).get()
            .then(doc =>
            {
                let mediaImages = doc.data().mediaImages; 
                mediaImages.push(imageUrl); 
                db.doc(dbPath).update({mediaImages})
                .then(res =>
                {
                    response.status(201).json({
                        message: 'Image ploaded successfully', 
                        url: `${imageUrl}`
                    });
                })
                .catch(err =>
                {
                    response.status(500).json({error: err.code});
                })
            })
            .catch(err =>
            {
                response.status(500).json({error: err.code});
            })
        })
        .catch(err =>
        {
            response.status(500).json({error: `${err.code}`});
        })
    })
    busboy.end(request.rawBody); 
}

exports.deleteMediaImage = (request, response) =>
{
    const targetIndex = request.body.index; 
    const userHandle = request.user.userHandle; 
    const type = request.user.type; 

    if(type !== 'service')
        return response.status(500).json({type: 'User type must be of type service'});
    const dbPath = `/users/${userHandle}`;

    db.doc(dbPath).get()
    .then(doc =>
    {
        let mediaImages = doc.data().mediaImages; 
        if(targetIndex >= mediaImages.length || targetIndex < 0)
            return response.status(500).json({error: 'Index out of bounds'});

        let targetImageURL = mediaImages[targetIndex];
        let imageFileName = targetImageURL.split(`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/`)[1];
        imageFileName = imageFileName.split('?')[0];

        let file = admin.storage().bucket().file(imageFileName); 
        file.delete()
        .then(() =>
        {
            mediaImages.splice(targetIndex, 1); 
            db.doc(dbPath).update({mediaImages})
            .then(() =>
            {
                return response.status(201).json({message: `File ${imageFileName} deleted from doc`});
            })
            .catch(err=>
            {
                return response.status(500).json({err: `Failed to delete file from Firebase`});
            })
        })
        .catch(err=>
        {
            return response.status(500).json({err});
        })
    })
    .catch(err=>
    {
        return response.status(500).json({error: err});
    })
}

exports.updateUserProfile = (request, response) =>
{
    const type = request.user.type;
    const userHandle = request.user.userHandle; 
    const dbPath = `/users/${userHandle}`;
    
    let errors = {}; 

    let newData = {
        zipcode: request.body.zipcode, 
        fullName: request.body.fullName,
        phone: request.body.phone
    }

    if(!newData.zipcode)
        errors.zipcode = 'Must include a zipcode object in the request';
    if(!newData.fullName)
        errors.fullName = 'Must include a Full Name object in the request'; 
    if(newData.fullName && isEmpty(newData.fullName))
        errors.fullName = 'Name cannot be empty';
    if(newData.zipcode && !isZipcode(newData.zipcode))
        errors.zipcode = 'Invalid zipcode format';
    if(!isPhone(newData.phone) || newData.phone === null)
        errors.phone = 'Invalid phone number. (10-digit number)'
    
    if(Object.keys(errors).length > 0)
    {
        return response.status(500).json(errors); 
    }

    newData.phone = getDigits(newData.phone) //Convert number into XXX-XXX-XXXX format 

    if(type === 'client')
    {   
        console.log(`Updating client account: ${userHandle}`);
        db.doc(dbPath).update(newData)
        .then(() =>
        {
            return response.status(201).json({message: `User ${userHandle} updated with new information`});
        })
        .catch(err =>
        {
            return response.status(500).json({error: `Could not update information for user ${userHandle}`})
        })
    }else if(type === 'service') 
    {
        newData.tags = request.body.tags;
        newData.bio = request.body.bio;
        //Socials 
        newData.website = request.body.website; 
        newData.instagram = request.body.instagram; 
        newData.facebook = request.body.facebook; 
        
        if(!newData.tags)
            errors.tags = 'Must contain tag object in request';   
        if(!newData.bio)
            errors.bio = 'Must contain bio object in request';
        if(newData.tags && !Array.isArray(newData.tags))
            errors.tags = 'tag object must be of type Array';
        if(newData.website && (newData.website.includes('https://') || newData.website.includes('http://'))){
            newData.website = "https://" + newData.website;
        }
        if(newData.instagram && newData.instagram.includes('@')){
            errors.instagram = 'Instagram handle invalid';
        }

        if(Object.keys(errors).length > 0)
        {
            return response.status(500).json(errors); 
        }
        console.log(`Updating service account: ${userHandle}`);
        db.doc(dbPath).update(newData)
        .then(() =>
        {
            return response.status(201).json({message: `Service ${userHandle} updated with new information`});
        })
        .catch(err =>
        {
            return response.status(500).json({error: `Could not update information for service ${userHandle}`});
        })
    }
}

// DO NOT USE
// This is a method that modifies the DB manually
exports.userHandleLowerCase = (request, response) =>
{
    const userHandle = request.body.userHandle;
    let newUserHandle = userHandle.toLowerCase(); 
    const dbPath = `/users/${userHandle}`
    const newdbPath = `/users/${newUserHandle}`;

    db.doc(dbPath).get()
    .then(doc =>
    {
        if(!doc.exists) return response.status(500).json({err: `Handle ${userHandle} doesn't exist`});
        const userData = doc.data(); 
        
        db.doc(newdbPath).set(userData)
        .then(() =>
        {
            return response.status(201).json({message: `New document /users/${newUserHandle} created`});
        })
        .catch(err =>
        {
            return response.status(500).json({err});
        })
    })
    .catch(err =>
    {
        return response.status(500).json({err});
    })
}