<!--
 * @Author: 赵峰
 * @Date: 2021-09-13 14:19:16
 * @LastEditTime: 2021-09-13 16:24:43
 * @LastEditors: 赵峰
 * @Descripttion: 系统内试验项目列表弹窗组件
 * @FilePath: \hifar-platform-client\src\views\components\SysFeeListSelectModal.vue
-->
<template>
  <h-modal
    destroyOnClose
    inner
    fullScreen
    :title="title"
    :visible="visible"
    :width="800"
    :confirmLoading="confirmLoading"
    :getContainer="getContainer"
    @cancel="handleCancel"
    @submit="handleOk"
  >
    <h-card fixed :bordered="false">
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="false"
        :data="searchBar"
        @change="refresh(true)"
      />
      <h-vex-table
        ref='feeTable'
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows, onChange: onSelected }"
      >
        <!-- 购买日期 -->
        <span slot="buyTime" slot-scope="text, record">
        {{
            record.buyTime && record.buyTime != 0 && record.buyTime > 0
              ? moment(parseInt(record.buyTime)).format('YYYY-MM-DD')
              : '--'
          }}
      </span>
        <!-- 检定有效期 -->
        <span slot="checkValid" slot-scope="text, record">
        <span
          v-if="record.checkValid && record.checkValid != 0 && record.checkValid > 0"
          :style="record.checkValid <= moment().add(30, 'days').valueOf() ? 'color:red;' : ''"
        >
          {{ moment(record.checkValid - 0).format('YYYY-MM-DD') }} [{{
            moment().isSame(record.checkValid - 0, 'day') ? '今天' : moment(record.checkValid - 0).fromNow()
          }}到期]
        </span>
        <span v-else>--</span>
      </span>
        <!-- 检定周期 -->
        <span slot="checkPeriod" slot-scope="text, record">
        {{ record.checkPeriod ? record.checkPeriod : '--' }}
        {{
            record.checkPeriod
              ? record.checkUnit == 1
                ? '日'
                : record.checkUnit == 2
                  ? '月'
                  : record.checkUnit == 3
                    ? '年'
                    : ''
              : ''
          }}
      </span>

      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import { isArray } from 'lodash'
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
      moment,
      title: '设备列表',
      visible: false,
      confirmLoading: false,
      queryParams: {},
      url: {
        list: '/HfResEquipBusiness/listPage',
      },
      searchBar: [
        {
          title: '设备编号',
          formType: 'input',
          key: 'c_equipCode_7',
        },
        {
          title: '设备名称 ',
          formType: 'input',
          key: 'c_equipName_7',
        },
        {
          title: '设备用途',
          key: 'c_equipUse_1',
          formType: 'dict',
          dictCode: 'hf_res_equip_use',
        },
        {
          title: '设备类型',
          formType: 'dict',
          key: 'c_equipTypeCode_1',
          dictCode: 'hf_res_equip_type',
        },
        {
          title: '内部名称',
          formType: 'input',
          key: 'c_innerName_7',
        },
        {
          title: '设备型号',
          formType: 'input',
          key: 'c_equipModel_7',
        },
        {
          title: '资产编号',
          formType: 'input',
          key: 'c_assetsCode_7',
        },
      ],
      columns: [
        {
          title: '设备编号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipCode',
        },
        {
          title: '设备名称 ',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备用途',
          align: 'left',
          ellipsis: true,
          minWidth: 80,
          dataIndex: 'equipUse_dictText',
        },
        {
          title: '设备类型',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipTypeCode_dictText',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '计量有效期',
          align: 'left',
          ellipsis: true,
          width: 160,
          dataIndex: 'checkValid',
          scopedSlots: {customRender: 'checkValid'},
        },
        {
          title: '计量周期',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'checkPeriod',
          scopedSlots: {customRender: 'checkPeriod'},
        },
        {
          title: '内部名称',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'innerName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '资产编号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'assetsCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '购买日期',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'buyTime',
          scopedSlots: {customRender: 'buyTime'},
        },
        {
          title: '出厂编号',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'leaveCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '生产厂家',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'factoryName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '责任人',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'managerName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '技术参数',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'technology',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '状态',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'status_dictText',
        },
        {
          title: '排序',
          align: 'left',
          width: 80,
          dataIndex: 'rowSort',
        },
        {
          title: '备注',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          searchType: "all"
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.feeTable.refresh(bool)
    },
    show(selectedRows = [], selectedKeys = []) {
      if (isArray(selectedRows)) {
        this.selectedRows = selectedRows
      }
      if (isArray(selectedKeys)) {
        this.selectedRowKeys = selectedKeys
      }
      this.visible = true
    },
    handleOk() {
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.visible = false
    },
    onSelected(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
  },
}
</script>

<style>
</style>