const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    creator_email: {
        type: String,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    invitee_emails: {
        type: [String],
        required: true
    },
    roomName: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    tokenExpireAt: {
        type: Date,
        required: true
    },
    chat: [
        {
            username: {
                type: String,
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ]
});

roomSchema.index( { tokenExpireAt: 1 }, { expireAfterSeconds: 0 } );

roomSchema.methods.addMessage = function(message){
    //const updatedChat = [...this.chat];
    this.chat.push(message);
    //this.chat = updatedChat;
    return this.save();
};

module.exports = mongoose.model('Room', roomSchema);