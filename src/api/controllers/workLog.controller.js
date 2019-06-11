const httpStatus = require("http-status");
const WorkLog = require("../models/workLog.model");
const { handler: errorHandler } = require("../middlewares/error");
const path = require("path");

/**
 * Load workLog and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const workLog = await WorkLog.get(id);
    req.locals = { workLog };
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
  console.log(req.body);
  try {
    const workLog = new WorkLog(req.body);
    const savedWorkLog = await workLog.save();
    res.status(httpStatus.CREATED);
    res.json({ createdWorkLog: savedWorkLog.transform() });
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
    .then(savedWorkLog =>
      res.json({ updatedWorkLog: savedWorkLog.transform() })
    )
    .catch(e => next(e));
};

/**
 * Get workLog list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const workLogs = await WorkLog.list(req.query);
    const transformedWorkLogs = workLogs.map(workLog => workLog.transform());
    res.json({ workLogs: transformedWorkLogs });
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

  workLog
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

/**
 * Get workLogs for user
 * @public
 */
exports.getWorkLogsForOwner = async (req, res, next) => {
  try {
    const workLogsForUser = await WorkLog.list({ owners: req.params.ownerId });
    const transformedWorkLogsForUser = workLogsForUser.map(workLog =>
      workLog.transform()
    );
    res.json({ workLogs: transformedWorkLogsForUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Filter worklogs with request body fields
 */
exports.filter = async (req, res, next) => {
  try {
    const workLogs = await WorkLog.list(req.body);
    const transformedWorkLogs = workLogs.map(workLog => workLog.transform());
    res.json({ workLogs: transformedWorkLogs });
  } catch (error) {
    next(error);
  }
};

/**
 * Save file
 */
exports.uploadFile = async (req, res, next) => {
  console.log(JSON.stringify(req));

  const workLog = req.locals.workLog;
  const fileType = req.params.fileType;

  workLog.setUploaded(fileType);

  workLog
    .save()
    .then(savedWorkLog =>
      res.json({ updatedWorkLog: savedWorkLog.transform() })
    )
    .catch(e => {
      console.log(JSON.stringify(e));
      next(e);
    });
};

/**
 * Download file
 */
exports.getFile = async (req, res, next) => {
  const workLog = req.locals.workLog;
  const fileType = req.params.fileType;

  const fileName = `${workLog.id}_${fileType}`;
  res.download(path.join(__dirname, `../../../files/${fileType}/${fileName}`));
};
