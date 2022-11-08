<!--
 * @Author: 马潭龙
 * @Date: 2021-11-16 16:18:15
 * @LastEditTime: 2021-11-30 10:48:06
 * @LastEditors: 马潭龙
 * @Descripttion: 交接班记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\handover\HandoverList.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <!-- 搜索 -->
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh(true)"
      />
      <template slot="title">交班记录</template>
      <!-- 新增删除 -->
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'handover:add'" size="small" @click="handoverAdd" type="ghost-primary" icon="plus">新增</a-button>
        <a-button v-has="'handover:delete'" type="danger" size="small" icon="delete" @click="delet">
          批量删除
        </a-button>
      </div>
      <!-- 表格 -->
      <h-vex-table
        ref="handover"
        bordered
        :columns="columns"
        :data="loadData"
        style="width: 100%"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, trigger: 'cell' }"
      >
        <!-- 交班人点击跳转详情 -->
        <span slot="surrenderUserName" slot-scope="text, record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.surrenderUserName ? record.surrenderUserName : '--' }}
          </a>
        </span>
        <!-- 环境状态 -->
        <span slot="envStatus" slot-scope="text, record">
          <a-badge :color="record.envStatus == 1 ? 'blue' : 'red'" :text="record.envStatus == 1 ? '正常' : '异常'" />
        </span>
        <!-- 测试状态 -->
        <span slot="testStatus" slot-scope="text, record">
          <a-badge
            :color="record.testStatus == 1 ? 'red' : 'blue'"
            :text="record.testStatus == 1 ? '有错误' : '无错误'"
          />
        </span>
        <!-- 工具状态 -->
        <span slot="toolStatus" slot-scope="text, record">
          <a-badge :color="record.toolStatus == 1 ? 'blue' : 'red'" :text="record.toolStatus == 1 ? '齐全' : '缺失'" />
        </span>
        <!-- 设备状态 -->
        <span slot="deviceStatus" slot-scope="text, record">
          <a-badge
            :color="record.deviceStatus == 1 ? 'red' : 'blue'"
            :text="record.deviceStatus == 1 ? '有故障' : '无故障'"
          />
        </span>
        <!-- 操作 -->
        <template slot="actions" slot-scope="text, record">
          <!-- 编辑 -->
          <a-tooltip title="编辑">
            <a-icon type="edit" class="primary-text" @click="() => handleEdit(record)" />
          </a-tooltip>
          <a-divider type="vertical" />
          <!-- 详情 -->
          <a-tooltip title="详情">
            <a-icon
              type="eye"
              title="详情"
              class="primary-text"
              style="cursor: pointer"
              @click="() => handleDetail(record)"
            />
          </a-tooltip>
          <a-divider type="vertical" />
          <!-- 删除 -->
          <a-tooltip title="删除">
            <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
              <h-icon type="icon-shanchu" title="删除" class="danger-text" style="cursor: pointer" />
            </a-popconfirm>
          </a-tooltip>
        </template>
      </h-vex-table>
    </h-card>
    <handover-add-modal ref="handoverAddModal" @change="refresh(true)"></handover-add-modal>
    <handover-detail ref="handoverDetail" @change="refresh(true)"></handover-detail>
  </div>
</template>

<script>
import HandoverAddModal from './modules/HandoverAddModal.vue'
import { postAction } from '@/api/manage'
import mixin from '@/views/hifar/mixin.js'
import handoverDetail from './modules/handoverDetail.vue'
import moment from 'moment'
export default {
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  components: {
    HandoverAddModal,
    handoverDetail,
  },
  data() {
    return {
      moment,
      selectedRowKeys: [],
      queryParams: {},
      url: {
        tableList: '/HfEnvTestHandoverRecordBusiness/listPage',
        delet: '/HfEnvTestHandoverRecordBusiness/logicRemoveById',
        delete: '/HfEnvTestHandoverRecordBusiness/logicRemoveById',
      },
      // 搜索
      searchBar: [
        {
          title: '交班人员',
          key: 'c_surrenderUserName_7',
          formType: 'input',
        },
        {
          title: '接班人员',
          key: 'c_receiveUserName_7',
          formType: 'input',
        },
        {
          title: '交接时间',
          key: 'handoverTime',
          formType: 'dateRangePick',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
          },
        },
        {
          title: '环境状态',
          key: 'c_envStatus_1',
          formType: 'select',
          options: [
            { title: '正常', value: 1, key: 1 },
            { title: '异常', value: 2, key: 2 },
          ],
        },
        {
          title: '测试状态',
          key: 'c_testStatus_1',
          formType: 'select',
          options: [
            { title: '有错误', value: 1, key: 2 },
            { title: '无错误', value: 2, key: 2 },
          ],
        },
        {
          title: '工具状态',
          key: 'c_toolStatus_1',
          formType: 'select',
          options: [
            { title: '齐全', value: 1, key: 1 },
            { title: '缺失', value: 2, key: 2 },
          ],
        },
        {
          title: '设备状态',
          key: 'c_deviceStatus_1',
          formType: 'select',
          options: [
            { title: '有故障', value: 1, key: 1 },
            { title: '无故障', value: 2, key: 2 },
          ],
        },
        {
          title: '备注',
          key: 'c_remarks_7',
          formType: 'input',
        },
      ],
      // 表格
      columns: [
        {
          title: '交班人',
          align: 'left',
          dataIndex: 'surrenderUserName',
          scopedSlots: { customRender: 'surrenderUserName' },
        },
        {
          title: '接班人',
          align: 'left',
          dataIndex: 'receiveUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '交接时间',
          align: 'left',
          dataIndex: 'handoverTime',
          width: 130,
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
          },
        },
        {
          title: '环境状态',
          align: 'left',
          dataIndex: 'envStatus',
          scopedSlots: { customRender: 'envStatus' },
        },
        {
          title: '测试状态',
          align: 'left',
          dataIndex: 'testStatus',
          scopedSlots: { customRender: 'testStatus' },
        },
        {
          title: '工具状态',
          align: 'left',
          dataIndex: 'toolStatus',
          scopedSlots: { customRender: 'toolStatus' },
        },
        {
          title: '设备状态',
          align: 'left',
          dataIndex: 'deviceStatus',
          scopedSlots: { customRender: 'deviceStatus' },
        },
        {
          title: '创建时间',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
          },
        },
        {
          title: '备注',
          align: 'left',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'actions',
          width: 110,
          scopedSlots: { customRender: 'actions' },
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
        }
        if (data.handoverTime && data.handoverTime.length > 0) {
          data.beginTime = moment(data.handoverTime[0]).format('YYYY-MM-DD') + ' 00:00:00'
          data.endTime = moment(data.handoverTime[1]).format('YYYY-MM-DD') + ' 23:59:59'
          data.c_handoverTime_4 = moment(data.beginTime).format('X') * 1000
          data.c_handoverTime_6 = moment(data.endTime).format('X') * 1000
        }
        delete data.beginTime
        delete data.endTime
        delete data.handoverTime
        return postAction(this.url.tableList, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
    }
  },
  methods: {
    // 更新
    refresh(bool = true) {
      this.$refs.handover.refresh(bool)
      this.selectedRowKeys = []
    },
    // 添加
    handoverAdd(record) {
      let title = '新增交接班记录'
      let groupCode = 'handoverAdd'
      this.$refs.handoverAddModal.show(record, title, groupCode)
      this.refresh()
    },
    // 编辑
    handleEdit(record) {
      let title = '编辑交接班记录'
      let groupCode = 'handoverAdd'
      this.$refs.handoverAddModal.show(record, title, groupCode)
      this.refresh()
    },
    // 批量删除
    delet() {
      let _this = this
      if (_this.selectedRowKeys.length) {
        this.$confirm({
          title: '确认删除',
          content: '删除后不可恢复，确认删除？',
          onOk: function () {
            postAction(_this.url.delet, { ids: _this.selectedRowKeys.join() }).then((res) => {
              if (res.code === 200) {
                _this.$message.success('删除成功')
                _this.refresh()
                _this.selectedRowKeys = []
                _this.selectedRows = []
              } else {
                _this.$message.warning(res.msg)
              }
            })
          },
        })
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 详情
    handleDetail(record) {
      this.$refs.handoverDetail.show(record)
    },
    // 点击交班人跳转详情
    handleDetailCode(record) {
      this.$refs.handoverDetail.show(record)
    },
    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { ids: id }).then((res) => {
        console.log('id===', id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
  },
}
</script>

<style>
</style>