const httpStatus = require("http-status");
const Site = require("../models/site.model");
const { handler: errorHandler } = require("../middlewares/error");

/**
 * Load site and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const site = await Site.get(id);
    req.locals = { site };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get site
 * @public
 */
exports.get = (req, res) => res.json(req.locals.site.transform());

/**
 * Create new site
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const site = new Site(req.body);
    const savedSite = await site.save();
    res.status(httpStatus.CREATED);
    res.json(savedSite.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing site
 * @public
 */
exports.update = (req, res, next) => {
  const site = Object.assign(req.locals.site, req.body);

  site
    .save()
    .then(savedSite => res.json({ updated: savedSite.transform() }))
    .catch(e => next(e));
};

/**
 * Get site list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const sites = await Site.list(req.query);
    const transformedSites = sites.map(site => site.transform());
    res.json({ sites: transformedSites });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete site
 * @public
 */
exports.remove = (req, res, next) => {
  const site = req.locals.site;

  site
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
