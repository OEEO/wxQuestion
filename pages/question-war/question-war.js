
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
    clickIndex: [], //两个人点击的选项
    curClick: '', //当前玩家点击的选项
    results: [],
    move: 'in',
    numToCh: ['一', '二', '三', '四', '五'],
    isGameOver: false,
    selectArr: [[],[]],
    room: '',
    player1: null,
    player2: null,
    curPlayerIndex: '',
    otherPlayerIndex: '',
    gameStatus: 0, //游戏当前状态 0 未开始，1 可以答题， 2 两位玩家已答题，
    correctCount: [0, 0],
    win: '',
    userIndex: 1, // 测试用,
    hasBeenClick: false, 
    isTest: false, // 当前是否测试模式
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
    wx.closeSocket()
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
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
   * 用户点击右上角分享，邀请好友
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
  goToIndex () {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  startGame () {
    let that = this
    if(!this.data.player2) {
      wx.showToast({
        title: '点击右边的图标邀请好友',
        icon: 'none'
      })
      return
    }
    
    let sendData = {
      startGame: true,
      gameStatus: 1
    }
    wx.sendSocketMessage({
      data: JSON.stringify(sendData)
    })
  },

  selectOption (e) {
    let that = this

    if(!this.data.isTest) {
      if (this.data.hasBeenClick) {
        return
      }
    }

    this.setData({
      hasBeenClick: true
    }) 

    let room = this.data.room

    let index = e.currentTarget.dataset.index //当前点击的选项
    let correctIndex = this.data.questions[this.data.curIndex].correctIndex
    let result = ''
    if (index === correctIndex) {
      result = true
    } else {
      result = false
    }

    console.log(this.data.clickIndex)
    let userIndex = ''

    // 测试，第2次次点击时改变玩家下标
    if( this.data.isTest ) {
      userIndex = this.data.userIndex === 0 ? 1 : 0
      this.setData({
        userIndex: userIndex
      })
    } else {
      // 正式
      userIndex = this.data.curPlayerIndex
    }

    this.data.clickIndex[userIndex] = {
      result: result,
      index: index
    }
    this.setData({
      curClick: index,
      clickIndex: this.data.clickIndex
    })

    let sendData = {
      answer: true,
      data: {
        userIndex: userIndex, 
        curAns: {
          index: index,
          result: result,
          curTitleNum: that.data.curIndex + 1
        }
      }
    }

    console.log('发送的答案', sendData)
    wx.sendSocketMessage({
      data: JSON.stringify(sendData)
    })

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
      wx.redirectTo({
        url: `/pages/login/login?backToPage=${backToPage}`,
      })
      return
    }
    let sendData = {
      addUser: true,
      isTest: that.data.isTest, //测试自动添加2人
      data: userData
    }
    wx.connectSocket({
      url: `wss://www.wangchaozhen.com/${room}`,
      success() {
        console.log('进入socket房间', room)
        wx.onSocketOpen(function (res) {
  
          wx.onSocketMessage(function (res) {
            let data = JSON.parse(res.data)
            // 房间内已有两位玩家
            if (data.hasTwoPlayer) {
              data.data.some(player => {
                if (player.avatarUrl !== userData.avatarUrl) {

                  that.setData({
                    player2: player
                  })

                  let curPlayerIndex = -1

                  if(player.userIndex === 0) {
                    curPlayerIndex = 1
                  } else {
                    curPlayerIndex = 0
                  }
                  that.setData({
                    curPlayerIndex: curPlayerIndex,
                    otherPlayerIndex: curPlayerIndex === 0 ? 1 : 0
                  })
                  console.log('otherIndex', that.data.otherPlayerIndex)
                  return true
                }
              })
            }
            // 点击开始游戏
            if (data.startGame) {
              app.ajax('question', 'GET', { level: that.data.level }, res => {
                console.log('问题json', res.data.data)
                that.setData({
                  isBegin: true,
                  questions: res.data.data,
                  isShowTitleNum: true
                })
                let timer = setTimeout(() => {
                  that.setData({
                    isShowTitleNum: false,
                    curIndex: 0,
                    move: ''
                  })
                }, 1200)
              })
            }
            // 两位玩家都已回答
            if (data.twoPlayerAns) {
              data = data.players
              console.log('两位玩家已回答', data)
              let result = []
              let ans0 = data[0].answers
              let ans1 = data[1].answers
              let arr = []
              if(that.data.curPlayerIndex === 0) {
                arr[0] = ans0[ans0.length - 1]
                arr[1] = ans1[ans1.length - 1]
              } else {
                arr[1] = ans0[ans0.length - 1]
                arr[0] = ans1[ans1.length - 1]
              }
              that.data.clickIndex[that.data.otherPlayerIndex] = arr[1]
              that.setData({
                clickIndex: that.data.clickIndex,
                hasBeenClick: false
              })
              console.log('clickIndex', that.data.clickIndex)
              that.data.results.push(arr)
              that.setData({
                results: that.data.results,
                gameStatus: 2
              })
              console.log('答案数组', that.data.results)
              // 移出
              let moveTimer = setTimeout(() => {
                that.setData({
                  move: 'out',
                  isCounting: true,
                  clickIndex: [],
                  curClick: '',
                  gameStatus: 1
                })

                // 设置移进初始点
                let timer = setTimeout(() => {
                  let i = ++that.data.curIndex
                  if (i > that.data.questions.length - 1) {
                    let curPlayerIndex = that.data.curPlayerIndex
                    let otherPlayerIndex = that.data.otherPlayerIndex
                    that.data.results.forEach((item) => {
                      that.data.selectArr[curPlayerIndex].push(item[curPlayerIndex].result)
                      that.data.selectArr[otherPlayerIndex].push(item[otherPlayerIndex].result)

                      if (item[curPlayerIndex].result) {
                        that.data.correctCount[curPlayerIndex]++
                      }
                      if (item[otherPlayerIndex].result) {
                        that.data.correctCount[otherPlayerIndex]++
                      }
                    })

                    let win = ''
                    let curP = that.data.correctCount[curPlayerIndex]
                    let othP = that.data.correctCount[otherPlayerIndex]
                    if (curP > othP) {
                      win = '你赢了'
                    } else if (curP < othP) {
                      win = '你输了'
                    } else {
                      win = '打成平局'
                    }

                    that.setData({
                      isGameOver: true,
                      selectArr: that.data.selectArr,
                      correctCount: that.data.correctCount,
                      win: win
                    })
                    console.log(that.data.selectArr)
                    return;
                  }
                  that.setData({
                    curIndex: i,
                    move: 'in',
                    isShowTitleNum: true
                  })

                  // 移进
                  let t = setTimeout(() => {
                    that.setData({
                      move: '',
                      isShowTitleNum: false
                    })
                  }, 1200)

                }, 600)

              }, 1500)
            }
            console.log('收到服务器内容：' + res.data)
          })

          wx.sendSocketMessage({
            data: JSON.stringify(sendData)
          })
        })
      }
    })
  }
})