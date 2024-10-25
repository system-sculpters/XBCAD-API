const router = require('express').Router();
const { verifyToken, verifyAgent } = require('../middleware/authMiddleWare');
const { createProperty, getProperties, updateProperty, deleteProperty, bookmarkProperty, unbookmarkProperty } = require('../controller/propertyController');
const multer = require('multer'); // Store files in memory
const upload = multer({ storage: multer.memoryStorage() }).fields([
    { name: 'property', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]);
// Route to create a new property
router.post('/create', verifyToken, verifyAgent, upload, createProperty);

// Route to get all properties
router.get('/', verifyToken, getProperties);

// Route to create a new property
router.put('/:id', verifyToken, verifyAgent, upload, updateProperty);
 
// Route to get all properties
router.delete('/:id', verifyToken, verifyAgent, deleteProperty);

// Route to create a new property
router.post('/create', verifyToken, verifyAgent, upload, createProperty);



module.exports = router;
