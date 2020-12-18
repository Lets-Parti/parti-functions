const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { isEmail, isEmpty, isZipcode, containsSpecialCharacters } = require('../util/validators');
const axios = require('axios');
const cors = require('cors')({origin: true});
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'funpartiapp@gmail.com',
        pass: 'funpartiapp1991'
    }
})

exports.connect = (req, res) => 
{
    cors(req, res, () => {
      
        // getting dest email by query string
        const dest = 'jake8heller@gmail.com';

        const mailOptions = {
            from: 'Parti <funpartiapp@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
            to: dest,
            subject: 'I\'M A PICKLE!!!', // email subject
            html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
                <br />
                <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
            ` // email content in HTML
        };
  
        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
            return res.send('Sended');
        });
    });    
};


/*
exports.connect = (request, response) =>
{
    const userType = request.user.type; 
    const userHandle = request.user.userHandle; 
    const body = request.body.body; 

    let connect_data = 
    {
        eventID: request.body.eventID,
        createdAt: new Date().toISOString(),
        body: body
    }

    if(userType === 'client')                  //Client reaches out to service
    {
        connect_data.accept = true; 
        connect_data.clientHandle = userHandle; 
        connect_data.serviceHandle = request.body.sendeeHandle; 

        db.doc(`/events/${connect_data.eventID}`)
        .get()
        .then(doc => 
        {
            if(!doc.exists)
                return response.status(500).json({event: `Event ${connect_data.eventID} exists`});
            if (doc.data().userHandle !== connect_data.clientHandle)
                return response.status(500).json({event: `Event ${connect_data.eventID} does not belong to ${connect_data.clientHandle}`});

            db.collection('connects')
            .add(connect_data)
            .then((doc) => {
                let connect_ID = doc.id;
    
                //Send Email that a connect is made 
                cors(request, response, () => {
      
                    // getting dest email by query string
                    const dest = 'jake8heller@gmail.com';
            
                    const mailOptions = {
                        from: 'Parti <funpartiapp@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
                        to: dest,
                        subject: 'I\'M A PICKLE!!!', // email subject
                        html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
                            <br />
                            <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
                        ` // email content in HTML
                    };
              
                    // returning responseult
                    return transporter.sendMail(mailOptions, (erro, info) => {
                        if(erro){
                            return response.send(erro.toString());
                        }
                        return response.send('Sended');
                    });
                });  
    
                return response.status(201).json({ message: `Connection ${connect_ID} created` })
            })
            .catch(err => {
                return response.status(500).json({ error: 'Failed to create a connect new' })
            })
        })   
        .catch(err => 
        {
            return response.status(500).json({ err });
        })              
    }
    else if(userType === 'service')            //Service reach out to clients
    {
        connect_data.accept = false; 
        connect_data.clientHandle = request.body.sendeeHandle; 
        connect_data.serviceHandle = userHandle; 

        db.doc(`/events/${connect_data.eventID}`)
        .get()
        .then(doc => 
        {
            if(!doc.exists)
                return response.status(500).json({event: `Event ${connect_data.eventID} exists`});
            if (doc.data().userHandle !== connect_data.clientHandle)
                return response.status(500).json({event: `Event ${connect_data.eventID} does not belong to ${connect_data.clientHandle}`});
            
            db.collection('connects')
            .add(connect_data)
            .then((doc) => {
                let connect_ID = doc.id;
    
                //Send Email that a connect is made 

                cors(request, response, () => {
      
                    // getting dest email by query string
                    const dest = 'jake8heller@gmail.com';
            
                    const mailOptions = {
                        from: 'Parti <funpartiapp@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
                        to: dest,
                        subject: 'I\'M A PICKLE!!!', // email subject
                        html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p>
                            <br />
                            <img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />
                        ` // email content in HTML
                    };
              
                    // returning responseult
                    return transporter.sendMail(mailOptions, (erro, info) => {
                        if(erro){
                            return response.send(erro.toString());
                        }
                        return response.send('Sended');
                    });
                });
    
                return response.status(201).json({ message: `Connection ${connect_ID} created` })
            })
            .catch(err => {
                return response.status(500).json({ error: 'Failed to create a connect' })
            })
        })   
        .catch(err => 
        {
            return response.status(500).json({ err });
        }) 
    }
}
*/

exports.acceptConnect = (request, response) =>
{
    const userType = request.user.type; 
    const userHandle = request.user.userHandle;
    const connectID = request.body.connectID; 

    if(userType !== 'client')                                                           //Only clients can accept Connects
        return response.status(500).json({type: 'Only clients can accept a Connect'});

    db.doc(`/connects/${connectID}`).update({accept: true})
    .then(() =>
    {
        //Send email notification that a connect has been created.
    })
    .catch(err =>
    {
        return response.status(500).json({err});
    })
}

// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'funpartiapp@gmail.com',
//         pass: 'funpartiapp1991'
//     }
// })