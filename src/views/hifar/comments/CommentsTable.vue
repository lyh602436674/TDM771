<!--
 * @Author: 赵峰
 * @Date: 2021-09-30 14:21:44
 * @LastEditTime: 2021-11-30 15:04:15
 * @LastEditors: 马潭龙
 * @Descripttion: 现有问题
 * @FilePath: \hifar-platform-client\src\views\hifar\comments\CommentsTable.vue
-->
<template>
  <div ref="pageWrapper" class="h-custom-layout" style="height: 100%; position: relative">
    <h-card fixed :bordered="true">
      <h-search
        v-model="queryParams"
        slot="search-form"
        size="small"
        :showToggleButton="true"
        :data="searchBar"
        @change="refresh"
      />
      <div slot="table-operator" style="border-top: 5px">
        <a-button v-has="'problem:add'" size="small" @click="handleAdd({}, '新增')" type="ghost-primary" icon="plus">添加</a-button>
      </div>
      <h-vex-table
        slot="content"
        ref="taskAssignTable"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
      >
        <span slot="suggestModuleName" slot-scope="text, record">
          <a href="javascript:;" @click="handleDetailCode(record)">
            {{ record.suggestModuleName ? record.suggestModuleName : '--' }}
          </a>
        </span>
        <div slot="suggestContent" slot-scope="text, record">
          <div v-html="record.suggestContent"></div>
        </div>
        <span slot="status" slot-scope="text, record">
          <a-tag class="status_tag" :color="record.status | dealStatusColorFilter">
            {{ record.status | dealStatusFilter }}
          </a-tag>
        </span>
        <div slot="action" slot-scope="text, record">
          <a @click="handleDetail(record)"> 查看 </a>
          <span v-if="record.status != 1 && record.isOwn">
            <a-divider type="vertical" />
            <a @click="handleDeal(record, 'close')"> 关闭 </a>
          </span>
          <span v-if="record.status == 1">
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link">更多<a-icon type="down" /> </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="handleEditor(record, '编辑')"> 编辑 </a>
                </a-menu-item>
                <a-menu-item>
                  <a @click="handleDeal(record, 'deal')"> 处理 </a>
                </a-menu-item>
                <a-menu-item v-if="record.isOwn">
                  <a @click="handleDeal(record, 'close')"> 关闭 </a>
                </a-menu-item>
                <a-menu-item>
                  <a-popconfirm title="确定要删除此意见吗?" @confirm="() => handleDelete(record)">
                    <a class="danger-text"> 删除 </a>
                  </a-popconfirm>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </span>
        </div>
      </h-vex-table>
    </h-card>
    <comments-modal ref="CommentsModal" @change="refresh(true)"></comments-modal>
    <comments-deal-modal ref="CommentsDealModal" @change="refresh(true)"></comments-deal-modal>
    <comments-detail ref="CommentsDetail"></comments-detail>
  </div>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import CommentsModal from './modules/CommentsModal'
import CommentsDealModal from './modules/CommentsDealModal'
import CommentsDetail from './modules/CommentsDetail'
import mixin from '@/views/hifar/mixin.js'
export default {
  mixins: [mixin],
  components: {
    CommentsModal,
    CommentsDealModal,
    CommentsDetail,
  },

  data() {
    return {
      moment,
      queryParams: {},
      url: {
        list: '/BaseUserSuggestBusiness/listPage',
        delete: '/BaseUserSuggestBusiness/logicRemoveById',
      },
      searchBar: [
        {
          title: '问题类型',
          key: 'c_suggestTypeCode_1',
          formType: 'dict',
          dictCode: 'hr_suggest_type',
        },
        {
          title: '问题描述',
          key: 'c_suggestContent_7',
          formType: 'input',
        },
        {
          title: '处理状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            { title: '未处理', value: 1, key: 1 },
            { title: '已处理', value: 2, key: 2 },
            { title: '已关闭', value: 3, key: 3 },
          ],
        },
      ],
      columns: [
        {
          title: '所属模块',
          align: 'left',
          dataIndex: 'suggestModuleName',
          scopedSlots: { customRender: 'suggestModuleName' },
        },
        {
          title: '问题类型',
          align: 'left',
          dataIndex: 'suggestTypeName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '问题描述',
          align: 'left',
          width: 220,
          dataIndex: 'suggestContent',
          scopedSlots: { customRender: 'suggestContent' },
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '提出人',
          align: 'left',
          dataIndex: 'suggestUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '提出时间',
          align: 'left',
          dataIndex: 'suggestTime',
          customRender: (time, record) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '创建人',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '处理人',
          align: 'left',
          dataIndex: 'dealUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '处理时间',
          align: 'left',
          dataIndex: 'dealTime',
          customRender: (time, record) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '备注',
          align: 'left',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          c_status_97: '1,2',
          ...params,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
    }
  },

  methods: {
    refresh(bool = false) {
      this.$refs.taskAssignTable.refresh(bool)
    },
    handleAssign(record) {
      this.unitId = record.unitId
      this.$refs.TaskAssignmentModal.show(record)
    },
    // 详情
    handleDetail(record) {
      this.$refs.CommentsDetail.show(record)
    },
    handleDetailCode(record) {
      this.handleDetail(record)
    },
    //编辑
    handleEditor(record, title) {
      this.$refs.CommentsModal.show(record, title)
    },
    handleDelete(record) {
      postAction(this.url.delete, { id: record.id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功！')
          this.refresh(true)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleAdd(record, title) {
      this.$refs.CommentsModal.show(record, title)
    },
    handleDeal(record, type) {
      this.$refs.CommentsDealModal.show(record, type)
    },
  },
}
</script>
<style lang='less' scoped>
</style>