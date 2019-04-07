const httpStatus = require('http-status');
const WorkLog = require('../models/workLog.model');
const {handler: errorHandler} = require('../middlewares/error');

/**
 * Load workLog and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const workLog = await WorkLog.get(id);
    req.locals = {workLog};
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get workLog
 * @public
 */
exports.get = (req, res) => res.json(req.locals.workLog.transform());

/**
 * Create new workLog
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const workLog = new WorkLog(req.body);
    const savedWorkLog = await workLog.save();
    res.status(httpStatus.CREATED);
    res.json(savedWorkLog.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing workLog
 * @public
 */
exports.update = (req, res, next) => {
  const workLog = Object.assign(req.locals.workLog, req.body);

  workLog
    .save()
    .then(savedWorkLog => res.json(savedWorkLog.transform()))
    .catch(next(e));
};

/**
 * Get workLog list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const workLogs = await WorkLog.list(req.query);
    const transformedWorkLogs = workLogs.map(workLog => workLog.transform());
    res.json({workLogs: transformedWorkLogs});
  } catch (error) {
    next(error);
  }
};

/**
 * Delete workLog
 * @public
 */
exports.remove = (req, res, next) => {
  const workLog = req.locals.workLog;

  workLog.remove().then(() => res.status(httpStatus.NO_CONTENT).end()).catch(e => next(e));
};


/**
 * Get workLogs for user
 * @public
 */
exports.getWorkLogsForOwner = async (req, res, next) => {
  try {
    const workLogsForUser = await WorkLog.list({'owners': req.params.ownerId});
    const transformedWorkLogsForUser = workLogsForUser.map(workLog => workLog.transform());
    res.json({workLogs: transformedWorkLogsForUser});
  } catch (error) {
    next(error);
  }
};