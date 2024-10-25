const router = require('express').Router();
const { verifyToken, verifyAgent, verifyAdmin } = require('../middleware/authMiddleWare');
const { getUsers, getUsersWithRole, updateUserRole, updateUserDetails, updatePassword } = require('../controller/userController');

// Route to get all users
router.get('/get-all-users', verifyToken, verifyAdmin, getUsers);

// Route to get users with a specific role (e.g., 'user')
router.get('/get-users-by-role', verifyToken, verifyAgent, getUsersWithRole);

// Route to update user role (e.g., from user to agent)
router.put('/update-user-role/:id', verifyToken, verifyAdmin, updateUserRole);

// Route to update user details (e.g., fullName, email, phoneNumber)
router.put('/update-user-details/:id', verifyToken, updateUserDetails);

// Route to update password
router.put('/update-password/:id', verifyToken, updatePassword);

module.exports = router;
