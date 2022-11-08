<!--
 * @Author: 赵文凯
 * @Date: 2021-12-10 14:30:56
 * @LastEditTime: 2021-12-13 10:12:05
 * @LastEditors: 赵文凯
 * @Description: 能力参数
 * @FilePath: \新建文件夹 (2)\tdm200-client\src\views\hifar\hifar-environmental-test\methodStandardLibrary\modules\ParametersLibrary.vue
-->
<template>
  <div ref="parametersLibrary" class="parametersLibrary">
    <!-- 能力参数 -->
    <h-card fixed :bordered="false" :title="title + ' 能力参数'">
      <h-search
        v-model="parameterQueryParams"
        slot="search-form"
        size="small"
        :showToggleButton="false"
        :data="parameterSearchBar"
        @change="handleSearch('equipmentParameterTable')"
      />
      <template slot="table-operator">
        <a-button type="ghost-primary" size="small" icon="plus" @click="handleAdd">添加参数</a-button>
      </template>
      <!--      <h-vex-table-->
      <!--        slot="content"-->
      <!--        ref="equipmentParameterTable"-->
      <!--        :columns="columns"-->
      <!--        :autoLoad="false"-->
      <!--        :data="loadData"-->
      <!--        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"-->
      <!--      >-->
      <!--        <a slot="conditionType" slot-scope="text, record" @click="() => handleAddCondition(record)">-->
      <!--          {{ record.conditionTypeDesc || '未设置' }}-->
      <!--        </a>-->
      <!--        <template slot="actions" slot-scope="text, record">-->
      <!--          <a-popconfirm title="确认删除？" @confirm="() => handleDelete(record.id)">-->
      <!--            <h-icon class="danger-text" type="icon-shanchu" style="cursor: pointer"/>-->
      <!--          </a-popconfirm>-->
      <!--        </template>-->
      <!--      </h-vex-table>-->
      <h-edit-table
        uid="equipmentParameterTable"
        ref="equipmentParameterTable"
        slot="content"
        :autoLoad="false"
        :editConfig="editConfig"
        :editRules="editRules"
        :columns="columns"
        :data="loadData"
      ></h-edit-table>
    </h-card>
    <methods-standard-parameter ref="equipmentParameter" @change="refresh"></methods-standard-parameter>
    <editor-point-modal ref="editorPointModal" @change="handleSubmitPoint"/>
    <string-modal ref="StringModal" @change="handleSubmitPoint"></string-modal>
    <date-time-modal ref="DateTimeModal" @change="handleSubmitPoint"></date-time-modal>
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import StringModal from '@/views/hifar/hifar-environmental-test/equipmentManage/modules/StringModal'
import DateTimeModal from '@/views/hifar/hifar-environmental-test/equipmentManage/modules/DateTimeModal'
import EditorPointModal from '@/views/components/EditorPointModal'
import MethodsStandardParameter
  from "@views/hifar/hifar-environmental-test/methodStandardLibrary/modules/MethodsStandardParameter";

export default {
  components: {
    MethodsStandardParameter, EditorPointModal, StringModal, DateTimeModal
  },
  props: {
    selectedRows: {
      type: [Array, Object],
      default: () => {
      },
    },
  },
  data() {
    return {
      id: null,
      editConfig: {
        trigger: 'click',
        mode: 'row',
        autoClear: true,
        showIcon: true,
        showStatus: true,
        showUpdateStatus: true,
        showAsterisk: true,
        showInsertStatus: true,
      },
      editRules: {},
      title: '',
      activeKey: 0,
      // 试验项目信息
      unitInfo: {},
      selectedKeys: [],
      // 指标库相关配置
      parameterQueryParams: {},
      parameterSearchBar: [
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
      dataTypeTransform: {'string': '字符型', 'number': '数值型', 'dateTime': "日期型"},
      columns: [
        {
          title: '参数编号',
          key: 'paramCode',
        },
        {
          title: '参数名称',
          key: 'paramName',
        },
        {
          title: '数据类型',
          key: 'dataType',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              // return [<span>{this.dataTypeTransform[row[column.property]] || '--'}</span>]
              return h('span', {}, [this.dataTypeTransform[row[column.property]] || '--'])
            },
          }
        },
        {
          title: '判读条件',
          key: 'conditionTypeDesc',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, {row, column}) => {
              if (row.dataType === 'number') {
                return h('a-input-number', {
                  props: {
                    value: row[column.property],
                  },
                  style: {
                    width: '100%',
                  },
                  on: {
                    change: (value) => {
                      row[column.property] = value
                    },
                    blur: () => {
                      this.conditionTypeDescOfNumberChange(row)
                    }
                  },
                })
              } else if (row.dataType === 'string') {
                return h('a-input', {
                  props: {
                    value: row[column.property],
                  },
                  attrs: {
                    style: {
                      width: '100%',
                    },
                  },
                  on: {
                    change: (e) => {
                      row[column.property] = e.target.value
                    },
                    blur: () => {
                      this.conditionTypeDescOfStringChange(row)
                    }
                  },
                })
              }
            },
            renderCell: (h, renderOpts, {row, column}) => {
              return h('span', {}, [row[column.property] || '不判读'])
            },
          },
        },
        {
          title: '操作',
          width: 100,
          align: 'center',
          fixed: 'right',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, params) => {
              return h('h-icon', {
                props: {type: 'icon-shanchu'},
                class: 'danger-text',
                on: {
                  click: () => {
                    this.handleDelete(params.row.id)
                  },
                },
              })
            },
          },
        },
      ],
      selectedRowKeys: [],
      selectedLeftRows: [],
      url: {
        list: '/HfMethodStaLibParamBusiness/listPageMethodStaLibParamByMethodId',
        delete: '/HfMethodStaLibParamBusiness/logicRemoveById',
        edit: "/HfMethodStaLibParamBusiness/modifyById",
        editPoint: '/HfResEquipParamBusiness/modifyResEquipParamById',
      },
    }
  },
  watch: {
    selectedRows: {
      immediate: true,
      deep: true,
      handler(val) {
        this.$nextTick(() => {
          this.selectedLeftRows = val
          this.refresh(true)
        })
      },
    },
  },
  methods: {
    loadData(params) {
      let data = {
        ...params,
        ...this.parameterQueryParams,
        methodId: this.selectedLeftRows[0].id,
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    conditionTypeDescOfNumberChange(row) {
      row.minValue = row.conditionTypeDesc
      postAction(this.url.edit, row).then((res) => {
        if (res.code == 200) {
          this.$message.success('添加成功')
          this.refresh()
        }
      })
    },
    conditionTypeDescOfStringChange(row) {
      row.strValue = row.conditionTypeDesc
      postAction(this.url.edit, row).then((res) => {
        if (res.code == 200) {
          this.$message.success('添加成功')
          this.refresh()
        }
      })
    },
    handleSearch(tab) {
      this.$refs[tab].refresh(true)
      this.selectedRowKeys = []
    },
    handleDelete(ids) {
      postAction(this.url.delete, {id: ids}).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.selectedRowKeys = []
          this.refresh()
        }
      })
    },
    handleSubmitPoint(val) {
      postAction(this.url.editPoint, val).then((res) => {
        if (res.code == 200) {
          this.$message.success('添加成功')
          this.refresh()
        }
      })
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      // this.selectedRows = selectedRows
    },
    refresh(bool = true) {
      // this.$refs.equipmentParameter.refresh(bool)
      this.$refs.equipmentParameterTable.refresh(bool)
    },
    handleAdd() {
      this.$refs.equipmentParameter.show(this.selectedRows[0].id)
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleAddCondition(record) {
      console.log('record', record)
      if (record.dataType == 'number') {
        this.$refs.editorPointModal.show(record)
      } else if (record.dataType == 'dateTime') {
        this.$refs.DateTimeModal.show(record)
      } else {
        this.$refs.StringModal.show(record)
      }
    },
  },
}
</script>

<style lang='less'>
.parametersLibrary {
  height: 100%;
  position: relative;
}
</style>