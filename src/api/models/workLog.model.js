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
  //前往现场 用车
  toSiteCommute: {
    _id: false,
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
  //离开现场 用车
  leaveSiteCommute: {
    _id: false,
    toSite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
    },
    carId: {
      type: String,
    },
    startKilos: {
      type: Number,
    },
    endKilos: {
      type: Number,
    },
    date: {
      type: Date,
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
      .populate({path: 'toSiteCommute.fromSite', select: ['id', 'name']})
      .populate({path: 'leaveSiteCommute.toSite', select: ['id', 'name']});
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
  async list({page = 1, perPage = 30, ...props}) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({updatedAt: 1})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populateRefs()
      .exec();
  },

};

/**
 * @typedef User
 */
module.exports = mongoose.model('WorkLog', WorkLogSchema);
