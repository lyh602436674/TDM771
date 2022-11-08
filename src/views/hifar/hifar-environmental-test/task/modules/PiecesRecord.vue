<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-29 16:14:21
 * @LastEditTime: 2021-11-26 11:56:18
 * @LastEditors: 马潭龙
 * @Description: 试品流转记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\PiecesRecord.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    :getContainer="getContainer"
    destroyOnClose
    :title="title"
    :visible="visible"
    @cancel="handleCancel"
  >
    <h-card fixed>
      <h-vex-table slot="content" :columns="columns" :data="loadData">
        <div slot="optType" slot-scope="text">
          {{ text | filterOptType(text) }}
        </div>
      </h-vex-table>
    </h-card>
    <div slot="footer">
      <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
    </div>
  </h-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import moment from 'moment'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      visible: false,
      title: '流转记录',
      model: {},
      columns: [
        {
          title: '操作类型',
          dataIndex: 'optType',
          scopedSlots: {
            customRender: 'optType',
          },
        },
        {
          title: '操作时间',
          dataIndex: 'optTime',
          customRender: (text) => {
            return text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作人',
          dataIndex: 'createUserName',
        },
      ],
      url: {
        list: '/HfEnvTaskTestRecordBusiness/listPage',
      },
    }
  },
  filters: {
    filterOptType(type) {
      switch (type) {
        case 'create':
          return '创建'
        case 'recover':
          return '撤销'
        case 'start':
          return '开始'
        case 'suspend':
          return '暂停'
        case 'forceEnd':
          return '强制结束'
        case 'finish':
          return '完成'
        case 'remove':
          return '删除'
        case 'forceEndApply':
          return '终止'
      }
    },
  },
  methods: {
    show(record = {}) {
      this.model = Object.assign({}, record)

      this.$nextTick(() => {
        this.visible = true
      })
    },
    loadData(params) {
      let data = {
        ...params,
        taskTestId: this.model.id,
      }
      return getAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style>
</style>