const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment-timezone');

/**
 * Refresh Token Schema
 * @private
 */
const RefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dingId: {
    type: 'String',
    ref: 'User',
    required: true,
  },
  name: {
    type: 'String',
    ref: 'User',
    required: true,
  },
  expires: {type: Date},
});

RefreshTokenSchema.statics = {

  /**
   * Generate a refresh token object and saves it into the database
   *
   * @param {User} user
   * @returns {RefreshToken}
   */
  generate(user) {
    const userId = user._id;
    const dingId = user.dingId;
    const name = user.dingId;
    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment().add(30, 'days').toDate();
    const tokenObject = new RefreshToken({token, userId, dingId, name, expires});
    tokenObject.save();
    return tokenObject;
  },

};

/**
 * @typedef RefreshToken
 */
const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
module.exports = RefreshToken
