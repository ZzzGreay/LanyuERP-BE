const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

const workTypes = ['安装', '维护', '维修'];

/**
 * 工作事项 隶属于一个工作日志
 */
const WorkItemSchema = new mongoose.Schema({
  // 隶属于一个工作日志
  workLog: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  // 谁做的 可以多个
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  // 工作类型
  workType: {
    type: String,
    enum: workTypes,
    required: true,
  },
  // 哪个机器
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
  },
  // 机器上原有零件
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
  },
  // 安装/更换新的零件
  newPart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
  },
  // 安装/更换零件数量
  partCount: {
    type: Number,
  },
  // 备注
  description: {
    type: String,
  },
  // 开始时间
  startTime: {
    type: Date,
    required: true,
  },
  // 结束时间
  endTime: {
    type: Date,
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
      'workLog',
      'owners',
      'workType',
      'machine',
      'part',
      'newPart',
      'partCount',
      'description',
      'startTime',
      'endTime',
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
      .populate('workLog')
      .populate('owners')
      .populate('machine')
      .populate('part')
      .populate('newPart')
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

  async list({ page = 1, perPage = 10000, ...props }) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({ updatedAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populateRefs()
      .exec();
  },

  getWorkTypes() {
    return workTypes;
  },

};

module.exports = mongoose.model('WorkItem', WorkItemSchema);
