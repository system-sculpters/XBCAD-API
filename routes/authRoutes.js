const router = require('express').Router();
const { signup, signin } = require('../controller/authController')

router.post('/signup', signup);

router.post('/signin', signin);

module.exports = router