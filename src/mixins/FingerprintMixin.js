/**
 * @Author: 朱巍巍
 * @Date: 2023/7/10$ 18:10$
 * @LastEditTime: 2023/7/10$ 18:10$
 * @LastEditors: 朱巍巍
 * @Description: $
 * @FilePath: $
 */
export const FingerpinttMixin = {
  data() {
    return {
      ws: null,
      status: '',
      data: '',
      timer: null,
      srcBase64: ''
    }
  },
  methods: {
    init() {
      if ('WebSocket' in window) {
        this.connect('ws://127.0.0.1:21187/fps')
      } else {
        console.log('错误:浏览器不支持!')
      }
    },
    connect(host) {
      try {
        this.ws = new WebSocket(host)
        console.log('成功!')
      } catch (err) {
        console.log('错误!')
      }

      this.ws.onopen = function() {
        this.status = '就绪'
        // AboutImage();
      }
      var that = this
      this.ws.onmessage = function(evt) {
        var obj = eval('(' + evt.data + ')')
        switch (obj.workmsg) {
          case 1:
            that.status = '请打开或连接设备'
            break
          case 2:
            that.status = '请按手指...'
            break
          case 3:
            that.status = '请抬起手指...'
            break
          case 4:
            // this.status = "";
            break
          case 5:
            if (obj.retmsg == 1) {
              that.status = '采集指纹模板成功'
              if (obj.data1 == 'null') {
              } else {
                that.data = obj.data1
              }
            } else {
              that.status = '采集指纹模板失败'
            }
            break
          case 6:
            if (obj.retmsg == 1) {
              that.status = '登记指纹模板成功'
              if (obj.data1 == 'null') {
              } else {
                console.log('enroldata', obj.data1)
              }
            } else {
              that.status = '登记指纹模板失败'
            }
            break
          case 7:
            if (obj.image == 'null') {
            } else {
              that.srcBase64 = obj.image
            }
            break
          case 8:
            that.status = '超时'
            break
          case 9:
            that.status = '比对分数:' + obj.retmsg
            break
          case 10:
            if (obj.image == 'null') {
            } else {
            }
            break
          case 15:
            if (obj.retmsg == 1) {
              that.status = '重新连接设备成功'
            } else {
              that.status = '重新连接设备失败'
            }
            break
          case 18:
            if (obj.image == 'null') {
            } else {
              // img.src = 'data:image/jpeg;base64,' + obj.image
              console.log('18', obj.image)
              that.srcBase64 = obj.image
            }
            break
          case 19:
            that.status = obj.image
            break
          case 255:
            that.status = '设备忙'
            break
        }
      }
      this.ws.onclose = function() {
        console.log('错误:关闭连接!')
      }
    },
    relink() {
      this.ws.close()
      this.connect('ws://127.0.0.1:21187/fps')
    },

    enrollTemplate() {
      try {
        var v1 = '0' // 指纹颜色   0 红色,1 红色,2 绿色,3 蓝色
        var v2 = '0' // 背景颜色    1 透明,0 白色
        var cmd = '{"cmd":"enrol","data1":"' + v1 + '","data2":"' + v2 + '"}'
        this.ws.send(cmd)
      } catch (err) {
      }
      // document.getElementById('state').value = 'Place Finger'
      this.status = 'Place Finger'
    },
    getTemplate() {
      try {
        var v1 = '1' // 指纹颜色   0 红色,1 红色,2 绿色,3 蓝色
        var v2 = '0' // 背景颜色    1 透明,0 白色
        var cmd = '{"cmd":"capture","data1":"' + v1 + '","data2":"' + v2 + '"}'
        this.ws.send(cmd)
      } catch (err) {
      }
      this.status = 'Place Finger'
    },
    relinkDevice() {
      try {
        var cmd = '{"cmd":"opendevice","data1":"","data2":""}'
        this.ws.send(cmd)
      } catch (err) {
      }
    },
    getDeviceSN() {
      try {
        var cmd = '{"cmd":"getsn","data1":"","data2":""}'
        this.ws.send(cmd)
      } catch (err) {
      }
    },
    aboutImage() {
      try {
        var cmd = '{"cmd":"aboutimage","data1":"","data2":""}'
        this.ws.send(cmd)
      } catch (err) {
      }
    }
  }
}
