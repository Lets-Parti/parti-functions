const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config');
const { isEmail, isEmpty, isZipcode, containsSpecialCharacters } = require('../util/validators');
const axios = require('axios');
const cors = require('cors')({ origin: true });
const nodemailer = require('nodemailer');
const { user } = require('firebase-functions/lib/providers/auth');
const parti_development = require('../util/config');

exports.createConnect = (request, response) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'funpartiapp@gmail.com',
            pass: 'funpartiapp1991'
        }
    })

    const userType = request.user.type;
    const from = request.user.userHandle;
    const body = request.body.body;
    const to = request.body.userHandle;

    let connect_data =
    {
        createdAt: new Date().toISOString(),
        body: body,
        sentBy: userType
    }

    if (userType === 'client') {
        connect_data.clientHandle = from;
        connect_data.serviceHandle = to;
    } else if (userType === 'service') {
        connect_data.clientHandle = to;
        connect_data.serviceHandle = from;
    }

    db.collection('connects')
        .add(connect_data)
        .then((doc) => {
            db.doc(`/users/${from}`).get()
                .then(doc => {
                    let emailFrom = doc.data().email;
                    let phone = doc.data().phone;
                    let fullName = doc.data().fullName;

                    let emailBody;

                    if (userType === 'client') {
                        emailBody =
                        `<img src="https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/PartiLogotranmsparnet.png?alt=media&token=45f06ea2-e5bd-4039-9e5b-3e20ab7bd0ca" style="height: 100px;" alt="partilogo"></img>
                        <br>
                        <b>${fullName} (@${from}) reached out to you!<b>. <br><br>
                        <p>${connect_data.body}</p>
                        <p>Here's my contact information: </p>
                        <p>${phone}</p>
                        <p>${emailFrom}</p>
                        <br>
                        <i>We hope you're having a good experience. Create your event or view your contracts at Parti!</i>`;
                    } else if (userType === 'service') {
                        emailBody =
                            `<img src="https://firebasestorage.googleapis.com/v0/b/lets-parti.appspot.com/o/PartiLogotranmsparnet.png?alt=media&token=45f06ea2-e5bd-4039-9e5b-3e20ab7bd0ca" style="height: 100px;" alt="partilogo"></img>
                        <br>
                        <b>${fullName} (@${from})reached out to you!<b>. <br><br>
                        <p>${connect_data.body}</p>
                        <p>Here's my contact information: </p>
                        <p>${phone}</p>
                        <p>${emailFrom}</p>
                        <a href="https://parti.app/user/${from}">Click here to view ${from}'s profile</a>
                        <br>
                        <i>We hope you're having a good experience. Create your event or view your contracts at Parti!</i>`;
                    }

                    db.doc(`/users/${to}`).get()
                        .then(doc => {
                            let emailTo = doc.data().email;

                            cors(request, response, () => {
                                const mailOptions =
                                {
                                    from: 'Parti <funpartiapp@gmail.com>',
                                    to: emailTo,
                                    subject: `${fullName} Reached Out`,
                                    html: emailBody
                                }
                                return transporter.sendMail(mailOptions, (erro, info) => {
                                    if (erro) {
                                        return response.send(erro.toString());
                                    }
                                    return response.status(201).json({ message: "Connect Sent!" });
                                });
                            })
                        })
                        .catch(err => {
                            return response.status(500).json({ err });
                        })
                })
                .catch(err => {
                    return response.status(500).json({ err });
                })
        })
}

exports.getConnects = (request, response) => {
    const userType = request.user.type;
    const userHandle = request.user.userHandle;
    let isClient = request.user.type === 'client';
    let whichHandle = isClient ? 'clientHandle' : 'serviceHandle';
    let otherHandle = !isClient ? 'clientHandle' : 'serviceHandle';

    db.collection('connects')
        .where(`${whichHandle}`, '==', `${userHandle}`)
        .get()
        .then(data => {
            let connects = [];
            data.forEach(doc => {
                let data = doc.data();
                let connect = 
                {
                    sent: (userType === data.sentBy) ? true : false,
                    otherHandle: (userType === 'client') ? data.serviceHandle : data.clientHandle,
                    body: data.body,
                    date: data.createdAt
                }
                connects.push(connect);
            })

            connects.sort((x, y) =>                                                                           //Sort the connects
            {
                if(x.date < y.date) return 1; 
                if(x.date > y.date) return -1; 
                return 0; 
            })

            return response.status(201).json(connects);
        })
        .catch(err => {
            return response.status(500).json({ error: `Error: ${err.code}` });
        })
}