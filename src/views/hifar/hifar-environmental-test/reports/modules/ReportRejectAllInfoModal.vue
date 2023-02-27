<template>
  <h-modal
    :getContainer="getContainer"
    :submitLoading="submitLoading"
    :title="handleType[type]"
    :visible="visible"
    :width="1200"
    destroyOnClose
    inner
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-form ref="baseForm" v-model="model" :column="2" :formData="formData" style="margin-top: 18px"
            @change="handleFormChange"/>
  </h-modal>
</template>

<script>
import HEditTree from "@views/components/HEditTree";
import SysUserSelect from "@views/components/SysUserSelect";
import {postAction} from "@api/manage";

const rejectType = [
  {title: "报告生成", key: "1", value: "1"},
  {title: "报告审核", key: "2", value: "2"},
  {title: "报告批准", key: "3", value: "3"},
  {title: "修改审批", key: "4", value: "4"},
]

export default {
  name: "ReportRejectAllInfoModal",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: {
    selectedTreeRows: {
      type: Array,
      default: () => []
    }
  },
  components: {
    SysUserSelect,
    HEditTree
  },
  data() {
    return {
      title: "新增",
      visible: false,
      submitLoading: false,
      model: {},
      treeData: [],
      selectedRowKeys: [],
      formData: [
        {
          title: '',
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '',
          key: 'reportId',
          formType: 'input',
          hidden: true,
        },
        {
          title: "报告编号",
          formType: 'input',
          key: 'reportCode',
          readOnly: true,
          validate: {
            rules: [{required: false, message: '请输入设备型号'}],
          },
        },
        {
          title: '运行单号',
          formType: 'input',
          key: 'entrustCode',
          readOnly: true,
        },
        {
          title: '委托单号',
          formType: 'input',
          key: 'entrustNo',
          readOnly: true,
        },
        {
          title: '试验编号',
          formType: 'input',
          key: 'testCode',
          readOnly: true,
        },
        {
          title: '试验项目',
          formType: 'input',
          key: 'testNames',
          readOnly: true,
        },
        {
          title: '送试单位',
          formType: 'input',
          key: 'custName',
          readOnly: true,
        },
        {
          title: '驳回节点',
          formType: 'select',
          key: 'rejectType',
          disabled: true,
          options: rejectType
        },
        {
          title: '问题类型',
          formType: 'dict',
          dictCode: "hf_report_question_type",
          key: 'questionType',
          validate: {
            rules: [{required: true, message: '请选择问题类型'}],
          },
        },
        {
          title: '内容',
          key: 'questionContent',
          formType: 'textarea',
          autoSize: {minRows: 1},
          validate: {
            rules: [{required: true, message: '请输入内容'}],
          },
        },
        {
          title: '责任人',
          key: 'questionPerson',
          validate: {
            rules: [{required: true, message: '请选择责任人'}],
          },
          component: (
            <sys-user-select v-decorator={['questionPerson', {initialValue: undefined}]}/>
          )
        },
      ],
      url: {
        add: "/HfEnvReportRejectBusiness/addSingle",
        edit: "/HfEnvReportRejectBusiness/modifyById",
        detail: "/HfEnvReportRejectBusiness/queryById",
      },
      type: "add",
      handleType: {add: '新增', edit: "编辑"}
    }
  },
  methods: {
    show(record, type) {
      this.visible = true
      this.model = Object.assign({}, record)
      this.type = type
      if (type === 'add') {
        this.$nextTick(() => {
          let [selectedTreeRows] = this.selectedTreeRows
          this.$refs.baseForm.form.setFieldsValue({
            rejectType: "1",
            reportId: selectedTreeRows.id,
            reportCode: selectedTreeRows.reportCode,
            entrustCode: selectedTreeRows.entrustCode,
            entrustNo: selectedTreeRows.entrustNo,
            testCode: selectedTreeRows.testCode,
            unitNames: selectedTreeRows.unitNames,
            custName: selectedTreeRows.custName,
          })
        })
      }
    },
    handleSubmit() {
      this.$refs.baseForm.validateForm()
    },
    handleFormChange(values) {
      this.submitLoading = true
      let url, params
      if (this.model.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      params = {
        ...values,
      }
      postAction(url, params).then(res => {
        if (res.code === 200) {
          this.$message.success(this.handleType[this.type] + '成功')
          this.$emit('change')
          this.handleCancel()
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
    handleCancel() {
      this.visible = false;
    },
  }
}
</script>

<style scoped>

</style>