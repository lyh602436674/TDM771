<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-27 15:14:45
 * @LastEditTime: 2021-10-27 16:48:22
 * @LastEditors: 陈乾龙
 * @Description: 检测项目分类和项目的新增，修改弹窗
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\project\modules\ClassifyAndUnitModal.vue
-->
<template>
  <h-modal inner :width="600" destroyOnClose :visible="visible" :title="title" @cancel="handleCancel">
    <h-form
      v-model="model"
      ref="envTestForm"
      :width="600"
      :column="1"
      :formData="formData"
      @change="handleChange"
    ></h-form>
    <div slot="footer" v-if="!disableSubmit" class="drawer-bootom-button">
      <a-button type="ghost-danger" style="margin-right: 8px" @click="handleCancel">取消</a-button>
      <a-button type="ghost-primary" :loading="confirmLoading" @click="handleSubmit">提交</a-button>
    </div>
  </h-modal>
</template>

<script>
import workCenterSelect from '../components/WorkCenterSelect'
import pcClassifySelect from '../components/PcClassifySelect'
import { postAction } from '@/api/manage'
import { findIndex } from 'lodash'
export default {
  components: { workCenterSelect, pcClassifySelect },
  inject: ['groupCode'],
  data() {
    return {
      title: '操作',
      visible: false,
      confirmLoading: false,
      disableSubmit: false,
      model: {},
      expFormData: {
        // 项目分类
        classify: [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'groupCode',
            formType: 'input',
            hidden: true,
          },
          {
            title: '名称',
            key: 'classifyName',
            formType: 'input',
            validate: { rules: [{ required: true, message: '请输入名称' }] },
          },
          {
            title: '类型',
            key: 'type',
            formType: 'select',
            options: [
              {
                title: '检测类别',
                key: 'classify',
                value: 'classify',
              },
              {
                title: '检测项目',
                key: 'unit',
                value: 'unit',
              },
            ],
            change: (v) => {
              this.changeType(v)
            },
            validate: { rules: [{ required: true, message: '请选择类型' }] },
          },
          {
            title: '工作中心',
            key: 'centerIds',
            component: (
              <work-center-select showSearch mode="multiple" placeholder="请选择" v-decorator={['centerIds']}>
                <span slot="addonBefore">workCenter</span>
              </work-center-select>
            ),
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
          },
          {
            title: '排序',
            key: 'rowSort',
            component: <a-input-number v-decorator={['rowSort', { initialValue: 1000 }]} />,
          },
        ],
        // 项目
        unit: [
          {
            key: 'id',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'classifyId',
            formType: 'input',
            hidden: true,
          },
          {
            key: 'groupCode',
            formType: 'input',
            hidden: true,
          },
          {
            title: '项目编码',
            key: 'unitCode',
            formType: 'input',
          },
          {
            title: '名称',
            key: 'unitName',
            formType: 'input',
            validate: {
              rules: [{ required: true, message: '请输入项目名称' }],
            },
          },
          {
            title: '类型',
            key: 'type',
            formType: 'select',
            options: [
              {
                title: '检测类别',
                key: 'classify',
                value: 'classify',
              },
              {
                title: '检测项目',
                key: 'unit',
                value: 'unit',
              },
            ],
            change: (v) => {
              this.changeType(v)
            },
            validate: { rules: [{ required: true, message: '请选择类型' }] },
          },
          {
            title: '项目类别',
            key: 'classifyId',
            component: (
              <pc-classify-select
                placeholder="请选择项目类别"
                showSearch
                v-decorator={['classifyId', { rules: [{ required: true, message: '请选择项目类别' }] }]}
              />
            ),
          },
          {
            title: '备注',
            key: 'remarks',
            formType: 'textarea',
          },
        ],
      },
      formData: [],
      url: {
        classifyAdd: '/HfPrjUnitClassifyBusiness/addAndCenter',
        classifyModify: '/HfPrjUnitClassifyBusiness/modifyAndCenterById',
        unitAdd: '/HfPrjUnitBaseBusiness/add',
        unitModify: '/HfPrjUnitBaseBusiness/modifyById',
      },
    }
  },
  methods: {
    add(record) {
      this.model.id = null
      this.edit(record)
    },
    edit(record = {}) {
      this.model = Object.assign({}, record)
      if (!this.model.type) {
        this.model.type = 'classify'
      }
      let formData = this.expFormData[this.model.type]
      let index = findIndex(formData, function (obj) {
        return obj.key === 'type'
      })
      if (this.model.id) {
        formData[index]['disabled'] = true
      } else {
        formData[index]['disabled'] = false
      }
      this.formData = formData
      this.visible = true
    },
    changeType(v) {
      this.model = Object.assign({}, this.model, { type: v })
      let formData = this.expFormData[this.model.type]
      let index = findIndex(formData, function (obj) {
        return obj.key === 'type'
      })
      if (this.model.id) {
        formData[index]['disabled'] = true
      } else {
        formData[index]['disabled'] = false
      }
      this.formData = formData
    },
    handleSubmit() {
      this.$refs.envTestForm.validateForm()
    },
    handleChange(values) {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let params = {
        ...values,
      }
      let url = null
      if (params.type == 'unit') {
        if (params.id) {
          url = this.url.unitModify
        } else {
          url = this.url.unitAdd
        }
        postAction(url, params).then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('ok', true)
            this.handleCancel()
          }
        })
      } else if (params.type == 'classify') {
        if (params.id) {
          url = this.url.classifyModify
        } else {
          url = this.url.classifyAdd
        }
        if (params.centerIds && params.centerIds.length > 0) {
          params.centerIds = params.centerIds.join(',')
        }
        postAction(url, params).then((res) => {
          if (res.code == 200) {
            this.$message.success(this.title + '成功')
            this.$emit('ok', true)
            this.handleCancel()
          }
        })
      }
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>