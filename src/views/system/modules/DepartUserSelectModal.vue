<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-02 15:51:12
 * @LastEditTime: 2021-08-03 16:50:03
 * @LastEditors: 陈乾龙
 * @Description: 部门用户选择组件
 * @FilePath: \hifar-platform-client\src\views\system\modules\DepartUserSelectModal.vue
-->
<template>
  <h-modal
    destroyOnClose
    :visible="visible"
    :inner="true"
    :fullScreen="true"
    :title="title"
    :getContainer="() => getContainer()"
    :confirmLoading="loading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <h-card :bordered="false" style="height:100%;padding:5px;">
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <h-vex-table
        ref="departNotUser"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{
          columnWidth: 60,
          columnTitle: '#',
          selectedRowKeys: selectedRowKeys,
          onSelect: onSelect,
          type: 'checkbox',
        }"
      >
        <template slots="status" slot-scope="text, record">
          <h-icon v-if="record.status == 1" type="icon-qiyong" class="primary-text" />
          <h-icon v-else-if="record.status == 2" type="icon-yidongjie" class="danger-text" />
        </template>
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
export default {
  inject: ['getContainer'],
  data() {
    return {
      title: '选择员工',
      visible: false,
      loading: false,
      queryParams: {},
      departId: null,
      url: {
        list: '/OrgDeptUserBusiness/listPageUserByNotDeptId',
      },
      searchBar: [
        {
          title: '姓名',
          key: 'c_idName_7',
          formType: 'input',
        },
        {
          title: '电话',
          key: 'c_mobile_7',
          formType: 'input',
        },
        {
          title: '座机',
          key: 'c_telephone_7',
          formType: 'input',
        },
        {
          title: '性别',
          key: 'c_sex_1',
          formType: 'select',
          options: [
            {
              title: '男',
              key: '1',
              value: '1',
            },
            {
              title: '女',
              key: '2',
              value: '2',
            },
            {
              title: '保密',
              key: '0',
              value: '0',
            },
          ],
        },
      ],
      columns: [
        {
          title: '姓名',
          dataIndex: 'idName',
        },
        {
          title: '电话',
          dataIndex: 'mobile',
        },
        {
          title: '座机',
          dataIndex: 'telephone',
        },
        {
          title: '性别',
          customRender: (text, record) => {
            return record.sex == 1 ? '男' : record.sex == 2 ? '女' : '保密'
          },
        },
        {
          title: '状态',
          scopedSlots: {
            customRender: 'status',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          deptId: this.departId,
        }
        return getAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  methods: {
    refresh(bool = false) {
      this.$refs.departNotUser.refresh(bool)
    },
    show(departId) {
      // 初始化选中的值
      this.departId = departId
      this.selectedRowKeys = []
      this.selectedRows = []
      this.visible = true
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleSubmit() {
      if (this.selectedRowKeys && this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择人员')
        return
      }
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
    },
    handleCancel() {
      this.departId = null
      this.loading = false
      this.visible = false
    },
  },
}
</script>

<style lang='less' scoped>
</style>