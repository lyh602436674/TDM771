<!--
 * @Author: 赵峰
 * @Date: 2021-08-17 17:13:43
 * @LastEditTime: 2021-09-29 13:52:42
 * @LastEditors: 赵峰
 * @Descripttion: 试品流转记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\sample\modules\SampleCirculationTable.vue
-->
<template>
  <h-modal
    title="试品流转记录"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-card fixed>
      <h-vex-table slot="content" ref="sampleCirculationTable" :columns="columns" :data="loadData">
        <div slot="optType" slot-scope="text, record">
          {{ filterType(record.optType) }}
        </div>
        <a-tooltip slot="optContent" slot-scope="text, record" placement="topLeft" arrow-point-at-center>
          <div slot="title">
            <div>{{ filterType(record.optType) }}数量：{{ record.optNum ? record.optNum : '0' }}</div>
            <div>{{ filterType(record.optType) }}人：{{ record.optUserName ? record.optUserName : '--' }}</div>
          </div>
          {{ record.optNum ? record.optNum : '0' }} / {{ record.optUserName ? record.optUserName : '--' }}
        </a-tooltip>
        <div slot="optNum" slot-scope="text, record">
          <span :style="record.optNum > 0 ? 'color:red' : 'color:green'">{{ record.optNum ? record.optNum : 0 }}</span>
        </div>
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: ['pieceId'],
  data() {
    return {
      moment,
      visible: false,
      queryParams: {},
      url: {
        list: '/HfEnvPieceRecordBusiness/listPage',
      },
      columns: [
        {
          title: '操作时间',
          dataIndex: 'optTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作人',
          dataIndex: 'optUserName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'optType',
          scopedSlots: { customRender: 'optType' },
        },
        {
          title: '数量/人',
          dataIndex: 'optContent',
          scopedSlots: { customRender: 'optContent' },
        },
        {
          title: '操作前库存',
          dataIndex: 'beforeNum',
          customRender: (text) => {
            return text || 0
          },
        },
        {
          title: '库存变更',
          dataIndex: 'optNum',
          scopedSlots: { customRender: 'optNum' },
        },
        {
          title: '操作后库存',
          dataIndex: 'afterNum',
          customRender: (text) => {
            return text || 0
          },
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          customRender: (text) => {
            return text || '--'
          },
        },
      ],
    }
  },
  methods: {
    handleCancel() {
      this.visible = false
    },
    filterType(type) {
      let typeName = null
      if (type == 'rec') {
        typeName = '接收'
      } else if (type == 'use') {
        typeName = '领用'
      } else if (type == 'back') {
        typeName = '归还'
      } else if (type == 'dispose') {
        typeName = '处置'
      } else {
        typeName = '--'
      }
      return typeName
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        pieceId: this.pieceId,
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
</style>