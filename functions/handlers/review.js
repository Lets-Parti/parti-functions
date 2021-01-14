const {admin, db} = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const {isEmail, isEmpty, isZipcode, containsSpecialCharacters, isPhone, getDigits} = require('../util/validators');

/**
 * Add Review API
 * @param {*} request 
 * @param {*} response 
 * 
 * @return {success or error in form of json}
 * 
 * @author Aaric Han, Matthew Wang
 * @date Last Modified: 1/7/2021
 * 
 * Comments:
 * request.user is the user reviewing the service (line 24)
 * request.body is the service that is being reviewed (line 29)
 */

exports.addReview = (request, response) => {
    const type = request.user.type;
    
    if (type !== "client")
      return response.status(500).json({error: `User isn't a client`});
    
    let serviceBeingReviewed = request.body.userHandle

    let addReview = {   
        author_userHandle: request.user.userHandle,
        author_fullName: request.user.fullName,
        profile_photo_url: request.user.imageUrl, 
        rating: request.body.rating,
        body: request.body.body,
        source: 'Parti', 
        source_url: `https://parti.app/user/${serviceBeingReviewed}`, 
        createdAt: new Date().toISOString()
    };

    let errors = {}; 
    if(!serviceBeingReviewed || isEmpty(serviceBeingReviewed)) 
        errors.userHandle = "User Handle cannot be empty"
    if(!addReview.rating || addReview.rating < 0 || addReview.rating > 5)
        errors.rating = 'Invalid Star Rating'
    
    if(Object.keys(errors).length > 0)
    {
        return response.status(500).json(errors); 
    }    
    
    const dbPath = `/users/${serviceBeingReviewed}`;
    db.doc(dbPath).get()
    .then(doc => 
    {
        if(!doc.exists)
            return response.status(500).json({error: `User ${serviceBeingReviewed} doesn't exist `});
        if(doc.data().type !== 'service')
            return response.status(500).json({error: `User ${serviceBeingReviewed} must be of type service `});

        let reviews = doc.data().reviews; 
        for (let i = 0; i < reviews.length; i++) {
          if (reviews[i].author_userHandle === addReview.author_userHandle) {
            return response.status(500).json({message: 'You have already created a review'});
          }
        }
        
        reviews.push(addReview)

        db.doc(dbPath).update({reviews})
        .then(() =>
        {
            return response.status(201).json({message: 'Review Successfully Created'});
        })       
    })
    .catch(err =>
    {
        return response.status(500).json({error: err});
    })
}

/**
 * Edit Review API
 * @param {*} request 
 * @param {*} response 
 * 
 * @return {success or error in form of json}
 * 
 * @author Aaric Han
 * @date Last Modified: 1/11/2021
 * 
 * Comments:
 * request.user is the user reviewing the service (line 24)
 * request.body is the service that is being reviewed (line 29)
 */

exports.editReview = (request, response) => {
  const type = request.user.type;
  
  if (type !== "client")
    return response.status(500).json({error: `User isn't a client`});
  
  let serviceBeingReviewed = request.body.userHandle
  let addReview = {   
    author_userHandle: request.user.userHandle,
    author_fullName: request.user.fullName,
    profile_photo_url: request.user.imageUrl, 
    rating: request.body.rating,
    body: request.body.body,
    source: 'Parti', 
    source_url: `https://parti.app/user/${serviceBeingReviewed}`, 
    createdAt: new Date().toISOString()
  };

  let errors = {}; 
  if(!addReview.body || isEmpty(addReview.body)) 
      errors.body = "Review cannot be empty"
  if(!serviceBeingReviewed || isEmpty(serviceBeingReviewed)) 
      errors.userHandle = "User Handle cannot be empty"
  if(!addReview.stars || addReview.stars < 0 || addReview.stars > 5)
      errors.stars = 'Invalid Star Rating'
  
  if(Object.keys(errors).length > 0)
  {
      return response.status(500).json(errors); 
  }    
  
  const dbPath = `/users/${serviceBeingReviewed}`;
  db.doc(dbPath).get()
  .then(doc => 
  {
      if(!doc.exists)
          return response.status(500).json({error: `User ${serviceBeingReviewed} doesn't exist `});
      if(doc.data().type !== 'service')
          return response.status(500).json({error: `User ${serviceBeingReviewed} must be of type service `});

      let reviews = doc.data().reviews; 

      let editCheck = -1;
      for (let i = 0; i < reviews.length; i++) {
        if (reviews[i].author_userHandle === addReview.author_userHandle) {
          editCheck = i;
        }
      }

      if (editCheck !== -1) {
        reviews[editCheck] = addReview;
        db.doc(dbPath).update({reviews})
        .then(() => 
        {
          return response.status(201).json({message: 'Review Successfully Edited'});
        })
      }
      else {
        return response.status(500).json({message: 'Review Edit Unsuccessful'});
      }        
  })
  .catch(err =>
  {
      return response.status(500).json({error: err});
  })
}