<!--
 * @Author: 赵峰
 * @Date: 2021-08-31 16:24:26
 * @LastEditTime: 2021-11-10 15:41:23
 * @LastEditors: 马潭龙
 * @Descripttion: 材料管理详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\material\modules\MaterialDetail.vue
-->
<template>
  <h-modal
    title="详情"
    inner
    destroyOnClose
    :width="1000"
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-detail :showElevator="false">
      <h-desc size="small" :column="2" title="基本信息" labelWidth="120px">
        <h-desc-item v-for="(item, index) in formData" :key="index" :label="item.title">
          {{ detail ? detail[item.key] : '' }}
        </h-desc-item>
      </h-desc>
    </h-detail>
  </h-modal>
</template>

<script>
import HDesc from '../../../../../../components/HDesc/HDesc.vue'
export default {
  components: { HDesc },
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },

  data() {
    return {
      visible: false,
      detail: {},
      formData: [
        {
          title: '材料名称',
          key: 'materialName',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入材料名称' }],
          },
        },
        {
          title: '材料编号',
          key: 'materialCode',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入材料编号' }],
          },
        },
        {
          title: '材料类型',
          key: 'materialType',
          formType: 'input',
          validate: {
            rules: [{ required: false, message: '请输入材料类型' }],
          },
        },
        {
          title: '材料规格',
          key: 'materialSpecs',
          formType: 'input',
        },
        {
          title: '材料品牌',
          key: 'materialBrand',
          formType: 'input',
          validate: {
            rules: [{ required: true, message: '请输入材料品牌' }],
          },
        },
        {
          title: '材料单位',
          key: 'materialUnit',
          formType: 'input',
        },
        {
          title: '材料来源',
          key: 'buySource',
          formType: 'input',
        },
        {
          title: '生产厂家',
          key: 'factoryName',
          formType: 'input',
        },
        {
          title: '库存数量',
          key: 'quantity',
          formType: 'input',
        },
        {
          title: '库存上限',
          key: 'quantityMin',
          formType: 'input',
        },
        {
          title: '库存下限',
          key: 'quantityMax',
          formType: 'input',
        },
        {
          title: '存储位置',
          key: 'location',
          formType: 'input',
        },
        {
          title: '保质期(月)',
          key: 'period',
          formType: 'input',
          addonAfter: '个月',
        },
        {
          title: '备注',
          key: 'remarks',
          validate: {
            rules: [{ required: false, message: '请输入' }],
          },
          formType: 'textarea',
          span: 2,
        },
      ],
    }
  },

  methods: {
    show(record) {
      this.visible = true
      this.detail = record
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>
<style lang='less' scoped>
</style>