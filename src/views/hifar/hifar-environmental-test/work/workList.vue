<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 11:41:07
 * @LastEditTime: 2021-11-19 15:06:46
 * @LastEditors: 赵峰
 * @Descripttion: 岗位管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\work\workList.vue
-->
<template>
  <div ref="workcenter" class="workcenter h-custom-layout">
    <r-l-layout class="h-custom-layout" :leftMinWidth="280">
      <template slot="left">
        <h-edit-tree
          ref="physicoChemicalTree"
          title="岗位列表"
          menuIcon="icon-gangweirenyuan"
          fileIcon="icon-drxx12"
          :tree="treeData"
          :replaceFields="replaceFields"
          :selectedKeys="selectedKeys"
          @onSelect="handleSelected"
        >
          <a-input-search
            v-model="treeSearchParams.c_postName_7"
            allowClear
            slot="search-form"
            size="small"
            placeholder="请输入岗位名称"
            enter-button="搜索"
            @keyup.enter.native="getWorkCenterTree"
            @search="getWorkCenterTree"
          />
          <a-space slot="extra" class="actions-icon" align="end" size="small">
            <a-tooltip title="新建">
              <a-icon type="plus-circle" @click="handleAdd" />
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-icon type="edit" @click="handleModify" />
            </a-tooltip>
            <a-tooltip title="删除">
              <h-icon class="danger-text" type="icon-shanchu" @click="handleDelete" />
            </a-tooltip>
          </a-space>
        </h-edit-tree>
      </template>
      <div slot="right" style="background: #fff; height: 100%">
        <div
          v-if="selectedRows && selectedRows.length <= 0"
          style="display: flex; justify-content: center; align-items: center; height: 100%"
        >
          <a-empty description="请选择右方岗位列表">
            <img slot="image" src="../../../../assets/no-data.png" />
          </a-empty>
        </div>
        <template v-else>
          <work-list-detail ref="WorkListDetail"></work-list-detail>
        </template>
      </div>
    </r-l-layout>
    <work-list-modal ref="WorkListModal" @change="handleRloadTree"></work-list-modal>
  </div>
</template>

<script>
import HEditTree from '@/views/components/HEditTree.js'
import { postAction } from '@/api/manage'
import WorkListModal from './modules/WorkListModal'
import WorkListDetail from './modules/WorkListDetail'
export default {
  components: { HEditTree,WorkListDetail,WorkListModal },
  provide() {
    return {
      getContainer: () => this.$refs.workcenter,
      selectedRows: () => this.selectedRows,
      selectedKeys: () => this.selectedKeys,
    }
  },
  data() {
    return {
      replaceFields: {
        children: 'children',
        title: 'postName',
        key: 'id',
      },
      url: {
        list: '/OrgPostBusiness/listAll',
        del: '/OrgPostBusiness/logicRemoveById',
      },
      treeSearchParams: {},
      treeFormData: [
        {
          title: '分类名称',
          key: 'classifyName',
          formType: 'input',
        },
        {
          title: '项目名称',
          key: 'unitName',
          formType: 'input',
        },
      ],
      treeData: [], // 左侧的树的数据
      selectedKeys: [], // 左侧树的已选中key
      selectedRows: [],
    }
  },
  created() {
    this.getWorkCenterTree()
  },
  methods: {
    handleSelected(selectedKeys, event) {
      let selectedRows = []
      event.selectedNodes.map((item) => {
        selectedRows.push(item.data.props)
      })
      this.selectedKeys = selectedKeys
      this.selectedRows = selectedRows
    },
    handleAdd() {
      this.$refs.WorkListModal.title = '新建'
      let record = {}
      this.$refs.WorkListModal.add(record)
    },
    handleModify() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个工作岗位')
        return
      }
      this.$refs.WorkListModal.title = '编辑'
      this.$refs.WorkListModal.edit(this.selectedRows[0])
    },
    handleDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个工作岗位')
        return
      }
      this.$confirm({
        title: '确定删除?',
        content: '删除后数据不可恢复，确定删除？',
        onOk: () => {
          postAction(this.url.del, { id: this.selectedRows[0].id }).then((res) => {
            if (res.code == 200) {
              this.$message.success('删除成功')
              this.handleRloadTree()
            }
          })
        },
      })
    },
    handleRloadTree() {
      this.getWorkCenterTree()
    },
    async getWorkCenterTree() {
      let params = {
        ...this.treeSearchParams,
      }
      let res = await postAction(this.url.list, params)
      if (res.code == 200) {
        console.log(res.data)
        this.treeData = res.data.map((item) => {
          item.scopedSlots = {
            title: 'customTitle',
          }
          item.title = item.postName
          item.children = []
          return item
        })
        this.selectedRows = []
        this.selectedKeys = []
      }
    },
  },
}
</script>

<style lang="less" scoped>
.h-custom-layout {
  height: 100%;
  .actions-icon {
    cursor: pointer;
  }
}
/deep/ .ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop{
  display: none;
}
</style>
<style lang="less">
.workcenter {
  position: relative;
  .ant-tabs {
    height: 100%;
    .ant-tabs-content {
      height: calc(100% - 56px);
      .ant-tabs-tabpane-active {
        height: 100%;
      }
    }
  }
}
</style>