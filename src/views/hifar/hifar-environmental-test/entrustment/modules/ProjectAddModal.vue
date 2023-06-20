<!--
 * @Author: 赵峰
 * @Date: 2021-09-16 11:49:56
 * @LastEditTime: 2021-09-16 16:07:23
 * @LastEditors: 赵峰
 * @Descripttion: 项目添加
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\modules\ProjectAddModal.vue
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    title="添加项目"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
      <a-button :loading="submitLoading" type="primary" @click="handleSubmit">保存</a-button>
    </template>
    <r-l-layout :leftMinWidth="150" style="height: 100%">
      <template slot="left">
        <h-card fixed>
          <ul class="classify-list">
            <li v-for="item in treeData" :key="item.id" @click="(e)=>handleSelected(e,item)">
              <h-icon type="icon-xiangmuchengyuan"/>
              {{ item.classifyName }}
            </li>
          </ul>
        </h-card>
      </template>
      <template slot="right">
        <h-card fixed>
          <h-search
            slot="search-form"
            v-model="queryParams"
            :data="columns"
            :showToggleButton="false"
            style="width: 100%"
            @change="refresh"
          />
          <h-vex-table
            ref="projectTable"
            slot="content"
            :columns="columns"
            :data="loadProjectList"
            historySelect
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
          />
        </h-card>
      </template>
    </r-l-layout>
  </h-modal>
</template>

<script>
import {getAction} from '@/api/manage'
import HEditTree from "@views/components/HEditTree";

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    }
  },
  props: {
    allowEmpty: {
      type: Boolean,
      default: false
    }
  },
  components: {HEditTree},
  data() {
    return {
      visible: false,
      submitLoading: false,
      queryParams: {},
      selectedRowKeys: [],
      selectedRows: [],
      treeData: [],
      selectedTreeKeys: [],
      replaceFields: {
        title: 'classifyName',
        key: 'id',
      },
      columns: [
        {
          title: '项目名称',
          dataIndex: 'unitName',
          key: 'c_unitName_7',
          formType: 'input',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '项目编码',
          dataIndex: 'unitCode',
          key: 'c_unitCode_7',
          formType: 'input',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '所属分类',
          dataIndex: 'classifyName',
          key: 'c_classifyName_7',
          formType: 'input',
          customRender: (text) => {
            return text || '--'
          }
        }
      ],
      groupCode: 'env',
      url: {
        list: '/HfPrjUnitClassifyBusiness/pageUnitByClassify',
        treeList: "/HfPrjUnitClassifyBusiness/listClassify"
      },
    }
  },
  methods: {
    show(selectedRowKeys) {
      this.visible = true
      this.getProjectTree()
      this.selectedRowKeys = selectedRowKeys
    },
    getProjectTree() {
      getAction(this.url.treeList).then((res) => {
        if (res.code === 200) {
          this.treeData = res.data
        }
      })
    },
    handleSelected(e, item) {
      [].forEach.call(e.target.parentNode.children, (item => {
        item.classList.remove('active')
      }))
      e.srcElement.classList.add('active')
      this.selectedTreeKeys = item.id
      this.refresh()
    },
    refresh(bool = false) {
      this.$refs.projectTable.refresh(bool)
    },
    loadProjectList(params) {
      let data = {
        ...params,
        ...this.queryParams,
        id: this.selectedTreeKeys
      }
      return getAction(this.url.list, data).then((res) => {
        if (res.code === 200) {
          return res.data
        }
      })
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCancel() {
      this.queryParams = {}
      this.visible = false
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    handleSubmit() {
      if (this.submitLoading) return
      this.submitLoading = true
      if (!this.selectedRowKeys.length && !this.allowEmpty) {
        return this.$message.warning('请先选择项目!')
      }
      /**
       * 这里解释一下
       * 如果没有重新选择表格数据，那么应该拿的是checkboxRecords，因为默认没有带入具体选中的行数据，只有rowId
       * 如果重新选择了表格数据，那么直接拿this.selectedRows就可以，因为操作表格后，this.selectedRows永远是最新选中行数据
       * */
      let checkboxRecords = this.$refs.projectTable.getCheckboxRecords(true)
      let currSelectedRows = this.selectedRows
      let selectedRows = currSelectedRows.length ? currSelectedRows : checkboxRecords
      this.handleCancel()
      this.$emit('change', this.selectedRowKeys, selectedRows)
      this.submitLoading = false
    },
  },
}
</script>

<style lang="less" scoped>
.classify-list {
  padding: 0;
  width: 100%;

  li {
    cursor: pointer;
    margin: 5px;
    padding: 5px;
    border-radius: 3px;
    list-style: none;
    transition: all 0.3s;

    &:hover:not(.active) {
      background-color: #E6F7FF;
    }
  }

  .active {
    background-color: #bae7ff;
  }
}
</style>