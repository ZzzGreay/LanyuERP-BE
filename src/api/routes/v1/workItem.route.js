const express = require('express');
const controller = require('../../controllers/workItem.controller');
const {authorize, LOGGED_USER} = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load workItem when API with workItemId route parameter is hit
 */
router.param('workItemId', controller.load);


router
  .route('/')
  .get(authorize(LOGGED_USER), controller.list)
  .post(authorize(LOGGED_USER), controller.create);

router
  .route('/workLog/:workLogId')
  .get(authorize(LOGGED_USER), controller.getWorkItemsInWorkLog);

router
  .route('/:workItemId')
  .get(authorize(LOGGED_USER), controller.get)
  // TODO (change to PATCH)
  .post(authorize(LOGGED_USER), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;
