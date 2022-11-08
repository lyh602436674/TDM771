<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-14 17:38:04
 * @LastEditTime: 2021-12-08 20:03:04
 * @LastEditors: 赵文凯
 * @Description: 能力参数管理.
 * @FilePath: \tdm200-client\src\views\hifar\hifar-environmental-test\equipmentManage\CapabilityParameter.vue
-->
<template>
  <div ref="capabilityParameter" class="capability-parameter">
    <h-card fixed>
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" @change="refresh"/>
      <template slot="table-operator">
        <a-button v-has="'parameter:add'" icon="plus" size="small" type="ghost-primary" @click="handleAdd"> 新建
        </a-button>
        <a-button
          v-has="'parameter:delete'"
          icon="delete"
          size="small"
          type="danger"
          @click="handleDeleteBatch"
        >
          批量删除
        </a-button>
      </template>
      <h-vex-table
        ref="capabilityParameterTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect }"
      >
        <template slot="actions" slot-scope="text, record">
          <a-icon class="primary-text" type="edit" @click="() => handleEdit(record)"/>
          <a-divider type="vertical"/>
          <a-popconfirm title="确认删除" @confirm="() => handleDelete(record.id)">
            <h-icon class="danger-text" style="cursor:pointer" type="icon-shanchu"/>
          </a-popconfirm>
        </template>
      </h-vex-table>
    </h-card>
    <capability-parameter-modal ref="capabilityParameterModal" @change="refresh"></capability-parameter-modal>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import CapabilityParameterModal from './modules/CapabilityParameterModal.vue'
import mixin from '@/views/hifar/mixin.js'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.capabilityParameter,
    }
  },
  components: {CapabilityParameterModal},
  mixins: [mixin],
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '参数名称',
          key: 'c_paramName_7',
          formType: 'input',
        },
        {
          title: '参数编号',
          key: 'c_paramCode_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '参数编号',
          dataIndex: 'paramCode',
        },
        {
          title: '参数名称',
          dataIndex: 'paramName',
        },
        {
          title: '参数类型',
          formType: 'dict',
          dataIndex: 'paramType_dictText',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '曲线类型',
          dataIndex: 'curveType',
          customRender: (text, record) => {
            return text === '1' ? '温度/℃' : text === '2' ? '湿度/RH' : '--'
          }
        },
        {
          title: '数据类型',
          dataIndex: 'dataType',
          customRender: (text) => {
            switch (text) {
              case 'string':
                return '字符型'
              case 'number':
                return '数值型'
              case 'dateTime':
                return '日期型'
            }
          },
        },
        {
          title: '单位名称',
          dataIndex: 'unitName',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
        },
        {
          title: '操作',
          width: 80,
          align: 'center',
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      selectedRowKeys: [],
      selectedRows: [],
      url: {
        list: '/HfEnvAbilityParamBusiness/listPage',
        delete: '/HfEnvAbilityParamBusiness/logicRemoveById',
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.capabilityParameterTable.refresh(bool)
      this.selectedRowKeys = []
    },
    handleAdd() {
      this.$refs.capabilityParameterModal.add()
    },
    handleEdit(record) {
      this.$refs.capabilityParameterModal.edit(record)
    },
    handleDeleteBatch() {
      if (this.selectedRowKeys.length) {
        this.$confirm({
          title: '确认删除？',
          content: '删除后不可恢复，确认删除？',
          onOk: () => {
            postAction(this.url.delete, {id: this.selectedRowKeys.toString()}).then((res) => {
              if (res.code == 200) {
                this.$message.success('删除成功')
                this.selectedRowKeys = []
                this.selectedRows = []
                this.refresh()
              }
            })
          },
        })
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    handleDelete(ids) {
      postAction(this.url.delete, {id: ids}).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.refresh()
        }
      })
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
  },
}
</script>

<style lang="less">
.capability-parameter {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>