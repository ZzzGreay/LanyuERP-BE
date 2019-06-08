const httpStatus = require('http-status');
const WorkItem = require('../models/workItem.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load workItem and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    const workItem = await WorkItem.get(id);
    req.locals = { workItem };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get workItem
 */
exports.get = (req, res) => res.json(req.locals.workItem.transform());

/**
 * Create new workItem
 */
exports.create = async (req, res, next) => {
  try {
    const workItem = new WorkItem(req.body);
    const savedWorkItem = await workItem.save();
    res.status(httpStatus.CREATED);
    res.json({ createdWorkItem: savedWorkItem.transform() });
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing workItem
 */
exports.update = (req, res, next) => {
  const workItem = Object.assign(req.locals.workItem, req.body);
  workItem
    .save()
    .then(savedWorkItem => res.json({ updatedWorkItem: savedWorkItem.transform() }))
    .catch(e => {
      next(e)
    });
};

/**
 * Get workItem list
 */
exports.list = async (req, res, next) => {
  try {
    const workItems = await WorkItem.list(req.query);
    const transformedWorkItems = workItems.map(workItem => workItem.transform());
    res.json({ workItems: transformedWorkItems });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete workItem
 */
exports.remove = (req, res, next) => {
  const workItem = req.locals.workItem;

  workItem.remove().then(() => res.status(httpStatus.NO_CONTENT).end()).catch(e => next(e));
};


/**
 * Get workItems in the worklog
 */
exports.getWorkItemsInWorkLog = async (req, res, next) => {
  try {
    const workItemsInWorkLog = await WorkItem.list({ 'workLogId': req.params.workLogId });
    const transformedWorkItemsInWorkLog = workItemsInWorkLog.map(workItem => workItem.transform());
    res.json({ workItems: transformedWorkItemsInWorkLog });
  } catch (error) {
    next(error);
  }
};

/**
 * Get workItems for machine
 */
exports.getWorkItemsForMachine = async (req, res, next) => {
  try {
    const workItemsForMachine = await WorkItem.list({ 'machine': req.params.machineId });
    const transformedWorkItemsForMachine = workItemsForMachine.map(workItem => workItem.transform());
    res.json({ workItems: transformedWorkItemsForMachine });
  } catch (error) {
    next(error);
  }
};

/**
 * Get workItems with the owner
 */
exports.getWorkItemsWithOwner = async (req, res, next) => {
  try {
    const workItemsWithOwner = await WorkItem.list({ 'owners': req.params.ownerId });
    const transformedWorkItemsWithOwner = workItemsWithOwner.map(workItem => workItem.transform());
    res.json({ workItems: transformedWorkItemsWithOwner });
  } catch (error) {
    next(error);
  }
};


/**
 * Filter workItems with request body fields
 */
exports.filter = async (req, res, next) => {
  try {
    const workItems = await WorkItem.list(req.body);
    const transformedWorkItems = workItems.map(workItem => workItem.transform());
    res.json({ workItems: transformedWorkItems });
  } catch (error) {
    next(error);
  }
};

/**
 * Get workTypes
 */
exports.getWorkTypes = async (req, res, next) => {
  try {
    res.json({ workTypes: WorkItem.getWorkTypes() });
  } catch (error) {
    next(error);
  }
};
