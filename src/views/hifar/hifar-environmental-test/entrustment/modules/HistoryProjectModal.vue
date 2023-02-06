<!--
 * @Author: 雷宇航
 * @Date: 2022-11-09 10:46:27
 * @fileName: HistoryProjectModal.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\entrustment\modules\HistoryProjectModal.vue
 * @Description: 历史上样品做过的项目
-->
<template>
  <h-modal
    title="历史试验项目选择"
    :getContainer='getContainer'
    :visible='visible'
    destroyOnClose
    fullScreen inner
    @cancel='handleCancel'>
    <div slot='footer' class='footer'>
      <a-button :loading="submitLoading" style='margin-right: 8px' type='ghost-danger' @click='handleCancel'> 关闭
      </a-button>
      <a-button :loading="submitLoading" type='primary' @click='handleSubmit'>确定</a-button>
    </div>
    <h-card :bordered="false" fixed>
      <h-search
        slot="search-form"
        v-model="queryParams"
        :data="searchData"
        :showToggleButton="false"
        size="small"
        @change="handleSearch"
      />
      <h-vex-table
        :autoLoad="false"
        ref="vxeTable"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect, type: 'checkbox' }"
        style="width: 100%"
      >
        <template #attachNum="text,record">
          <a @click="previewAttach(record)">{{ text }}</a>
        </template>
      </h-vex-table>
    </h-card>
    <h-modal
      title="附件查看"
      :width="800"
      :getContainer='getContainer'
      :visible='subVisible'
      destroyOnClose
      inner
      @cancel='handleSubCancel'>
      <div slot='footer' class='footer'>
        <a-button type='ghost-danger' @click='handleSubCancel'> 关闭</a-button>
      </div>
      <h-upload-file v-model="fileList" :isEdit="false"></h-upload-file>
    </h-modal>
  </h-modal>
</template>

<script>
import {postAction} from "@api/manage";

export default {
  name: "HistoryProjectModal",
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      visible: false,
      subVisible: false,
      submitLoading: false,
      pieceIds: "",
      fileList: [],
      queryParams: {},
      searchData: [
        {
          title: '试验项目',
          formType: 'input',
          key: 'c_unitName_7',
        },
        {
          title: '产品编号',
          formType: 'input',
          key: 'c_pieceNo_7',
        },
        {
          title: '产品代号',
          formType: 'input',
          key: 'c_productAlias_7',
        },
      ],
      columns: [
        {
          title: '试验项目',
          minWidth: 150,
          align: 'center',
          dataIndex: 'unitName',
        },
        {
          title: '产品编号',
          minWidth: 100,
          align: 'center',
          dataIndex: 'pieceNo',
        },
        {
          title: '产品代号',
          minWidth: 100,
          align: 'center',
          dataIndex: 'productAlias',
        },
        {
          title: '创建时间',
          minWidth: 150,
          align: 'center',
          dataIndex: 'createTime',
        },
        {
          title: '试验名称',
          minWidth: 150,
          align: 'center',
          dataIndex: 'testName',
        },
        {
          title: '试验判据',
          minWidth: 150,
          align: 'center',
          dataIndex: 'testCriteria',
        },
        {
          title: '合格判据',
          minWidth: 150,
          align: 'center',
          dataIndex: 'conformityCriteria',
        },
        {
          title: '试验依据',
          minWidth: 150,
          align: 'center',
          dataIndex: 'testEvidence',
        },
        {
          title: '试验标准',
          minWidth: 150,
          align: 'center',
          dataIndex: 'standardName',
        },
        {
          title: '试验条件',
          minWidth: 150,
          align: 'center',
          dataIndex: 'testCondition',
        },
        {
          title: '是否加电',
          minWidth: 100,
          align: 'center',
          dataIndex: 'isPowerUp',
          customRender: (text) => {
            return text === '1' ? '是' : "否"
          }
        },
        {
          title: '加电时间',
          minWidth: 100,
          align: 'center',
          dataIndex: 'powerUpTime_dictText',
        },
        {
          title: '最终用户',
          minWidth: 100,
          align: 'center',
          dataIndex: 'lastUser_dictText',
        },
        {
          title: '是否显示最终用户',
          minWidth: 160,
          align: 'center',
          dataIndex: 'isShowUserInReport',
          customRender: (text) => {
            return text === '1' ? '是' : "否"
          }
        },
        {
          title: '项目附件',
          minWidth: 100,
          align: 'center',
          dataIndex: 'attachNum',
          scopedSlots: {customRender: 'attachNum'},
        },
      ],
      selectedRowKeys: [],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          pieceIds: this.pieceIds,
        }
        return postAction('/HfEnvEntrustBusiness/projectPieceByHistory', data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      selectedKeys: [],
      selectedRows: [],
    }
  },
  methods: {
    show(pieceIds,selectedKeys) {
      this.selectedKeys = selectedKeys
      this.pieceIds = pieceIds
      this.visible = true
      this.$nextTick(() => {
        this.refresh(true)
      })
    },
    refresh(bool) {
      this.$refs.vxeTable.refresh(bool)
    },
    onSelect(selectedKeys, selectedRows) {
      this.selectedKeys = selectedKeys
      this.selectedRows = selectedRows
    },
    previewAttach(record) {
      this.fileList = record.attachInfo.map(item => {
        return {
          fileId: item.id,
          size: item.fileSize,
          status: item.status === 9 ? 'success' : 'exception',
          url: item.filePath,
          name: item.fileName,
          uuid: item.id,
          percent: 100,
          uploadTime: item.createTime,
          secretLevel: item.secretLevel,
          type: item.viewType === 2 ? 'image/jpeg' : 'text/plain',
        }
      })
      this.subVisible = true
    },
    handleSearch() {
      this.refresh(true)
    },
    handleSubmit() {
      this.$emit('callback', this.selectedKeys, this.selectedRows)
      this.submitLoading = true
    },
    handleSubCancel() {
      this.subVisible = false
    },
    handleCancel() {
      this.visible = false
      this.selectedKeys = []
      this.selectedRows = []
    },
  },
}
</script>

<style scoped>

</style>