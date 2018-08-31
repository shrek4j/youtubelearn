var UserInfo = require('../userInfo/userInfo.js')

var totalCount = 0;

Page({
  data: {
    pageNo: 0,
    start: 0,
    pageSize: 5,
    hasMoreData: true,
    contentList: []
  },
  showworddetail: function (e) {
    var word = e.target.dataset.word
    wx.navigateTo({
      url: '../videopage/word?wd=' + word
    });
  },
  onLoad: function (options) {
    this.getCollectWords();
  },
  getCollectWords: function () {
    var that = this;
    var sfz = UserInfo.tryGetSfz();
    wx.request({
      url: 'https://odin.bajiaoshan893.com/LearnWord/showVideoWordCollectsByUserPaging',
      data: {
        'userId': sfz,
        'start': that.data.start,
        'pageSize': that.data.pageSize
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var msg = res.data
        if (msg == 'noresult') {
          return;
        }
        var dataObj = JSON.parse(msg);
        if (dataObj.totalCount != null && dataObj.totalCount != undefined) {
          totalCount = dataObj.totalCount;
        }
        var collects = dataObj.collects;
        if (collects == null || collects == undefined || collects.length == 0) {
          that.data.hasMoreData = false
          var title = '已经到底了'
          if (that.data.start == 0) {
            title = '暂无收藏'
          }
          wx.showToast({
            title: title,
          })
          that.setData({
            group: group,
            totalCount: totalCount
          });
        } else {

          //判断是否到底的逻辑
          if (collects.length < that.data.pageSize) {
            that.data.hasMoreData = false
          }

          var num = 1;
          for (var i = 0; i < collects.length; i++) {
            collects[i]['num'] = num + that.data.pageNo * that.data.pageSize;
            num++;
          }
          that.data.contentList = that.data.contentList.concat(collects)
          that.setData({
            contentList: that.data.contentList,
            totalCount: totalCount
          });

          that.data.start += that.data.pageSize;
          that.data.pageNo += 1;
        }

      }
    });
  },
})
