// pages/point24/point24.js

require('../../utils/Binding.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    numArray: null,
    gameStatus: 0, // 0 未开始，1已开始，2结束
    preAnswer: '', //答案预处理
    answer: '' //答案发布
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  startGame() {
    let arr = []
    for(let i = 0; i < 4; i++) {
      let num = Math.floor(Math.random() * 13) + 1
      arr.push(num)
    }
    this.setData({
      numArray: arr,
      gameStatus: 1
    })
    wx.showLoading({
      title: '计算答案中',
    })
    let result = this.point24(...this.data.numArray)
    if (typeof result === 'string') {
      result = [result]
    }
    wx.hideLoading()
    this.setData({
      preAnswer: result[0]
    })
  },
  lookAtTheAnswer(again) {
    this.setData({
      answer: this.data.preAnswer,
      gameStatus: 2,
    })
  },
  point24 (num1, num2, num3, num4) {
    let nums = [num1, num2, num3, num4]
    let op = ['+', '-', '*', '/']

    let numsDou = [] // 四个数排列组合
    let opDou = [] // 三个运算符排列组合
    for (let i = 0; i < 4; i++) {
      let numArr1 = [nums[i]]
      let numArrLast1 = nums.concat()
      numArrLast1.splice(i, 1)
      for (let j = 0; j < 3; j++) {
        let numArr2 = numArr1.concat()
        numArr2.push(numArrLast1[j])
        let numArrLast2 = numArrLast1.concat()
        numArrLast2.splice(j, 1)
        for (let k = 0; k < 2; k++) {
          let numArr3 = numArr2.concat()
          numArr3.push(numArrLast2[k])
          let numArrLast3 = numArrLast2.concat()
          numArrLast3.splice(k, 1)
          numArr3.push(numArrLast3[0])
          numsDou.push(numArr3)
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      let opArr1 = [op[i]]
      for (let j = 0; j < 4; j++) {
        let opArr2 = opArr1.concat()
        opArr2.push(op[j])
        for (let k = 0; k < 4; k++) {
          let opArr3 = opArr2.concat()
          opArr3.push(op[k])
          opDou.push(opArr3)
        }
      }
    }
    let equations = []
    for (let i = 0, numLen = numsDou.length; i < numLen; i++) {
      for (let j = 0, opLen = opDou.length; j < opLen; j++) {
        let equ = numsDou[i].concat()
        let op = opDou[j]
        equ.splice(1, 0, op[0])
        equ.splice(3, 0, op[1])
        equ.splice(5, 0, op[2])
        equations.push(equ)
      }
    }

    let results = []
    for (let i = 0, len = equations.length; i < len; i++) {
      let result1 = equations[i].concat()
      for (let j = 0, len = result1.length; j < len; j++) {
        let result2 = result1.concat()
        result2.splice(j, 0, '(')
        for (let k = j + 4, len = result2.length; k <= len; k++) {
          let result3 = result2.concat()
          result3.splice(k, 0, ')')
          results.push(result3)
        }
      }
    }
    let re = /.*\(\d[\\+\-*\/]\d.*\d\).*/
    results = results.filter((item, i) => {
      return re.test(item.join(''))
    })

    for (let i = 0, len = results.length; i < len; i++) {
      let result1 = results[i].concat()
      for (let j = 0, len = result1.length; j < len; j++) {
        let result2 = result1.concat()
        result2.splice(j, 0, '(')
        for (let k = j + 4, len = result2.length; k <= len; k++) {
          let result3 = result2.concat()
          result3.splice(k, 0, ')')
          results.push(result3)
        }
      }
    }
    let re2 = /.*\(?.*\(?.*\)?.*\)?.*/

    results = results.filter((item, i) => {
      return re2.test(item.join(''))
    })
    results = equations.concat(results)
    let result = []

    results.forEach((item, i) => {
      let equ = item.join('')
      let sum = 0
      try {
        sum = wx.binding.eval(equ)
      }
      catch (e) {

      }
      if (sum === 24) {
        result.push(equ)
      } else {

      }
    })
    if (result.length > 0) {
      return [...new Set(result)]
    } else {
      return '没有组合'
    }
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
  
  }
})