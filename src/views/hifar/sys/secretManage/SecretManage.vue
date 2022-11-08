<!--
 * @Author: 陈乾龙
 * @Date: 2021-06-24 10:47:53
 * @LastEditTime: 2021-09-07 09:43:34
 * @LastEditors: 赵峰
 * @Description: 密级管理页面
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\secretManage\SecretManage.vue
-->
<template>
  <h-card fixed title="人员密级管理">
    <!-- 查询条件 -->
    <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh" />
    <!-- 高级搜索  -->
    <template slot="extra">
      <secret-select
        ref="SecretSelect"
        v-show="selectedRowKeys.length"
        @select="handleSecretSelect"
        style="margin-right: 5px"
      />
    </template>

    <!-- 表格区域 -->
    <h-vex-table
      slot="content"
      ref="secretTable"
      :columns="columns"
      :data="loadData"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
    >
      <div slot="status" slot-scope="text, record">
        <h-tag
          type="1"
          :status="record.status == 1 ? 'start' : 'stop'"
          style="font-size: 35px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
        />
      </div>
      <template slot="secretName" slot-scope="text, record">
        <a-dropdown>
          <a class="ant-dropdown-link">
            {{ record.secretName || '--' }}
          </a>
          <a-menu slot="overlay" @click="(item) => handleModify(item, record)">
            <a-menu-item v-for="(item, index) in $refs.SecretSelect.secretList || []" :key="index">{{
              item.itemValue
            }}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </h-vex-table>
  </h-card>
</template>

<script>
import SecretSelect from './components/SecretSelect'
import { postAction } from '@/api/manage'

export default {
  name: 'UserList',
  components: {
    SecretSelect,
  },
  data() {
    return {
      queryParams: {},
      columns: [
        {
          title: '用户账号',
          align: 'center',
          dataIndex: 'userCode',
        },
        {
          title: '用户姓名',
          align: 'center',
          width: 100,
          dataIndex: 'idName',
        },
        {
          title: '手机号码',
          align: 'center',
          width: 100,
          dataIndex: 'mobile',
          customRender(t, r) {
            return t || '--'
          },
        },
        {
          title: '座机',
          align: 'center',
          width: 100,
          dataIndex: 'telephone',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '部门',
          align: 'center',
          width: 180,
          dataIndex: 'deptName',
          customRender(t, r) {
            return t || '--'
          },
        },
        {
          title: '状态',
          align: 'center',
          width: 80,
          dataIndex: 'status',
          scopedSlots: {
            customRender: 'status',
          },
        },
        {
          title: '密级',
          scopedSlots: { customRender: 'secretName' },
          align: 'center',
          width: 170,
        },
      ],
      searchForm: [
        {
          title: '姓名',
          key: 'c_idName_7',
          formType: 'input',
        },
        {
          title: '账号',
          key: 'c_userCode_7',
          formType: 'input',
        },
        {
          title: '手机号',
          key: 'c_mobile_7',
          formType: 'input',
        },
        {
          title: '座机',
          key: 'c_telephone_7',
          formType: 'input',
        },
        {
          title: '状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '正常',
              key: 1,
              value: 1,
            },
            {
              title: '冻结',
              key: 2,
              value: 2,
            },
          ],
        },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      url: {
        list: '/SysSecretLevel/listPage',
        setSecret: '/SysSecretLevel/setUserSecretLevel',
      },
    }
  },
  methods: {
    refresh(bool = false) {
      this.$refs.secretTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    handleModify(item, record) {
      console.log(item, record)
      this.selectedRowKeys = [record.id]
      this.$refs.SecretSelect.handleMenuClick({ key: item.key })
    },
    handleSecretSelect(secret) {
      this.$confirm({
        title: '确认',
        content: `您确定修改密级为${secret.itemValue}?`,
        cancelButtonProps: {
          props: {
            type: 'danger',
            ghost: true,
          },
        },
        onOk: () => {
          postAction(this.url.setSecret, {
            ids: this.selectedRowKeys.join(','),
            secretLevel: secret.itemKey,
          }).then((res) => {
            if (res.code == 200) {
              this.$message.success('设置成功')
              this.refresh()
            }
          })
        },
      })
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
    },
  },
}
</script>