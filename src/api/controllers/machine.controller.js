const httpStatus = require("http-status");
const Machine = require("../models/machine.model");
const { handler: errorHandler } = require("../middlewares/error");

/**
 * Load machine and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    const machine = await Machine.get(id);
    req.locals = { machine };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get machine
 */
exports.get = (req, res) => res.json(req.locals.machine.transform());

/**
 * Create new machine
 */
exports.create = async (req, res, next) => {
  try {
    const machine = new Machine(req.body);
    const savedMachine = await machine.save();
    res.status(httpStatus.CREATED);
    res.json({ createdMachine: savedMachine.transform() });
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing machine
 */
exports.update = (req, res, next) => {
  const machine = Object.assign(req.locals.machine, req.body);

  machine
    .save()
    .then(savedMachine =>
      res.json({ updatedMachine: savedMachine.transform() })
    )
    .catch(e => next(e));
};

/**
 * Get machine list
 */
exports.list = async (req, res, next) => {
  try {
    const machines = await Machine.list(req.query);
    const transformedMachines = machines.map(machine => machine.transform());
    res.json({ machines: transformedMachines });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete machine
 */
exports.remove = (req, res, next) => {
  const machine = req.locals.machine;

  machine
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

/**
 * getMachinesForSite
 */
exports.getMachinesForSite = async (req, res, next) => {
  try {
    const machinesForSite = await Machine.list({ location: req.params.siteId });
    const transformedMachinesForSite = machinesForSite.map(machine =>
      machine.transform()
    );
    res.json({ machines: transformedMachinesForSite });
  } catch (error) {
    next(error);
  }
};

/**
 * Save file
 */
exports.uploadFile = async (req, res, next) => {
  const machine = req.locals.machine;
  const fileType = req.params.fileType;

  machine.setUploaded(fileType);

  machine
    .save()
    .then(savedMachine =>
      res.json({ updatedMachine: savedMachine.transform() })
    )
    .catch(e => {
      next(e);
    });
};

/**
 * Download file
 */
exports.getFile = async (req, res, next) => {
  const machine = req.locals.machine;
  const fileType = req.params.fileType;

  const fileName = `${machine.id}_${fileType}`;
  res.download(path.join(__dirname, `../../../files/machine/${fileName}.jpg`));
};
