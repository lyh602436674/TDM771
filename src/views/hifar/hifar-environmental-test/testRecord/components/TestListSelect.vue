<!--
 * @Author: 赵峰
 * @Date: 2021-11-03 16:54:36
 * @LastEditTime: 2021-11-03 18:21:18
 * @LastEditors: 赵峰
 * @Descripttion: 试验列表弹窗（未完成的数据）
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testRecord\components\TestListSelect.vue
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
        {{ selectedName }}
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
import { postAction } from '@/api/manage'
import { isString, isArray } from 'lodash'
import moment from 'moment'
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
      default: '选择试验',
    },
    placeholder: {
      type: String,
      default: '请选择试验',
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
          title: 'unitNames',
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
        console.log(this.selectedRowKeys)
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
      searchData: [
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input',
        },
        {
          title: '委托单位',
          key: 'custName',
          formType: 'input',
        },
        {
          title: '试验项目',
          key: 'unitName',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '试验名称',
          dataIndex: 'testNames',
          minWidth: 100,
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 160,
        },
        {
          title: '试验项目',
          dataIndex: 'unitNames',
          minWidth: 100,
        },
        {
          title: '试验设备',
          dataIndex: 'equipName',
          minWidth: 100,
        },
        {
          title: '委托单位',
          dataIndex: 'custNames',
          minWidth: 100,
        },
        {
          title: '期望开始时间',
          dataIndex: 'predictStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 100,
        },
        {
          title: '预计用时(h)',
          dataIndex: 'predictUseTime',
          minWidth: 100,
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 100,
        },
        {
          title: '实际用时(h)',
          dataIndex: 'realUseTime',
          minWidth: 100,
        },
      ],
      url: '/HfEnvTaskTestBusiness/listPageForEquip',
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
        c_status_97: '1,20,25,30',
      }
      return postAction(this.url, data).then((res) => {
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