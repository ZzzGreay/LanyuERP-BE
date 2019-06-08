const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

/**
 * 客户
 */
const ClientSchema = new mongoose.Schema({
  // 客户名称
  name: {
    type: String,
    required: true,
    unique: true,
  },
  // 合同开始时间
  // 2019-01-01
  contractStartDate: {
    type: String,
  },
  // 合同结束时间
  contractEndDate: {
    type: String,
  },
  // 承包方式
  contractType: {
    type: String,
  },
  // 备注
  note: {
    type: String,
  }
}, {
    timestamps: true,
  });

// ClientSchema.pre('save', async function save(next) {
// })

/**
 * Methods
 */
ClientSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'name',
      'contractStartDate',
      'contractEndDate',
      'contractType',
      'note',
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
ClientSchema.statics = {
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
  list({ page = 1, perPage = 30, ...props }) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
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
};

/**
 * @typedef Client
 */
module.exports = mongoose.model('Client', ClientSchema);
