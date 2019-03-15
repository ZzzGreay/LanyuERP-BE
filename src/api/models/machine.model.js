const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const APIError = require('../utils/APIError');

const machineCategories = ['FB-1000'];
const machineStates = ['初始化', '组装中', '运行', '维护'];

/**
 * 机器
 */
const MachineSchema = new mongoose.Schema({
  //机器编码
  id: {
    type: String,
    required: true,
    unique: true,
  },
  //机器类型
  category: {
    type: String,
    enum: machineCategories,
    default: machineCategories[0],
  },
  //机器状态
  state: {
    type: String,
    enum: machineStates,
    default: machineStates[0],
  },
  //机器位置
  location: {
    _id: false,
    address: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  //机器配件
  parts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    default: [],
  }],
}, {
  timestamps: true,
});

/**
 * Convenient methods to apply to a row.
 */
MachineSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'category',
      'state',
      'location',
      'parts',
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
MachineSchema.query = {
  populateRefs() {
    return this
      .populate('parts');
    //.populate({ path: 'parts', select: ['realname', 'username'] })
  },
};

/**
 * Statics
 */
MachineSchema.statics = {
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
module.exports = mongoose.model('Machine', MachineSchema);
