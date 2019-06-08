const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../utils/APIError');

const partStates = ['入库', '使用中',];

/**
 * 配件
 */
const PartSchema = new mongoose.Schema({
  // 配件名称
  name: {
    type: String,
    required: true,
  },
  // 配件编码
  partId: {
    type: String,
  },
  // 配件状态
  state: {
    type: String,
    enum: partStates,
    default: partStates[0],
  },
  // 配件所在机器
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
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
      'partId',
      'state',
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
        client = await this.findById(id).populateRefs().exec();
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
  list({ page = 1, perPage = 10000, ...props }) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populateRefs()
      .exec();
  },
};

module.exports = mongoose.model('Part', PartSchema);
