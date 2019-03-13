const httpStatus = require('http-status');
const { omit } = require('lodash');
const Client = require('../models/client.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load client and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const client = await Client.get(id);
    req.locals = { client };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get client
 * @public
 */
exports.get = (req, res) => res.json(req.locals.client.transform());

/**
 * Create new client
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(httpStatus.CREATED);
    res.json(savedClient.transform());
  } catch (error) {
    next(Client.checkDuplicateName(error));
  }
};

/**
 * Replace existing client
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { client } = req.locals;
    const newClient = new Client(req.body);
    const ommitRole = client.role !== 'admin' ? 'role' : '';
    const newClientObject = omit(newClient.toObject(), '_id', ommitRole);

    await client.update(newClientObject, { override: true, upsert: true });
    const savedClient = await Client.findById(client._id);

    res.json(savedClient.transform());
  } catch (error) {
    next(Client.checkDuplicateName(error));
  }
};

/**
 * Update existing client
 * @public
 */
exports.update = (req, res, next) => {
  const client = Object.assign(req.locals.client, req.body);

  client.save().
    then(savedClient => res.json(savedClient.transform())).
    catch(e => next(Client.checkDuplicateName(e)));
};

/**
 * Get client list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const clients = await Client.list(req.query);
    const transformedClients = clients.map(client => client.transform());
    res.json(transformedClients);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete client
 * @public
 */
exports.remove = (req, res, next) => {
  const client = req.locals.client;

  client.remove().
    then(() => res.status(httpStatus.NO_CONTENT).end()).
    catch(e => next(e));
};

/**
 * Get client types
 * @public
 */
exports.getClientTypes = async (req, res, next) => {
  try {
    res.json(Client.getClientTypes());
  } catch (error) {
    next(error);
  }
};

/**
 * Get source types
 * @public
 */
exports.getSourceTypes = async (req, res, next) => {
  try {
    res.json(Client.getSourceTypes());
  } catch (error) {
    next(error);
  }
};
