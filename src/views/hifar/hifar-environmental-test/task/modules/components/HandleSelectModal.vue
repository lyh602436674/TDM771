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
          :columns="columns"
          :data="loadData"
          :rowKey="(record) => record.id"
          :rowSelection="{ selectedRowKeys, onSelect: tableSelectChange, type: multiple ? 'checkbox' : 'radio' }"
          style="width: 100%"
      >
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'

export default {
  name: 'HandleSelectModal',
  inject: {
    getContainer: {
      default: () => document.body,
    },
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
  },
  data() {
    return {
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
    show(record) {
      this.visible = true
      this.selectedRows = []
      this.selectedRowKeys = []
      if (record && record.length) {
        let ids = []
        record.forEach((item) => {
          ids.push(item.id)
        })
        this.ids = ids
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
      if (this.multiple) {
        this.selectedRows = selectedRows
        this.selectedRowKeys = selectedRowKeys
      } else {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      }
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
            const { data } = res
            if (this.type === 'product') {
              if (data.length) {
                data.map((item, index) => {
                  return (item.id = index)
                })
              }
            }
            return res.data
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