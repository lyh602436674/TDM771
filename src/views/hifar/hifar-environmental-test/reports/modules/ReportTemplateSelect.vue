<template>
  <h-modal :getContainer='getContainer' :visible='visible' :width="1400" destroyOnClose inner title="选择模板"
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
      height="500"
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
import moment from "moment";

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
        {
          title: '模板分类',
          dataIndex: 'reportType_dictText',
          align: 'left',
        },
        {
          title: '模板名称',
          align: 'left',
          dataIndex: 'name',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建人 ',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '创建时间 ',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '备注',
          align: 'left',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
      ],
      url: {
        list: "/HfResTemplateBusiness/listPage"
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