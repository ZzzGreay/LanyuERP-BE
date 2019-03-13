const httpStatus = require('http-status')
const moment = require('moment-timezone')

const DingApi = require('../utils/dingapi');
const User = require('../models/user.model')
const RefreshToken = require('../models/refreshToken.model')
const {jwtExpirationInterval} = require('../../config/vars')

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer'
  const refreshToken = RefreshToken.generate(user).token
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes')
  return {tokenType, accessToken, refreshToken, expiresIn}
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.login = async (req, res, next) => {
  const dingUser = await DingApi.login();
  // see if user exists. if so, login.
  const user = await User.findByDingId(dingUser.userid);
  if (user) {
    try {
      const token = generateTokenResponse(user, user.token());
      const userTransformed = user.transform();
      return res.json({token, user: userTransformed});
    } catch (error) {
      return next(error);
    }
  }
  // if not, register.
  const newUser = {
    dingId: dingUser.userid,
    name: dingUser.name,
    lastLoginTime: moment().unix(),
  };
  try {
    const user = await (new User(newUser)).save()
    const userTransformed = user.transform()
    const token = generateTokenResponse(user, user.token())
    res.status(httpStatus.CREATED)
    return res.json({token, user: userTransformed})
  } catch (error) {
    return next(User.checkDuplicateUsername(error))
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const {email, refreshToken} = req.body
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    })
    const {user, accessToken} = await User.findAndGenerateToken(
      {email, refreshObject})
    const response = generateTokenResponse(user, accessToken)
    return res.json(response)
  } catch (error) {
    return next(error)
  }
};
