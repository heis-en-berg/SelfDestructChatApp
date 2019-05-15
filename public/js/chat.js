
$(function(){

	//buttons and inputs
	var message = $("#message")
	var username = $("#username")
	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")
	var room = $("#room")

	//make connection
	var socket = io.connect('http://localhost:3000', { query: "room=" + room.val()})

	//Emit message
	send_message.click(function(){
		socket.emit('new_message', {message : message.val()})
	})

	//Listen on old_messages
	socket.on("old_messages", (data) => {
		feedback.html('');
		message.val('');
		var chat = data.chat;
		for (var i = 0; i < chat.length; i++) {
			chatroom.append("<p class='message'>" + chat[i].username + ": " + chat[i].message + "</p>")
		}
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
	})

	//Emit a username
	send_username.click(function(){
		socket.emit('change_username', {username : username.val()})
	})

	socket.on('redirect', function(destination) {
		window.location.href = destination;
	});
});


