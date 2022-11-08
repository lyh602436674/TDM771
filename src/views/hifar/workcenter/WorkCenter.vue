<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-26 17:45:43
 * @LastEditTime: 2021-12-10 14:19:20
 * @LastEditors: 赵文凯
 * @Description: 工作中心管理页面
 * @FilePath: \新建文件夹 (2)\tdm200-client\src\views\hifar\workcenter\WorkCenter.vue
-->
<template>
  <div ref="workcenter" class="workcenter h-custom-layout">
    <r-l-layout class="h-custom-layout" :leftMinWidth="280">
      <template slot="left">
        <h-edit-tree
          ref="physicoChemicalTree"
          title="工作中心"
          menuIcon="icon-bumen"
          fileIcon="icon-xiangmuchengyuan"
          :tree="treeData"
          :replaceFields="replaceFields"
          :selectedKeys="selectedKeys"
          @onSelect="handleSelected"
        >
          <a-input-search
            v-model="treeSearchParams.c_workName_7"
            allowClear
            slot="search-form"
            size="small"
            placeholder="请输入工作中心名称"
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
          <a-empty description="请选择右方工作中心">
            <img slot="image" src="../../../assets/no-data.png" />
          </a-empty>
        </div>
        <template v-else>
          <work-center-detail ref="workCenterDetail"></work-center-detail>
        </template>
      </div>
    </r-l-layout>
    <work-center-modal ref="workCenterModal" @change="handleRloadTree"></work-center-modal>
  </div>
</template>

<script>
import HEditTree from '@/views/components/HEditTree.js'
import { postAction } from '@/api/manage'
import WorkCenterModal from './modules/WorkCenterModal'
import WorkCenterDetail from './modules/WorkCenterDetail'
export default {
  components: { HEditTree,
   WorkCenterModal, 
   WorkCenterDetail
    },
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
        title: 'workName',
        key: 'id',
      },
      url: {
        list: '/HfPrjWorkCenterBusiness/listAll',
        del: '/HfPrjWorkCenterBusiness/logicRemoveById',
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
      this.$refs.workCenterModal.title = '新建'
      let record = {
        groupCode: this.groupCode,
      }
      this.$refs.workCenterModal.add(record)
    },
    handleModify() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个工作中心')
        return
      }
      this.$refs.workCenterModal.title = '编辑'
      this.$refs.workCenterModal.edit(this.selectedRows[0])
    },
    handleDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个工作中心')
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
        this.treeData = res.data.map((item) => {
          item.scopedSlots = {
            title: 'customTitle',
          }
          item.title = item.workName
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
/deep/ .ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop {
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
