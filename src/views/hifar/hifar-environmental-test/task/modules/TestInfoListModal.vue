<!--
 * @Author: 赵峰
 * @Date: 2021-11-10 10:06:54
 * @LastEditTime: 2021-11-24 10:04:36
 * @LastEditors: 马潭龙
 * @Descripttion: 任务试验信息列表弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\TestInfoListModal.vue
-->
<template>
  <h-modal
    :title="title"
    :visible="visible"
    inner
    destroyOnClose
    width="94%"
    :getContainer="getContainer"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger" style="margin-right: 8px"> 关闭 </a-button>
    </div>
    <h-card :bordered="false" fixed class="testTable">
      <h-search
        v-model="queryParams"
        slot="search-form"
        :data="searchData"
        :showToggleButton="false"
        @change="refresh(true)"
      />
      <h-vex-table slot="content" ref="testInfoListTable" :columns="columns" :data="loadData">
        <template slot="status" slot-scope="text">
          <a-badge v-if="text == 0" color="grey" text="未发布" />
          <a-badge v-else-if="text == 1" color="geekblue" text="已发布" />
          <a-badge v-else-if="text == 10" color="red" text="已撤销" />
          <a-badge v-else-if="text == 20" color="green" text="进行中" />
          <a-badge v-else-if="text == 30" color="volcano" text="暂停" />
          <a-badge v-else-if="text == 40" color="red" text="终止" />
          <a-badge v-else-if="text == 45" color="yellow" text="异常"/>
          <a-badge v-else-if="text == 50" color="grey" text="已完成" />
        </template>
        <span slot="actions" slot-scope="text, record">
          <a-popconfirm title="确定发布吗？" @confirm="() => handleRelease(record.id)">
            <a v-if="[0].includes(record.status)">发布</a>
          </a-popconfirm>
          <a-divider v-if="[0].includes(record.status)" type="vertical"/>
          <a-popconfirm title="确定删除吗？" @confirm="() => handleDelete(record.id)">
            <a v-if="[0].includes(record.status)" style="color: red">删除</a>
          </a-popconfirm>
          <a-popconfirm title="确定撤销吗？" @confirm="() => handleBack(record)">
            <a v-if="record.status === 1">撤销</a>
          </a-popconfirm>
        </span>
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'

export default {
  inject: ['getContainer'],
  props: {
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      moment,
      title: '试验信息',
      url: {
        testList: '/HfEnvTaskTestBusiness/listPageForTask',
        recover: '/HfEnvTaskTestBusiness/recover',
        release: '/HfEnvTaskTestBusiness/release', // 发布url
        delete: '/HfEnvTaskTestBusiness/logicRemoveById' // 删除
      },
      queryParams: {},
      columns: [
        {
          title: '设备名称',
          dataIndex: 'equipName',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 120
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 120
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 120
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 120
        },
        {
          title: '试验项目',
          dataIndex: 'testNames',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 120
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: {
            customRender: 'status'
          },
          minWidth: 100
        },
        {
          title: '试验员',
          dataIndex: 'chargeUserName',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 80
        },
        {
          title: '设备速率',
          dataIndex: 'testRate',
          customRender: (text) => {
            return text || '--'
          },
          minWidth: 80
        },
        {
          title: '预计开始时间',
          dataIndex: 'predictStartTime',
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150
        },
        {
          title: '预计时长（小时）',
          dataIndex: 'predictUseTime',
          align: 'center',
          minWidth: 150
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender(text) {
            return text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150
        },
        {
          title: '实际结束时间',
          dataIndex: 'realEndTime',
          customRender(text) {
            return text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150
        },
        {
          title: '操作',
          width: 120,
          align: 'center',
          dataIndex: 'actions',
          fixed: 'right',
          hidden: this.isReadOnly,
          scopedSlots: {
            customRender: 'actions'
          }
        }
      ],
      searchData: [
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input'
        },
        {
          title: '试验状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '未发布',
              key: 0,
              value: 0
            },
            {
              title: '已发布',
              key: 1,
              value: 1
            },
            {
              title: '已撤销',
              key: 10,
              value: 10
            },
            {
              title: '进行中',
              key: 20,
              value: 20
            },
            {
              title: '暂停',
              key: 30,
              value: 30
            },
            {
              title: '终止',
              key: 40,
              value: 40
            },
            {
              title: '异常',
              key: 45,
              value: 45
            },
            {
              title: '已完成',
              key: 50,
              value: 50
            }
          ]
        },
        {
          title: '设备名称',
          key: 'c_equipName_7',
          formType: 'input'
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          taskId: this.taskId
        }
        return postAction(this.url.testList, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      }
    }
  },
  methods: {
    show(record = {}) {
      this.visible = true
      this.taskId = record.id
    },
    handleCancel() {
      this.visible = false
      this.$emit('change')
    },
    refresh(bool = true) {
      this.$refs.testInfoListTable.refresh(bool)
    },
    handleBack(record) {
      postAction(this.url.recover, {id: record.id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('操作成功')
          this.refresh()
        }
      })
    },
    /**
     * 发布
     * @param id 试验id
     */
    handleRelease(id) {
      postAction(this.url.release, { id }).then((res) => {
        if (res.code === 200) {
          if (res.msg) {
            this.$message.success(res.msg)
          } else {
            this.$message.success('操作成功')
          }
          this.refresh()
        } else {
          this.$message.success('发布失败')
        }
      })
    },
    handleDelete(id) {
      postAction(this.url.delete, { id }).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.refresh()
        } else {
          this.$message.success('删除失败')
        }
      })
    }
  }
}
</script>

<style lang='less' scoped>
.testTable {
  height: 600px;
}
</style>
