<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 15:53:25
 * @LastEditTime: 2021-11-30 14:39:30
 * @LastEditors: 马潭龙
 * @Descripttion: 设备传感器
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\EquipmentSensor.vue
-->
<template>
  <div ref="equipmentParameter" style="height: 100%; width: 100%; position: relative">
    <r-l-layout style="height: 100%">
      <div class="ep-left" slot="left" style="height: 100%">
        <h-card fixed title="设备列表">
          <a-tree
            v-if="equipmentTree.length"
            size="small"
            style="overflow: auto"
            :treeData="equipmentTree"
            :selectedKeys="selectedKeys"
            :replaceFields="replaceFields"
            @select="onTreeNodeSelect"
          >
            <div slot="customTitle" slot-scope="record" class="custom-title">
              <div>
                <h-icon class="warning-text" type="icon-xiangmuchengyuan" />
                <span>
                  {{ record.title }}
                </span>
              </div>
            </div>
          </a-tree>
          <a-empty
            v-else
            style="
              height: 100%;
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
            "
          />
        </h-card>
      </div>
      <div slot="right" style="height: 100%; background: #fff">
        <div v-if="selectedKeys.length" class="ep-wrapper">
          <div style="width: 100%; flex: 1; overflow: hidden">
            <h-card fixed>
              <span slot="title"> {{ title }}-传感器 </span>
              <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh" />
              <template slot="table-operator">
                <a-button v-has="'sensor:add'" type="ghost-primary" size="small" icon="plus" @click="handleAdd">添加</a-button>
                <a-button v-has="'sensor:delete'" type="danger" size="small" icon="delete" @click="handleDeleteBatch">
                  批量删除
                </a-button>
              </template>
              <h-vex-table
                slot="content"
                ref="equipmentParameterTable"
                :columns="columns"
                :data="loadData"
                :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
              >
                <a
                  href="javascript:;"
                  slot="conditionType"
                  slot-scope="text, record"
                  @click="() => handleAddCondition(record)"
                >
                  {{ record.conditionTypeDesc || '未设置' }}
                </a>
                <template slot="actions" slot-scope="text, record">
                  <a-popconfirm title="确认删除？" @confirm="() => handleDelete(record.id)">
                    <h-icon class="danger-text" type="icon-shanchu" style="cursor: pointer" />
                  </a-popconfirm>
                </template>
              </h-vex-table>
            </h-card>
          </div>
        </div>
        <a-empty
          v-else
          description="请先选择一个设备"
          style="
            background: #fff;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          "
        />
      </div>
    </r-l-layout>
    <equipment-parameter-modal ref="equipmentParameterModal" @change="refresh"></equipment-parameter-modal>
    <equipment-sensor-modal ref="EquipmentSensorModal" @change="refresh"></equipment-sensor-modal>
    <editor-point-modal ref="editorPointModal" @change="handleSubmitPoint" />
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import EquipmentParameterModal from './modules/EquipmentParameterModal.vue'
import EquipmentSensorModal from './modules/EquipmentSensorModal.vue'
import EquipmentDetail from './modules/EquipmentDetail.vue'
import EditorPointModal from '@/views/components/EditorPointModal'
import mixin from '@/views/hifar/mixin.js'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.equipmentParameter,
    }
  },
  components: {
    EquipmentParameterModal,
    EquipmentDetail,
    EditorPointModal,
    EquipmentSensorModal,
  },
  mixins:[mixin],
  data() {
    return {
      moment,
      queryParams: {},
      equipmentTree: [],
      selectedKeys: [],
      replaceFields: {
        children: 'children',
        title: 'title',
        value: 'id',
        key: 'id',
      },
      searchForm: [
        {
          title: '设备编号',
          key: 'c_equipCode_7',
          formType: 'input',
        },
        {
          title: '设备名称',
          key: 'c_equipName_7',
          formType: 'input',
        },
        {
          title: '设备型号',
          key: 'c_equipModel_7',
          formType: 'input',
        },
      ],
      title: '',
      columns: [
        {
          title: '设备编号',
          align: 'left',
          width: 100,
          dataIndex: 'equipCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备名称',
          align: 'left',
          dataIndex: 'equipName',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          align: 'left',
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '检定日期',
          dataIndex: 'checkTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '检定有限期',
          dataIndex: 'checkValid',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          },
        },
        {
          title: '检定编号',
          dataIndex: 'checkCode',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'center',
          fixed: 'right',
          width: 80,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          equipId: this.selectedKeys.join(''),
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
        list: '/HfResEquipSensorBusiness/listPageSensorByEquip',
        delete: '/HfResEquipSensorBusiness/removeResEquipSensor',
        tree: '/HfResEquipBusiness/listAll',
        deleteEquip: '/HfResEquipBusiness/logicRemoveById',
        editPoint: '/HfResEquipParamBusiness/modifyResEquipParamById',
      },
    }
  },
  created() {
    this.getEquipmentTree()
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    getEquipmentTree() {
      postAction(this.url.tree, { c_equipUse_1: 1 }).then((res) => {
        if (res.code === 200) {
          this.equipmentTree = res.data.map((item) => {
            return {
              title: item.equipName + '-' + item.equipModel,
              pid: 0,
              id: item.id,
              scopedSlots: {
                title: 'customTitle',
              },
            }
          })
        }
      })
    },
    refresh(bool = true) {
      this.$refs.equipmentParameterTable.refresh(bool)
    },
    handleAdd() {
      this.$refs.EquipmentSensorModal.show(this.selectedKeys.join(''))
    },
    handleDeleteBatch() {
      if(this.selectedRowKeys.length){
      this.$confirm({
        title: '确认删除？',
        content: '删除后数据不可恢复，确认删除？',
        onOk: () => {
          let ids = this.selectedRowKeys.join(',')
          this.handleDelete(ids)
        },
      })
      }else{
        this.openNotificationWithIcon('error','删除提示','请至少选择一项')
      }
    },
    handleDelete(ids) {
      postAction(this.url.delete, { sensorIds: ids, equipId: this.selectedKeys.join('') }).then((res) => {
        if (res.code == 200) {
          this.$message.success('删除成功')
          this.selectedRowKeys = []
          this.selectedRows = []
          this.refresh()
        }
      })
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    // 选择了左侧的目录树
    onTreeNodeSelect(selectedKeys, event) {
      this.selectedKeys = selectedKeys[0]?selectedKeys:this.selectedKeys
      this.title = event.node.dataRef.title
      if (this.$refs.equipmentParameterTable) {
        this.refresh(true)
      }
    },
    handleAddCondition(record) {
      console.log('record', record)
      this.$refs.editorPointModal.show(record)
    },
    handleSubmitPoint(val) {
      postAction(this.url.editPoint, val).then((res) => {
        if (res.code == 200) {
          this.$message.success('添加成功')
          this.refresh()
        }
      })
    },
  },
}
</script>

<style lang="less">
.ep-left {
  .h-card-wrapper {
    padding: 0;
  }
  .custom-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    > div {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex: 1;
      overflow: hidden;
      .text-overflow(1);
    }
    span {
      margin-left: 5px;
      .text-overflow(1);
    }
  }
  .ant-tree-switcher {
    display: none !important;
  }
  .ant-tree {
    width: 100%;
    .ant-tree-node-content-wrapper {
      display: block;
      width: 100%;
      .ant-tree-title {
        display: block;
        width: 100%;
      }
    }
  }
}
.ep-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  height: 100%;
  background: #fff;
  overflow: hidden;
}
</style>