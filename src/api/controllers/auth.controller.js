const httpStatus = require('http-status');
const moment = require('moment-timezone');

const DingApi = require('../utils/dingapi');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const {jwtExpirationInterval} = require('../../config/vars');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {tokenType, accessToken, refreshToken, expiresIn};
}

/**
 * Returns jwt token if registration//login was successful
 * @public
 */
exports.login = async (req, res, next) => {
  const dingUser = await DingApi.login(req);

  // see if user exists. if so, login.
  const user = await User.findByDingId(dingUser.userid);
  if (user) {
    try {
      user.lastLoginTime = moment().unix();
      await user.save();
      const token = generateTokenResponse(user, user.token());
      const userTransformed = user.transform();
      console.log(JSON.stringify(userTransformed) + " logged in.");
      return res.json({token, user: userTransformed});
    } catch (error) {
      return next(error);
    }
  }
  // if not, auto register.
  const newUser = {
    dingId: dingUser.userid,
    name: dingUser.name,
    username: dingUser.name,
    lastLoginTime: moment().unix(),
  };
  try {
    const user = await (new User(newUser)).save();
    const token = generateTokenResponse(user, user.token());
    const userTransformed = user.transform();
    console.log(JSON.stringify(userTransformed) + " registered and logged in.");
    res.status(httpStatus.CREATED);
    return res.json({token, user: userTransformed});
  } catch (error) {
    return next(User.checkDuplicateUsername(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.signin = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body)
    const token = generateTokenResponse(user, accessToken)
    const userTransformed = user.transform()
    return res.json({ token, user: userTransformed })
  } catch (error) {
    return next(error)
  }
}

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const {email, refreshToken} = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const {user, accessToken} = await User.findAndGenerateToken(
      {email, refreshObject});
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
