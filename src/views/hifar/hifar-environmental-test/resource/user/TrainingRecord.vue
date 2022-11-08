<!--
 * @Author: 赵峰
 * @Date: 2021-08-05 10:59:19
 * @LastEditTime: 2021-11-30 14:05:18
 * @LastEditors: 马潭龙
 * @Descripttion: 培训记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\user\TrainingRecord.vue
-->
<template>
  <div class="em-custom-wrapper" ref="pageWrapper" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <template slot="title"> 培训记录 </template>
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'record:add'" size="small" @click="handleAdd" type="ghost-primary" icon="plus">添加</a-button>
        <a-button v-has="'record:privice'" size="small" type="ghost-warning" icon="download" @click="handleExportXls('培训记录')">导出</a-button>
        <a-button v-has="'record:import'" size="small" type="ghost-success" icon="import" @click="handleImportExcel">导入</a-button>
        <template>
          <a-button v-has="'record:delete'" type="danger" size="small" icon="delete" @click="batchDel">
            批量删除
          </a-button>
        </template>
      </div>

      <h-vex-table
        slot="content"
        ref="materialTable"
        :scroll="{ x: true }"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      >
      <!-- 点击培训主题跳转详情 -->
        <span slot="trainTheme" slot-scope="text,record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.trainTheme? record.trainTheme:'--' }}
          </a>
        </span>
        <span slot="trainMode" slot-scope="text, record">
          {{ record.trainMode == 1 ? '线下' : record.trainMode == 2 ? '线上' : '--' }}
        </span>
        <span slot="trainYear" slot-scope="text, record">
          {{ record.trainYear && record.trainYear != 0 ? moment(parseInt(record.trainYear)).format('YYYY') : '--' }}
        </span>
        <span slot="startTime" slot-scope="text, record">
          {{
            record.startTime && record.startTime != 0 ? moment(parseInt(record.startTime)).format('YYYY-MM-DD') : '--'
          }}
        </span>
        <span slot="endTime" slot-scope="text, record">
          {{ record.endTime && record.endTime != 0 ? moment(parseInt(record.endTime)).format('YYYY-MM-DD') : '--' }}
        </span>
        <span slot="action" slot-scope="text, record">
          <a-icon
            type="edit"
            title="编辑"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleEdit(record)"
          />
          <a-divider type="vertical" />
          <a-icon
            type="eye"
            title="详情"
            class="primary-text"
            style="cursor: pointer"
            @click="() => handleDetail(record)"
          />
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a-icon
              type="delete"
              title="删除"
              class="primary-text"
              style="cursor: pointer"
              theme="twoTone"
              two-tone-color="#ff4d4f"
            />
          </a-popconfirm>
        </span>
      </h-vex-table>
      <training-record-moal ref="trainingRecordMoal" @change="refresh"></training-record-moal>
      <training-record-detail ref="trainingRecordDetail"></training-record-detail>
      <h-file-import ref="HFileImport" @change="refresh(true)" @downloadExcel="downloadChange" />
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { postAction, downloadFile } from '@/api/manage'
import trainingRecordMoal from './modules/trainingRecordMoal.vue'
import trainingRecordDetail from './modules/trainingRecordDetail.vue'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.pageWrapper,
    }
  },
  components: {
    trainingRecordMoal,
    trainingRecordDetail,
  },
  mixins: [mixin],
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      url: {
        list: '/HfResPersonTrainRecordBusiness/listPage',
        delete: '/HfResPersonTrainRecordBusiness/logicRemoveById',
        importExcelUrl: 'HfResPersonTrainRecordImport/importExcel',
        export: '/HfResPersonTrainRecordExport/exportExcel',
      },
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      searchBar: [
        {
          title: '培训主题',
          key: 'c_trainTheme_7',
          formType: 'input',
        },
        {
          title: '培训老师',
          key: 'c_trainTeacher_7',
          formType: 'input',
        },
        {
          title: '培训方式',
          key: 'c_trainMode_1',
          formType: 'select',
          options: [
            { title: '线下', value: 1, key: 1 },
            { title: '线上', value: 2, key: 2 },
          ],
        },
      ],
      // 表头
      columns: [
        {
          title: '培训主题 ',
          align: 'left',
          dataIndex: 'trainTheme',
          scopedSlots:{ customRender:'trainTheme' }
        },
        {
          title: '培训日期',
          align: 'left',
          dataIndex: 'trainTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '培训老师',
          align: 'left',
          dataIndex: 'trainTeacher',
          customRender: (text, record) => {
            return text ? text : '--'
          },
        },
        {
          title: '培训方式',
          align: 'left',
          dataIndex: 'trainMode',
          customRender: (text, record) => {
            return text && text == 1 ? '线下' : text && text == 2 ? '线上' : '--'
          },
        },
        {
          title: '培训内容',
          align: 'left',
          dataIndex: 'trainContent',
          customRender: (text, record) => {
            return text ? text : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    refresh() {
      this.$refs.materialTable.refresh(true)
      this.selectedRowKeys = []
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
        } else {
          this.$message.warning('删除失败')
        }
      })
    },

    // 批量删除
    batchDel() {
      let _this = this
      if (_this.selectedRowKeys.length) {
        this.$confirm({
          title: '确认删除',
          content: '删除后不可恢复，确认删除？',
          onOk: function () {
            postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
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
    // 添加
    handleAdd() {
      let record = {}
      this.$refs.trainingRecordMoal.show(record, '添加')
    },
    // 编辑
    handleEdit(record) {
      this.$refs.trainingRecordMoal.show(record, '编辑')
    },
    // 详情
    handleDetail(record) {
      this.$refs.trainingRecordDetail.show(record)
    },
    // 点击培训主题跳转详情
    handleDetailCode(record){
      this.handleDetail(record)
    },
    // 导出
    async handleExportXls(name, model) {
      let data = {
        ...this.queryParams,
        ids: this.selectedRowKeys.join(','),
        ...model,
      }
      let url = this.url.export
      let params = data
      let fileName = name + '.xls'
      await downloadFile(url, fileName, params)
    },
    // 导入
    handleImportExcel() {
      let type = '培训记录'
      let { importExcelUrl } = this.url
      let record = {
        importCode: 'HfResPersonTrainRecordImport',
      }
      this.$refs.HFileImport.show(type, importExcelUrl,record)
    },
    downloadChange() {
      this.handleExportXls('培训记录', { type: 'template' })
    },
  },
}
</script>
