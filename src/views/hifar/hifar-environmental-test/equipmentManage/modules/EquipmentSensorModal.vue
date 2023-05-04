<!--
 * @Author: 赵峰
 * @Date: 2021-10-26 16:13:38
 * @LastEditTime: 2021-11-29 15:01:38
 * @LastEditors: 马潭龙
 * @Descripttion: 设备传感器-列表查询不在设备下的传感器
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\EquipmentSensorModal.vue
-->
<template>
  <h-modal
    inner
    fullScreen
    :title="title"
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card fixed>
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh"/>
      <h-vex-table
        ref="equipmentSensorTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :history-select="true"
        :rowSelection="{ selectedRowKeys, onChange: onSelect }"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'

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
      queryParams: {},
      title: '选择传感器',
      visible: false,
      equipId: null,
      searchForm: [
        {
          title: '设备编号',
          key: 'c_equipCode_7',
          formType: 'input',
        },
        {
          title: '设备名称',
          key: 'c_equipName_7',
          formType: 'input',
        },
        {
          title: '设备型号',
          key: 'c_equipModel_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '设备编号',
          align: 'left',
          width: 100,
          dataIndex: 'equipCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备名称',
          align: 'left',
          dataIndex: 'equipName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          align: 'left',
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检定日期',
          dataIndex: 'checkTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '检定有限期',
          dataIndex: 'checkValid',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '检定编号',
          dataIndex: 'checkCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '技术参数',
          minWidth: 140,
          dataIndex: 'technologyParam',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '备注',
          minWidth: 120,
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          equipId: this.equipId,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/HfResEquipSensorBusiness/listPageSensorNotByEquip',
        add: '/HfResEquipSensorBusiness/add',
      },
    }
  },
  methods: {
    show(equipId) {
      this.visible = true
      this.equipId = equipId
      this.$nextTick(() => {
        this.refresh(true)
      })
    },
    refresh(bool = true) {
      this.$refs.equipmentSensorTable.refresh(bool)
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleSubmit() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请选择传感器')
        return
      }
      postAction(this.url.add, {
        equipId: this.equipId,
        sensorIds: this.selectedRowKeys.join(','),
      }).then((res) => {
        if (res.code === 200) {
          this.$message.success('添加成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    handleCancel() {
      this.$refs.equipmentSensorTable.clearCheckboxRow()
      this.visible = false
      this.selectedRowKeys = []
      this.selectedRows = []
    },
  },
}
</script>

<style>
</style>