const router = require('express').Router();
const { verifyToken, verifyAgent } = require('../middleware/authMiddleWare');
const { sendMessage, sendNewMessage, getChats } = require('../controller/chatController');

// Route to send a message in a chat
router.post('/send', verifyToken, sendMessage);

router.post('/send-new-message', verifyToken, sendNewMessage);

// Route to get all chats for a specific user
router.get('/:id', verifyToken, getChats);

module.exports = router;
