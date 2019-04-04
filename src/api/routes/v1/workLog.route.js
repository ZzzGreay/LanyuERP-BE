const express = require('express');
const controller = require('../../controllers/workLog.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load workLog when API with workLogId route parameter is hit
 */
router.param('workLogId', controller.load);


router
  .route('/')
  .get(authorize(ADMIN), controller.list)
  .post(authorize(ADMIN), controller.create);

router
  .route('/:workLogId')
  .get(authorize(LOGGED_USER), controller.get)
  .patch(authorize(LOGGED_USER), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);


module.exports = router;
