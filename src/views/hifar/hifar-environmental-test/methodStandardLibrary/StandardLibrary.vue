<!--
 * @Author: 赵文凯
 * @Date: 2021-12-09 18:09:55
 * @LastEditTime: 2021-12-13 09:37:05
 * @LastEditors: 赵文凯
 * @Description:
 * @FilePath: \新建文件夹 (2)\tdm200-client\src\views\hifar\hifar-environmental-test\methodStandardLibrary\Standardlibrary.vue
-->
<template>
  <div ref="methodstandardlibrary" class="methodstandardlibrary custom-layouts">
    <r-l-layout class="custom-layouts" :leftMinWidth="280">
      <template slot="left">
        <h-edit-tree
          ref="physicoChemicalTrees"
          title="方法标准库"
          menuIcon="icon-bumen"
          fileIcon=""
          :tree="treeData"
          :replaceFields="replaceFields"
          :selectedKeys="selectedKeys"
          @onSelect="handleSelected"
        >
          <a-input-search
            allowClear
            slot="search-form"
            size="small"
            placeholder="请输入方法标准库名称"
            enter-button="搜索"
            v-model="treeSearchParams.c_methodName_7"
            @keyup.enter.native="getMethodStandardTree"
            @search="getMethodStandardTree"
          />
          <a-space slot="extra" class="actions-icon" align="end" size="small">
            <a-tooltip title="新建">
              <a-icon type="plus-circle" @click="handleAdd"/>
            </a-tooltip>
            <a-tooltip title="编辑">
              <a-icon type="edit" @click="handleModify"/>
            </a-tooltip>
            <a-tooltip title="删除">
              <h-icon class="danger-text" type="icon-shanchu" @click="handleDelete"/>
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
            <img slot="image" src="../../../../assets/no-data.png"/>
          </a-empty>
        </div>
        <template v-else>
          <parameters-library ref="parameterslibrary" :selectedRows='selectedRows'></parameters-library>
        </template>
      </div>
    </r-l-layout>
    <methods-standard-modal ref="methodsStandardModal" @change="handleReloadTree"></methods-standard-modal>
  </div>
</template>

<script>
import HEditTree from '@/views/components/HEditTree.js'
import {postAction} from '@/api/manage'
import ParametersLibrary from './modules/ParametersLibrary.vue'
import methodsStandardModal from './modules/methodsStandardModal.vue'

export default {
  components: {HEditTree, ParametersLibrary, methodsStandardModal},
  provide() {
    return {
      getContainer: () => this.$refs.methodstandardlibrary,
      selectedRows: () => this.selectedRows,
      selectedKeys: () => this.selectedKeys,
    }
  },
  data() {
    return {
      replaceFields: {
        children: 'children',
        title: 'methodName',
        key: 'id',
      },
      url: {
        // list: '/HfMethodStaLibParamBusiness/listAll',
        list: '/HfMethodStaLibBusiness/listAll',
        del: '/HfMethodStaLibBusiness/logicRemoveById',
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
      treeData: [],
      selectedKeys: [], // 左侧树的已选中key
      selectedRows: [],
    }
  },
  mounted() {
    this.handleReloadTree()
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
      let record = {}
      this.$refs.methodsStandardModal.show(record, '新建')
    },
    handleModify() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个方法')
        return
      }
      this.$refs.methodsStandardModal.show(this.selectedRows[0], '编辑')
    },
    handleDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个方法')
        return
      }
      this.$confirm({
        title: '确定删除?',
        content: '删除后数据不可恢复，确定删除？',
        onOk: () => {
          postAction(this.url.del, {id: this.selectedRows[0].id}).then((res) => {
            if (res.code == 200) {
              this.$message.success('删除成功')
              this.handleReloadTree()
            }
          })
        },
      })
    },
    handleReloadTree() {
      this.getMethodStandardTree()
    },
    async getMethodStandardTree(enent) {
      console.log("event",event)
      let params = {
        ...this.treeSearchParams,
      }
      let res = await postAction(this.url.list, params)
      if (res.code == 200) {
        this.treeData = res.data.map((item) => {
          item.scopedSlots = {
            title: 'customTitle',
          }
          item.title = item.methodName
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
.custom-layouts {
  height: 100%;

  .actions-icon {
    cursor: pointer;
  }
}

/deep/ .ant-tree-switcher {
  display: none !important;
}
</style>
