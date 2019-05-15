const crypto = require('crypto');
const moment = require('moment');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator/check');

const Room = require('../models/room')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'mortalchats@gmail.com',
        pass: 'Qwerty!@#'
    }
});

exports.createRoom = (req, res, next) => {
    return res.redirect('/createroom');
}

exports.getCreateRoom = (req, res, next) => {
    let localTime  = moment.utc(moment.utc().format()).toDate()
    localTime = moment(localTime).format('YYYY-MM-DD[T]HH:mm');
    
    return res.render('room/create-room', {
        path: '/',
        pageTitle: 'Create Chat Room',
        errorMessage: "",
        successMessage: "",
        oldInput: {
            email: "",
            start_time: localTime,
            duration: ""
        },
        validationErrors: []
      });
}

exports.postCreateRoom = (req, res, next) => {
    const email = req.body.email;
    const duration = req.body.duration;
    const invitee_emails_string = req.body.invitee_emails;
    let invitee_emails = invitee_emails_string;
    let start_time = req.body.start_time;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('room/create-room', {
            path: '/',
            pageTitle: 'Create Chat Room',
            errorMessage: errors.array()[0].msg,
            successMessage: '',
            oldInput: {
                email: email,
                start_time: start_time,
                duration: duration
            },
            validationErrors: errors.array()
        });
    }

    invitee_emails = invitee_emails.substring(1, invitee_emails.length - 1);
    invitee_emails = invitee_emails.split(",");
    invitee_emails = invitee_emails.map(value => value.substring(1, value.length - 1));

    start_time = new Date(Date.parse(start_time));
    const expireAt = new Date(start_time.getTime() + duration * 60000);

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err);
          return res.redirect('/');
        }
        token = buffer.toString('hex');
        const room = new Room({
            creator_email: email,
            start_time: start_time,
            duration: duration,
            invitee_emails: invitee_emails,
            token: token,
            tokenExpireAt: expireAt,
            chat: []
        });
        room
        .save()
        .then(result => {
            res.status(422).render('room/create-room', {
                path: '/',
                pageTitle: 'Create Chat Room',
                errorMessage: '',
                successMessage: 'Room created!! Please check your mail for further details.',
                oldInput: {
                    email: email,
                    start_time: req.body.start_time,
                    duration: duration
                },
                validationErrors: errors.array()
            });
            
            sendMail(email, start_time, duration, invitee_emails, token, (err) => {
                if(err){
                    console.log("Error in sending email: " + err);
                }
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
    });

    const sendMail = (email, start_time, duration, invitee_emails, token, cb) => {

        const toMails = invitee_emails.concat(email);
        let start_time_string = moment(start_time).format('MMMM Do YYYY, h:mm:ss a');

        const mailOptions = {
            from: '"Mortal Chat" <mortalchats@gmail.com>',
            to: toMails,
            subject: "Chat Room",
            html: `
            <p>Chat Room Details</p>
            <p>Click this <a href="http://mortalchat.herokuapp.com/room/${token}">link</a> to join the room.</p>
            <p>Start Time: ${start_time_string}</p>
            <p>Duration: ${duration} minutes</p>
          `
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return cb(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            cb(null);
        });
    }
}