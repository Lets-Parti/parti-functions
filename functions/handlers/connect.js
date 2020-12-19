const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { isEmail, isEmpty, isZipcode, containsSpecialCharacters } = require('../util/validators');
const axios = require('axios');
const cors = require('cors')({ origin: true });
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'funpartiapp@gmail.com',
        pass: 'funpartiapp1991'
    }
})

exports.createConnect = (request, response) => 
{
    const userType = request.user.type;     
    const from = request.user.userHandle;                                     //Person sending the message
    const body = request.body.body;
    const to = request.body.userHandle; 

    let connect_data =
    {
        createdAt: new Date().toISOString(),
        body: body
    }

    if(userType === 'client')
    {
        connect_data.accept = true;
        connect_data.clientHandle = from;
        connect_data.serviceHandle = to;
    }else if(userType === 'service')
    {
        connect_data.accept = false;
        connect_data.clientHandle = to;
        connect_data.serviceHandle = from;
    }

    db.collection('connects')
    .add(connect_data)
    .then((doc) => 
    {
        db.doc(`/users/${from}`)
        .get(doc =>
        {
            let emailFrom = doc.data().email; 
            let phone = doc.data().phone; 
            let fullName = doc.data().fullName; 
            
            db.doc(`/users/${to}`)
            .get(doc =>
            {
                let emailTo = doc.data().email; 
                const emailBody = `${fullName} wants to reach out to you. Here is the contact info: ${phone} ${emailFrom}. Here is the message Body: ${connect_data.body}`;

                cors(request, response, () => 
                {
                    const mailOptions = 
                    {
                        from: 'Parti <funpartiapp@gmail.com>', 
                        to: emailTo,
                        subject: 'I\'M A PICKLE!!!', 
                        html: emailBody
                    }
                    return transporter.sendMail(mailOptions, (erro, info) => 
                    {
                        if (erro) 
                        {
                            return response.send(erro.toString());
                        }
                        return response.status(201).json({message: "Connect Sent!"});
                    });
                })
            })
        })
    })
}

// exports.acceptConnect = (request, response) => {
//     const userType = request.user.type;
//     const userHandle = request.user.userHandle;
//     const connectID = request.body.connectID;

//     if (userType !== 'client')                                                           //Only clients can accept Connects
//         return response.status(500).json({ type: 'Only clients can accept a Connect' });

//     db.doc(`/connects/${connectID}`).update({ accept: true })
//         .then(() => {
//             //Send email notification that a connect has been created.
//         })
//         .catch(err => {
//             return response.status(500).json({ err });
//         })
// }