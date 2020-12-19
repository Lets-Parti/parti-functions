const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { isEmail, isEmpty, isZipcode, containsSpecialCharacters } = require('../util/validators');
const axios = require('axios');
const cors = require('cors')({ origin: true });
const nodemailer = require('nodemailer');

exports.createConnect = (request, response) => 
{
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'funpartiapp@gmail.com',
            pass: 'funpartiapp1991'
        }
    })

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
        db.doc(`/users/${from}`).get()
        .then(doc =>
        {
            let emailFrom = doc.data().email; 
            let phone = doc.data().phone; 
            let fullName = doc.data().fullName; 
            
            db.doc(`/users/${to}`).get()
            .then(doc =>
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
            .catch(err =>
            {
                return response.status(500).json({err}); 
            })
        })
        .catch(err =>
        {
            return response.status(500).json({err}); 
        })
    })
}