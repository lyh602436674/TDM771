<!--
 * @Author: 赵峰
 * @Date: 2021-11-01 16:21:18
 * @LastEditTime: 2021-11-17 09:33:49
 * @LastEditors: 赵峰
 * @Descripttion: 岗位--人员选择弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\PostionModal.vue
-->
<template>
  <h-modal
    :title="title"
    destroyOnClose
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <r-l-layout class="h-custom-layout" :leftMinWidth="280">
      <template slot="left">
        <h-edit-tree
          ref="physicoChemicalTree"
          title="岗位"
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
        </h-edit-tree>
      </template>
      <div slot="right" style="background: #fff; height: 100%">
        <work-list-detail
          ref="WorkListDetail"
          :post-id="selectedKeys.toString()"
          :selectedTreeRows="selectedRows"
          :type="type"
          @change="selectPersonChange"></work-list-detail>
      </div>
    </r-l-layout>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import HEditTree from '@/views/components/HEditTree.js'
import WorkListDetail from './components/WorkListDetail'

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  props: {
    type: {
      type: String,
      default: 'checkbox'
    },
  },
  components: {
    HEditTree,
    WorkListDetail
  },

  data() {
    return {
      visible: false,
      confirmLoading: false,
      loading: false,
      title: '选择人员',
      customParams: {},
      replaceFields: {
        children: 'children',
        title: 'postName',
        key: 'id'
      },
      url: {
        list: '/OrgPostBusiness/listAll',
        del: '/OrgPostBusiness/logicRemoveById'
      },
      treeSearchParams: {},
      treeFormData: [
        {
          title: '分类名称',
          key: 'classifyName',
          formType: 'input'
        },
        {
          title: '项目名称',
          key: 'unitName',
          formType: 'input'
        }
      ],
      treeData: [], // 左侧的树的数据
      selectedKeys: [], // 左侧树的已选中key
      selectedRows: [],
      selectedPersonRows: [],
    }
  },
  methods: {
    show(record, title, customParams = {}) {
      this.visible = true
      this.title = title
      this.customParams = customParams
      this.getWorkCenterTree()
    },
    handleCancel() {
      this.visible = false
      this.selectedPersonRows = []
    },
    handleSelected(selectedKeys, event) {
      let selectedRows = []
      event.selectedNodes.map((item) => {
        selectedRows.push(item.data.props)
      })
      this.selectedKeys = selectedKeys
      this.selectedRows = selectedRows
    },
    async getWorkCenterTree() {
      let params = {
        ...this.treeSearchParams,
        ...this.customParams
      }
      let res = await postAction(this.url.list, params)
      if (res.code === 200) {
        this.treeData = res.data.map((item) => {
          item.scopedSlots = {
            title: 'customTitle'
          }
          item.title = item.postName
          item.children = []
          return item
        })
        try {
          this.selectedRows = [this.treeData[0]]
          this.selectedKeys = [this.treeData[0].id]
        } catch {
        }
        this.$refs.WorkListDetail.refresh()
      }
    },
    selectPersonChange(arrVal) {
      this.selectedPersonRows = arrVal
    },
    handleSubmit() {
      this.$emit('change', this.selectedPersonRows)
      this.handleCancel()
    }
  }
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
