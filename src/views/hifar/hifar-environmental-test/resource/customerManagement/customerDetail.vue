<!--
 * @Author: 赵峰
 * @Date: 2021-08-02 14:23:46
 * @LastEditTime: 2021-11-10 15:54:57
 * @LastEditors: 马潭龙
 * @Descripttion: 
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\resource\customerManagement\customerDetail.vue
-->
<template>
  <h-modal
    title="详情"
    :visible="visible"
    inner
    :getContainer="getContainer"
    :width="1000"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭 </a-button>
    </div>
    <h-detail :showElevator="false">
      <h-desc size="small" labelWidth="110px" :column="1" title="基本信息">
        <h-desc-item v-for="(item, index) in config" :key="index" :label="item.title">
          {{ detail[item.key] == 'outside' ? '外部' : detail[item.key] == 'inside' ? '内部' : detail[item.key] }}
        </h-desc-item>
      </h-desc>
    </h-detail>
  </h-modal>
</template>
<script>
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: {
    detail: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      visible: false,
      config: [
        {
          title: '客户名称',
          key: 'custName',
          formType: 'input',
        },
        {
          title: '客户简称',
          key: 'custShort',
          formType: 'input',
        },
        {
          title: '客户类型',
          key: 'custType',
          formType: 'select',
        },
        {
          title: '联系人',
          key: 'linkName',
          formType: 'input',
        },
        {
          title: '联系电话',
          key: 'linkMobile',
          formType: 'input',
        },
        {
          title: '客户地址',
          key: 'custAddress',
          formType: 'input',
        },
        {
          title: '费用标准',
          key: 'costName',
          formType: 'input',
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    handleCancel(e) {
      this.visible = false
    },
  },
}
</script>
