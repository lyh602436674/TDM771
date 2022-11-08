<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:52:46
 * @LastEditTime: 2021-09-29 13:50:10
 * @LastEditors: 赵峰
 * @Descripttion: 接收信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\AccessInfo.vue
-->
<template>
  <h-card fixed :bordered="false">
    <h-vex-table
      ref="accessInfoTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
    >
      <span slot="status" slot-scope="text,record">
        <a-tag v-if="record.status == 1" color="orange">待接收</a-tag>
        <a-tag v-if="record.status == 10" color="green">已接收</a-tag>
      </span>
      <span slot="action" slot-scope="text, record">
        <template v-if="record.status == 10">
          <a @click="handleCirculation(record)"> 流转信息 </a>
        </template>
      </span>
    </h-vex-table>
    <sample-circulation-table ref="SampleCirculationTable" :pieceId="pieceId"></sample-circulation-table>
  </h-card>
</template>

<script>
import { postAction } from '@/api/manage'
import SampleCirculationTable from '@/views/hifar/hifar-environmental-test/sample/modules/SampleCirculationTable'
export default {
  props: {
    entrustId: {
      type: String,
      default: '',
    },
  },
  watch: {
    entrustId(val) {
      if (val) {
        this.refresh(true)
      }
    },
  },
  components:{
    SampleCirculationTable
  },
  data() {
    return {
      queryParams: {},
      url: '/HfEnvPieceBusiness/listPageByEntrustId',
      columns: [
        {
          title: '试品编号',
          align: 'left',
          minWidth: 80,
          dataIndex: 'pieceCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '状态',
          align: 'left',
          width: 100,
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '试品名称',
          align: 'left',
          dataIndex: 'productName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品代号',
          align: 'left',
          dataIndex: 'productAliass',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品规格',
          align: 'left',
          dataIndex: 'productSpec',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '试品数量',
          align: 'right',
          dataIndex: 'pieceNum',
          customRender: (text, record) => {
            return text || 0
          },
        },
        {
          title: '库存数量',
          align: 'right',
          dataIndex: 'pieceCnum',
          customRender: (text, record) => {
            return text || 0
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 80,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      pieceId: null,
    }
  },

  methods: {
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        entrustId: this.entrustId,
      }
      return postAction(this.url, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },

    // 流转记录
    handleCirculation(record) {
      this.pieceId = record.id
      this.$refs.SampleCirculationTable.visible = true
    },

    refresh(bool = true) {
      this.$refs.accessInfoTable.refresh(bool)
    },
  },
}
</script>
<style lang='less' scoped>
</style>