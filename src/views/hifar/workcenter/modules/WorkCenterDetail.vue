<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-04 13:55:39
 * @LastEditTime: 2021-11-30 13:46:19
 * @LastEditors: 马潭龙
 * @Description: 工作中心详情组件
 * @FilePath: \hifar-platform-client\src\views\hifar\workcenter\modules\WorkCenterDetail.vue
-->
<template>
  <div ref="workCenterUser" style="height: 100%; position: relative">
    <h-card :bordered="false" :fixed="true" :title="workCenterDetail.workName + '-人员管理'">
      <h-search
        slot="search-form"
        v-model="queryParams"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="handleSearch"
      />
      <div slot="table-operator">
        <a-button v-has="'workCenter:add'" type="ghost-primary" icon="plus" size="small" @click="selectedUser">添加用户</a-button>
         <template>
          <a-button v-has="'workCenter:delete'" type="danger" size="small" icon="delete" @click="handleDelBatch">
            批量删除
          </a-button>
        </template>
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
          <a-tooltip title="中心负责人">
            <h-icon
              v-if="record.dataType == 'manager'"
              type="icon-fuzeren"
              class="primary-text"
              style="font-size: 16px"
            />
          </a-tooltip>
        </div>
        <template slot="actions" slot-scope="text, record">
          <a-popconfirm title="确定删除吗？" @confirm="() => handleDelete(record.id)">
            <h-icon type="icon-shanchu" class="danger-text" />
          </a-popconfirm>
          <a-divider type="vertical"></a-divider>
          <a-tooltip v-if="record.dataType === 'user'" title="设置成负责人">
            <h-icon
              class="primary-text"
              type="icon-bumenfuzeren1"
              @click="() => handleSetManager(record.id, 'manager')"
            />
          </a-tooltip>
          <a-tooltip v-else title="取消负责人">
            <h-icon class="danger-text" type="icon-bumenfuzeren" @click="() => handleSetManager(record.id, 'user')" />
          </a-tooltip>
        </template>
      </h-vex-table>
    </h-card>
    <work-center-select-user ref="workCenterSelectUser" @change="refresh"></work-center-select-user>
  </div>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import WorkCenterSelectUser from './WorkCenterSelectUser.vue'
import mixin from '@/views/hifar/mixin.js'
export default {
  components: { WorkCenterSelectUser },
  mixins:[mixin],
  inject: {
    selectedRows: {
      default: () => {},
    },
  },
  provide() {
    return {
      customGetContainer: () => this.$refs.workCenterUser,
      columns: this.columns,
      searchBar: this.searchBar,
      workCenterId: () => this.workCenterId,
      dataType: this.dataType,
    }
  },
  data() {
    return {
      url: {
        list: '/HfPrjWorkCenterUserBusiness/listPageUserByCenterId',
        del: '/HfPrjWorkCenterUserBusiness/removeCenterUsers',
        setManager: '/HfPrjWorkCenterUserBusiness/setUserType',
      },
      workCenterId: null,
      queryParams: {},
      dataType: 'user',
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
          title: '电话',
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '座机',
          dataIndex: 'telephone',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          width: 140,
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
          centerId: this.workCenterDetail.id,
          dataType: this.dataType,
        }
        this.workCenterId = this.workCenterDetail.id
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
    workCenterDetail() {
      return this.selectedRows()[0] || {}
    },
  },
  watch: {
    workCenterDetail() {
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
      this.$refs.workCenterSelectUser.handleCancel()
      this.$refs.centerUserTable.refresh(bool)
    },
    selectedUser() {
      this.$refs.workCenterSelectUser.show()
    },
    onSelect(selectedRowKeys) {
      console.log('选中的行', selectedRowKeys)
      this.selectedRowKeys = selectedRowKeys
    },
    handleDelBatch() {
      this.$confirm({
        title: '确认删除？',
        content: '删除后可以重新点击添加用户重新添加，确认删除？',
        onOk: () => {
          this.handleDelete(this.selectedRowKeys.join(','))
        },
      })
    },
    // 批量删除
    // batchDel() {
    //   let _this = this
    //   if (_this.selectedRowKeys.length) {
    //     this.$confirm({
    //       title: '确认删除',
    //       content: '删除后不可恢复，确认删除？',
    //       onOk: function () {
    //         postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
    //           if (res.code === 200) {
    //             _this.$message.success('删除成功')
    //             _this.refresh()
    //             _this.selectedRowKeys = []
    //             _this.selectedRows = []
    //           } else {
    //             _this.$message.warning(res.msg)
    //           }
    //         })
    //       },
    //     })
    //   }else{
    //     this.openNotificationWithIcon('error','删除提示', '请至少选择一项')
    //   }
    // },
    handleDelete(id) {
      let params = {
        centerId: this.workCenterDetail.id,
        dataType: this.dataType,
        userIds: id,
      }
      postAction(this.url.del, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        }
      })
    },
    handleSetManager(ids, dataType) {
      let params = {
        centerId: this.workCenterDetail.id,
        userIds: ids,
        dataType,
      }
      postAction(this.url.setManager, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(dataType == 'user' ? '取消负责人成功' : '设置负责人成功')
          this.refresh()
        }
      })
    },
  },
}
</script>

<style>
</style>