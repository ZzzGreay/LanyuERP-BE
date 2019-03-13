const express = require('express');
const path = require('path');
const controller = require('../../controllers/project.controller');
const { authorize, ADMIN } = require('../../middlewares/auth');
const multer = require('multer');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // FIXME: change to another system folder
    cb(null, path.join(__dirname, '../../../../files/contracts/'));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname);
  },
});
const upload = multer({ storage });

/**
 * Load user when API with userId route parameter is hit
 */
router.param('projectId', controller.load);

router.route('/steps').get(authorize(ADMIN), controller.getSteps);
router.route('/testTypes').get(authorize(ADMIN), controller.getTestTypes);
router.route('/paymentTypes').get(authorize(ADMIN), controller.getPaymentTypes);

router.route('/')
  /**
   * @api {get} v1/departments List Departments
   * @apiDescription Get a list of departments
   * @apiVersion 1.0.0
   * @apiName ListDepartments
   * @apiGroup Department
   * @apiPermission admin
   */
  .get(authorize(ADMIN), controller.list)

  /**
   * @api {post} v1/users Create Department
   * @apiDescription Create a new user
   * @apiVersion 1.0.0
   * @apiName CreateDepartment
   * @apiGroup Department
   * @apiPermission admin
   */
  .post(authorize(ADMIN), controller.create);

router.route('/:projectId')
  /**
   * @api {get} v1/users/:id Get Department
   * @apiDescription Get user information
   * @apiVersion 1.0.0
   * @apiName GetDepartment
   * @apiGroup Department
   * @apiPermission user
   */
  .get(authorize(ADMIN), controller.get)
  /**
   * @api {put} v1/users/:id Replace Department
   * @apiDescription Replace the whole user document with a new one
   * @apiVersion 1.0.0
   * @apiName ReplaceDepartment
   * @apiGroup Department
   * @apiPermission user
   */
  .put(authorize(ADMIN), controller.replace)
  /**
   * @api {patch} v1/users/:id Update Department
   * @apiDescription Update some fields of a user document
   * @apiVersion 1.0.0
   * @apiName UpdateDepartment
   * @apiGroup Department
   * @apiPermission user
   */
  .patch(authorize(ADMIN), controller.update)
  /**
   * @api {patch} v1/users/:id Delete Department
   * @apiDescription Delete a user
   * @apiVersion 1.0.0
   * @apiName DeleteDepartment
   * @apiGroup Department
   * @apiPermission user
   */
  .delete(authorize(ADMIN), controller.remove);

router.route('/:projectId/contractFile')
  .get(authorize(ADMIN), controller.getContractFile)
  .post(authorize(ADMIN), upload.any(), controller.saveContractFile)
  .delete(authorize(ADMIN), controller.removeContractFile);

router.route('/:projectId/signedContractFile')
  .get(authorize(ADMIN), controller.getSignedContractFile)
  .post(authorize(ADMIN), upload.any(), controller.saveSignedContractFile)
  .delete(authorize(ADMIN), controller.removeSignedContractFile);

router.route('/assignee/:userId')
  /**
   * @api {get} v1/users/:id Get Department
   * @apiDescription Get user information
   * @apiVersion 1.0.0
   * @apiName GetDepartment
   * @apiGroup Department
   * @apiPermission user
   */
  .get(authorize(ADMIN), controller.getAssigneeProjects);

module.exports = router;
