const router = require('express').Router();
const { verifyToken, verifyAgent } = require('../middleware/authMiddleWare');
const { createValuation, getUserValuations, getValuations, updateValuationStatus } = require('../controller/valuationController');

// Route to create a new valuation request
router.post('/create', verifyToken, createValuation);

// Route to get all valuations for a specific user
router.get('/user/:id', verifyToken, getUserValuations);

// Route to get all valuations for a specific agent
router.get('/agent/:id', verifyToken, verifyAgent, getValuations);

// Route to update the status of a valuation
router.patch('/:valuationId/status',  verifyToken, verifyAgent, updateValuationStatus);

module.exports = router;
