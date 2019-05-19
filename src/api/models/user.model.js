const mongoose = require('mongoose');
const httpStatus = require('http-status');
const {omitBy, isNil} = require('lodash');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const APIError = require('../utils/APIError');
const {jwtSecret, jwtExpirationInterval} = require('../../config/vars');

/**
 * 用户
 */
const UserSchema = new mongoose.Schema({
  //钉钉ID, 在注册时填入
  dingId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  lastLoginTime: {
    // epoch seconds
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

/**
 * Methods for a user instance
 */
UserSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'dingId', 'name', 'lastLoginTime'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(playload, jwtSecret);
  },
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user by dingId
   */
  async findByDingId(dingId) {
    return await await this.findOne({dingId}).exec();
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({page = 1, perPage = 10000, dingId, name, lastLoginTime}) {
    const options = omitBy({dingId, name, lastLoginTime}, isNil);

    return this
      .find(options)
      .sort({name: 1})
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
  checkDuplicateUsername(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: '用户名已存在',
        errors: [
          {
            field: 'username',
            location: 'body',
            messages: ['用户名已经存在'],
          }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
