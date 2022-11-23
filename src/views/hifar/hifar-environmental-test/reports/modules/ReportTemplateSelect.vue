<template>
  <h-modal :getContainer='getContainer' :visible='visible' destroyOnClose inner title="选择模板"
           @cancel='handleCancel'>
    <template slot="footer">
      <a-button type='ghost-danger' @click='handleCancel'> 关闭</a-button>
      <a-button :loading='submitLoading' type='ghost-success' @click='handleSubmit'>
        保存
      </a-button>
    </template>
    <h-vex-table
      :columns="columns"
      :data="loadData"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange,type:'radio' }"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
      style="height: 100%"
    >
    </h-vex-table>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'

export default {
  name: "ReportTemplateSelect",
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      visible: false,
      submitLoading: false,
      columns: [
        {}
      ],
      url: {
        list: ""
      },
      selectedRowKeys: [],
      loadData: (params) => {
        return postAction(this.url.list, {...params}).then(res => {
          if (res.code === 200) {
            return res.data
          }
        })
      }
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleCancel() {
      this.visible = false
      this.submitLoading = false
      this.selectedRowKeys = []
    },
    handleSubmit() {
      if (this.submitLoading) return
      if (this.selectedRowKeys.length) {
        this.submitLoading = true
        this.$emit('callback', this.selectedRowKeys)
        this.handleCancel()
      } else {
        this.$message.warning('请选择模板')
      }
    },
  }
}
</script>

<style scoped>

</style>