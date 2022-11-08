/*
 * @Author: 赵峰
 * @Date: 2021-09-15 10:33:38
 * @LastEditTime: 2021-11-08 10:26:51
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\mixin.js
 */
export default {
    data() {
        return {
            messageError: '',
            messageErrorShow: false
        }
    },
    filters: {
      //委托单状态
      wtStatusFilter(status, type) {
        let s = Number(status)
        switch (s) {
          case 1:
            return '草稿';
          case 10:
            return '已提交';
          case 20:
            return '已通过';
          case 30:
            return '已驳回';
          case 40:
            return type === '1' ? '已完成' : '待出报告';
          case 50:
            return '已出报告';
          case 80:
            return '已终止';
          case 99:
            return '已删除';
        }
      },
      // 状态：1 未开始 10 已撤销 20 进行中 30 暂停 40 强制结束 50 已完成 99 已删除
      testStatusFilter(status) {
        let s = Number(status)
        switch (s) {
          case 1:
            return '未开始';
          case 10:
            return '已撤销';
          case 20:
            return '进行中';
                case 30:
                    return '暂停';
                case 40:
                    return '强制结束';
                case 50:
                    return '待出报告';
                case 60:
                    return '已出报告';
                case 99:
                    return '已删除';
            }
        },
        // 委托单状态color
        wtStatusColorFilter(status) {
            let s = Number(status)
            switch (s) {
                case 1:
                    return 'purple';
                case 10:
                    return 'orange';
                case 20:
                    return '#87d068';
                case 30:
                    return '#F50';
                case 40:
                    return '#2db7f5';
                case 50:
                    return 'cyan';
                case 80:
                    return '#F50';
                case 99:
                    return 'red';
            }
        },
        // 委托单状态color
        testStatusColorFilter(status) {
            let s = Number(status)
            switch (s) {
                case 1:
                    return 'purple';
                case 10:
                    return 'orange';
                case 20:
                    return '#87d068';
                case 30:
                    return '#F50';
                case 40:
                    return '#2db7f5';
                case 50:
                    return '#2db7f5';
                case 60:
                    return 'cyan';
                case 80:
                    return '#F50';
                case 99:
                    return 'red';
            }
        },
    },
    methods: {
        openNotificationWithIcon(type, title, desc) {
            this.$notification[type]({
                duration: 2,
                message: title,
                description: desc,
            })
        },
    }
}