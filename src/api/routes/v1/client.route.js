const express = require('express');
const controller = require('../../controllers/client.controller');
const {authorize, ADMIN} = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('clientId', controller.load);

router.route('/client-types').get(authorize(ADMIN), controller.getClientTypes);
router.route('/source-types').get(authorize(ADMIN), controller.getSourceTypes);

router.route('/')
  .get(authorize(ADMIN), controller.list)
  .post(authorize(ADMIN), controller.create);

router.route('/:clientId')
  .get(authorize(ADMIN), controller.get)
  .put(authorize(ADMIN), controller.replace)
  .patch(authorize(ADMIN), controller.update)
  .delete(authorize(ADMIN), controller.remove);


module.exports = router;
