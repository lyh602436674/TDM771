<!--
 * @Author: 赵峰
 * @Date: 2021-11-03 18:12:50
 * @LastEditTime: 2021-11-25 11:44:46
 * @LastEditors: 赵峰
 * @Descripttion: 试验管理-试验对应任务的所有样品数据
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testRecord\components\PieceListSelect.vue
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
      <div
        v-else-if="type === 'checkbox'"
        v-html="selectedName"
        class="sys-product-select"
        :placeholder="placeholder"
      ></div>
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
      :getContainer="getContainer"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <h-card>
        <h-search
          v-model="queryParams"
          slot="search-form"
          size="small"
          :showToggleButton="true"
          :data="searchData"
          style="width:100%"
          @change="handleSearch"
        />
        <h-table
          slot="content"
          ref="productSelectTable"
          :bordered="true"
          :columns="columns"
          :data="loadData"
          :rowKey="(record) => record.id"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect, type: type }"
        ></h-table>
      </h-card>
    </h-modal>
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import {isArray, isString} from 'lodash'

export default {
  inject: ['getContainer', 'testId'],
  props: {
    title: {
      type: String,
      default: '选择试验样品',
    },
    placeholder: {
      type: String,
      default: '请选择试验样品',
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
          title: 'pieceNo',
          key: 'id',
        }
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
      url: '/HfEnvTestPieceBusiness/listPage',
      searchData: [
        {
          title: '试验名称',
          key: 'c_testName_7',
          formType: 'input',
        },
        {
          title: '样品名称',
          key: 'c_productName_7',
          formType: 'input',
        },
        {
          title: '型号/规格',
          key: 'c_productModel_7',
          formType: 'input',
        },
        {
          title: '图号',
          key: 'c_productAlias_7',
          formType: 'input',
        },
        {
          title: '样品编号',
          dataIndex: 'c_pieceNo_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '样品名称',
          dataIndex: 'productName',
          align: "center"
        },
        {
          title: '型号/规格',
          dataIndex: 'productModel',
          align: "center",
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '图号',
          dataIndex: 'productAlias',
          align: "center",
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '样品编号',
          align: "center",
          dataIndex: 'pieceNo',
        },
        {
          title: '试验名称',
          align: "center",
          dataIndex: 'testName',
        },
      ],
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
          this.selectedName =
            isArray(this.selectedName) && this.selectedName.length > 0 ? this.selectedName.join(',') : ''
          break
      }
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
    },
    handleSubmit() {
      this.triggerChange()
      this.handleCancel()
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCancel() {
      this.selectedRowKeys = []
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
        c_testId_1: this.testId(),
      }
      data.pageSize = 2000
      return postAction(this.url, data).then((res) => {
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