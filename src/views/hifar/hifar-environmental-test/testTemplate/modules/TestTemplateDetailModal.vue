<!--
 * @Author: 赵峰
 * @Date: 2021-10-27 11:43:16
 * @LastEditTime: 2021-10-27 13:43:42
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\testTemplate\modules\TestTemplateDetailModal.vue
-->
<template>
  <h-modal :title="title" inner fullScreen :getContainer="getContainer" :visible="visible" @cancel="handleCancel">
    <div slot="footer">
      <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
    </div>
    <div style="padding: 8px 25px">
      <h-descriptions title="基本信息" bordered size="small" :column="2">
        <a-descriptions-item label="模板名称" :span="2">
          {{ model.checkName || '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建人">
          {{ model.createUserName || '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{
            model.createTime && model.createTime != 0
              ? moment(parseInt(model.createTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </a-descriptions-item>
        <a-descriptions-item label="更新人">
          {{ model.updateUserName || '--' }}
        </a-descriptions-item>
        <a-descriptions-item label="更新时间">
          {{
            model.updateTime && model.updateTime != 0
              ? moment(parseInt(model.updateTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">
          {{ model.remarks || '--' }}
        </a-descriptions-item>
      </h-descriptions>
      <h-descriptions title="检查项" style="margin-top: 20px">
        <a-descriptions-item>
          <vxe-table border show-all-overflow keep-source ref="testCheckTable" :data="model.checkItem">
            <vxe-table-column type="seq" width="60"></vxe-table-column>
            <vxe-table-column title="检查项" field="itemName"></vxe-table-column>
            <vxe-table-column title="检查内容" field="itemContent"></vxe-table-column>
            <vxe-table-column title="检查要求" field="itemRequire"></vxe-table-column>
            <vxe-table-column title="是否复核" field="checkFlag">
              <template #default="{ row }">
                <span>{{ row.checkFlag == 1 ? '是' : row.checkFlag == 2 ? '否' : '--' }}</span>
              </template>
            </vxe-table-column>
            <vxe-table-column title="备注" field="remarks"></vxe-table-column>
          </vxe-table>
        </a-descriptions-item>
      </h-descriptions>
    </div>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { getAction, postAction } from '@/api/manage'
export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      title: '',
      visible: false,
      checkType: '',
      model: {},
      testCheckData: [],
      url: {
        detail: '/HfEnvTestCheckBusiness/queryCheckTemplateAndItemById',
      },
    }
  },

  methods: {
    show(record, title) {
      console.log(record, title)
      this.visible = true
      this.title = title
      this.loadDetailData(record.id)
    },
    loadDetailData(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          this.editor(res.data)
        }
      })
    },
    editor(record) {
      let obj = Object.assign({}, record)
      this.model = obj
    },
    handleCancel() {
      this.visible = false
      this.testCheckData = []
      this.$emit('change', true)
    },
  },
}
</script>
<style lang='less' scoped>
</style>