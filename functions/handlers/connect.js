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
        connect_data.clientHandle = from;
        connect_data.serviceHandle = to;
    }else if(userType === 'service')
    {
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
                const emailBody = `<img src="https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/logo_beta.png?alt=media&token=ff77edb3-aafb-4d66-8f6e-b462f5d821f0" style="height: 100px;" alt="partilogo"></img>
                                   <br>
                                   <b>${fullName} reached out to you!<b>. <br><br>
                                   <p>${connect_data.body}</p>
                                   <br>
                                   <p>Here's my contact information: </p>
                                   <p>${phone}</p>
                                   <p>${emailFrom}</p>`;

                cors(request, response, () => 
                {
                    const mailOptions = 
                    {
                        from: 'Parti <funpartiapp@gmail.com>', 
                        to: emailTo,
                        subject: `${fullName} Reached Out`, 
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