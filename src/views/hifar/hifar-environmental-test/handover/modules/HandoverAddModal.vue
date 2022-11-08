<!--
 * @Author: 马潭龙
 * @Date: 2021-11-16 16:58:00
 * @LastEditTime: 2021-11-26 16:22:51
 * @LastEditors: 马潭龙
 * @Descripttion: 交接班-添加,编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\handover\modules\HandoverAddModal.vue
-->
<template>
  <h-modal
    ref='handoverAdd'
    inner
    destroyOnClose
    :visible='visible'
    :title='title'
    :confirm-loading='confirmLoading'
    @cancel='handleCancel'
    @submit='handleSubmit'
    width='70%'
  >
    <!-- 基本信息 -->
    <h-desc title='基本信息' :bordered='false'>
      <h-form
        v-model='model'
        ref='handoverAddForm'
        :formData='formData'
        :column='2'
        @change='submitHandle'
        style='margin-top: 18px; margin-left: 15px'
      >
      </h-form>
    </h-desc>
    <!-- 执行任务总览 -->
    <h-desc title='执行任务总览' :bordered="false">
      <h-vex-table
        ref='handoverTask'
        bordered
        :pagination='false'
        :columns='columns'
        :data='loadData'
        style='width: 100%; height: 300px'
      >
      </h-vex-table>
    </h-desc>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import SysUserSelect from '@/views/components/SysUserSelect'

export default {
  components: {
    SysUserSelect
  },
  data() {
    return {
      model: {},
      confirmLoading: false,
      visible: false,
      runNum: '',
      title: '',
      url: {
        taskListAll: '/HfEnvTestHandoverRecordBusiness/taskTestListAll',
        add: '/HfEnvTestHandoverRecordBusiness/add',
        editor: '/HfEnvTestHandoverRecordBusiness/modifyById',
        loadDetail: '/HfEnvTestHandoverRecordBusiness/queryById'
      },
      // 表单
      formData: [
        {
          title: '',
          key: 'id',
          formType: 'input',
          hidden: true
        },
        {
          key: 'surrenderUserName',
          formType: 'input',
          hidden: true
        },
        {
          key: 'receiveUserName',
          formType: 'input',
          hidden: true
        },
        {
          title: '交班人',
          key: 'surrenderUserId',
          validate: {
            rules: [{required: true, message: '请选择交班人'}]
          },
          component: (
            <sys-user-select
              style={{display: "block"}}
              multiple={true}
              v-decorator={['surrenderUserId', {initialValue: []}]}
              v-on:change={this.surrenUserChange}
            ></sys-user-select>
          )
        },
        {
          title: '接班人',
          key: 'receiveUserId',
          validate: {
            rules: [{required: true, message: '请选择接班人'}]
          },
          component: (
            <sys-user-select
              style={{display: "block"}}
              multiple={true}
              v-decorator={['receiveUserId', {initialValue: []}]}
              v-on:change={this.receiveUserChange}
            ></sys-user-select>
          )
        },
        {
          title: '交接时间',
          key: 'handoverTime',
          validate: {
            rules: [{required: true, message: '请输入交接班时间'}]
          },
          component: (
            <h-time-select
              v-decorator={['expectStartTime', {rules: [{required: true, message: '请选择交接班时间'}]}]}
            />
          )
        },
        {
          title: '环境状态',
          key: 'envStatus',
          formType: 'select',
          options: [
            {title: '正常', key: 1, value: 1},
            {title: '异常', key: 2, value: 2}
          ]
        },
        {
          title: '测试状态',
          key: 'testStatus',
          formType: 'select',
          validate: {
            rules: [{required: true, message: '请选择测试状态'}]
          },
          options: [
            {title: '有错误', value: 1, key: 1},
            {title: '无错误', value: 2, key: 2}
          ]
        },
        {
          title: '工具状态',
          key: 'toolStatus',
          formType: 'select',
          options: [
            {title: '齐全', value: 1, key: 1},
            {title: '缺失', value: 2, key: 2}
          ]
        },
        {
          title: '设备状态',
          key: 'deviceStatus',
          formType: 'select',
          options: [
            {title: '有故障', value: 1, key: 1},
            {title: '无故障', value: 2, key: 2}
          ]
        },
        {
          title: '运行设备',
          key: 'runNum',
          formType: 'text'
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
          placeholder: '请输入交接班必要的内容'
        }
      ],
      // 执行任务总览表格
      columns: [
        {
          title: '委托单号',
          align: 'left',
          width: 100,
          dataIndex: 'entrustNos',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '试验项目',
          align: 'left',
          width: 100,
          dataIndex: 'unitNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '使用设备',
          align: 'left',
          width: 100,
          dataIndex: 'equipName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '试件数量(件)',
          align: 'left',
          dataIndex: 'sampleNum',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '过程描述',
          align: 'left',
          minWidth: 200,
          dataIndex: 'processDesc',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '开始时间',
          align: 'left',
          dataIndex: 'realStartTime',
          minWidth: 150,
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '预计用时',
          align: 'left',
          width: 80,
          dataIndex: 'predictUseTime',
        },
        {
          title: '预计结束时间',
          align: 'left',
          minWidth: 150,
          dataIndex: 'predictEndTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '备注',
          align: 'left',
          width: 200,
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          }
        }
      ],
      loadData: () => {
        return postAction(this.url.taskListAll).then((res) => {
          if (res.code == 200) {
            this.model = Object.assign({}, this.model, {runNum: res.data.length})
            // this.$refs.handoverAddForm.form.setFieldsValue({ runNum: this.model.runNum })
            return res.data
          }
        })
      }
    }
  },
  methods: {
    show(record, title) {
      this.visible = true
      this.$nextTick(() => {
        this.title = title
        if (record.id) {
          this.loadDetail(record.id)
        } else {
          this.editor(record)
        }
      })
    },
    // 更新
    refresh(bool = true) {
      this.$refs.handover.refresh(bool)
    },
    // 取消
    handleCancel() {
      this.model = {}
      this.visible = false
    },
    // 保存
    handleSubmit() {
      this.$refs.handoverAddForm.validateForm()
    },
    // 通过id查找
    loadDetail(id) {
      postAction(this.url.loadDetail, {id: id}).then((res) => {
        if (res.code == 200) {
          this.editor(res.data)
        }
      })
    },
    // 编辑
    editor(record) {
      let obj = Object.assign({}, record)
      obj.handoverTime = obj.handoverTime && obj.handoverTime != 0 ? moment(parseFloat(obj.handoverTime)) : ''
      this.model = obj
    },
    // 交班
    surrenUserChange(val, option) {
      let usernames = option.map(item => item.idName).join(',')
      this.$refs.handoverAddForm.form.setFieldsValue({surrenderUserName: usernames})
    },
    // 接班
    receiveUserChange(val, option) {
      let usernames = option.map(item => item.idName).join(',')
      this.$refs.handoverAddForm.form.setFieldsValue({receiveUserName: usernames})
    },
    // 提交
    submitHandle(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values
      }
      let url = null
      // 根据id判断编辑和添加
      if (params.id) {
        url = this.url.editor
      } else {
        url = this.url.add
      }
      params.handoverTime = params.handoverTime && params.handoverTime != 0 ? params.handoverTime.valueOf() : ''
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    }
  }
}
</script>

<style>
</style>