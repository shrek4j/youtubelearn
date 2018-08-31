
var audioPointer = -1;
var mode = 0; //0 顺序  1 循环单首
var playStatus = 0;

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

    const backgroundAudioManager = wx.getBackgroundAudioManager();
    backgroundAudioManager.onEnded(() => {
      this.next();
    });
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
    wx.navigateTo({
      url: 'index?videoUrl=' + videoUrl + "&subtitleUrl=" + subtitleUrl + "&engTitle=" + engTitle + "&cnTitle=" + cnTitle,
    })
  },
  next: function(){
    if(mode == 0){
      audioSrcPointer++;
      if(audioSrcPointer >= that.data.contentList.length){
        audioSrcPointer = 0;
      }
      this.doNext(audioSrcPointer);
      backgroundAudioManager.play();
    }else if(mode == 1){
      const backgroundAudioManager = wx.getBackgroundAudioManager()
      backgroundAudioManager.pause();
      backgroundAudioManager.seek(0);
      backgroundAudioManager.play();
    }
  },
  doNext: function(vidx){
    var that = this
    const backgroundAudioManager = wx.getBackgroundAudioManager()

    backgroundAudioManager.title = that.data.contentList[vidx].eng_title
    backgroundAudioManager.singer = 'youtube'
    backgroundAudioManager.src = that.data.contentList[vidx].audio_url // 设置了 src 之后会自动播放
    that.setData({
      playStatus: playStatus,
      audioPointer: audioPointer
    });
  },
  pauseAudio: function(e){
    var that = this;
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    backgroundAudioManager.pause();
    playStatus = 0;
    that.setData({
      playStatus: playStatus,
      audioPointer: audioPointer
    });
  },
  playAudio: function(e){
    var vidx = e.target.dataset.vidx;
    var that = this;
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    if(vidx == audioPointer){
      backgroundAudioManager.play();
    }else{
      audioPointer = vidx
      backgroundAudioManager.title = that.data.contentList[vidx].eng_title
      backgroundAudioManager.singer = 'youtube'
      backgroundAudioManager.src = that.data.contentList[vidx].audio_url // 设置了 src 之后会自动播放
    }
    playStatus = 1;
    that.setData({
      playStatus: playStatus,
      audioPointer: audioPointer
    });
  },
  changeMode: function(e){
    if(mode == 0){
      mode = 1;
    }else if(mode == 1){
      mode = 0;
    }
  }
})