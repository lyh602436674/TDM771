<!--
 * @Author: 马潭龙
 * @Date: 2021-11-24 11:17:49
 * @LastEditTime: 2021-11-24 18:43:08
 * @LastEditors: 马潭龙
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\components\PhemismUserSelect.vue
-->
<template>
  <div class="sys-product-select">
    <div :class="['sys-product-select-wrapper', type]" @click="showSelectModal">
      <div
        v-if="type === 'radio'"
        v-html="localSelectedName"
        class="sys-product-select"
        tabindex="2"
        :placeholder="placeholder"
      ></div>
      <div v-else-if="type === 'checkbox'"  v-html="localSelectedName"
           tabindex="2"
           :placeholder="placeholder" class="sys-product-select">
      </div>
      <a-button type="ghost-primary" :size="size" icon="select"> </a-button>
    </div>
    <h-modal
      destroyOnClose
      inner
      fullScreen
      :title="title"
      :width="600"
      :visible="visible"
      :confirmLoading="loading"
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
import { getAction } from '@/api/manage'
import { isString, isArray, isFunction } from 'lodash'
export default {
  // inject: ['centerId'],
  props: {
    placeholder: {
      type: String,
      default: '请选择试验员单位',
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
      default: () => {},
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
  },
  data() {
    return {
      visible: false,
      queryParams: {},
      title: '选择',
      loading: false,
      localSelectedName: this.selectedName || undefined,
      selectedRowKeys: [],
      selectedRows: [],
      columns: [
        {
          title: '用户姓名',
          dataIndex: 'idName',
          key: 'c_idName_7',
          formType: 'input',
        },
        {
          title: '部门名称',
          dataIndex: 'deptName',
          key: 'c_deptName_7',
          formType: 'input',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '联系电话',
          dataIndex: 'mobile',
          key: 'c_mobile_7',
          formType: 'input',
          customRender: (text, record) => {
            return text || '--'
          },
        },
      ],
      url: '/HfPrjWorkCenterUserBusiness/listPageUserByCenterId',
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
    refresh(bool = true) {
      this.$refs.customerSelectTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        // centerId: this.centerId(),
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
      z-index: 9999;

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