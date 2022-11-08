<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-06 14:49:56
 * @LastEditTime: 2021-08-26 13:39:45
 * @LastEditors: 陈乾龙
 * @Description: 项目分类弹窗选择器
 * @FilePath: \hifar-platform-client\src\views\hifar\project\components\ProjectUnitSelect.vue
-->
<template>
  <h-modal
    destroyOnClose
    inner
    fullScreen
    :title="title"
    :width="600"
    :visible="visible"
    :confirmLoading="loading"
    :getContainer="getContainer"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <h-card fixed>
      <h-search
        v-model="queryParams"
        slot="search-form"
        :showToggleButton="false"
        :data="columns"
        @change="() => refresh(true)"
      />
      <h-vex-table
        ref="unitSelectTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
    groupCode: {
      default: null,
    },
  },
  data() {
    return {
      title: '选择项目',
      visible: false,
      loading: false,
      queryParams: {},
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
          },
        },
      ],
      url: {
        list: '/HfPrjUnitBaseBusiness/listPage',
      },
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    handleSubmit() {
      this.handleCancel()
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
    },
    handleCancel() {
      this.visible = false
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    refresh(bool = true) {
      this.$refs.unitSelectTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        groupCode: this.groupCode,
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
  },
}
</script>