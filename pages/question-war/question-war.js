let app = getApp()
// pages/question-war/question-war.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [],
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

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
  onUnload: function () {
  
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
  
  },

  getQuestions () {
    app.ajax('question', 'GET', {level:1}, res => {
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

  connectSocket () {
    app.socket()
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
    })
  }


})