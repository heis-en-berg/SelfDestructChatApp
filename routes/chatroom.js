const express = require('express');

const chatRoomController = require('../controllers/chatroom');

const router = express.Router();

router.get('/room/:token', chatRoomController.getChatRoom);

module.exports = router;