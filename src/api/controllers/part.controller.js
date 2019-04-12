const httpStatus = require('http-status');
const Part = require('../models/part.model');
const {handler: errorHandler} = require('../middlewares/error');

/**
 * Load part and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    const part = await Part.get(id);
    req.locals = {part};
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get part
 */
exports.get = (req, res) => res.json(req.locals.part.transform());

/**
 * Create new part
 */
exports.create = async (req, res, next) => {
  try {
    const part = new Part(req.body);
    const savedPart = await part.save();
    res.status(httpStatus.CREATED);
    res.json({createdPart: savedPart.transform()});
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing part
 */
exports.update = (req, res, next) => {
  const part = Object.assign(req.locals.part, req.body);

  part
    .save()
    .then(savedPart => res.json({updatedPart: savedPart.transform()}))
    .catch(e => next(e));
};

/**
 * Get part list
 */
exports.list = async (req, res, next) => {
  try {
    const parts = await Part.list(req.query);
    const transformedParts = parts.map(part => part.transform());
    res.json({parts: transformedParts});
  } catch (error) {
    next(error);
  }
};

/**
 * Delete part
 */
exports.remove = (req, res, next) => {
  const part = req.locals.part;

  part.remove().then(() => res.status(httpStatus.NO_CONTENT).end()).catch(e => next(e));
};
