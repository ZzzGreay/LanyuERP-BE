const httpStatus = require("http-status");
const Machine = require("../models/machine.model");
const { handler: errorHandler } = require("../middlewares/error");
const path = require("path");
const fs = require('fs');

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
 * check existing files
 */
exports.checkExistingFiles = async (req, res, next) => {
  const machine = req.locals.machine;
  const fileType = req.params.fileType;

  // if this is a new batch of files for a image type, and the image has already been upload.
  // we will need to remove all existing files
  if (machine[fileType] > 0) {
    for (let i = 1; i <= machine[fileType]; i++) {
      let fileName = `${machine.id}_${fileType}_${i}`;
      let filePath = path.join(__dirname, `../../../files/machine/${fileName}.jpg`)
      fs.unlinkSync(filePath, (err) => {
        if (err) next(err);
        console.log(`successfully deleted ${filePath}`);
      });
    }
  }

  machine.setFileCount(fileType, 0);

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
 * Save file
 */
exports.uploadFile = async (req, res, next) => {
  const machine = req.locals.machine;
  const fileType = req.params.fileType;
  const number = req.params.number;

  // HACK TODO FIXME
  if (machine[fileType] < number) {
    machine.setFileCount(fileType, number);
  }

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
  const number = req.params.number;

  const fileName = `${machine.id}_${fileType}_${number}`;
  res.download(path.join(__dirname, `../../../files/machine/${fileName}.jpg`));
};
