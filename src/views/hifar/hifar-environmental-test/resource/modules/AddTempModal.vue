<!--
  *
  * @Author: 朱巍巍
  * @Date: 2022/6/24$ 9:46$
  * @LastEditTime: 2022/6/24$ 9:46$
  * @LastEditors: 朱巍巍
  * @Description: $
  * @FilePath: $
 -->
<template>
  <div class='sys-product-select'>
    <div :class="['sys-product-select-wrapper', type]" @click='showSelectModal'>
      <a-tooltip v-if="type === 'radio'" :title='localSelectedName ? localSelectedName : null'>
        <div
          :class="['sys-product-select',disabled?'disabled':'']"
          v-html="
            localSelectedName && localSelectedName.length > 50
              ? localSelectedName.substr(0, 20) + '...'
              : localSelectedName
          "
        ></div>
      </a-tooltip>
      <a-tooltip v-else-if="type === 'checkbox'" :title='localSelectedName ? localSelectedName : null'>
        <div
          :class="['sys-product-select',disabled?'disabled':'']"
          v-html="
            localSelectedName && localSelectedName.length > 50
              ? localSelectedName.substr(0, 20) + '...'
              : localSelectedName
          "
        ></div>
      </a-tooltip>
      <a-button :disabled='disabled' :size='size' icon='select' type='ghost-primary' />
    </div>
    <h-modal
      :getContainer='getContainer'
      :visible='visible'
      destroyOnClose
      fullScreen
      inner
      title='选择报告'
      @cancel='handleCancel'
      @submit='handleSubmit'
    >
      <template>
        <h-card fixed>
          <h-search
            slot='search-form'
            v-model='queryParams'
            :showToggleButton='false'
            :data="searchBar"
            style='width: 100%'
            @change='loadData'
          />
          <a-table
            ref='templateTable'
            style='width: 100%'
            :columns='columns'
            :customRow='onClickRow'
            :data-source='dataList'
            :pagination='false'
            :row-key='(record) => record.id'
            :rowSelection='{ selectedRowKeys: selectedRowKeys,  onChange: onSelect, type: type}'
          />
        </h-card>
      </template>
    </h-modal>
  </div>
</template>

<script>
import { getAction } from '@api/manage'
import { isArray, isFunction, isString } from 'lodash'
import moment from 'moment'

export default {
  name: 'AddTempModal',
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择报告'
    },
    size: {
      type: String,
      default: 'default'
    },
    value: {
      type: [Array, String],
      default: () => []
    },
    type: {
      type: String,
      default: 'checkbox'
    },
    replaceFields: {
      type: Object,
      default: () => {
        return {
          title: 'standardName',
          key: 'id'
        }
      }
    },
    selectedName: {
      type: [Function, String],
      default: ''
    },
    tableData: {
      type: Array,
      default: () => []
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
      }
    },
    tableData: {
      deep: true,
      immediate: true,
      handler(val) {
        this.dataList = val
      }
    }
  },
  data() {
    return {
      // 添加弹窗相关
      visible: false,
      queryParams: {},
      selectedRowKeys: [],
      selectedRows: [],
      localSelectedName: this.selectedName || [],
      dataList: [],
      searchBar: [
        {
          title: '模板名称',
          key: 'c_name_7',
          formType: 'input',
        },
        {
          title: '模版分类',
          key: 'c_reportType_1',
          formType: 'select',
          options: [
            {
              title: '封面',
              key: 'cover',
              value: 'cover',
            },
            {
              title: '报告',
              key: 'report',
              value: 'report',
            },
          ],
        },
      ],
      columns: [
        {
          title: '模板分类',
          dataIndex: 'reportType',
          customRender: (text, record) => {
            return text == 'cover' ? '封面' : text == 'report' ? '报告' : '--'
          }
        },
        {
          title: '模板名称',
          align: 'left',
          dataIndex: 'name',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建人 ',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建时间 ',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '备注',
          align: 'center',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          }
        }
      ],
      url: {
        list: '/HfResTemplateBusiness/listPage'
      }
    }
  },
  mounted() {
    this.loadData()
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
      this.$emit('change', this.selectedRowKeys[0], this.selectedRows[0])
    },
    handleSubmit() {
      let { selectedRowKeys } = this
      if (selectedRowKeys.length > 0) {
        this.handleCancel()
        this.triggerChange()
      } else {
        this.$message.error('请选择报告')
      }
    },
    loadData() {
      let data = {
        ...this.queryParams,
        groupCode: 'report'
      }
      return getAction(this.url.list, data).then((res) => {
        if (res.code === 200) {
          this.dataList = res.data.data
        }
      })
    },
    onClickRow(record) {
      return {
        on: {
          click: () => {
            console.log('onClick-record', record)
            if (this.type === 'radio' && record != undefined) {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
          }
        }
      }
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    showSelectModal() {
      if (this.disabled) return
      this.visible = true
    },
    handleCancel() {
      this.queryParams = {}
      this.visible = false
    }
  }
}
</script>

<style lang='less' scoped>


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