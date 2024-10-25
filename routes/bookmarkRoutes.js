const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleWare');
const { bookmarkProperty, unbookmarkProperty} = require('../controller/bookmarkController');

// Route to send a message in a chat
router.post('/:propertyId', verifyToken, bookmarkProperty);

// Route to get all chats for a specific user
router.delete('/', verifyToken, unbookmarkProperty);

module.exports = router;