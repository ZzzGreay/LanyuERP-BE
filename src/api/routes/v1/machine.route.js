const express = require("express");
const controller = require("../../controllers/machine.controller");
const { authorize, LOGGED_USER } = require("../../middlewares/auth");

const router = express.Router();

const multer = require("multer");
const path = require("path");
// update in machine.controller if the file paths are changed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = req.params.fileType;
    cb(null, path.join(__dirname, `../../../../files/machine/`));
  },
  filename: (req, file, cb) => {
    const machineId = req.params.machineId;
    const fileType = req.params.fileType;
    const fileName = `${machineId}_${fileType}.jpg`;
    cb(null, fileName);
  }
});
const upload = multer({ storage });

/**
 * Load machine when API with machineId route parameter is hit
 */
router.param("machineId", controller.load);

router
  .route("/")
  .get(authorize(LOGGED_USER), controller.list)
  .post(authorize(LOGGED_USER), controller.create);

router
  .route("/site/:siteId")
  .get(authorize(LOGGED_USER), controller.getMachinesForSite);

router
  .route("/:machineId")
  .get(authorize(LOGGED_USER), controller.get)
  // TODO (change to PATCH)
  .put(authorize(LOGGED_USER), controller.update)
  .post(authorize(LOGGED_USER), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);

router
  .route("/:machineId/file/:fileType")
  .post(authorize(LOGGED_USER), upload.any(), controller.uploadFile)
  .get(authorize(LOGGED_USER), controller.getFile);

module.exports = router;
