var UserInfo = require('pages/userInfo/userInfo.js');

App({
  onLaunch: function () {
    //login
    UserInfo.initSfzAndSession();
    UserInfo.setUserInfo();
  },
  globalData: {
    userInfo: null
  }
})