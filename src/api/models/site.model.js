const mongoose = require("mongoose");
const httpStatus = require("http-status");
const { omitBy, isNil } = require("lodash");
const APIError = require("../utils/APIError");

/**
 * 现场
 */
const SiteSchema = new mongoose.Schema(
  {
    // 现场名称
    name: {
      type: String,
      unique: true,
      required: true
    },
    // 负责人
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // 负责人
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client"
    },
    // 城市
    city: {
      type: String
    },
    // 地址
    address: {
      type: String
    },
    // 经度
    longitude: {
      type: Number
    },
    // 纬度
    latitude: {
      type: Number
    },
    //上次去现场时间
    lastVisitDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/**
 * Convenient methods to apply to a row.
 */
SiteSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "id",
      "name",
      "owner",
      "client",
      "city",
      "address",
      "longitude",
      "latitude",
      "lastVisitDate"
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});

/**
 * Populate reference fields.
 */
SiteSchema.query = {
  populateRefs() {
    return this.populate("client").populate("owner");
  }
};

/**
 * Statics
 */
SiteSchema.statics = {
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

  list({ page = 1, perPage = 10000, ...props }) {
    const options = omitBy(props, isNil);

    return this.find(options)
      .sort({ name: 1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populateRefs()
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("Site", SiteSchema);
