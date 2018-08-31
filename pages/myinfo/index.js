var UserInfo = require('../userInfo/userInfo.js')
Page({
  data: {
    array: ['下载二维码', '复制公众号'],
    index: 0,
  },
  showActions: function(){
    wx.showActionSheet({
      itemList: ['下载二维码', '复制公众号'],
      success: function (res) {
        var val = res.tapIndex
        if (val == 0) {
          wx.downloadFile({
            url: "https://odin.bajiaoshan893.com/Public/img/gongzhonghao.jpg",
            success: function (res) {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: function (data) {
                  wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 2000
                  })
                },
                fail: function (err) {
                  if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                    wx.showToast({
                      title: '保存失败！请先设置保存权限',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                }
              })
            }
          })
        }
        if (val == 1) {
          wx.setClipboardData({
            data: "英语课代表史莱克",
            success: function (res) {
              wx.getClipboardData({
                success: function (res) {

                }
              })
            }
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  onLoad: function () {
    try {
      var userInfo = UserInfo.tryGetUserInfo()
      if (userInfo) {
        var avatarUrl = userInfo.avatarUrl
        var nickName = userInfo.nickName
      } else {
        var avatarUrl = ""
        var nickName = "游客"
      }
    } catch (e) {
      var avatarUrl = ""
      var nickName = "游客"
    }
    this.setData({
      avatarUrl: avatarUrl,
      nickName: nickName
    });
  },
  setUserInfo:function(){
    UserInfo.setUserInfo();
  }
});