var UserInfo = require('../userInfo/userInfo.js')

Page({
  onLoad: function(params){
    var wd = params.wd.toLowerCase()
    var sfz = UserInfo.tryGetSfz();
    //  if (currWord == wd) {
    //    return
    //  }
    //  currWord = wd
      var that = this
      wx.request({
        url: 'https://odin.bajiaoshan893.com/LearnWord/getWordInfoJson',
        data: {
          'userId': sfz,
          'word': wd
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var msg = res.data
          var dataObj = JSON.parse(msg);
          var showSens = 0
          if (dataObj.msg == 'noinfo') {
            that.setData({
              showExplain: 0
            });
          } else {
            // console.log(dataObj)
            var wordInfo = dataObj.wordInfo[0]
            var sens = dataObj.sens
            var roots = dataObj.roots
            var collectCount = dataObj.collectCount

            var trans = wordInfo.translation
            var tranArr = trans.split('<br/>')
            if (tranArr == null || tranArr == undefined || tranArr == '' || tranArr.length == 0) {
              //do nothing
            } else {
              tranArr = tranArr.slice(0, tranArr.length - 1)
              wordInfo['tranList'] = tranArr
            }
            if (roots.length > 0) {
              for (var j = 0; j < roots.length; j++) {
                if (roots[j].true_root == null) {
                  roots[j].true_root = roots[j].word_root
                }
              }
            }
            if(sens != null && sens.length > 1){
              showSens = 1
            }
            that.setData({
              wd: wd,
              wordInfo: wordInfo,
              sens: sens,
              roots: roots,
              showExplain: 1,
              showSens: showSens,
              collectCount: collectCount
            });
          }
        },
        fail: function (res) {
          console.log(res)
        }
      })
  },
  collectVideoWord : function(e){
    var wordId = e.target.dataset.wordid;
    var sfz = UserInfo.tryGetSfz();
    var that = this;
    wx.request({
      url: 'https://odin.bajiaoshan893.com/LearnWord/collectVideoWord',
      data: {
        'userId': sfz,
        'wordId': wordId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.showToast({
          title: '已收藏',
          duration: 1500
        })
        that.setData({
          collectCount: 1
        });
      }
    })
  },
  uncollectVideoWord: function (e) {
    var wordId = e.target.dataset.wordid;
    var sfz = UserInfo.tryGetSfz();
    var that = this;
    wx.request({
      url: 'https://odin.bajiaoshan893.com/LearnWord/uncollectVideoWord',
      data: {
        'userId': sfz,
        'wordId': wordId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.showToast({
          title: '已取消收藏',
          duration: 1500
        })
        that.setData({
          collectCount: 0
        });
      }
    })
  }

})