const mongoose = require("mongoose");
const httpStatus = require("http-status");
const { omitBy, isNil } = require("lodash");
const APIError = require("../utils/APIError");

const machineStates = ["初始化", "组装中", "运行中", "需维护"];

/**
 * 作业指导书
 */
const InstructionSchema = new mongoose.Schema(
  {
    // 指导书主题
    for: {
      type: String,
      required: true,
      unique: true
    },
    // 指导书名称
    filePath: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

/**
 * Convenient methods to apply to a row.
 */
MachineSchema.method({
  transform() {
    const transformed = {};
    const fields = ["id", "for", "filePath"];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});

/**
 * Statics
 */
MachineSchema.statics = {
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
        message: "客户不存在",
        status: httpStatus.NOT_FOUND
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
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("Machine", MachineSchema);
