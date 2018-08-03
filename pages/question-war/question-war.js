
import utils from '../../utils/util.js'

let app = getApp()
// pages/question-war/question-war.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [],
    level: 1,
    levels: [1, 2, 3],
    isBegin: false,
    isCounting: false,
    isShowTitleNum: false,
    curIndex: '', // 当前题号
    clickIndex: '', //点击的选项
    result: [],
    move: 'in',
    numToCh: ['一', '二', '三', '四', '五'],
    isGameOver: false,
    correctNum: 0,
    room: '',
    player1: null,
    player2: null,
    curPlayerIndex: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      player1: app.globalData.userInfo
    })

    wx.showShareMenu({
      withShareTicket: true //显示当前页面的分享按钮
    })

    let room = options.room
    this.setData({
      room: room
    })
    this.enterSocketRoom(room)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function (options) {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // if (res.from === 'menu') {
    //   // 来自页面内转发按钮
    //   console.log(res.target)
    // }
    console.log('分享事件')
    return {
      title: `${app.globalData.userInfo.nickName}邀请你加入英语单词大战游戏`,
      path: `/pages/question-war/question-war?room=${this.data.room}`,
      imageUrl: '/images/1.jpg'
    }
  },

  startGame () {
    let that = this
    if(!this.data.player2) {
      wx.showToast({
        title: '请先邀请好友',
        icon: 'none'
      })
      return
    }
    app.ajax('question', 'GET', {level:that.data.level}, res => {
      this.setData({
        isBegin: true,
        questions: res.data.data,
        isShowTitleNum: true
      })
      let timer = setTimeout(() => {
        this.setData({
          isShowTitleNum: false,
          curIndex: 0,
          move: ''
        })
      }, 1200)
    })
  },

  selectOption (e) {
    let curPlayerIndex = this.data.curPlayerIndex
    
    let index = e.currentTarget.dataset.index
    let currectIndex = this.data.questions[this.data.curIndex].correctIndex
    let result = ''
    if (index === currectIndex) {
      result = true
      this.setData({
        correctNum: ++this.data.correctNum
      })
    } else {
      result = false
    }
    this.data.result.push(result)
    this.setData({
      result: this.data.result,
      clickIndex: index
    })
    console.log(this.data.result)
    // 移出
    let moveTimer = setTimeout(() => {
      this.setData({
        move: 'out',
        isCounting: true,
        clickIndex: ''
      })

      // 设置移进初始点
      let timer = setTimeout(() => {
        let i = ++this.data.curIndex
        if (i > this.data.questions.length - 1) {
          this.setData({
            isGameOver: true
          })
          return;
        }
        this.setData({
          curIndex: i,
          move: 'in',
          isShowTitleNum: true
        })

        // 移进
        let t = setTimeout(() => {
          this.setData({
            move: '',
            isShowTitleNum: false
          })
        }, 1200)

      }, 600)

    }, 1000)
  },

  enterSocketRoom(room) {
    let that = this
    if (!room) {
      return
    }

    let userData = app.globalData.userInfo
    let backToPage = encodeURIComponent(`/pages/question-war/question-war?room=${room}`)
    console.log('back', backToPage)
    if (!userData) {
      wx.navigateTo({
        url: `/pages/login/login?backToPage=${backToPage}`,
      })
      return
    }
    console.log('用户信息', userData)
    let sendData = {
      addUser: true,
      data: userData
    }
    wx.connectSocket({
      url: `wss://www.wangchaozhen.com/${room}`,
      success() {
        console.log('进入socket房间', room)
        wx.onSocketOpen(function (res) {


          wx.sendSocketMessage({
            data: JSON.stringify(sendData)
          })

          wx.onSocketMessage(function (res) {
            let data = JSON.parse(res.data)
            if (data.hasTwoPlayer) {
              data.data.some(player => {
                if (player.username !== username) {

                  that.setData({
                    player2: player
                  })

                  let curPlayerIndex = ''

                  if(player.userIndex === 1) {
                    curPlayerIndex = 2
                  } else {
                    curPlayerIndex = 1
                  }
                  that.setData({
                    curPlayerIndex: curPlayerIndex
                  })

                  console.log('可以开始游戏')
                  return true
                }
              })
            }
            console.log('收到服务器内容：' + res.data)
          })
        })
      }
    })
  }
})