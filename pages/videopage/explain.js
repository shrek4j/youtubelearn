


Page({
  onLoad: function(params){
    wx.setNavigationBarTitle({ title: '讲解' });
    var vidx = params.vidx;
    var explainAudioUrl = decodeURIComponent(params.explainAudioUrl)
    var explainTextUrl = decodeURIComponent(params.explainTextUrl)
    var explainer = decodeURIComponent(params.explainer)
    var that = this
    if (explainTextUrl == null || explainTextUrl == "null" || explainAudioUrl == null || explainAudioUrl == "null"){
      that.setData({
        isExplained : 0
      });
    }else{
      wx.request({
        url: explainTextUrl,
        header: {
          'content-type': 'application/x-subrip' // 默认值
        },
        success: function (res) {
          var text = res.data
          var lines = text.split('\n')
          that.setData({
            lines: lines,
            explainAudioUrl: explainAudioUrl,
            explainer: explainer
          });
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }
    

  },

})