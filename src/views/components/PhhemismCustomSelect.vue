<!--
 * @Author: 赵峰
 * @Date: 2021-08-09 16:56:44
 * @LastEditTime: 2021-09-16 10:25:01
 * @LastEditors: 赵峰
 * @Descripttion: 系统内客户选择通用组件
 * @FilePath: \hifar-platform-client\src\views\components\PhhemismCustomSelect.vue
-->
<template>
  <div class="sys-product-select">
    <div :class="['sys-product-select-wrapper', type]" @click="showSelectModal">
      <a-tooltip v-if="type === 'radio'" :title="localSelectedName ? localSelectedName : null">
        <div
          v-if="type === 'radio'"
          v-html="localSelectedName"
          class="sys-product-select"
          tabindex="2"
        ></div>
        <div v-else-if="type === 'checkbox'" class="sys-product-select" v-html="localSelectedName"></div>
      </a-tooltip>
      <a-button type="ghost-primary" :size="size" icon='select'></a-button>
    </div>
    <h-modal
      destroyOnClose
      inner
      fullScreen
      :title="title"
      :width="600"
      :visible="visible"
      :confirmLoading="loading"
      :getContainer="getContainer"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <h-card>
        <h-search
          v-model="queryParams"
          slot="search-form"
          size="small"
          :showToggleButton="false"
          :data="columns.filter(v => v.search !== false)"
          @change="handleSearch"
        />
        <h-vex-table
          slot="content"
          ref="customerSelectTable"
          :columns="columns"
          :data="loadData"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect, type: type }"
        ></h-vex-table>
      </h-card>
    </h-modal>
  </div>
</template>

<script>
import {getAction} from '@/api/manage'
import {isArray, isFunction, isString} from 'lodash'
import {CUST_TYPE_OPTIONS} from "@views/hifar/constants";


export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  props: {
    placeholder: {
      type: String,
      default: '请选择客户单位',
    },
    size: {
      type: String,
      default: 'default',
    },
    value: {
      type: [Array, String],
      default: () => [],
    },
    type: {
      type: String,
      default: 'radio',
    },
    replaceFields: {
      type: Object,
      default: () => {
        return {
          title: 'custName',
          key: 'id',
        }
      },
    },
    selectedName: {
      type: [Function, String],
      default: () => {
      },
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (isString(val)) {
          this.selectedRowKeys = val.split(',')
        } else if (isArray(val)) {
          this.selectedRowKeys = val
        } else {
          this.selectedRowKeys = []
        }
        if (isFunction(this.selectedName)) {
          this.localSelectedName = this.selectedName()
        }
      },
    },
    entrustType: {
      immediate: true,
      handler(val) {
        this.localEntrustType = val
      }
    }
  },
  data() {
    return {
      visible: false,
      title: '选择送试单位',
      loading: false,
      localSelectedName: this.selectedName || undefined,
      selectedRowKeys: [],
      selectedRows: [],
      entrustType: "1",
      queryParams: {},
      localEntrustType: '1',
      columns: [
        {
          title: '客户单位',
          dataIndex: 'custName',
          key: 'c_custName_7',
          formType: 'input',
        },
        {
          title: '客户类型',
          dataIndex: 'custType',
          search: false,
          customRender: t => {
            try {
              return CUST_TYPE_OPTIONS.filter(v => v.key === t)[0].title
            } catch {
              return '--'
            }

          }
        },
        {
          title: '客户折扣',
          dataIndex: 'discount',
          key: 'c_discount_7',
          formType: 'input',
        },
        {
          title: '联系人',
          dataIndex: 'linkName',
          key: 'c_linkName_7',
          formType: 'input',
        },
        {
          title: '联系方式',
          dataIndex: 'linkMobile',
          key: 'c_linkMobile_7',
          formType: 'input',
        },
        {
          title: '联系地址',
          dataIndex: 'custAddress',
          key: 'c_custAddress_7',
          formType: 'input',
        },
      ],
      url: '/HfResCustBusiness/listPage',
    }
  },
  methods: {
    triggerChange() {
      switch (this.type) {
        case 'radio':
          this.selectedRows.map((item) => {
            this.localSelectedName = item[this.replaceFields.title]
          })
          break
        case 'checkbox':
          this.localSelectedName = []
          this.selectedRows.map((item) => {
            this.localSelectedName.push(item[this.replaceFields.title])
          })
          break
      }
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
    },
    handleSubmit() {
      this.handleCancel()
      this.triggerChange()
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCancel() {
      this.visible = false
    },
    showSelectModal() {
      this.visible = true
    },
    handleSearch() {
      this.refresh(true)
    },
    refresh(bool = false) {
      this.$refs.customerSelectTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
      }
      let obj = {
        '1': "inside",
        '2': 'outside'
      }
      data.c_custType_1 = obj[this.localEntrustType]
      return getAction(this.url, data).then((res) => {
        if (res.code === 200) {
          return res.data
        }
      })
    },
  },
}
</script>
<style lang="less">
.has-error {
  .sys-product-select,
  .sys-product-select:hover,
  .sys-product-select:focus {
    background-color: #fff;
    border-color: #f5222d !important;
  }
}

.sys-product-select {
  .sys-product-select-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .sys-product-select {
      box-sizing: border-box;
      margin: 0;
      font-variant: tabular-nums;
      list-style: none;
      font-feature-settings: 'tnum';
      position: relative;
      display: inline-block;
      width: 100%;
      height: 32px;
      padding: 4px 11px;
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
      line-height: 1.5;
      background-color: #fff;
      background-image: none;
      border: 1px solid #d9d9d9;
      border-radius: 3px;
      transition: all 0.3s;
      overflow: hidden;

      &:focus {
        border-color: #69b9ff;
        border-right-width: 1px !important;
        outline: 0;
        box-shadow: 0 0 0 2px rgb(64 158 255 / 20%);
      }

      &:empty::before {
        color: lightgrey;
        content: attr(placeholder);
      }
    }

    .ant-btn {
      margin-left: 5px;
    }
  }
}
</style>