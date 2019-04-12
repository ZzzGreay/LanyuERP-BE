const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const APIError = require('../utils/APIError');

const partCategories = ['零件', '仪器'];
const partStates = ['入库'];
const partHostTypes = ['仓库', '售后', '仪器'];

/**
 * 配件
 */
const PartSchema = new mongoose.Schema({
  //编码
  partId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    enum: partCategories,
    default: partCategories[0],
  },
  state: {
    type: String,
    enum: partStates,
    default: partStates[0],
  },
  //1. 配件不在机器上
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
  },
  //2. 配件在机器上
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
  }
}, {
  timestamps: true,
});

// PartSchema.pre('save', async function save(next) {
// })

/**
 * Methods
 */
PartSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'partId',
      'name',
      'category',
      'state',
      'site',
      'machine',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Populate reference fields.
 */
PartSchema.query = {
  populateRefs() {
    return this
      .populate('site')
      .populate('machine');
  },
};

/**
 * Statics
 */
PartSchema.statics = {
  /**
   * Get client
   *
   * @param {ObjectId} id - The objectId of client.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let client;

      if (mongoose.Types.ObjectId.isValid(id)) {
        client = await this.findById(id).exec();
      }
      if (client) {
        return client;
      }

      throw new APIError({
        message: '客户不存在',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List clients in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of clients to be skipped.
   * @param {number} limit - Limit number of clients to be returned.
   * @returns {Promise<User[]>}
   */
  list({page = 1, perPage = 30, name, email, role}) {
    const options = omitBy({name, email, role}, isNil);

    return this.find(options)
      .sort({createdAt: -1})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('Part', PartSchema);
