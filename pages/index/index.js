//index.js
//获取应用实例
import config from '../../utils/config.js'
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  onLoad: function () {
    console.log(config.domain)
    console.log('用户信息', app.globalData.userInfo)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      wx.redirectTo({
        url: '/pages/login/login',
      })
    }
  },
  onUnload: function () {
    console.log('页面卸载')
  },
  onHide() {
    console.log('页面隐藏')
  },
  onShow() {
    console.log('页面show')
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  goToArticles () {
    wx.navigateTo({
      url: '/pages/articles/articles',
    }) 
  },
  goToQuestionWar () {
    app.ajax('socket/createRoom', 'GET', '', res => {
      let room = res.data.socket
      wx.navigateTo({
        url: `/pages/question-war/question-war?room=${room}`,
      })
    })
  },
  goToPoint24 () {
    wx.navigateTo({
      url: '/pages/point24/point24',
    })
  }
})
