const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const APIError = require('../utils/APIError');

const machineStates = ['初始化', '组装中', '运行中', '需维护'];

/**
 * 机器
 */
const MachineSchema = new mongoose.Schema({
  //机器编码
  machineId: {
    type: String,
    required: true,
    unique: true,
  },
  // 机器代号 锅炉号
  alias: {
    type: String,
    unique: true,
  },
  //机器类型
  type: {
    type: String,
  },
  //机器状态
  state: {
    type: String,
    enum: machineStates,
    default: machineStates[0],
  },
  //机器位置
  location: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Site',
  },
  //机器配件
  parts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
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
      'machineId',
      'alias',
      'type',
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
      .populate('location')
      .populate('parts');
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
  list({page = 1, perPage = 10000, name, email, role}) {
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
module.exports = mongoose.model('Machine', MachineSchema);
