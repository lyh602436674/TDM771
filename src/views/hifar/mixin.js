/*
 * @Author: 赵峰
 * @Date: 2021-08-18 17:40:19
 * @LastEditTime: 2021-11-25 09:55:48
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\mixin.js
 */
import {ACCESS_TOKEN, TENANT_ID} from '@/store/mutation-types'

export default {
  data() {
    return {
      messageError: '',
      messageErrorShow: false
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    tokenHeader() {
      let head = {'token': this.$ls.get(ACCESS_TOKEN)}
      let tenantid = this.$ls.get(TENANT_ID)
      if (tenantid) {
        head['tenant_id'] = tenantid
      }
      return head
    }
  },
  filters: {
    // 意见处理方式
    dealStatusFilter(status) {
      let s = parseInt(status)
      switch (s) {
        case 1:
          return '未处理'
        case 2:
          return '已处理'
        case 3:
          return '已关闭'
      }
    },
    // 意见处理方式 color
    dealStatusColorFilter(status) {
      let s = parseInt(status)
      switch (s) {
        case 1:
          return 'red'
        case 2:
          return '#2db7f5'
        case 3:
          return ''
      }
    },
    // 试品处理方式
    pieceHandleFilter(status) {
      let s = parseInt(status)
      switch (s) {
        case 1:
          return '委托方取回'
        case 2:
          return '销毁'
      }
    },
    // 密级
    secretFilter(status) {
      let s = parseInt(status)
      switch (s) {
        case 1:
          return '一般'
        case 2:
          return '秘密'
        case 3:
          return '机密'
        case 4:
          return '绝密'
      }
    },
    // 优先级
    priorityFilter(status) {
      let s = parseInt(status)
      switch (s) {
        case 100:
          return '一般'
        case 500:
          return '重要'
        case 1000:
          return '紧急'
      }
    },
    //设备台账状态
    deviceStatusFilter(status) {
      let s = parseInt(status)
      switch (s) {
        case 1:
          return '在用'
        case 2:
          return '停用'
        case 3:
          return '封存'
        case 4:
          return '报废'
        case 5:
          return '故障'
        case 6:
          return '计量'
        default:
          return '--'
      }
    },
    //人员性别
    sexFilter(status) {
      let s = Number(status)
      switch (s) {
        case 0:
          return '保密'
        case 1:
          return '男'
        case 2:
          return '女'
      }
    },
    //人员在职状态
    positionStatusFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return '在职'
        case 2:
          return '离职'
      }
    },
    // 委托单优先级color
    priorityColorFilter(status) {
      let s = Number(status)
      switch (s) {
        case 100:
          return 'green'
        case 500:
          return 'red'
        case 1000:
          return '#F50'
      }
    },
    // 委托单类型
    entrustTypeFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return '内部'
        case 2:
          return '外部'
        default:
          return '--'
      }
    },
    //委托单状态
    wtStatusFilter(status,type) {
      let s = Number(status)
      switch (s) {
        case 1:
          return '草稿'
        case 10:
          return '已提交'
        case 20:
          return '已通过'
        case 30:
          return '已驳回'
        case 40:
          return type === '1' ? '已完成' : '待出报告';
        case 50:
          return '已出报告'
        case 80:
          return '已终止'
        case 99:
          return '已删除'
      }
    },
    // 委托单状态color
    wtStatusColorFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return 'purple'
        case 10:
          return 'orange'
        case 20:
          return '#87d068'
        case 30:
          return '#F50'
        case 40:
          return '#2db7f5'
        case 50:
          return 'cyan'
        case 80:
          return '#F50'
        case 99:
          return 'red'
      }
    },
    //委托单进度
    wtScheduleFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return '委托创建'
        case 10:
          return '调度审核'
        case 20:
          return '试品接收'
        case 30:
          return '试品检测'
        case 40:
          return '报告编制'
        case 50:
          return '委托结束'

      }
    },
    // 委托单进度color
    wtScheduleColorFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return 'purple'
        case 10:
          return 'orange'
        case 20:
          return 'green'
        case 30:
          return 'orange'
        case 40:
          return 'blue'
        case 50:
          return 'cyan'
      }
    },
    //任务状态
    taskStatusFilter(status, type) {
      let s = Number(status)
      switch (s) {
        case 1:
          return type == 1 ? '待接收' : '待分配'
        case 10:
          return '进行中'
        case 20:
          return '已提交'
        case 30:
          return '复核通过'
        case 40:
          return '复核驳回'
        case 50:
          return '审核通过'
        case 60:
          return '审核驳回'
        case 70:
          return '已终止'
        case 99:
          return '已删除'
      }
    },
    taskStatusColorFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return 'cyan'
        case 10:
          return 'orange'
        case 20:
          return '#87d068'
        case 30:
          return '#2db7f5'
        case 40:
          return 'red'
        case 50:
          return '#2db7f5'
        case 60:
          return '#F50'
        case 70:
          return 'black'
        case 99:
          return 'red'
      }
    },
    // 任务操作类型
    taskOptFilter(txt) {
      switch (txt) {
        case 'create':
          return '创建'
        case 'receive':
          return '接收'
        case 'cancelReceive':
          return '取消接收'
        case 'distribute':
          return '指派'
        case 'revoke':
          return '撤销指派'
        case 'transfer':
          return '转派'
        case 'save':
          return '保存'
        case 'submit':
          return '提交'
        case 'checkPass':
          return '复核通过'
        case 'checkNotPass':
          return '复核驳回'
        case 'examinePass':
          return '审核通过'
        case 'examineNotPass':
          return '审核驳回'
        case 'destroy':
          return '已作废'
        case 'stop':
          return '已终止'
      }
    }
  },
  methods: {
    openNotificationWithIcon(type, title, desc) {
      this.$notification[type]({
        duration: 2,
        message: title,
        description: desc
      })
    }
  }
}