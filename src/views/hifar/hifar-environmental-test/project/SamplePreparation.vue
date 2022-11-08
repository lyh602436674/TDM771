<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-30 19:05:50
 * @LastEditTime: 2021-08-30 15:28:06
 * @LastEditors: 赵峰
 * @Description: 试品加工
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-physico-chemical\project\SamplePreparation.vue
-->
<template>
  <div class="h-custom-layout">
    <r-l-layout class="h-custom-layout" :leftMinWidth="280">
      <template slot="left">
        <h-edit-tree
          ref="physicoChemicalTree"
          title="检测项目"
          menuIcon="icon-fenlei"
          fileIcon="icon-xiangmuchengyuan"
          :tree="treeData"
          :replaceFields="replaceFields"
          :selectedKeys="selectedKeys"
          @onSelect="handleSelected"
        >
          <a-input-search
            v-model="treeSearchParams.unitName"
            allowClear
            slot="search-form"
            size="small"
            placeholder="请输入项目名称"
            enter-button="搜索"
            @keyup.enter.native="getProjectTree"
            @search="getProjectTree"
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
          <a-empty description="请选择左方的分类或者项目">
            <img slot="image" src="../../../../assets/no-data.png" />
          </a-empty>
        </div>
        <template v-else>
          <!-- 这里展示对应的分类详情或项目详情组件 -->
          <!-- 分类信息 -->
          <classify-info v-if="selectedRows[0] && selectedRows[0].type == 'classify'" ref="classifyInfo" />
          <!-- 项目信息 -->
          <unit-info v-if="selectedRows[0] && selectedRows[0].type == 'unit'" ref="unitInfo" />
        </template>
      </div>
    </r-l-layout>
    <classify-and-unit-modal ref="classifyAndUnitModal" @ok="handleRloadTree" />
  </div>
</template>

<script>
import HEditTree from '@/views/components/HEditTree.js'
import { chemicalTree } from '@/api/api'
import { postAction } from '@/api/manage'
import classifyAndUnitModal from './modules/ClassifyAndUnitModal'
import classifyInfo from './modules/ClassifyInfo'
import unitInfo from './modules/UnitInfo.vue'
export default {
  components: { HEditTree, classifyAndUnitModal, classifyInfo, unitInfo },
  provide() {
    return {
      groupCode: this.groupCode,
    }
  },
  data() {
    return {
      replaceFields: {
        children: 'children',
        title: 'itemTitle',
        key: 'id',
      },
      groupCode: 'sample',
      url: {
        classifyDelete: '/HfPrjUnitClassifyBusiness/logicRemoveById',
        unitDelete: '/HfPrjUnitBaseBusiness/logicRemoveById',
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
    this.getProjectTree()
  },
  methods: {
    handleSelected(selectedKeys, event) {
      let selectedRows = []
      event.selectedNodes.map((item) => {
        selectedRows.push(item.data.props)
      })
      this.selectedKeys = selectedKeys
      this.selectedRows = selectedRows
      this.$nextTick(() => {
        if (selectedRows.length) {
          if (selectedRows[0].type == 'classify') {
            this.$refs.classifyInfo.getDetail(this.selectedKeys[0])
          } else {
            // 这里展示项目的信息，传入0~5可以切换不同的tab
            this.$refs.unitInfo.show(0, this.selectedKeys[0])
          }
        }
      })
    },
    handleAdd() {
      this.$refs.classifyAndUnitModal.title = '新建'
      let record = {
        groupCode: this.groupCode,
      }
      this.$refs.classifyAndUnitModal.add(record)
    },
    handleModify() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个检测分类或项目')
        return
      }
      this.$refs.classifyAndUnitModal.title = '编辑'
      this.$refs.classifyAndUnitModal.edit(this.selectedRows[0])
    },
    handleDelete() {
      if (!this.selectedRows.length) {
        this.$message.warning('请选择一个检测分类或项目')
        return
      }
      this.$confirm({
        title: '确定删除?',
        content: '删除后数据不可恢复，确定删除？',
        onOk: () => {
          let delUrl = null
          let selectedRow = this.selectedRows[0]
          if (selectedRow.type == 'unit') {
            delUrl = this.url.unitDelete
          } else {
            delUrl = this.url.classifyDelete
          }
          postAction(delUrl, { id: selectedRow.id }).then((res) => {
            if (res.code == 200) {
              this.$message.success('删除成功')
              this.handleRloadTree()
            }
          })
        },
      })
    },
    handleRloadTree() {
      this.getProjectTree()
    },
    async getProjectTree() {
      let params = {
        groupCode: this.groupCode,
        ...this.treeSearchParams,
      }
      let res = await chemicalTree(params)
      if (res.code == 200) {
        this.treeData = res.data
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
</style>