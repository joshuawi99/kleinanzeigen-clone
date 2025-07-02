const express = require('express');
const router = express.Router();

const controller = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/create-order', auth, controller.createOrder);

module.exports = router;
