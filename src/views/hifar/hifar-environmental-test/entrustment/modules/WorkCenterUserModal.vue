<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 09:55:31
 * @LastEditTime: 2021-09-18 09:55:32
 * @LastEditors: 赵峰
 * @Descripttion: 检测中心人员
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\modules\WorkCenterUserModal.vue
-->
<template>
  <h-modal
    title="检测中心人员"
    inner
    fullScreen
    destroyOnClose
    :getContainer="getContainer"
    :visible="visible"
    :width="1000"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-vex-table
      ref="workCenterTable"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
    >
      <div slot="idName" slot-scope="text, record">
        {{ record.idName }}
        <a-tooltip title="中心负责人">
          <h-icon
            v-if="record.dataType == 'manager'"
            type="icon-fuzeren"
            class="primary-text"
            style="font-size: 16px"
          />
        </a-tooltip>
      </div>
    </h-vex-table>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },

  data() {
    return {
      visible: false,
      centerId: '',
      url: '/HfPrjWorkCenterUserBusiness/listPageUserByCenterId',
      columns: [
        {
          title: '姓名',
          dataIndex: 'idName',
          scopedSlots: {
            customRender: 'idName',
          },
        },
        {
          title: '性别',
          dataIndex: 'sex',
          customRender: (text) => {
            return text == 1 ? '男' : text == 2 ? '女' : '保密'
          },
        },
        {
          title: '电话',
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '座机',
          dataIndex: 'telephone',
          customRender: (text) => {
            return text || '--'
          },
        },
      ],
    }
  },

  methods: {
    show(centerId) {
      this.visible = true
      this.centerId = centerId
      this.loadData()
    },
    handleCancel() {
      this.visible = false
    },
    loadData() {
      let data = {
        centerId: this.centerId,
      }
      return postAction(this.url, data).then((res) => {
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