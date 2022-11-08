<!--
 * @Author: 赵峰
 * @Date: 2021-10-20 10:49:19
 * @LastEditTime: 2021-10-20 10:49:19
 * @LastEditors: 赵峰
 * @Descripttion: 方法选择弹窗
 * @FilePath:  \hifar-platform-client\src\views\hifar\hifar-environmental-test\components\MethodSelectModal.vue
-->
<template>
  <div class="sys-product-select">
    <div :class="['sys-product-select-wrapper', type]" @click="showSelectModal">
      <a-tooltip  :title="localSelectedName">
        <div
          v-if="type === 'radio'"
          class="sys-product-select"
          tabindex="2"
          v-html="localSelectedName"
        ></div>
        <div v-else-if="type === 'checkbox'" class="sys-product-select"></div>
      </a-tooltip>
      <a-button :size="size" icon='select' type="ghost-primary"/>
    </div>
    <h-modal
      :confirmLoading="loading"
      :getContainer="getContainer"
      :title="title"
      :visible="visible"
      :width="600"
      destroyOnClose
      fullScreen
      inner
      @cancel="handleCancel"
      @submit="handleSubmit"
    >
      <h-card :bordered="false" fixed>
        <h-search
          slot="search-form"
          v-model="queryParams"
          :data="columns"
          :showToggleButton="false"
          size="small"
          @change="handleSearch"
        />
        <h-tabs slot="content" :activeKey="activeKey" fixed @change="handleChange">
          <a-tab-pane :key="1" tab="关联项目的标准">
            <h-vex-table
              ref="unitMethodsTable"
              :columns="columns"
              :data="loadData"
              :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect, type: type }"
            ></h-vex-table>
          </a-tab-pane>
          <a-tab-pane :key="2" tab="全部">
            <h-vex-table
              ref="allMethodsTable"
              :columns="columns"
              :data="loadData"
              :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect, type: type }"
            ></h-vex-table>
          </a-tab-pane>
        </h-tabs>
      </h-card>
    </h-modal>
  </div>
</template>

<script>
import {getAction} from '@/api/manage'
import {isArray, isFunction, isString} from 'lodash'

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
    unitId: {
      default: () => null,
    },
    groupCode: {
      default: '',
    },
  },
  props: {
    placeholder: {
      type: String,
      default: '请选择标准',
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
          title: 'standardName',
          key: 'id',
        }
      },
    },
    selectedName: {
      type: [Function, String],
      default: () => {
      },
    },
    itemUnitId: {
      type: [Function, String],
      default: '',
    }
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
      title: '选择标准',
      loading: false,
      localSelectedName: this.selectedName || undefined,
      selectedRowKeys: [],
      selectedRows: [],
      activeKey: 1,
      columns: [
        {
          title: '标准编号',
          dataIndex: 'standardCode',
          key: 'c_standardCode_7',
          formType: 'input',
        }, {
          title: '标准名称',
          dataIndex: 'standardName',
          key: 'c_standardName_7',
          formType: 'input',
        },
      ],
      url: {
        unitMethodList: '/HfPrjUnitStandardBusiness/listPageStandardByUnitId',
        allMethodList: '/HfResStandardBusiness/listPage',
      },
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
      let {selectedRowKeys} = this
      if (selectedRowKeys.length > 0 && selectedRowKeys[0] != '') {
        this.handleCancel()
        this.triggerChange()
      } else {
        this.$message.error('请选择方法')
      }
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
      if (this.activeKey == 1) {
        if (this.$refs.unitMethodsTable) {
          this.$refs.unitMethodsTable.refresh(bool)
        }
      } else {
        if (this.$refs.allMethodsTable) {
          this.$refs.allMethodsTable.refresh(bool)
        }
      }
    },
    handleChange(v) {
      this.activeKey = v
      this.refresh(true)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
      }
      let url = null
      if (this.activeKey == 1) {
        data.groupCode = this.groupCode
        data.unitId = this.itemUnitId() || this.unitId()
        url = this.url.unitMethodList
      } else {
        url = this.url.allMethodList
      }
      return getAction(url, data).then((res) => {
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