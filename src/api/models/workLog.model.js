const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const APIError = require('../utils/APIError');

/**
 * 工作日志
 */
const WorkLogSchema = new mongoose.Schema({
  // 日志负责人
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // 维修现场
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true,
  },
  // 工作记录
  records: {
    type:[{
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
        required: true,
      },
      // 机器上的哪个零件
      part: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Part',
        required: true,
      },
      // 对这个零件做了啥 TODO: maybe change to ENUM?
      action: {
        type: String,
        required: true,
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
    }],
  },
  //前往现场 用车
  toSiteCommute: {
    _id: false,
    required: true,
    type: {
      fromSite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        required: true,
      },
      carId: {
        type: String,
        required: true,
      },
      startKilos: {
        type: Number,
        required: true,
      },
      endKilos: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  },
  //离开现场 用车
  leaveSiteCommute: {
    _id: false,
    required: true,
    default: {},
    type: {
      toSite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        required: true,
      },
      carId: {
        type: String,
        required: true,
      },
      startKilos: {
        type: Number,
        required: true,
      },
      endKilos: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
WorkLogSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'owners',
      'site',
      'records',
      'toSiteCommute',
      'leaveSiteCommute',
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
WorkLogSchema.query = {
  populateRefs() {
    return this
      .populate('owners')
      .populate('site')
      .populate('records')
      .populate('toSiteCommute')
      .populate('leaveSiteCommute');
  },
};

/**
 * Statics
 */
WorkLogSchema.statics = {
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
        message: '日志不存在',
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
  async list({page = 1, perPage = 30, owner, machine}) {
    const options = omitBy({owner, machine}, isNil);

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
module.exports = mongoose.model('WorkLog', WorkLogSchema);
