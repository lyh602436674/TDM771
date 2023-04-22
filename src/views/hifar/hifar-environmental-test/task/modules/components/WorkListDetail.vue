<!--
 * @Author: 赵峰
 * @Date: 2021-11-01 16:28:42
 * @LastEditTime: 2021-11-17 09:39:36
 * @LastEditors: 赵峰
 * @Descripttion: 岗位管理--人员
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\WorkListDetail.vue
-->
<template>
  <div ref="postionUser" style="height: 100%; position: relative">
    <h-card :bordered="false" :fixed="true" title="人员列表">
      <h-search
        slot="search-form"
        v-model="queryParams"
        size="small"
        :showToggleButton="false"
        :data="searchBar"
        style="width: 100%"
        @change="handleSearch"
      />
      <h-vex-table
        slot="content"
        ref="centerUserTable"
        :autoLoad="false"
        :columns="columns"
        :data="loadData"
        historySelect
        :rowSelection="{
          columnWidth: 60,
          columnTitle: '#',
          selectedRowKeys: selectedRowKeys,
          onChange: onSelect,
          type: type,
        }"
      >
        <div slot="idName" slot-scope="text, record">
          {{ record.idName }}
        </div>
      </h-vex-table>
    </h-card>
  </div>
</template>

<script>
import {getAction} from '@/api/manage'

export default {
  props: {
    postId: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'checkbox'
    },
    selectedTreeRows: {
      type: [Array, Object],
      default: () => []
    },
  },
  watch: {
    postId(val) {
      if (val) {
        this.$nextTick(() => {
          this.refresh(true)
        })
      }
    }
  },
  data() {
    return {
      url: {
        list: '/OrgPostUserBusiness/listPageUserByPostId'
      },
      queryParams: {},
      dataType: 'user',
      searchBar: [
        {
          title: '姓名',
          key: 'c_idName_7',
          formType: 'input'
        },
        {
          title: '性别',
          key: 'c_sex_1',
          formType: 'select',
          options: [
            {
              title: '男',
              key: '1',
              value: '1'
            },
            {
              title: '女',
              key: '2',
              value: '2'
            },
            {
              title: '保密',
              key: '0',
              value: '0'
            }
          ]
        },
        {
          title: '电话',
          key: 'c_mobile_7',
          formType: 'input'
        }
      ],
      columns: [
        {
          title: '姓名',
          dataIndex: 'idName',
          scopedSlots: {
            customRender: 'idName'
          }
        },
        {
          title: '性别',
          dataIndex: 'sex',
          customRender: (text) => {
            return text == 1 ? '男' : text == 2 ? '女' : '保密'
          }
        },
        {
          title: '部门名称',
          dataIndex: 'deptName',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '电话',
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          }
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          postId: this.postId,
        }
        return getAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            let selectedTreeRows = {
              postId: this.selectedTreeRows[0].id,
              postName: this.selectedTreeRows[0].postName
            }
            return Object.assign({}, res.data, {
              data: res.data.data.map(item => {
                return {
                  ...item,
                  ...selectedTreeRows,
                }
              })
            })
          }
        })
      },
      selectedRowKeys: []
    }
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
      this.$refs.centerUserTable.refresh(bool)
    },
    onSelect(selectedRowKeys, selectedRow) {
      this.selectedRowKeys = selectedRowKeys
      this.$emit('change', selectedRow)
    }
  }
}
</script>

<style>
</style>
