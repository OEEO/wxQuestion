//app.js
import config from 'utils/config.js'

App({
  data: {
    appid:'',
  },
  onLaunch: function () {
    let that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录

    wx.login({
      success: function (res) {
        if (res.code) {

          console.log('获取用户信息', res.code)
          wx.getUserInfo({
            success: function (res) {
              let userInfo = {};
              userInfo.avatarUrl = res.userInfo.avatarUrl;
              userInfo.nickName = res.userInfo.nickName;
              //console.log(objz);
              wx.setStorageSync('userInfo', userInfo);//存储userInfo
            }
          });

          that.ajax('wxlogin/manual', 'POST', { code: res.code }, res => {
            console.log('登录成功', res)
            wx.setStorage({
              key: "swordToken",
              data: res.token
            })
          })

        }
      }
    });


    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    // 获取转发回调信息
    // wx.getShareInfo({
    //   success (res) {
    //     console.log('分享进入')
    //   }
    // })
  },
  globalData: {
    userInfo: null,
    appid: 'wx45aa5038b3144f8f',
    secret: 'ae9956684aea0693838b51358cd03023'
  },
  ajax (path, method, data, fn) {
    let url = `https://${config.domain}/api/`
    console.log(url + path)
    if (method.toLowerCase() === 'post') {
      method = 'POST'
    } else {
      method = 'GET'
    }
    wx.request({
      url: url + path,
      method: method,
      data: data,
      header: {
        'content-type': "application/x-www-form-urlencoded; charset=utf-8"
      },
      success: function(res) {
        console.log(res)
        if(typeof fn === 'function') {
          fn(res)
        }
      },
      fail: function(err) {
        console.error(err)
      }
    })
  },
  socket (roomName) {
    wx.connectSocket({
      url: 'wss://www.wangchaozhen.com'
    })
  }
})