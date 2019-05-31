const express = require('express');
const controller = require('../../controllers/client.controller');
const {authorize, LOGGED_USER} = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load client when API with clientId route parameter is hit
 */
router.param('clientId', controller.load);

router
  .route('/')
  .get(authorize(LOGGED_USER), controller.list)
  .post(authorize(LOGGED_USER), controller.create);

router
  .route('/:clientId')
  .get(authorize(LOGGED_USER), controller.get)
  // TODO (change to PATCH)
  .post(authorize(LOGGED_USER), controller.update)
  .put(authorize(LOGGED_USER), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;
