const router = require('express').Router();
const { analytics } = require('../controller/analyticsController')
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleWare');

router.get('/', verifyToken, verifyAdmin, analytics);

module.exports = router