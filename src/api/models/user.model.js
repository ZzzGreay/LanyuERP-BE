const mongoose = require("mongoose");
const httpStatus = require("http-status");
const { omitBy, isNil } = require("lodash");
const moment = require("moment-timezone");
const jwt = require("jwt-simple");
const APIError = require("../utils/APIError");
const { jwtSecret, jwtExpirationInterval } = require("../../config/vars");

/**
 * 用户
 */
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      trim: true,
      maxlength: 128,
      // TODO: remove 'default'
      default: "123456"
    },
    name: {
      type: String,
      unique: true
    },
    lastLoginTime: {
      // epoch seconds
      type: Number,
    },
    //钉钉ID, 在注册时填入
    dingId: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
UserSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    const rounds = env === "test" ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods for a user instance
 */
UserSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "id",
      "username",
      "password",
      "dingId",
      "name",
      "lastLoginTime"
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment()
        .add(jwtExpirationInterval, "minutes")
        .unix(),
      iat: moment().unix(),
      sub: this._id
    };
    return jwt.encode(playload, jwtSecret);
  },

  async passwordMatches(password) {
    const matches = await bcrypt.compare(password, this.password);
    return matches;
  }
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user by dingId
   */
  async findByDingId(dingId) {
    return await await this.findOne({ dingId }).exec();
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { username, password, refreshObject } = options;
    if (!username)
      throw new APIError({
        message: "An username is required to generate a token"
      });

    const user = await this.findOne({ username }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true
    };
    if (password) {
      if (user && user.passwordMatches(password)) {
        return { user, accessToken: user.token() };
      }
      err.message = "用户名密码错误";
    } else if (refreshObject && refreshObject.userEmail === email) {
      return { user, accessToken: user.token() };
    } else {
      err.message = "Token错误";
    }
    throw new APIError(err);
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ page = 1, perPage = 10000, ...props }) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({ name: 1 })
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
    if (error.name === "MongoError" && error.code === 11000) {
      return new APIError({
        message: "用户名已存在",
        errors: [
          {
            field: "username",
            location: "body",
            messages: ["用户名已经存在"]
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("User", UserSchema);
