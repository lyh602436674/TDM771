<!--
 * @Author: 陈乾龙
 * @Date: 2021-11-03 13:57:59
 * @LastEditTime: 2021-11-29 11:37:25
 * @LastEditors: 马潭龙
 * @Description: 传感器选择弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\SensorSelectModal.vue
-->
<template>
  <h-modal
    title="传感器列表"
    fullScreen
    inner
    destroyOnClose
    :visible="visible"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card fixed :bordered="false">
      <h-vex-table
        slot="content"
        ref="sensorTable"
        :autoLoad="false"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: handleSelectChange }"
      >
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { isArray } from 'lodash'
import { postAction } from '@/api/manage'
import moment from 'moment'
export default {
  // inject: {
  //   getContainer: {
  //     default: () => document.body,
  //   },
  // },
  data() {
    return {
      visible: false,
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '设备编号',
          dataIndex: 'equipCode',
        },
        {
          title: '设备名称',
          dataIndex: 'equipName',
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '资产编号',
          dataIndex: 'assetsCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '检定日期',
          dataIndex: 'checkTime',
          customRender: (text) => {
            let time = parseFloat(text)
            if (isNaN(time) || time == 0) {
              return '--'
            }
            return moment(time).format('YYYY-MM-DD HH:mm:ss')
          },
        },
        {
          title: '检定编号',
          dataIndex: 'checkCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '检定有效期',
          dataIndex: 'checkValid',
          customRender: (text) => {
            let time = parseFloat(text)
            if (isNaN(time) || time == 0) {
              return '--'
            }
            return moment(time).format('YYYY-MM-DD HH:mm:ss')
          },
        },
        {
          title: '技术参数',
          dataIndex: 'technology',
          customRender: (text) => {
            return text || '--'
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          equipId: this.equipId,
          c_id_99: this.selectedRowKeys.join(','),
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            res.data.data.map((sensor) => {
              sensor.sensorId = sensor.id
            })
            return res.data
          }
        })
      },
      url: {
        list: '/HfResEquipSensorBusiness/listPageSensorByEquip',
      },
    }
  },
  methods: {
    show(selectedRows = [], equipId, testId) {
      this.selectedRowKeys = []
      this.selectedRows = []
      if (isArray(selectedRows)) {
        selectedRows.map((item) => {
          this.selectedRowKeys.push(item.id)
        })
        this.selectedRows = selectedRows
      } else {
        this.selectedRowKeys = []
        this.selectedRows = []
      }
      this.equipId = equipId
      this.testId = testId
      this.visible = true
      this.$nextTick(() => {
        this.refresh(true)
      })
    },
    refresh(bool = true) {
      this.$refs.sensorTable.refresh(bool)
    },
    handleSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
      this.handleCancel()
    },
  },
}
</script>

<style>
</style>