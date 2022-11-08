<!--
 * @Author: 赵峰
 * @Date: 2021-09-07 18:00:36
 * @LastEditTime: 2021-09-08 17:37:40
 * @LastEditors: 赵峰
 * @Descripttion: 材料流转记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\resource\material\modules\MaterialLibiaryRecord.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :width="800"
    :visible="visible"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-card fixed>
      <h-vex-table slot="content" ref="sampleCirculationTable" :columns="columns" :data="loadData">
        <!-- 数量 -->
        <div slot="quantity" slot-scope="text, record">
          <span v-if="record.optType == 2" style="color: green">-{{ record.quantity }}</span>
          <span v-if="record.optType == 1" style="color: red">{{ record.quantity }}</span>
        </div>
        <!-- 操作内容 -->
        <div slot="optContent" slot-scope="text, record">
          <span>{{ filterContent(record.optType, record.optCode, record.remarks) }}</span>
        </div>
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
export default {
  components: {},

  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: ['materialId'],
  data() {
    return {
      moment,
      visible: false,
      title: '流转记录',
      url: {
        detailById: '/HfResMaterialRecordBusiness/listPage',
      },
      columns: [
        {
          title: '操作时间',
          dataIndex: 'createTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作人',
          dataIndex: 'createUserName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'optName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作内容',
          dataIndex: 'optContent',
          scopedSlots: { customRender: 'optContent' },
        },
        {
          title: '操作前库存',
          align: 'right',
          dataIndex: 'quantityBefore',
          customRender: (text) => {
            return text || 0
          },
        },
        {
          title: '库存变更',
          dataIndex: 'quantity',
          align: 'right',
          scopedSlots: { customRender: 'quantity' },
        },
        {
          title: '操作后库存',
          dataIndex: 'quantityAfter',
          align: 'right',
          customRender: (text) => {
            return text || 0
          },
        },
      ],
    }
  },

  methods: {
    handleCancel() {
      this.visible = false
    },
    filterContent(optType, optCode, remarks) {
      let content = null
      if(optType == 1 && optCode == 1){
        content = '交货人:'+ remarks
      }else if(optType == 1 && optCode == 2){
        content = '归还人:'+ remarks
      }else if(optType == 1 && optCode == 3){
        content = '报溢入库:'+ remarks
      }else if(optType == 2 && optCode == 1){
        content = '领用人:'+ remarks
      }else if(optType == 2 && optCode == 2){
        content = '处理方式:'+ remarks
      }else if(optType == 2 && optCode == 3){
        content = '报损原因:'+ remarks
      }
      return content;
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        materialId: this.materialId,
      }
      return postAction(this.url.detailById, data).then((res) => {
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