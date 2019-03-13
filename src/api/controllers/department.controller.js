const httpStatus = require('http-status')
const { omit } = require('lodash')
const Department = require('../models/department.model')
const { handler: errorHandler } = require('../middlewares/error')

/**
 * Load department and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const department = await Department.get(id)
    req.locals = { department }
    return next()
  } catch (error) {
    return errorHandler(error, req, res)
  }
}

/**
 * Get department
 * @public
 */
exports.get = (req, res) => res.json(req.locals.department.transform())

/**
 * Create new department
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const department = new Department(req.body)
    const savedDepartment = await department.save()
    res.status(httpStatus.CREATED)
    res.json(savedDepartment.transform())
  } catch (error) {
    next(Department.checkDuplicateName(error))
  }
}

/**
 * Replace existing department
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { department } = req.locals
    const newDepartment = new Department(req.body)
    const ommitRole = department.role !== 'admin' ? 'role' : ''
    const newDepartmentObject = omit(newDepartment.toObject(), '_id', ommitRole)

    await department.update(newDepartmentObject, { override: true, upsert: true })
    const savedDepartment = await Department.findById(department._id)

    res.json(savedDepartment.transform())
  } catch (error) {
    next(Department.checkDuplicateName(error))
  }
}

/**
 * Update existing department
 * @public
 */
exports.update = (req, res, next) => {
  const department = Object.assign(req.locals.department, req.body)

  department
    .save()
    .then(savedDepartment => res.json(savedDepartment.transform()))
    .catch(e => next(Department.checkDuplicateName(e)))
}

/**
 * Get department list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const departments = await Department.list(req.query)
    const transformedDepartments = departments.map(department => department.transform())
    res.json(transformedDepartments)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete department
 * @public
 */
exports.remove = (req, res, next) => {
  const department = req.locals.department

  department.remove().
    then(() => res.status(httpStatus.NO_CONTENT).end()).
    catch(e => next(e))
}
