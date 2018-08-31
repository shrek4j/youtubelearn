//index.js
//获取应用实例
const app = getApp()
var videoContext = null
var learnMode = 2 //1 泛听  2 精听
var timeArr = []
var subArr = [] 

var totalStep = -1
var progressPointer = 0 //泛听计数器

var progressPointer2 = 0 //精听计数器
var playStatus = 0 // 0 暂停  1 播放  用于精听
var shouldUpdate = 1

var playRatePointer = 1
var rates = [0.5,1.0,1.25]
var ratesStr = ["0.5X", "1.0X"]

var currWord = ""
Page({
  onLoad: function (params) {
    var videoUrl = decodeURIComponent(params.videoUrl);
    var subtitleUrl = decodeURIComponent(params.subtitleUrl);
    var engTitle = decodeURIComponent(params.engTitle);
    var cnTitle = decodeURIComponent(params.cnTitle);
    wx.setNavigationBarTitle({ title: '精读' });
    var that = this;
    timeArr = [];
    subArr = [];
    totalStep = -1;
    wx.request({
      url: subtitleUrl,
      header: {
        'content-type': 'application/x-subrip' // 默认值
      },
      success: function (res) {
     //   console.log(res.data)
        var text = res.data
        var lines = text.split('\n')
        for(var i=0;i<lines.length;i++){
          if(lines[i].indexOf('||||') < 0){
            continue;
          }
          var timeAndSub = lines[i].split('||||')
          totalStep += 1;
          timeArr[totalStep] = timeAndSub[0]
          subArr[totalStep] = timeAndSub[1]
        }
        that.setData({
          engTitle: engTitle,
          videoUrl: videoUrl,
          subArr: subArr,
          learnMode: learnMode,
          currSub: subArr[0],
          playStatus: playStatus,
          playBtn:"pause",
          playRate: ratesStr[playRatePointer],
          currCount: progressPointer2 + 1
        });
        that.setCurrSubWds();
      },
      fail: function(res){
        console.log(res)
      }
    })
  },
  onReady: function (res) {
    videoContext = wx.createVideoContext('myVideo')
  },
  bindtimeupdate : function(e){
    if(shouldUpdate == 0){
      return
    }
    var that = this;
    var currentTime = parseFloat(e.detail.currentTime)
    if (learnMode == 2){//精听逻辑   循环单句播放
      if (progressPointer2 == 0 || currentTime + 5 >= timeArr[progressPointer2]) {//正常播放或前进
        if (progressPointer2 < timeArr.length - 1 && currentTime >= timeArr[progressPointer2 + 1]) {
          if (currentTime < parseFloat(timeArr[progressPointer2 + 1]) + 5) {//正常单句循环
            videoContext.seek(timeArr[progressPointer2]);
          } else {//跳转到视频当前句
            for (var i = progressPointer2; i < timeArr.length; i++) {
              var thisTime = timeArr[i]
              var nextTime = timeArr[i + 1]
              if (currentTime >= thisTime && currentTime < nextTime) {
                //set sub
                that.setCurrSubWds();
                break
              } else {
                progressPointer2 += 1
              }
            }
          }
        }
      }else{//向后退了
        for (var i = progressPointer2; i >= 0; i--) {
          var thisTime = timeArr[i]
          var prevTime = timeArr[i - 1]
          if (currentTime < thisTime && currentTime >= prevTime) {
            //set sub
            that.setCurrSubWds();
            break
          } else {
            progressPointer2 -= 1
          }
        }
      }
    }
  },
  longTap : function(e){
    videoContext.pause();
    wx.navigateTo({
      url: 'sentence?sen=' + subArr[e.target.dataset.index]
    })
    
  },
  onShareAppMessage: function () {
    var title = '油管学英语'
    var path = '/pages/videopage/index'
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
  changeLearnMode : function(){
    var that = this
    if(learnMode == 1){
      learnMode = 2
      videoContext.pause();
      videoContext.seek(timeArr[progressPointer2]);
    }else{
      learnMode = 1
      videoContext.pause();
      videoContext.seek(timeArr[progressPointer]);
    }
    that.setData({
      learnMode:learnMode
    });
  },
  goto : function (e){
    shouldUpdate = 0
    videoContext.pause();
    var that = this
    var step = e.target.dataset.step
    if(progressPointer2 == 0 && step < 0){
      shouldUpdate = 1
      return
    }
    progressPointer2 = progressPointer2 + parseInt(step)
    //set video
    videoContext.seek(timeArr[progressPointer2]);
    playStatus = 1
    //set sub
    that.setCurrSubWds();
    videoContext.play();
    shouldUpdate = 1
  },
  changePlayStatus : function (){
    var that = this
    //set video
    var playBtn
    if (playStatus == 0){
      playStatus = 1
      playBtn = "pause"
      videoContext.play();
    }else{
      playStatus = 0
      playBtn = "play"
      videoContext.pause();
    }
    //set status
    that.setData({
      playStatus: playStatus,
      playBtn: playBtn
    });
  },
  /**
   * 分割句子中的单词
   */
  splitSen:function(sen){
    var wds = []
    var wd = ""
    var flag = true
    for (var i = 0; i < sen.length; i++) {
      if (sen[i].match(/[a-zA-Z0-9']/)){
        if(!flag){
          flag = true
          wds.push(wd)
          wd = ""
        }
        wd += sen[i]
      }else{
        if(flag){
          flag = false
          wds.push(wd)
          wd = ""
        }
        wd += sen[i]
      }
    }
    if(wd != ""){
      wds.push(wd)
    }
    return wds
  },
  setCurrSubWds : function(){
    var that = this
    var currSen = subArr[progressPointer2]
    var wds = this.splitSen(currSen)
    
    that.setData({
      currSen: currSen,
      wds: wds,
      currCount: progressPointer2 + 1
    });
  },
  bindplay:function(){
    var that = this
    //set video
    playStatus = 1
    var playBtn = "pause"
    
    //set status
    that.setData({
      playStatus: playStatus,
      playBtn: playBtn
    });
  },
  bindpause: function () {
    var that = this
    //set video
    playStatus = 0
    var playBtn = "play"

    //set status
    that.setData({
      playStatus: playStatus,
      playBtn: playBtn
    });
  },
  changePlayRate : function(){
    var that = this
    playRatePointer += 1
    if (playRatePointer == rates.length){
      playRatePointer = 0
    }
    videoContext.playbackRate(rates[playRatePointer]);
    that.setData({
      playRate: ratesStr[playRatePointer]
    })
  },
  showWordExplain: function(e){
    var wd = e.target.dataset.wd
    if(!wd.match(/[a-zA-Z0-9']/)){
      return
    }
    videoContext.pause();
    wx.navigateTo({
      url: 'word?wd=' + wd
    })
  }
})
