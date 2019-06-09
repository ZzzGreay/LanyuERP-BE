const express = require("express");
const controller = require("../../controllers/workLog.controller");
const { authorize, LOGGED_USER } = require("../../middlewares/auth");

const router = express.Router();

/**
 * Load workLog when API with workLogId route parameter is hit
 */
router.param("workLogId", controller.load);

router
  .route("/")
  .get(authorize(LOGGED_USER), controller.list)
  .post(authorize(LOGGED_USER), controller.create);

router
  .route("/owner/:ownerId")
  .get(authorize(LOGGED_USER), controller.getWorkLogsForOwner);

router.route("/filter").post(authorize(LOGGED_USER), controller.filter);

router
  .route("/:workLogId")
  .get(authorize(LOGGED_USER), controller.get)
  // TODO (change to PATCH)
  .post(authorize(LOGGED_USER), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;
