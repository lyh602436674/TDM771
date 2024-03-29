<template>
  <div class="sys-product-select">
    <div :class="['sys-product-select-wrapper', type]" @click="showSelectModal">
      <a-tooltip v-if="type === 'radio'" :title="localSelectedName ? localSelectedName : null">
        <div
          :class="['sys-product-select',disabled?'disabled':'']"
          v-html="
            localSelectedName && localSelectedName.length > 50
              ? localSelectedName.substr(0, 20) + '...'
              : localSelectedName
          "
        ></div>
      </a-tooltip>
      <a-tooltip v-else-if="type === 'checkbox'" :title="localSelectedName ? localSelectedName : null">
        <div
          :class="['sys-product-select',disabled?'disabled':'']"
          v-html="
            localSelectedName && localSelectedName.length > 50
              ? localSelectedName.substr(0, 20) + '...'
              : localSelectedName
          "
        ></div>
      </a-tooltip>
      <a-button :disabled="disabled" :size="size" icon="select" type="ghost-primary"/>
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
      <h-card :bordered="false">
        <a-table
          :bordered="true"
          :columns="columns"
          :customRow="onClickRow"
          :data-source="dataList"
          :pagination="false"
          :row-key="(record) => record.id"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect, type: type }"
        ></a-table>
      </h-card>
    </h-modal>
  </div>
</template>

<script>
import {isArray, isFunction, isString} from 'lodash'

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
    pieceTableData: {
      default: () => null,
    },
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择产品',
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
      default: 'checkbox',
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
    selectedName: {
      type: [Function, String],
      default: ''
    },
    entrustType: {
      type: String,
      default: '1'
    },
  },
  computed: {
    localPieceTableData() {
      return this.pieceTableData()
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
    localPieceTableData: {
      deep: true,
      immediate: true,
      handler(val) {
        let value = val.value
        this.dataList = value
        this.selectedRows = value && value.length && value.filter(item => this.selectedRowKeys.includes(item.id))
      }
    }
  },
  data() {
    return {
      visible: false,
      queryParams: {},
      title: '选择产品',
      loading: false,
      localSelectedName: this.selectedName || [],
      dataList: [],
      selectedRowKeys: [],
      selectedRows: [],
      pieceNoArr: [],
      pieceIds: [],
      columns: [
        {
          title: '产品名称',
          align: 'center',
          dataIndex: 'productName',
        },
        {
          title: '产品代号',
          dataIndex: 'productAlias',
          align: 'center',
        },
        {
          title: '产品编号',
          align: 'center',
          dataIndex: 'pieceNo',
        },
        {
          title: '产品数量',
          align: 'center',
          dataIndex: 'pieceNum',
        },
      ],
      activeKey: 1,
      url: {
        detailById: '/HfEnvEntrustBusiness/queryById',
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
          let localSelectedName = []
          this.selectedRows.map((item) => {
            localSelectedName.push(item[this.replaceFields.title])
            this.localSelectedName = localSelectedName.toString()
          })
          break
      }
      this.$emit('change', this.selectedRowKeys, this.selectedRows, this.pieceNoArr)
    },
    handleSubmit() {
      let {selectedRowKeys} = this
      if (selectedRowKeys.length) {
        this.triggerChange()
        this.handleCancel()
      } else {
        this.$message.error('请选择产品')
      }
    },
    onClickRow(record) {
      return {
        on: {
          click: () => {
            if (this.type === 'radio') {
              let keys = []
              keys.push(record.id)
              this.selectedRowKeys = keys
            }
          },
        },
      }
    },
    onSelect(selectedRowKeys, selectedRows) {
      let pieceIds = []
      let pieceNoArr = []
      selectedRows.forEach((item) => {
        pieceIds.push(item.id)
        pieceNoArr.push(item.pieceNo)
      })
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      this.pieceIds = pieceIds
      this.pieceNoArr = pieceNoArr
    },
    handleCancel() {
      this.visible = false
    },
    showSelectModal() {
      if (this.disabled) return
      this.visible = true
    },
    handleSearch() {
      this.refresh(true)
    },
    handleChange(v) {
      this.activeKey = v
      this.refresh(true)
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

.disabled {
  background-color: #f5f5f5 !important;
  cursor: not-allowed !important;
  color: rgba(0, 0, 0, 0.25) !important;
  pointer-events: none;
}
</style>