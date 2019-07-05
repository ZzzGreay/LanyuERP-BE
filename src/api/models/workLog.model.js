const mongoose = require("mongoose");
const httpStatus = require("http-status");
const { omitBy, isNil } = require("lodash");
const APIError = require("../utils/APIError");

const WORK_LOG_TYPES = ["维护", "维修"];
/**
 * 工作维护，维修日志
 */
const WorkLogSchema = new mongoose.Schema(
  {
    // 日志负责人
    owners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    // 现场
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true
    },
    // 类型
    workLogType: {
      type: String,
      enum: WORK_LOG_TYPES
    },
    // 日期
    date: {
      type: Date
    },
    //前往现场 用车
    toSiteCommute: {
      _id: false,
      fromSite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site"
      },
      carId: {
        type: String
      },
      startKilos: {
        type: Number
      },
      endKilos: {
        type: Number
      },
      date: {
        type: Date
      }
    },
    //离开现场 用车
    leaveSiteCommute: {
      _id: false,
      toSite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site"
      },
      carId: {
        type: String
      },
      startKilos: {
        type: Number
      },
      endKilos: {
        type: Number
      },
      date: {
        type: Date
      }
    },
    /**
     * 所有文件
     * 0代表没有上传文件
     * n代表每个有n个文件
     * n最多是5
     */
    // 设备安装-维护-维修记录表:
    sanlianbiao: {
      type: Number,
      default: 0
    },
    // 固定污染源烟气排放连续监测系统日常巡检、校准和维护原始记录表:
    richangxunjian: {
      type: Number,
      default: 0
    },
    // CEMS 零点 / 量程漂移与校准记录表: ldLcPyJzFilePath
    jiaozhun: {
      type: Number,
      default: 0
    },
    // CEMS 校验测试记录表 （3个月）: jyCsFilePath
    jiaoyan: {
      type: Number,
      default: 0
    },
    // 易耗品更换记录表: yhpGhFilePath
    yihao: {
      type: Number,
      default: 0
    },
    // 标准气体更换记录表: bqGhFilePath
    biaoqi: {
      type: Number,
      default: 0
    },
    // CEMS 维修记录表: wxFilePath
    weixiu: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/**
 * Methods
 */
WorkLogSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "id",
      "owners",
      "workLogType",
      "site",
      "date",
      "toSiteCommute",
      "leaveSiteCommute",
      "sanlianbiao",
      "richangxunjian",
      "jiaozhun",
      "jiaoyan",
      "yihao",
      "biaoqi",
      "weixiu"
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
WorkLogSchema.query = {
  populateRefs() {
    return this.populate("owners")
      .populate("site")
      .populate({ path: "toSiteCommute.fromSite", select: ["id", "name"] })
      .populate({ path: "leaveSiteCommute.toSite", select: ["id", "name"] });
  }
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
        client = await this.findById(id)
          .populateRefs()
          .exec();
      }
      if (client) {
        return client;
      }

      throw new APIError({
        message: "日志不存在",
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
  async list({ page = 1, perPage = 10000, ...props }) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({ updatedAt: 1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populateRefs()
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("WorkLog", WorkLogSchema);
