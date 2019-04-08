const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const APIError = require('../utils/APIError');

/**
 * 工作事项 隶属于一个工作日志
 */
const WorkItemSchema = new mongoose.Schema({
  // 隶属于一个工作日志
  workLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkLog',
    required: true,
  },
  // 谁做的 可以多个
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  // 哪个机器
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
  },
  // 机器上的哪个零件
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
  },
  // 零件的处理方式 TODO: maybe a ENUM?
  action: {
    type: String,
    required: true,
  },
  // 描述
  description: {
    type: String,
  },
  // 几点开始
  startEpochSeconds: {
    type: Number,
    required: true,
  },
  // 几点结束
  endEpochSeconds: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
WorkItemSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'workLogId',
      'owners',
      'machine',
      'part',
      'action',
      'description',
      'startEpochSeconds',
      'endEpochSeconds',
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
WorkItemSchema.query = {
  populateRefs() {
    return this
      .populate('owners')
      .populate('part')
  },
};

/**
 * Statics
 */
WorkItemSchema.statics = {
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
        message: '事项不存在',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  async list({page = 1, perPage = 30, ...props}) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({updatedAt: -1})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populateRefs()
      .exec();
  },

};

module.exports = mongoose.model('WorkItem', WorkItemSchema);
