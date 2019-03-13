const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const APIError = require('../utils/APIError');

const partCategories = ['1'];
const partStates = ['入库'];
const partHostTypes = ['仓库', '售后', '仪器'];

/**
 * 配件
 */
const PartSchema = new mongoose.Schema({
  //编码
  id: {
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
  //配件持有者
  host: {
    type: {
      type: String,
      required: true,
      enum: partHostTypes,
    },
    id: {
      type: String,
      required: true,
    },
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
      'name',
      'type',
      'source',
      'addresses',
      'contacts',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

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

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateName(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: '客户名称已存在',
        errors: [
          {
            field: 'name',
            location: 'body',
            messages: ['客户已经存在'],
          },
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

  getClientTypes() {
    return clientTypes;
  },

  getSourceTypes() {
    return sourceTypes;
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('Part', PartSchema);
