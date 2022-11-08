<!--
 * @Author: 赵峰
 * @Date: 2021-10-27 09:50:51
 * @LastEditTime: 2021-11-23 11:55:53
 * @LastEditors: 赵峰
 * @Descripttion: 试验模板添加-编辑
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testTemplate\modules\TestTemplateModal.vue
-->
<template>
  <h-modal
    :title="title"
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <div style="padding: 8px 25px">
      <h-descriptions title="基本信息">
        <a-descriptions-item>
          <h-form
            ref="testTemplateForm"
            v-if="visible"
            v-model="model"
            :formData="formData"
            :column="1"
            @change="submitHandle"
          ></h-form>
        </a-descriptions-item>
      </h-descriptions>

      <h-descriptions
        :title="checkType == 1 ? '试前检查项' : checkType == 2 ? '试中检查项' : checkType == 3 ? '试后检查项' : ''"
      >
        <a-descriptions-item>
          <a-button
            size="small"
            @click="insertEvent(-1)"
            type="ghost-primary"
            icon="plus"
            style="margin-right: 5px; margin-bottom: 4px"
            >新增</a-button
          >
          <a-button
            v-if="hasSelected"
            type="danger"
            size="small"
            icon="minus"
            style="margin-bottom: 4px"
            @click="handleDelete"
          >
            删除
          </a-button>

          <vxe-table
            border
            show-all-overflow
            keep-source
            ref="testCheckTable"
            :data="testCheckData"
            @checkbox-all="selectAllEvent"
            @checkbox-change="onSelectChange"
            :edit-rules="validRules"
            :edit-config="{ key: 'id', trigger: 'click', mode: 'row', showStatus: true }"
          >
            <vxe-table-column type="checkbox" width="60"></vxe-table-column>
            <vxe-table-column type="seq" width="60"></vxe-table-column>
            <vxe-table-column
              title="检查项"
              field="itemName"
              :edit-render="{ name: '$input', props: { placeholder: '请输入检查项' } }"
            ></vxe-table-column>
            <vxe-table-column
              title="检查内容"
              field="itemContent"
              :edit-render="{ name: '$input', props: { placeholder: '请输入检查内容' } }"
            ></vxe-table-column>
            <vxe-table-column
              title="检查要求"
              field="itemRequire"
              :edit-render="{ name: '$input', props: { placeholder: '请输入检查要求' } }"
            ></vxe-table-column>
            <vxe-table-column
              title="是否复核"
              field="checkFlag"
              :width="120"
              :edit-render="{ name: 'select', options: checkList, props: { placeholder: '请选择是否复核' } }"
            ></vxe-table-column>
            <vxe-table-column
              title="备注"
              field="remarks"
              :edit-render="{ name: '$input', props: { placeholder: '请输入备注' } }"
            ></vxe-table-column>
          </vxe-table>
        </a-descriptions-item>
      </h-descriptions>
    </div>
  </h-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  components: {},

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  data() {
    return {
      title: '',
      visible: false,
      confirmLoading: false,
      checkType: '',
      model: {},
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          key: 'checkType',
          formType: 'input',
          hidden: true,
        },
        {
          title: '模板名称',
          key: 'checkName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入模板名称' }],
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2,
        },
      ],
      validRules: {
        itemName: [{ required: true, message: '检查项不能为空' }],
        itemContent: [{ required: true, message: '检查内容不能为空' }],
        itemRequire: [{ required: true, message: '检查要求不能为空' }],
        checkFlag: [{ required: true, message: '请选择是否复核' }],
      },
      testCheckData: [],
      selectedRowKeys: [],
      checkList: [
        { label: '请选择', value: '' },
        { label: '是', value: '1' },
        { label: '否', value: '2' },
      ],
      url: {
        add: '/HfEnvTestCheckBusiness/addCheckTemplateAndItem',
        edit: '/HfEnvTestCheckBusiness/modifyCheckTemplateAndItemById',
        detail: '/HfEnvTestCheckBusiness/queryCheckTemplateAndItemById',
      },
    }
  },

  methods: {
    show(record, title, checkType) {
      this.visible = true
      this.title = title
      this.checkType = checkType
      if (!record.id) {
        const tableItem = {
          checkId: this.model.id,
          itemName: '',
          itemContent: '',
          itemRequire: '',
          checkFlag: '',
          remarks: '',
        }
        this.testCheckData = [tableItem]
        this.editor(record, checkType)
      } else {
        this.loadDetailData(record.id)
      }
    },
    loadDetailData(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          let obj = Object.assign({}, res.data)
          this.model = obj
          this.testCheckData = res.data.checkItem
        }
      })
    },
    editor(record, checkType) {
      let obj = Object.assign({}, record)
      obj.checkType = checkType
      this.model = obj
    },
    handleCancel() {
      this.visible = false
      this.testCheckData = []
      this.$emit('change', true)
    },
    //  多选
    onSelectChange(records) {
      this.selectedRowKeys = records.records
    },
    // 全选
    selectAllEvent(records) {
      this.selectedRowKeys = records.records
    },
    handleClickSubmit() {
      this.$refs.testTemplateForm.validateForm()
    },
    async submitHandle(values) {
      const $table = this.$refs.testCheckTable
      const errMap = await $table.validate().catch((errMap) => errMap)
      if (!errMap) {
        if (this.confirmLoading) return
        this.confirmLoading = false
        let testCheckArr = []
        let testCheckData = []
        const { insertRecords } = $table.getRecordset()
        if (insertRecords.length == 0) {
          testCheckData = this.testCheckData
        } else {
          testCheckData = this.testCheckData.concat(insertRecords)
        }
        if (testCheckData.length > 0) {
          testCheckData.forEach((item) => {
            testCheckArr.push({
              id: item.id ? item.id : '',
              checkId: item.checkId ? item.checkId : '',
              itemName: item.itemName ? item.itemName : '',
              itemContent: item.itemContent ? item.itemContent : '',
              itemRequire: item.itemRequire ? item.itemRequire : '',
              checkFlag: item.checkFlag ? item.checkFlag : '',
              remarks: item.remarks ? item.remarks : '',
            })
          })
        } else {
          testCheckArr = []
        }
        let params = {
          ...values,
        }
        params.checkItem = testCheckArr
        let url = null
        if (params.id) {
          url = this.url.edit
        } else {
          url = this.url.add
        }
        console.log('params==========================', params)
        postAction(url, params).then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('change', true)
            this.handleCancel()
          }
        })
      }
    },
    handleDelete() {
      const $table = this.$refs.testCheckTable
      const { removeRecords } = $table.getRecordset()
      let tableData = this.testCheckData
      $table.removeCheckboxRow()
      this.selectedRowKeys = []
      if (tableData.length > 0) {
        let list = tableData.filter((items) => {
          if (!removeRecords.includes(items)) return items
        })
        this.testCheckData = list
      }
    },
    async insertEvent(row) {
      const $table = this.$refs.testCheckTable
      const tableItem = {
        id: '',
        checkId: this.model.id,
        itemName: '',
        itemContent: '',
        itemRequire: '',
        checkFlag: '',
        remarks: '',
      }
      const record = [tableItem]
      await $table.insertAt(record, row)
      const { insertRecords } = $table.getRecordset()
      this.testCheckData = this.testCheckData.concat(insertRecords)
    },
  },
}
</script>
<style lang='less' scoped>
</style>