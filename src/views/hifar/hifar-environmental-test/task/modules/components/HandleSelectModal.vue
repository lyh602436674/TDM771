<template>
  <h-modal
    :title="title"
    destroyOnClose
    inner
    fullScreen
    :getContainer="getContainer"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card fixed>
      <h-search
          v-if="searchData.length"
          slot="search-form"
          v-model="queryParams"
          :data="searchData"
          :showToggleButton="true"
          size="small"
          @change="refresh"
      />
      <h-vex-table
        ref="vexTable"
        :checkMethod="checkMethod"
        :columns="columns"
        :data="loadData"
        :rowKey="(record) => record.id"
        :rowSelection="{ selectedRowKeys, onSelect: tableSelectChange, type: multiple ? 'checkbox' : 'radio' }"
        style="width: 100%"
      >
        <template v-for="item in columnsSlot" :slot="item.slot" slot-scope="text,row">
          <span v-html="item.template(row)"></span>
        </template>
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'

export default {
  name: 'HandleSelectModal',
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  computed: {
    columnsSlot() {
      let result = []
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].scopedSlots && this.columns[i].scopedSlots.customRender && this.columns[i].scopedSlots.template) {
          result.push({
            slot: this.columns[i].scopedSlots.customRender,
            template: this.columns[i].scopedSlots.template
          })
        }
      }
      return result
    }
  },
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    searchData: {
      type: Array,
      default: () => [],
    },
    dataUrl: {
      type: Object,
      default: () => {
      },
    },
    title: {
      type: String,
      default: '新增',
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: '',
    },
    checkMethod: {
      type: Function,
      default: () => true
    },
  },
  data() {
    return {
      moment,
      visible: false,
      confirmLoading: false,
      loading: false,
      queryParams: {},
      url: {
        list: this.dataUrl.list,
      },
      selectedRowKeys: [],
      selectedRows: [],
      ids: [],
    }
  },
  methods: {
    show(record, field) {
      // field 是指定取record中那个字段
      this.visible = true
      this.selectedRows = []
      this.selectedRowKeys = []
      if (record && record.length) {
        this.ids = record.map((item) => item[field || 'id'])
      } else {
        this.ids = []
      }
    },
    refresh(bool = true) {
      this.$refs.vexTable.refresh(bool)
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.$emit('callback', this.selectedRows)
      this.handleCancel()
    },
    tableSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows
      this.selectedRowKeys = selectedRowKeys
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        ...this.dataUrl.queryParams,
        c_id_99: this.ids.join(','),
      }
      this.confirmLoading = true
      return postAction(this.url.list, data)
        .then((res) => {
          if (res.code === 200) {
            const {data} = res
            if (this.type === 'product') {
              if (data.length) {
                data.map((item, index) => {
                  return (item.id = index)
                })
              }
            }
            return data
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
  },
}
</script>

<style scoped>
</style>