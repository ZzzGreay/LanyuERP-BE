const httpStatus = require('http-status');
const path = require('path');
const { omit } = require('lodash');
const Project = require('../models/project.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load project and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const project = await Project.get(id);
    req.locals = { project };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get project
 * @public
 */
exports.get = (req, res) => res.json(req.locals.project.transform());

/**
 * Create new project
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(httpStatus.CREATED);
    res.json(savedProject.transform());
  } catch (error) {
    next(Project.checkDuplicateName(error));
  }
};

/**
 * Replace existing project
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { project } = req.locals;
    const newProject = new Project(req.body);
    const ommitRole = project.role !== 'admin' ? 'role' : '';
    const newProjectObject = omit(newProject.toObject(), '_id', ommitRole);

    await project.update(newProjectObject, { override: true, upsert: true });
    const savedProject = await Project.findById(project._id);

    res.json(savedProject.transform());
  } catch (error) {
    next(Project.checkDuplicateName(error));
  }
};

/**
 * Update existing project
 * @public
 */
exports.update = (req, res, next) => {
  const project = Object.assign(req.locals.project, req.body);

  project.save()
    .then(savedProject => res.json(savedProject.transform()))
    .catch(e => next(Project.checkDuplicateName(e)));
};

/**
 * Get project list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const projects = await Project.list(req.query);
    const transformedProjects = projects.map(project => project.transform());
    res.json(transformedProjects);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project
 * @public
 */
exports.remove = (req, res, next) => {
  const project = req.locals.project;

  project.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

/**
 * Get contract file
 * @public
 */
exports.getContractFile = (req, res, next) => {
  const project = req.locals.project;
  res.download(path.join(__dirname, `../../../files/contracts/${project.contractFileName}`));
};

/**
 * Save contract file
 * @public
 */
exports.saveContractFile = (req, res, next) => {
  const project = req.locals.project;
  project.setContractFile();
  project.save()
    .then(() => res.json(project.transform()));
};

/**
 * Remove contract file
 * @public
 */
exports.removeContractFile = (req, res, next) => {
  const project = req.locals.project;
  project.removeContractFile();
  project.save()
    .then(() => res.json(project.transform()));
};

/**
 * Get signed contract file
 * @public
 */
exports.getSignedContractFile = (req, res, next) => {
  const project = req.locals.project;
  res.download(path.join(__dirname,
    `../../../files/contracts/${project.signedContractFileName}`));
};

/**
 * Save signed  contract file
 * @public
 */
exports.saveSignedContractFile = (req, res, next) => {
  const project = req.locals.project;
  project.setSignedContractFile();
  project.save()
    .then(() => res.json(project.transform()));
};

/**
 * Remove signed contract file
 * @public
 */
exports.removeSignedContractFile = (req, res, next) => {
  const project = req.locals.project;
  project.removeSignedContractFile();
  project.save()
    .then(() => res.json(project.transform()));
};

/**
 * Get steps and states
 * @public
 */
exports.getSteps = async (req, res, next) => {
  try {
    res.json(Project.getSteps());
  } catch (error) {
    next(error);
  }
};

/**
 * Get types
 * @public
 */
exports.getTestTypes = async (req, res, next) => {
  try {
    res.json(Project.getTestTypes());
  } catch (error) {
    next(error);
  }
};


/**
 * Get payment types
 * @public
 */
exports.getPaymentTypes = async (req, res, next) => {
  try {
    res.json(Project.getPaymentTypes());
  } catch (error) {
    next(error);
  }
};

/**
 * Get steps and states
 * @public
 */
exports.getAssigneeProjects = async (req, res, next) => {
  try {
    const projects = await Project.list({ 'step.assignee': req.params.userId });
    const transformedProjects = projects.map(project => project.transform());
    res.json(transformedProjects);
  } catch (error) {
    next(error);
  }
};
