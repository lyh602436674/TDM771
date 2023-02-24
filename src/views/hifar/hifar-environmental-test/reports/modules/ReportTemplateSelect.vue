<template>
  <h-modal :getContainer='getContainer' :visible='visible' :width="1400" destroyOnClose inner title="选择模板"
           @cancel='handleCancel'>
    <template slot="footer">
      <a-button type='ghost-danger' @click='handleCancel'> 关闭</a-button>
      <a-button :loading='submitLoading' type='ghost-success' @click='handleSubmit'>
        确定
      </a-button>
    </template>
    <h-vex-table
      ref="templateTable"
      :columns="columns"
      :data="loadData"
      height="350"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange,type:'radio' }"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
      style="height: 100%"
    >
    </h-vex-table>

    <h-card v-if="selectedRowKeys.length" style="margin-top:20px" title="报告内容信息">
      <a-checkbox-group :value="checkboxValue" @change="handleCheckboxChange">
        <a-checkbox
          v-for="item in checkboxOptions"
          :key="item.value"
          :data-title="item.title"
          :value="item.value"
        >
          {{ item.title }}
        </a-checkbox>
      </a-checkbox-group>
    </h-card>

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
      checkboxValue: ['1', '2', '3', '4'],
      checkboxOptions: [
        {title: "试前检查单", value: "1"},
        {title: "样品图片", value: "2"},
        {title: "图片图谱", value: "3"},
        {title: "附件", value: "4"},
        {title: "项目附件", value: "5"},
      ],
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
        return postAction(this.url.list, {...params, reportType: '1'}).then(res => {
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
    handleCheckboxChange(checked) {
      this.checkboxValue = checked
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
        this.$emit('callback', this.selectedRowKeys, this.checkboxValue)
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