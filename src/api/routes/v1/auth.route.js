const express = require('express');
const controller = require('../../controllers/auth.controller');

const router = express.Router();

router.route('/login').post(controller.login);
router.route('/signin').post(controller.signin);

router.route('/refresh-token').post(controller.refresh);


module.exports = router;
