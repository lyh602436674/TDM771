<!--
 * @Author: 赵峰
 * @Date: 2021-10-14 11:15:13
 * @LastEditTime: 2021-10-29 15:57:20
 * @LastEditors: 赵峰
 * @Descripttion: 已过期
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\expiryReminder\components\EquipOverdueTable.vue
-->
<template>
  <h-card fixed :bordered="true">
    <h-search
      v-model="queryParam"
      slot="search-form"
      size="small"
      :showToggleButton="true"
      :data="searchBar"
      @change="refresh"
    />
    <h-vex-table
      slot="content"
      ref="diveceInfoTable"
      :scroll="{ x: true }"
      :columns="columns"
      :data="deviceInfoLoadData"
      :rowKey="(record) => record.id"
    >
      <!-- 购买日期 -->
      <span slot="buyTime" slot-scope="text, record">
        {{ record.buyTime && record.buyTime != 0 ? moment(parseInt(record.buyTime)).format('YYYY-MM-DD') : '--' }}
      </span>
      <!-- 检定有效期 -->
      <span slot="checkValid" slot-scope="text, record">
        <span
          v-if="record.checkValid && record.checkValid != 0"
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
      <!-- 状态 -->
      <span slot="status" slot-scope="text, record">
        {{ record.status | deviceStatusFilter }}
      </span>
      <!-- 操作 -->
      <span slot="action" slot-scope="text, record">
        <a-icon
          type="eye"
          title="详情"
          class="primary-text"
          style="cursor: pointer"
          @click="() => detailHandle(record)"
        />
      </span>
    </h-vex-table>
  </h-card>
</template>
<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { downloadFile, postAction } from '@/api/manage'

export default {
  props: {
    expiryTime: {
      type: String,
      default: '',
    },
  },
  mixins: [mixin],
  watch: {
    expiryTime: {
      immediate: true,
      handler(val) {
        this.expiryTime = val
      },
    },
  },
  data() {
    return {
      moment,
      url: {
        list: '/HfResEquipBusiness/listPage',
        importExcelUrl: 'HfResEquipImport/importExcel',
        export: '/HfResEquipExport/exportExcel',
      },
      queryParam: {},
      statisticsNum:{},
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
          title: '设备类型',
          formType: 'dict',
          key: 'c_equipTypeCode_1',
          dictCode: 'hf_res_equip_type',
        },
        {
          title: '设备型号',
          formType: 'input',
          key: 'c_equipModel_7',
        },
      ],
      columns: [
        {
          title: '设备编号',
          align: 'left',
          ellipsis: true,
          dataIndex: 'equipCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备名称 ',
          align: 'left',
          ellipsis: true,
          dataIndex: 'equipName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '计量有效期',
          align: 'left',
          ellipsis: true,
          dataIndex: 'checkValid',
          scopedSlots: { customRender: 'checkValid' },
        },
        {
          title: '计量周期',
          align: 'left',
          ellipsis: true,
          dataIndex: 'checkPeriod',
          scopedSlots: { customRender: 'checkPeriod' },
        },
        {
          title: '设备类型',
          align: 'left',
          ellipsis: true,
          dataIndex: 'equipTypeName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '内部名称',
          align: 'left',
          ellipsis: true,
          dataIndex: 'innerName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          align: 'left',
          ellipsis: true,
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '状态',
          align: 'left',
          ellipsis: true,
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   align: 'center',
        //   fixed: 'right',
        //   width: 80,
        //   scopedSlots: { customRender: 'action' },
        // },
      ],
      deviceInfoLoadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          searchType: this.expiryTime,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            let statisticsNum = res.ext
            this.$emit('change',statisticsNum)
            return res.data
          }
        })
      },
    }
  },
  methods: {
    refresh() {
      this.$refs.diveceInfoTable.refresh(true)
    },
    // 详情
    detailHandle(record) {},
    // 导出
    async handleExportXls(name) {
      let data = {
        ...this.queryParams,
        ids: this.selectedRowKeys.join(','),
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        if (info.file.response.code == 200) {
          this.$message.success(`${info.file.response.msg}`)
          this.refresh()
        } else {
          this.$message.error(`${info.file.name} ${info.file.response.msg}.`)
        }
      } else if (info.file.status === 'error') {
        this.$message.error(`文件导入失败: ${info.file.msg} `)
      }
    },
  },
}
</script>