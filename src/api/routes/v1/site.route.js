const express = require('express');
const controller = require('../../controllers/site.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load site when API with siteId route parameter is hit
 */
router.param('siteId', controller.load);


router
  .route('/')
  .get(authorize(ADMIN), controller.list)
  .post(authorize(ADMIN), controller.create);

router
  .route('/:siteId')
  .get(authorize(LOGGED_USER), controller.get)
  .patch(authorize(LOGGED_USER), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);


module.exports = router;
