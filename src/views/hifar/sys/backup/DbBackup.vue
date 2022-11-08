<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 14:55:17
 * @LastEditTime: 2021-10-28 11:52:08
 * @LastEditors: 赵峰
 * @Descripttion: 数据备份
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\backup\DbBackup.vue
-->
<template>
  <div ref="dbBackup" class="db-backup">
    <h-card fixed title="数据备份">
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh" />
      <h-vex-table slot="content" ref="dbBackupTable" :columns="columns" :data="loadData">
        <template slot="actions" slot-scope="text, record">
          <a-tooltip title="手动备份">
            <h-icon type="icon-shoudong" class="primary-text" @click="() => handleManual(record)" />
          </a-tooltip>
          <a-divider type="vertical" />
          <a-tooltip title="备份历史">
            <h-icon type="icon-guidang" class="warning-text" @click="() => showBackupHistory(record)" />
          </a-tooltip>
        </template>
      </h-vex-table>
    </h-card>
    <db-backup-drawer ref="dbBackupDrawer"></db-backup-drawer>
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import DbBackupDrawer from './modules/DbBackupDrawer.vue'
import moment from 'moment'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.dbBackup,
    }
  },
  components: { DbBackupDrawer },
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '数据源编码',
          key: 'c_datasourceCode_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '数据源编码',
          dataIndex: 'datasourceCode',
          minWidth: 130,
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '数据库类型',
          dataIndex: 'datasourceTypeName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '数据库名称',
          dataIndex: 'databaseName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          width: 100,
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          backupFlag: 2,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/SysDatasourceConfigBusiness/listPage',
        manual: '/DbBackupBusiness/dbBackup',
      },
    }
  },

  methods: {
    refresh(bool = false) {
      this.$refs.dbBackupTable.refresh(bool)
    },
    handleManual(record = {}) {
      this.$confirm({
        title: '手动备份',
        content: '数据库备份会消耗一段时间，稍等片刻后查看备份记录可以看到备份结果。',
        onOk: () => {
          postAction(this.url.manual, { id: record.id }).then((res) => {
            if (res.code == 200) {
              this.$message.success('已经开始手动备份，稍等片刻后查看备份记录可以看到备份结果。')
              this.refresh()
            }
          })
        },
      })
    },
    showBackupHistory(record) {
      this.$refs.dbBackupDrawer.show(record)
    },
  },
}
</script>
<style lang="less">
.db-backup {
  height: 100%;
  width: 100%;
  position: relative;
  .ant-drawer-body {
    padding-bottom: 0;
  }
}
</style>