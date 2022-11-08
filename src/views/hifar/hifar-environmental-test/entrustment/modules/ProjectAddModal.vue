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
    @submit="handleSubmit"
  >
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
  components: {HEditTree},
  data() {
    return {
      // 添加弹窗相关
      visible: false,
      allowEmpty: false,
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
    async getProjectTree() {
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
    refresh(bool = true) {
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
      this.allowEmpty = false
      this.selectedRowKeys = []
    },
    handleSubmit() {
      if (!this.selectedRowKeys.length && !this.allowEmpty) {
        this.$message.warning('请先选择项目!')
        return
      }
      this.handleCancel()
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
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