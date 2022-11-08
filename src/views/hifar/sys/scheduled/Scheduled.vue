<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-01 15:04:38
 * @LastEditTime: 2021-11-30 15:16:24
 * @LastEditors: 马潭龙
 * @Description: 定时任务
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\scheduled\Scheduled.vue
-->
<template>
  <div ref="scheduled" class="scheduled">
    <h-card fixed title="定时任务">
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh" />
      <template slot="table-operator">
        <a-button v-has="'timing:add'" size="small" type="ghost-primary" icon="plus" @click="handleCreateNew">新建</a-button>
      </template>
      <h-vex-table slot="content" ref="scheduledTable" :columns="columns" :data="loadData">
        <h-switch
          slot="status"
          slot-scope="text, record"
          size="small"
          checkedTxt="启用"
          uncheckedTxt="停用"
          :options="[2, 1]"
          :value="parseInt(record.status)"
          @change="(checked) => handleStatusChange(checked, record)"
        />
        <template slot="actions" slot-scope="text, record">
          <a-icon type="edit" class="primary-text" @click="() => handleEdit(record)" />
          <a-divider type="vertical" />
          <a-popconfirm title="确认删除该任务？" @confirm="() => handleDelete(record.id)">
            <h-icon type="icon-shanchu" class="danger-text" />
          </a-popconfirm>
        </template>
      </h-vex-table>
    </h-card>
    <scheduled-modal ref="scheduledModal" @change="refresh"></scheduled-modal>
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import ScheduledModal from './modules/ScheduledModal.vue'
export default {
  components: { ScheduledModal },
  provide() {
    return {
      getContainer: () => this.$refs.scheduled,
    }
  },
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '任务名称',
          key: 'c_jobName_7',
          formType: 'input',
        },
        {
          title: '任务类名',
          key: 'c_callService_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '任务名称',
          dataIndex: 'jobName',
        },
        {
          title: '任务类名',
          dataIndex: 'callService',
        },
        {
          title: 'Cron表达式',
          dataIndex: 'jobRule',
        },
        {
          title: '启用状态',
          width: 100,
          dataIndex: 'status',
          scopedSlots: {
            customRender: 'status',
          },
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          customRender: (text) => {
            return text || '--'
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
          ...this.queryParams
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/JobTimerTaskBusiness/listPage',
        start: '/JobTimerTaskBusiness/startJob',
        stop: '/JobTimerTaskBusiness/stopJob',
        delete: '/JobTimerTaskBusiness/logicRemoveById',
      },
    }
  },
  methods: {
    handleCreateNew() {
      this.$refs.scheduledModal.title = '新增任务'
      this.$refs.scheduledModal.add()
    },
    handleEdit(record) {
      this.$refs.scheduledModal.title = '编辑任务'
      this.$refs.scheduledModal.edit(record)
    },
    refresh(bool = false) {
      this.$refs.scheduledTable.refresh(bool)
    },
    handleDelete(ids) {
      postAction(this.url.delete, { id: ids }).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh()
        }
      })
    },
    handleStatusChange(checked, record) {
      console.log(checked, record)
      let url = null
      if (checked == 2) {
        url = this.url.start
      } else {
        url = this.url.stop
      }
      postAction(url, { id: record.id }).then((res) => {
        if (res.code == 200) {
          this.$message.success(checked == 2 ? '启用成功' : '停用成功')
          this.refresh()
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.scheduled {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>