const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const Room = require('./models/room');

const MONGODB_URI =
  'mongodb+srv://karandhingra:kdJ_gjXeLh2WW2A@cluster0-9wibb.mongodb.net/test?retryWrites=true';
const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const createRoomRoutes = require('./routes/createroom');
const chatRoomRoutes = require('./routes/chatroom');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(createRoomRoutes);
app.use(chatRoomRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500'
  });
});

mongoose
  .connect(MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true })
  .then(result => {
    server = app.listen(PORT);
    const io = require("socket.io")(server)
    //listen on every connection
    io.on('connection', (socket) => {

      socket.room = socket.handshake.query.room;
      socket.join(socket.room);

      //default username
      socket.username = "Anonymous"

      Room.findOne({ token: socket.room })
      .then(room => {
        let updatedRoom = room;
        if(!room){
          socket.emit('redirect', '/');
          socket.disconnect();
        }

        let timeNow = Date.now();
        let expiryTime = room.tokenExpireAt.getTime();
        const duration = (expiryTime - timeNow) / 60000;

        if(duration < 0){
          socket.emit('redirect', '/');
          socket.disconnect();
        }

        setTimeout(function(){
          socket.emit('redirect', '/');
          socket.disconnect();
        }, duration * 60 * 1000);

        setTimeout(function(){
          socket.emit('failed_to_send_message', {message : "30 seconds", username : "Time remaining: "});
        }, (duration * 60 * 1000) - 30000);
  
        //emit old messages
        let chat = room.chat;
        socket.emit('old_messages', {chat : chat});
        
        //listen on change_username
        socket.on('change_username', (data) => {
          socket.username = data.username;
        })
        //listen on new_message
        socket.on('new_message', (data) => {
          //broadcast the new message
          const messageBody = {message : data.message, username : socket.username};
          room.addMessage(messageBody)
          .then(result => {
            io.sockets.in(socket.room).emit('new_message', messageBody);
          })
          .catch(err => {
            console.log(err);
            socket.emit('failed_to_send_message', {message : "Failed to send message!! Please try again.", username : "Server"});
          });
        })
      })
      .catch(err => {
        socket.emit('redirect', '/500');
        socket.disconnect();
      });
    });

  })
  .catch(err => {
    console.log(err);
  });
