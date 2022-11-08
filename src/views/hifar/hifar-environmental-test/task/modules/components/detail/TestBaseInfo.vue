<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 14:12:47
 * @fileName: TestBaseInfo.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\task\modules\components\detail\TestBaseInfo.vue
 * @Description: 对此文件的描述...
-->
<template>
  <div>
    <h-card fixed title="基本信息" style="height: auto" class="basicInfo" :showCollapse="true">
      <h-desc slot="content" size="small" labelWidth="120px">
        <h-desc-item
          v-for="(item, index) in basicData"
          :span="item.span ? item.span : 1"
          :key="index"
          :label="item.title"
        >
          {{
            item.isTime
              ? parseFloat(item.value) == 0
                ? '--'
                : moment(parseFloat(item.value)).format('YYYY-MM-DD HH:mm:ss')
              : item.value
                ? item.value
                : '--'
          }}
        </h-desc-item>
      </h-desc>
    </h-card>
    <h-card title="样品信息" style="height: auto" :showCollapse="true">
      <div slot="content">
        <piece-detail-template title="" :dataSource="productTable"
                               :entrustType="entrustType"></piece-detail-template>
      </div>
    </h-card>
    <h-card title="项目信息" v-for="(item, index) in projectData" :key="index" style="margin-bottom: 10px">
      <project-detail-template title="" :model="item"/>
    </h-card>

    <h-card title="参试人员" style="height: auto" :showCollapse="true">
      <div slot="content">
        <a-table
          ref="personTable"
          size="small"
          :columns="personColumns"
          :dataSource="personArr"
          :pagination="false"
          bordered
        >
        </a-table>
      </div>
    </h-card>
    <h-card title="测试设备" :style="{ marginBottom: 0, height: 'auto' }" :showCollapse="true">
      <div slot="content">
        <a-table size="small" :columns="testEquipColumns" :dataSource="equipData" :pagination="false" bordered>
        </a-table>
      </div>
    </h-card>
    <h-card title="传感器" :style="{ marginBottom: 0, height: 'auto' }" :showCollapse="true">
      <div slot="content">
        <a-table size="small" :columns="sensorColumns" :dataSource="sensorData" :pagination="false" bordered>
        </a-table>
      </div>
    </h-card>
    <h-card title="振动工装" :style="{ marginBottom: 0, height: 'auto' }" :showCollapse="true">
      <div slot="content">
        <a-table size="small" :columns="toolsProductColumns" :dataSource="toolsProductData" :pagination="false" bordered>
        </a-table>
      </div>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import ProjectDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate";
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate";

export default {
  props: {
    entrustType: {
      type: String,
      default: '1',
    },
    basicData: {
      type: [Array, Object],
      default: () => {
      },
    },
    testTaskData: {
      type: [Array, Object],
      default: () => {
      },
    },
    projectData: {
      type: [Array, Object],
      default: () => {},
    },
    productTable: {
      type: [Array, Object],
      default: () => {},
    },
    carryOutProcessData: {
      type: [Array, Object],
      default: () => {},
    },
    personArr: {
      type: [Array, Object],
      default: () => {},
    },
    equipData: {
      type: [Array, Object],
      default: () => {},
    },
    sensorData: {
      type: [Array, Object],
      default: () => {
      },
    },
    toolsProductData: {
      type: [Array],
      default: () => [],
    },
  },
  components: {ProjectDetailTemplate, PieceDetailTemplate},
  data() {
    return {
      moment,
      toolsProductColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '工装编号',
          dataIndex: 'toolsCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装名称',
          dataIndex: 'toolsName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '工装规格',
          dataIndex: 'toolsSize',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '在库状态',
          dataIndex: 'larbaryStatus_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '存放地点',
          dataIndex: 'location',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '责任部门',
          dataIndex: 'deptName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备状态',
          dataIndex: 'toolsStatus_dictText',
          align: 'left',
          width: 120,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '工装分类',
          dataIndex: 'classify_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
      ],
      sensorColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '设备编号',
          dataIndex: 'equipCode',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '设备名称',
          dataIndex: 'equipName',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
      ],
      testTaskColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '试验名称',
          dataIndex: 'testName',
          customRender: (text) => {
            return text ? text : '--'
          },
        },
        {
          title: '试验中心',
          dataIndex: 'workName',
          customRender: (text) => {
            return text ? text : '--'
          },
        },
        {
          title: '试验条件',
          dataIndex: 'testCondition',
          customRender: (text) => {
            return text ? text : '--'
          },
          width: 180,
        },
        {
          title: '委托单号',
          dataIndex: 'entrustCode',
          customRender: (text) => {
            return text ? text : '--'
          },
        },
        {
          title: '委托单位',
          dataIndex: 'custName',
          customRender: (text) => {
            return text ? text : '--'
          },
        },
        {
          title: '任务编号',
          dataIndex: 'taskCode',
          customRender: (text) => {
            return text ? text : '--'
          },
        },
        {
          title: '项目名称',
          dataIndex: 'unitName',
          customRender: (text) => {
            return text ? text : '--'
          },
        },
        {
          title: '检验要求',
          dataIndex: 'checkRequire',
          customRender: (text) => {
            return text ? text : '--'
          },
        },
      ],
      projectColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '委托单号',
          dataIndex: 'entrustCode',
          customRender: (t) => {
            return t ? t : '--'
          },
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          customRender: (t) => {
            return t ? t : '--'
          },
        },
        {
          title: '委托单类型',
          dataIndex: 'entrustType',
          customRender: (t) => {
            return t ? t : '--'
          },
        },
        {
          title: '试验性质',
          dataIndex: 'testPropertyName',
          customRender: (t) => {
            return t ? t : '--'
          },
        },
        {
          title: '项目编码',
          dataIndex: 'unitCode',
          customRender: (t) => {
            return t ? t : '--'
          },
        },
        {
          title: '项目名称',
          dataIndex: 'unitName',
          customRender: (t) => {
            return t ? t : '--'
          },
        },
      ],
      personColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        { title: '参试人员岗位', dataIndex: 'testPostName' },
        { title: '参试人员姓名', dataIndex: 'testUserName' },
      ],
      testEquipColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          }
        },
        {title: '设备编号', dataIndex: 'equipCode'},
        {title: '设备名称', dataIndex: 'equipName'},
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {title: '设备型号', dataIndex: 'equipModel'},
      ],
    }
  },
  methods: {},
}
</script>
<style lang='less' scoped>
</style>