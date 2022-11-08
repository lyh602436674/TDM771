<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 14:54:20
 * @LastEditTime: 2021-11-30 15:17:53
 * @LastEditors: 马潭龙
 * @Descripttion: 数据源管理
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\backup\Datasource.vue
-->
<template>
  <div ref="dbBackup" class="db-backup">
    <h-card fixed title="数据备份">
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" :showToggleButton="false" @change="refresh" />
      <template slot="table-operator">
        <a-button v-has="'backups:add'" type="ghost-primary" icon="plus" size="small" @click="handleCreateNew">新建</a-button>
      </template>
      <h-vex-table ref="dbBackupTable" slot="content" :columns="columns" :data="loadData">
        <template slot="actions" slot-scope="text, record">
          <a-icon type="edit" class="primary-text" title="编辑" @click="() => handleModify(record)" />
          <a-divider type="vertical" />
          <a-popconfirm title="确认删除？" @confirm="() => handleDelete(record)">
            <h-icon type="icon-shanchu" class="danger-text" />
          </a-popconfirm>
        </template>
      </h-vex-table>
    </h-card>
    <datasource-modal ref="datasourceModal" @change="refresh" />
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import DatasourceModal from './modules/DatasourceModal.vue'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.dbBackup,
    }
  },
  components: { DatasourceModal },
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '数据源名称',
          key: 'c_datasourceName_7',
          formType: 'input',
        },
        {
          title: '数据源编码',
          key: 'c_datasourceCode_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '数据源名称',
          minWidth: 120,
          dataIndex: 'datasourceName',
        },
        {
          title: '数据源编码',
          dataIndex: 'datasourceCode',
          minWidth: 130,
        },
        {
          title: '数据源类型',
          dataIndex: 'datasourceTypeName',
          minWidth: 100,
        },
        {
          title: '驱动类',
          dataIndex: 'driverClassName',
          minWidth: 180,
        },
        {
          title: '数据源地址',
          dataIndex: 'linkUrl',
          minWidth: 180,
        },
        {
          title: '数据库名称',
          dataIndex: 'databaseName',
          minWidth: 120,
        },
        {
          title: '用户名',
          dataIndex: 'userName',
          minWidth: 100,
        },
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          width: 100,
          dataIndex: 'actions',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
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
      url: {
        list: '/SysDatasourceConfigBusiness/listPage',
        delete: '/SysDatasourceConfigBusiness/logicRemoveById',
      },
    }
  },

  methods: {
    refresh(bool = true) {
      this.$refs.dbBackupTable.refresh(bool)
    },
    handleCreateNew() {
      this.$refs.datasourceModal.add()
    },
    handleModify(record) {
      this.$refs.datasourceModal.edit(record)
    },
    handleDelete(record) {
      let params = {
        id: record.id,
      }
      postAction(this.url.delete, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh()
        }
      })
    },
  },
}
</script>
<style lang="less">
.db-backup {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>