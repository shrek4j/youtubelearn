//index.js
//获取应用实例
const app = getApp()
var audioContext = null
var learnMode = 1 //1 泛听  2 精听
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

var videoUrl = ""
var subtitleUrl = ""
var engTitle = ""
var cnTitle = ""
var explainAudioUrl = ""
var explainTextUrl = ""
var explainer = ""
var audioUrl = ""
var videoHint = ""
var vidx = 0

var currWord = ""
Page({
  onUnload: function (params) {
    playStatus = 0
    audioContext.pause();
  },
  onLoad: function (params) {
    vidx = decodeURIComponent(params.vidx)
    videoUrl = decodeURIComponent(params.videoUrl)
    subtitleUrl = decodeURIComponent(params.subtitleUrl)
    engTitle = decodeURIComponent(params.engTitle)
    cnTitle = decodeURIComponent(params.cnTitle)
    explainAudioUrl = decodeURIComponent(params.explainAudioUrl)
    explainTextUrl = decodeURIComponent(params.explainTextUrl)
    explainer = decodeURIComponent(params.explainer)
    audioUrl = decodeURIComponent(params.audioUrl)
    videoHint = decodeURIComponent(params.videoHint)

    wx.setNavigationBarTitle({ title: '泛听' });

    if(audioContext == null){
      audioContext = wx.createInnerAudioContext();
      audioContext.src = audioUrl;
      audioContext.obeyMuteSwitch = false;
    }
    
    var that = this;
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
          videoHint: videoHint
        });
        that.setCurrSubWds();
      },
      fail: function(res){
        console.log(res)
      }
    })
  },

  bindtimeupdate : function(){
    if(shouldUpdate == 0){
      return
    }
    var that = this;
    var currentTime = parseFloat(audioContext.currentTime)
    if (learnMode == 1){//泛听逻辑  持续播放
      if (progressPointer == 0 || (progressPointer > 0 && currentTime >= timeArr[progressPointer-1])) {//正常播放或前进
        //全部读取完毕
        if (progressPointer >= totalStep) {
          return
        }
        for (var i = progressPointer; i < timeArr.length; i++) {
          var thisTime = timeArr[i]
          var nextTime = timeArr[i + 1]
          if (currentTime < thisTime) {
            break
          } else if (currentTime >= thisTime && currentTime < nextTime) {
            progressPointer += 1
            var currSubLine = progressPointer - 1
            var showLine = currSubLine - 1 < 0 ? 0 : currSubLine - 1;
            that.setData({
              currSubLine: currSubLine,
              showLine: showLine,
              timePercent: audioContext.currentTime * 100 / audioContext.duration
            });
            break
          } else {
            progressPointer += 1
          }
        }
      } else {//向后退了
        for (var i = progressPointer; i >= 0; i--) {
          var thisTime = timeArr[i]
          var prevTime = timeArr[i - 1]
          if (currentTime < thisTime && currentTime >= prevTime) {
            progressPointer += 1
            var currSubLine = progressPointer - 1
            var showLine = currSubLine - 1 < 0 ? 0 : currSubLine - 1;
            //set sub
            that.setData({
              currSubLine: currSubLine,
              showLine: showLine,
              timePercent: audioContext.currentTime * 100 / audioContext.duration
            });
            break
          } else {
            progressPointer -= 1
          }
        }
      }
    }
  },
  onShareAppMessage: function () {
    var title = '油管学英语'
    var path = '/pages/vaudiopage/index'
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
  toDetailPage: function(e) {
    var that = this
    playStatus = 0
    var playBtn = "play"
    audioContext.pause();
    that.setData({
      playStatus: playStatus,
      playBtn: playBtn
    });
    wx.navigateTo({
      url: 'detailindex?videoUrl=' + videoUrl + "&subtitleUrl=" + subtitleUrl + "&engTitle=" + engTitle + "&cnTitle=" + cnTitle + "&audioUrl=" + audioUrl,
    })
  },
  toExplainPage:function(e){
    var that = this
    if (explainTextUrl == null || explainTextUrl == "null" || explainTextUrl == "" || explainAudioUrl == null || explainAudioUrl == "null" || explainAudioUrl == "") {
      wx.showToast({
        title: "努力制作中，请稍后再来... (๑•̀ㅂ•́)و",
        icon: 'none',
        duration: 5000
      })
    }else{
      playStatus = 0
      var playBtn = "play"
      audioContext.pause();
      that.setData({
        playStatus: playStatus,
        playBtn: playBtn
      });
      wx.navigateTo({
        url: 'explain?vidx=' + vidx + "&explainAudioUrl=" + explainAudioUrl + "&explainTextUrl=" + explainTextUrl + "&explainer=" + explainer,
      })
    }
  },
  changePlayStatus: function () {
    var that = this
    //set video
    var playBtn
    if (playStatus == 0) {
      playStatus = 1
      playBtn = "pause"
      audioContext.play();
      audioContext.onPlay((res)=> {
        audioContext.onTimeUpdate((res) => {
          that.bindtimeupdate()
        });
      });
    } else {
      playStatus = 0
      playBtn = "play"
      audioContext.pause();
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
      wds: wds
    });
  },
  showActions: function () {
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
  }
})
