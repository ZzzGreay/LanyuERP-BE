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
  }, function (getTokenError, getTokenResult) {
    if (!getTokenError) {

      console.log("\n getTokenResult: " +JSON.stringify(getTokenResult) + "\n");

      // This body.authCode is generated from Client when they do Oauth through Ding Ding.
      let code = req.body.authCode;
      let accessToken = getTokenResult.access_token;
      //获取用户id
      HttpUtils.get("/user/getuserinfo", {
        "access_token": accessToken,
        "code": code,
      }, function (getUserInfoError, getUserInfoResult) {
        if (!getUserInfoError) {

          console.log("\n getUserInfoResult: " + JSON.stringify(getUserInfoResult) + "\n");

          //获取用户详细信息
          HttpUtils.get("/user/get", {
            "access_token": accessToken,
            "userid": getUserInfoResult.userid,
          }, function (getUserDetailError, getUserDetailResult) {
            if (!getUserDetailError) {

              console.log("\n getUserDetailResult: " + JSON.stringify(getUserDetailResult) + "\n");

              resolve({
                userid: getUserInfoResult.userid,
                name: getUserDetailResult.name,
              });
            } else {
              console.error('获取用户信息失败');
            }
          });
        } else {
          console.error('获取用户id失败');
        }
      });
    } else {
      console.error('获取access_token失败');
    }
  });
});
