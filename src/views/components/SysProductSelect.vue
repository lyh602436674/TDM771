<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-05 15:02:02
 * @LastEditTime: 2021-09-16 11:08:27
 * @LastEditors: 赵峰
 * @Description: 系统内试品选择通用组件
 * @FilePath: \hifar-platform-client\src\views\components\SysProductSelect.vue
-->
<template>
  <div class="sys-product-select">
    <div :class="['sys-product-select-wrapper', type]" @click="showSelectModal">
      <div
        v-if="type === 'radio'"
        v-html="selectedName"
        class="sys-product-select"
        tabindex="2"
        :placeholder="placeholder"
      ></div>
      <div v-else-if="type === 'checkbox'" class="sys-product-select">
        {{ selectedName}}
      </div>
      <a-button type="ghost-primary" :size="size" icon='select'>
      </a-button>
      <!-- <a-button type="primary" :size="size">
        {{ title }}
      </a-button> -->
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
          :data="columns"
          @change="handleSearch"
        />
        <h-vex-table
          slot="content"
          ref="productSelectTable"
          :columns="columns"
          :data="loadData"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect, type: type }"
        ></h-vex-table>
      </h-card>
    </h-modal>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import { isString, isArray } from 'lodash'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  props: {
    title: {
      type: String,
      default: '选择试品',
    },
    placeholder: {
      type: String,
      default: '请选择试品',
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
          title: 'productName',
          key: 'id',
        }
      },
    },
    groupCode: {
      type: String,
      default: 'product',
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
        console.log(this.selectedRowKeys)
      },
    },
    groupCode: {
      immediate: true,
      handler(val) {
        if (val == 'product') {
          this.columns = this.backUpColumns[0]
          this.url = '/HfProductBaseBusiness/listPageProduct'
        } else {
          this.columns = this.backUpColumns[1]
          this.url = '/HfProductBaseBusiness/listPageMaterial'
        }
        this.groupCode = val
      },
    },
  },
  data() {
    return {
      visible: false,
      queryParams: {},
      loading: false,
      selectedName: this.name || undefined,
      selectedRowKeys: [],
      selectedRows: [],
      columns: [],
      backUpColumns: [
        // 试品
        [
          {
            title: '试品名称',
            dataIndex: 'productName',
            key: 'c_productName_7',
            formType: 'input',
          },
          {
            title: '试品型号',
            dataIndex: 'productModel',
            key: 'c_productModel_7',
            formType: 'input',
          },
          {
            title: '试品编号',
            dataIndex: 'productCode',
            key: 'c_productCode_7',
            formType: 'input',
          },
        ],
        // 材料
        [
          {
            title: '试品名称',
            dataIndex: 'productName',
            key: 'c_productName_7',
            formType: 'input',
          },
          {
            title: '试品规格',
            dataIndex: 'productSpec',
            key: 'c_productSpec_7',
            formType: 'input',
          },
          {
            title: '试品编号',
            dataIndex: 'productCode',
            key: 'c_productCode_7',
            formType: 'input',
          },
          {
            title: '牌号',
            dataIndex: 'drawNo',
            key: 'c_drawNo_7',
            formType: 'input',
          },
          {
            title: '交付状态',
            dataIndex: 'deliveryTypeName',
            key: 'c_deliveryTypeName_7',
            formType: 'input',
          },
          {
            title: '计量单位',
            dataIndex: 'calculateUnit',
            key: 'c_calculateUnit_7',
            formType: 'input',
          },
          {
            title: '技术条件',
            dataIndex: 'technology',
            key: 'c_technology_7',
            formType: 'input',
          },
        ],
      ],
      url: '',
    }
  },
  methods: {
    triggerChange() {
      switch (this.type) {
        case 'radio':
          this.selectedRows.map((item) => {
            this.selectedName = item[this.replaceFields.title]
          })
          break
        case 'checkbox':
          this.selectedName = []
          this.selectedRows.map((item) => {
            this.selectedName.push(item[this.replaceFields.title])
          })
          this.selectedName =  isArray(this.selectedName) && this.selectedName.length > 0 ? this.selectedName.join(',') :''
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
      this.selectedRowKeys
      this.visible = false
    },
    showSelectModal() {
      this.visible = true
    },
    handleSearch() {
      this.refresh(true)
    },
    refresh(bool = true) {
      this.$refs.productSelectTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        groupCode: this.groupCode,
      }
      return getAction(this.url, data).then((res) => {
        if (res.code == 200) {
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