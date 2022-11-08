<!--
 * @Author: 陈乾龙
 * @Date: 2021-06-01 10:46:33
 * @LastEditTime: 2021-06-11 17:54:31
 * @LastEditors: 陈乾龙
 * @Description: 
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\views\hifar\sys\tools\fileManage\FileManageList.vue
-->
<template>
  <a-card class="h-card">
    <div slot="title">
      <a-row :gutter="5">
        <a-col :span="6">
          <j-input size="small" v-model="queryParam.toolName" placeholder="请输入工具名称" @keyup.enter.native="searchQuery"></j-input>
        </a-col>
        <a-col :span="6">
          <a-space align="center" size="small">
            <a-button size="small" type="primary" icon="search" @click="searchQuery">查询</a-button>
            <a-button size="small" type="default" icon="reload" @click="searchReset">重置</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>
    <div slot="extra">
      <a-button type="ghost-success" size="small" icon="plus" @click="handleCreateNew">新增工具</a-button>
    </div>
    <a-table
      size="small"
      ref="filesTable"
      :columns="columns"
      :rowKey="(record) => record.id"
      bordered
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      :expandedRowKeys="expandedRowKeys"
      @expand="handleExpand"
    >
      <div slot="actions" slot-scope="text, record" style="cursor: pointer">
        <h-icon class="primary-text" type="icon-peizhi" @click="handleEdit(record)"></h-icon>
        <a-divider type="vertical"></a-divider>
        <h-icon class="danger-text" type="icon-shanchu" @click="handleDelete(record)"></h-icon>
      </div>
      <a-card size="small" slot="expandedRowRender" :bordered="false" :body-style="{ padding: 0 }">
        <a-spin :spinning="detailLoading">
          <template v-if="Object.keys(filesDetailList).length">
            <a-card-grid
              v-for="item in filesDetailList"
              :key="item.id"
              class="project-card-grid"
              style="width: 25%; text-align: center"
            >
              <file-card :file="item" @change="refresh"></file-card>
            </a-card-grid>
          </template>
          <a-empty v-else style="height:132px;"></a-empty>
        </a-spin>
      </a-card>
    </a-table>
    <files-modal ref="filesModal" @change="refresh"></files-modal>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import FilesModal from './modules/FilesModal'
import mixin from './mixins/mixin'
import FileCard from './modules/FileCard'
export default {
  components: { FilesModal, FileCard },
  mixins: [JeecgListMixin, mixin],
  data() {
    return {
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '工具名称',
          dataIndex: 'toolName',
          customRender: (t, r) => {
            return r.toolName || '--'
          },
        },
        {
          title: '创建人',
          dataIndex: 'createBy',
          customRender: (t, r) => {
            return r.createBy || '--'
          },
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (t, r) => {
            return r.createTime || '--'
          },
        },
        {
          title: '更新人',
          dataIndex: 'updateBy',
          customRender: (t, r) => {
            return r.updateBy || '--'
          },
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          customRender: (t, r) => {
            return r.updateTime || '--'
          },
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          customRender: (t, r) => {
            return r.remarks || '--'
          },
        },
        {
          title: '操作',
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],

      expandedRowKeys: [],
      queryParams: {},
    }
  },
  // 方法集合
  methods: {
    handleExpand(expended, record) {
      if (expended) {
        this.expandedRowKeys = [record.id]
        this.handleGetFilesDetail()
      } else {
        this.expandedRowKeys = []
      }
    },
    handleCreateNew(){
      this.handleEdit({})
    },
    handleEdit(record) {
      this.$refs.filesModal.open(record)
    }
  },
}
</script>

<style lang='less' scoped>
@import "~@/views/assets/less/index.less";
</style>