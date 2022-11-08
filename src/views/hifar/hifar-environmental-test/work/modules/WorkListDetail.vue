<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 14:45:40
 * @LastEditTime: 2021-11-30 15:12:33
 * @LastEditors: 马潭龙
 * @Descripttion: 岗位管理详情组件
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\work\modules\WorkListDetail.vue
-->
<template>
  <div ref="postionUser" style="height: 100%; position: relative">
    <h-card :bordered="false" :fixed="true" :title="postionDetail.postName + '-人员'">
      <h-search
        slot="search-form"
        v-model="queryParams"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="handleSearch"
      />
      <div slot="table-operator">
        <a-button v-has="'post:add'" type="ghost-primary" icon="plus" size="small" @click="selectedUser">添加人员</a-button>
        <a-button v-has="'post:delete'" type="danger" icon="delete" size="small" @click="handleDelBatch">
          批量删除
        </a-button>
      </div>
      <h-vex-table
        slot="content"
        ref="centerUserTable"
        :columns="columns"
        :data="loadData"
        :rowSelection="{
          columnWidth: 60,
          columnTitle: '#',
          selectedRowKeys: selectedRowKeys,
          onChange: onSelect,
          type: 'checkbox',
        }"
      >
        <div slot="idName" slot-scope="text, record">
          {{ record.idName }}
        </div>
        <template slot="actions" slot-scope="text, record">
          <a-popconfirm title="确定删除吗？" @confirm="() => handleDelete(record.id)">
            <h-icon type="icon-shanchu" class="danger-text" />
          </a-popconfirm>
        </template>
      </h-vex-table>
    </h-card>
    <work-list-select-user ref="WorkListSelectUser" @change="refresh"></work-list-select-user>
  </div>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import WorkListSelectUser from './WorkListSelectUser.vue'
import mixin from '@/views/hifar/mixin.js'
export default {
  components: { WorkListSelectUser },
  mixins:[mixin],
  inject: {
    selectedRows: {
      default: () => {},
    },
  },
  provide() {
    return {
      customGetContainer: () => this.$refs.postionUser,
      columns: this.columns,
      searchBar: this.searchBar,
      postId: () => this.postId
    }
  },
  data() {
    return {
      url: {
        list: '/OrgPostUserBusiness/listPageUserByPostId',
        del: '/OrgPostUserBusiness/removePostUsers'
      },
      postId: null,
      queryParams: {},
      dataType: 'user',
      searchBar: [
        {
          title: '姓名',
          key: 'c_idName_7',
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
        {
          title: '电话',
          key: 'c_mobile_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '姓名',
          dataIndex: 'idName',
          scopedSlots: {
            customRender: 'idName',
          },
        },
        {
          title: '性别',
          dataIndex: 'sex',
          customRender: (text) => {
            return text == 1 ? '男' : text == 2 ? '女' : '保密'
          },
        },
        {
          title: '岗位名称',
          dataIndex: 'postName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '电话',
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          width: 60,
          align: 'center',
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          postId: this.postionDetail.id,
        }
        this.postId = this.postionDetail.id
        return getAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      selectedRowKeys: [],
    }
  },
  computed: {
    postionDetail() {
      return this.selectedRows()[0] || {}
    },
  },
  watch: {
    postionDetail() {
      this.refresh(true)
    },
  },
  methods: {
    handleSearch(v) {
      this.queryParams = v
      this.refresh(true)
    },
    refresh(bool = false) {
      if (bool) {
        this.selectedRowKeys = []
      }
      this.$refs.WorkListSelectUser.handleCancel()
      this.$refs.centerUserTable.refresh(bool)
    },
    selectedUser() {
      this.$refs.WorkListSelectUser.show()
    },
    onSelect(selectedRowKeys) {
      console.log('选中的行', selectedRowKeys)
      this.selectedRowKeys = selectedRowKeys
    },
    handleDelBatch() {
      if(this.selectedRowKeys.length){
      this.$confirm({
        title: '确认删除？',
        content: '删除后可以重新点击添加用户重新添加，确认删除？',
        onOk: () => {
          this.handleDelete(this.selectedRowKeys.join(','))
        },
      })
      }else{
        this.openNotificationWithIcon('error','删除提示', '请至少选择一项')
      }
    },
    handleDelete(id) {
      let params = {
        postId: this.postionDetail.id,
        userIds: id,
      }
      postAction(this.url.del, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        }
      })
    },
  },
}
</script>

<style>
</style>