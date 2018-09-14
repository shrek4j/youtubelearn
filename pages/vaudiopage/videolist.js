
Page({
  data: {
    pageNo: 0,
    pageSize: 10,
    hasMoreData: true,
    contentList: []
  },
  getVideoList:function(){
    var that = this;
    wx.request({
      url: 'https://odin.bajiaoshan893.com/Video/getVideoListPaging',
      data: {
        "pageNo": that.data.pageNo,
        'pageSize': that.data.pageSize
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var dataObj = JSON.parse(res.data)
        var videoList = dataObj.videoList

        if (videoList == null || videoList == undefined || videoList.length == 0){
          that.data.hasMoreData = false
        }else{
          that.data.pageNo += 1
          that.data.contentList = that.data.contentList.concat(videoList) 
        }
        that.setData({
          contentList: that.data.contentList
        });
        
      }
    })
  },
  onReachBottom: function () {
    if (that.data.hasMoreData) {
      this.getWordList()
    } else {
      wx.showToast({
        title: '已经到底了',
      })
    }
  },
  onLoad: function () {
    this.getVideoList();
  },
  onShareAppMessage: function () {
    var title = '油管学英语'
    var path = '/pages/videopage/videolist'
    return {
      title: title,
      path: path,
      success: function (res) {
        wx.showToast({
          title: '转发成功！',
          icon: 'success',
          duration: 1500
        })
      },
      fail: function (res) {
        wx.showToast({
          title: '转发失败，请稍后再试',
          duration: 1500
        })
      }
    }
  },
  showVideoPage: function(e){
    var that = this
    var index = e.target.dataset.vidx
    var videoUrl = encodeURIComponent(that.data.contentList[index]['video_url'])
    var subtitleUrl = encodeURIComponent(that.data.contentList[index]['subtitle_url'])
    var engTitle = encodeURIComponent(that.data.contentList[index]['eng_title'])
    var cnTitle = encodeURIComponent(that.data.contentList[index]['cn_title'])
    var explainAudioUrl = encodeURIComponent(that.data.contentList[index]['explain_audio_url'])
    var explainTextUrl = encodeURIComponent(that.data.contentList[index]['explain_text_url'])
    var explainer = encodeURIComponent(that.data.contentList[index]['explainer'])
    var audioUrl = encodeURIComponent(that.data.contentList[index]['audio_url'])
    wx.navigateTo({
      url: 'index?videoUrl=' + videoUrl + "&subtitleUrl=" + subtitleUrl + "&engTitle=" + engTitle + "&cnTitle=" + cnTitle + "&vidx=" + index + "&explainAudioUrl=" + explainAudioUrl + "&explainTextUrl=" + explainTextUrl + "&explainer=" + explainer + "&audioUrl=" + audioUrl,
    })
  }
})