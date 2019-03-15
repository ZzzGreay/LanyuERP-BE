const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const APIError = require('../utils/APIError');

/**
 * 工作日志
 */
const WorkLogSchema = new mongoose.Schema({
  principal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true,
  },
  workLog: {
    required: true,
    type: [{
      worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      actions: [{
        _id: false,
        partId: {
          type: String,
          required: true,
        },
        //TODO: maybe change to ENUM?
        action: {
          type: String,
          required: true,
        }
      }],
      // epoch seconds
      startTime: {
        type: Number,
        required: true,
      },
      endTime: {
        type: Number,
        required: true,
      },
    }],
  },
  //去途 用车
  forwardCommute: {
    _id: false,
    required: true,
    type: {
      carId: {
        type: String,
        required: true,
      },
      startMiles: {
        type: Number,
        required: true,
      },
      endMiles: {
        type: Number,
        required: true,
      },
    },
  },
  //回途 用车
  backCommute: {
    _id: false,
    required: true,
    default: null,
    type: {
      carId: {
        type: String,
        required: true,
      },
      startMiles: {
        type: Number,
        required: true,
      },
      endMiles: {
        type: Number,
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
      'principal',
      'machine',
      'workLog',
      'forwardCommute',
      'backCommute',
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
      .populate('parts')
      .populate('machine')
      .populate('workLog');
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
module.exports = mongoose.model('WorkLog', WorkLogSchema);
