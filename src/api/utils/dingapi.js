const Http = require('../utils/http');
const dingConfig = require('../../config/ding.config');

const HttpUtils = new Http(dingConfig.oapiHost);

/**
 * return {userId, name}
 *
 * Needs to return a promise to work with async functions.
 */
exports.login = (req) => new Promise(resolve => {
  // 获取access_token
  HttpUtils.get("/gettoken", {
    "appkey": dingConfig.appkey,
    "appsecret": dingConfig.appsecret,
  }, function (err, body) {
    if (!err) {
      let code = req.body.authCode;
      let accessToken = body.access_token;
      //获取用户id
      HttpUtils.get("/user/getuserinfo", {
        "access_token": accessToken,
        "code": code,
      }, function (err2, body2) {
        if (!err2) {
          //获取用户详细信息
          HttpUtils.get("/user/get", {
            "access_token": accessToken,
            "userid": body2.userid,
          }, function (err3, body3) {
            if (!err3) {
              resolve({
                userid: body2.userid,
                name: body3.name,
              });
            } else {
              console.err('获取用户信息失败');
            }
          });
        } else {
          console.err('获取用户id失败');
        }
      });
    } else {
      console.err('获取access_token失败');
    }
  });
});
