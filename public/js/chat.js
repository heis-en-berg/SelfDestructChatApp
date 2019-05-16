
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
	var socket = io.connect('https://mortalchat.herokuapp.com/', { query: "room=" + room.val()})

	//Emit message
	send_message.click(function(){
		if(message.val() !== ""){
			socket.emit('new_message', {message : message.val()})
		}
	})

	//Listen on old_messages
	socket.on("old_messages", (data) => {
		feedback.html('');
		message.val('');
		var chat = data.chat;
		for (var i = 0; i < chat.length; i++) {
			chatroom.append("<div class='row message-bubble'><p class='text-muted'>" + chat[i].username + "</p><span>" + chat[i].message +"</span></div>");
			window.scrollBy(0, 100);
		}
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<div class='row message-bubble'><p class='text-muted'>" + data.username + "</p><span>" + data.message +"</span></div>")
		window.scrollBy(0, 100);
	})

	socket.on("failed_to_send_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<div class='row message-bubble-server-error'><p style='color:blue;font-weight:bold;'>" + data.username + "</p><span>" + data.message +"</span></div>")
		//chatroom.append("<p class='message_fail'>" + data.username + ": " + data.message + "</p>")
	})

	//Emit a username
	send_username.click(function(){
		if(username.val() !== ""){
			socket.emit('change_username', {username : username.val()})
		}
	})

	socket.on('redirect', function(destination) {
		window.location.href = destination;
	});
});


