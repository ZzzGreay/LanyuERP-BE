const express = require("express");
const controller = require("../../controllers/workLog.controller");
const { authorize, LOGGED_USER } = require("../../middlewares/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// update in workLog.controller if the file paths are changed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = req.params.fileType;
    cb(null, path.join(__dirname, `../../../../files/`));
  },
  filename: (req, file, cb) => {
    const workLogId = req.params.workLogId;
    const fileType = req.params.fileType;
    const number = req.params.number;
    const fileName = `${workLogId}_${fileType}_${number}.jpg`;
    cb(null, fileName);
  }
});
const upload = multer({ storage });

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

router
  .route("/:workLogId/file/:fileType/:number")
  .post(authorize(LOGGED_USER), upload.any(), controller.uploadFile)
  .get(authorize(LOGGED_USER), controller.getFile);

module.exports = router;
