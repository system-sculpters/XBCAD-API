const router = require('express').Router();
const { verifyToken, verifyAgent } = require('../middleware/authMiddleWare');
const { createPurchase, getUserPurchases } = require('../controller/purchaseController');

// Route to create a new valuation request
router.post('/create', verifyToken, createPurchase);

// Route to get all valuations for a specific user
router.get('/user/:id', verifyToken, getUserPurchases);

module.exports = router;