<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-02 09:54:20
 * @LastEditTime: 2021-09-08 10:47:31
 * @LastEditors: 陈乾龙
 * @Description: 数据库备份记录
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\backup\modules\DbBackupDrawer.vue
-->
<template>
  <a-drawer
    :title="title"
    placement="right"
    destroyOnClose
    :width="600"
    :closable="false"
    :visible="visible"
    :get-container="false"
    :wrap-style="{ position: 'absolute' }"
    @close="onClose"
  >
    <h-vex-table ref="dbBackupHistory" :columns="columns" :data="loadData">
      <template slot="status" slot-scope="text, record">
        <a-tag v-if="record.status == 1" color="#67C23A">备份成功</a-tag>
        <a-tag v-else-if="record.status == 2" color="#F56C6C">备份失败</a-tag>
      </template>
    </h-vex-table>
  </a-drawer>
</template>

<script>
import { postAction } from '@/api/manage'
import moment from 'moment'
export default {
  data() {
    return {
      visible: false,
      title: '',
      model: {},
      columns: [
        {
          title: '备份状态',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: {
            customRender: 'status',
          },
        },
        {
          title: '文件地址',
          dataIndex: 'filePath',
          minWidth: 180,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '备份人',
          dataIndex: 'createUserName',
          minWidth:100,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '备份时间',
          dataIndex: 'createTime',
          minWidth:142,
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
      ],
      url: {
        list: '/SysDatasourceRecordBusiness/listPage',
      },
    }
  },
  methods: {
    show(record) {
      this.model = Object.assign({}, record)
      this.title = this.model.databaseName + '-备份记录'
      this.$nextTick(() => {
        this.visible = true
      })
    },
    onClose() {
      this.visible = false
    },
    loadData(params) {
      let data = {
        ...params,
        datasourceConfigId: this.model.id,
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

<style>
</style>