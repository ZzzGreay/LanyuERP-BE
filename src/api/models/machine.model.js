const mongoose = require("mongoose");
const httpStatus = require("http-status");
const { omitBy, isNil } = require("lodash");
const APIError = require("../utils/APIError");

// 改这之后也要改前端
const machineStates = [
  "初始化",
  "组装中",
  "运行中",
  "需维护",
  "维修中",
  "损坏"
];

/**
 * 设备仪器
 */
const MachineSchema = new mongoose.Schema(
  {
    // 机器编码
    machineId: {
      type: String,
      required: true,
      unique: true
    },
    // 机器代号 锅炉号
    alias: {
      type: String,
      unique: true
    },
    // 机器类型
    type: {
      type: String
    },
    // 机器状态
    state: {
      type: String,
      enum: machineStates,
      default: machineStates[0]
    },
    // 机器位置
    location: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Site"
    },

    /**
     * 所有文件
     * 0代表没有上传文件
     * n代表每个有n个文件
     * n最多是5
     */
    // 上墙制度: policyFilePath
    shangqiangzhidu: {
      type: Number,
      default: 0
    },
    // 上墙的备案登记表: registerFilePath
    beiandengji: {
      type: Number,
      default: 0
    },
    // 运维证书: opCertFilePath
    yunweizhengshu: {
      type: Number,
      default: 0
    },
    // 人员上岗证书: laborCertFilePath
    shanggangzhengshu: {
      type: Number,
      default: 0
    },
    // 说明书: manualFilePath
    shuomingshu: {
      type: Number,
      default: 0
    },
    // 作业指导书: instructionFilePath
    zuoyezhidaoshu: {
      type: Number,
      default: 0
    },
    // 验收材料： inspectionFilePath
    yanshoucailiao: {
      type: Number,
      default: 0
    },
    // 标气配置： gasConfigFilePath
    biaoqipeizhi: {
      type: Number,
      default: 0
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
    const fields = [
      "id",
      "machineId",
      "alias",
      "type",
      "state",
      "location",
      "shangqiangzhidu",
      "beiandengji",
      "yunweizhengshu",
      "shanggangzhengshu",
      "shuomingshu",
      "zuoyezhidaoshu",
      "yanshoucailiao",
      "biaoqipeizhi"
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  setFileCount(fileType, count) {
    this[fileType] = count;
  }
});

/**
 * Populate reference fields.
 */
MachineSchema.query = {
  populateRefs() {
    return this.populate("location");
  }
};

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
        client = await this.findById(id)
          .populateRefs()
          .exec();
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
      .populateRefs()
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("Machine", MachineSchema);
