const express = require('express');
const controller = require('../../controllers/machine.controller');
const {authorize, LOGGED_USER} = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load machine when API with machineId route parameter is hit
 */
router.param('machineId', controller.load);

router
  .route('/')
  .get(authorize(LOGGED_USER), controller.list)
  .post(authorize(LOGGED_USER), controller.create);

router
  .route('/:machineId')
  .get(authorize(LOGGED_USER), controller.get)
  // TODO (change to PATCH)
  .post(authorize(LOGGED_USER), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;
