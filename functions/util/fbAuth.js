const {admin, db} = require('./admin');

module.exports = (request, response, next) =>
{
    let idToken; 
    if(request.headers.authorization && request.headers.authorization.startsWith('Bearer '))
    {
        idToken = request.headers.authorization.split('Bearer ')[1]; 
    }else
    {
        console.error('No Token Found')
        return response.status(403).json({error: 'Unauthorized: Missing Token'})
    }
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
        request.user = decodedToken;
        return db.collection('users')
        .where('userID', '==', request.user.uid)
        .limit(1)
        .get(); 
    })
    .then(data =>
    {
        request.user.userHandle = data.docs[0].data().userHandle; 
        request.user.type = data.docs[0].data().type; 
        request.user.zipcode = data.docs[0].data().zipcode; 

        if(data.docs[0].data().type === 'service')
        {
            request.user.tags = data.docs[0].data().tags; 
        }
        return next(); 
    })
    .catch(err =>
    {
        console.log('Error while verifying token', err)
        return response.status(400).json(err)
    })
}