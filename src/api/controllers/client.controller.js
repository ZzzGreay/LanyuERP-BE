const httpStatus = require('http-status');
const Client = require('../models/client.model');
const {handler: errorHandler} = require('../middlewares/error');

/**
 * Load client and append to req.
 */
exports.load = async (req, res, next, id) => {
  try {
    const client = await Client.get(id);
    req.locals = {client};
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get client
 */
exports.get = (req, res) => res.json(req.locals.client.transform());

/**
 * Create new client
 */
exports.create = async (req, res, next) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(httpStatus.CREATED);
    res.json({createdClient: savedClient.transform()});
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing client
 */
exports.update = (req, res, next) => {
  const client = Object.assign(req.locals.client, req.body);

  client
    .save()
    .then(savedClient => res.json({updatedClient: savedClient.transform()}))
    .catch(e => next(e));
};

/**
 * Get client list
 */
exports.list = async (req, res, next) => {
  try {
    const clients = await Client.list(req.query);
    const transformedClients = clients.map(client => client.transform());
    res.json({clients: transformedClients});
  } catch (error) {
    next(error);
  }
};

/**
 * Delete client
 */
exports.remove = (req, res, next) => {
  const client = req.locals.client;

  client.remove().then(() => res.status(httpStatus.NO_CONTENT).end()).catch(e => next(e));
};