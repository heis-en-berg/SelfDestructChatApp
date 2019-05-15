const moment = require('moment');

const Room = require('../models/room');

exports.getChatRoom = (req, res, next) => {
    
    const token = req.params.token;
    let localTimeMoment  = moment.utc(moment.utc().format()).toDate()
    localTimeMoment = moment(localTimeMoment).format('YYYY-MM-DD[T]HH:mm');

    Room.findOne({ token: token })
    .then(room => {
        if(!room){
            return res.render('room/create-room', {
                path: '/',
                pageTitle: 'Create Chat Room',
                errorMessage: 'No Room Found!!',
                oldInput: {
                    email: "",
                    start_time: localTimeMoment,
                    duration: ""
                },
                validationErrors: []
            });
        }

        const tokenExpiryAt = room.tokenExpireAt.getTime();

        let localTime  = Date.now();
        
        const startTime = room.start_time.getTime();
        if(localTime < startTime || localTime >= tokenExpiryAt) {
            return res.status(422).render('room/create-room', {
                path: '/',
                pageTitle: 'Create Chat Room',
                errorMessage: 'No Room Found!!',
                oldInput: {
                    email: "",
                    start_time: localTimeMoment,
                    duration: ""
                },
                validationErrors: []
            });
        }
        
        return res.status(422).render('room/chat-room', {
            path: '/',
            pageTitle: 'Chat Room',
            room: token
        });
        
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}