<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-16 11:29:14
 * @LastEditTime: 2021-09-13 11:31:49
 * @LastEditors: 陈乾龙
 * @Description:
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\paramConfig\modules\HfSysConfigModal.vue
-->
<template>
  <h-modal
    inner
    destroyOnClose
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :getContainer="getContainer"
    @cancel="handleCancel"
    @submit="handleOk"
  >
    <!--如果showForm=true显示 HfSysConfigForm组件,否则显示详情组hfSysConfigDetail件-->
    <h-form ref="realForm" v-if="showForm" v-model="model" :formData="formData" :column="1" @change="submit"></h-form>
    <hf-sys-config-detail ref="configDetail" v-else></hf-sys-config-detail>
  </h-modal>
</template>

<script>
import HfSysConfigDetail from '@views/hifar/sys/paramConfig/HfSysConfigDetail'
import { validateDuplicateValue } from '@/utils/util'
import { postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  name: 'HfSysConfigModal',
  components: {
    HfSysConfigDetail,
  },
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      confirmLoading: false,
      showForm: false,
      formData: [
        {
          title: 'id',
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '参数键',
          key: 'itemKey',
          formType: 'input',
          validate: {
            rules: [
              { required: true, message: '请输入参数键' },
              {
                validator: (rule, value, callback) =>
                  validateDuplicateValue('BaseSysSwitch', 'itemKey', value, callback),
              },
            ],
          },
        },
        {
          title: '参数名称',
          key: 'itemName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入参数名称' }],
          },
        },
        {
          title: '系统参数',
          key: 'isSys',
          component: <h-switch v-decorator={['isSys']} options={['1', '2']} />,
        },
        {
          title: '参数值',
          key: 'itemValue',
          formType: 'textarea',
          validate: {
            rules: [{ required: true, message: '请输入参数值' }],
          },
        },
        {
          title: '参数描述',
          key: 'itemDesc',
          formType: 'textarea',
        },
      ],
      url: {
        add: '/SysSwitchBusiness/add',
        edit: '/SysSwitchBusiness/modifyById',
      },
    }
  },
  methods: {
    showDetail(record) {
      this.visible = true
      this.showForm = false
      this.$nextTick(() => {
        this.$refs.configDetail.showDetails(record)
      })
    },
    add() {
      this.edit({})
    },
    edit(record) {
      this.showForm = true // 编辑时显示form组件
      this.model = Object.assign({}, record)
      this.visible = true
    },
    async submit(values) {
      if (this.confirmLoading) return
      this.confirmLoading = true
      let res = null
      let url = null
      if (values.id) {
        url = this.url.edit
      } else {
        url = this.url.add
      }
      res = await postAction(url, values).finally((res) => {
        this.confirmLoading = false
      })
      if (res.code == 200) {
        this.$message.success((values.id ? '编辑' : '添加') + '成功')
        this.$emit('ok', true)
        this.handleCancel()
      }
    },
    handleOk() {
      if (this.showForm) {
        this.$refs.realForm.validateForm()
      } else {
        this.handleCancel()
      }
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
