/*
 * @Author: 赵峰
 * @Date: 2021-09-08 17:48:53
 * @LastEditTime: 2021-11-08 11:06:39
 * @LastEditors: Please set LastEditors
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\reports\mixin.js
 */
export default {
  data() {
    return {
      messageError: '',
      messageErrorShow: false
    }
  },
  filters: {
    // mes报告推送状态
    mesPushStatusFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return '未知';
        case 2:
          return '成功';
        case 3:
          return '失败';
        default:
          return '未知';
      }
    },
    // 报告状态
    reportStatusFilter(status) {
      let s = Number(status)
      switch (s) {
        case 3:
          return '草稿';
        case 10:
          return '待审核';
        case 20:
          return '待批准';
        case 30:
          return '审核驳回';
        case 40:
          return '复核通过';
        case 50:
          return '批准驳回';
        case 60:
          return '修改审批';
        case 70:
          return '修改审批通过';
        case 80:
          return '修改复核驳回';
        case 99:
          return '已删除';
      }
    },
    /**
     * mes推送报告状态
     * @param status
     */
    mesPushStatusColorFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return '#4C4E50';
        case 2:
          return 'green';
        case 3:
          return 'red';
        default:
          return '#4C4E50';
      }
    },
    reportStatusColorFilter(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return 'purple';
        case 2:
          return 'volcano';
        case 3:
          return '#108ee9';
        case 10:
          return 'gold';
        case 20:
          return 'green';
        case 30:
          return 'red';
        case 40:
          return 'cyan';
        case 50:
          return 'red';
        case 60:
          return 'geekblue';
        case 70:
          return '#67A78F';
        case 80:
          return 'red';
        case 99:
          return 'red';
      }
    },
    // 报告流转状态
    reportFlowStatusFilter(status) {
      let s = Number(status)
      switch (s) {
        case 3:
          return '草稿';
        case 10:
          return '待审批';
        case 20:
          return '待批准';
        case 30:
          return '审核驳回';
        case 40:
          return '复核通过';
        case 50:
          return '批准驳回';
        case 60:
          return '修改审批';
        case 70:
          return '修改审批通过';
        case 80:
          return '修改复核驳回';
        case 99:
          return '已删除';
      }
    },
    // 报告操作类型
    reportOptFilter(txt) {
      switch (txt) {
        case 'create':
          return '创建';
        case 'receive':
          return '发放';
        case 'save':
          return '保存';
        case 'submit':
          return '草稿';
        case 'approvePass':
          return '复核通过';
        case 'approveReject':
          return '批准驳回';
        case 'examinePass':
          return '审核通过';
        case 'examineNotPass':
          return '审核驳回';
        case 'examineReject':
          return '审核驳回';
        case 'amendApply':
          return '申请修改';
        case 'amendPass':
          return '修改审批通过';
        case 'amendReject':
          return '修改复核驳回';
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
    },
    reportStatusColorFilterMethods(status) {
      let s = Number(status)
      switch (s) {
        case 1:
          return 'purple';
        case 2:
          return 'volcano';
        case 3:
          return '#108ee9';
        case 10:
          return 'gold';
        case 20:
          return 'green';
        case 30:
          return 'red';
        case 40:
          return 'cyan';
        case 50:
          return 'red';
        case 60:
          return 'geekblue';
        case 99:
          return 'red';
      }
    },
    reportStatusFilterMethods(status) {
      let s = Number(status)
      switch (s) {
        case 3:
          return '草稿';
        case 10:
          return '待审核';
        case 20:
          return '待批准';
        case 30:
          return '审核驳回';
        case 40:
          return '复核通过';
        case 50:
          return '批准驳回';
        case 99:
          return '已删除';
      }
    }
  }
}
