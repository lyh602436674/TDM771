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
          {{ item.isTime ? dateTimeFormatByStamp(item.value) : item.value ? item.value : '--' }}
        </h-desc-item>
      </h-desc>
    </h-card>
    <h-card title="样品信息" style="height: auto" :showCollapse="true">
      <div slot="content">
        <test-piece-detail
          :dataSource="productTable"
          class="mg-t-20"
          title=""/>
      </div>
    </h-card>
    <h-card title="项目信息" v-for="(item, index) in projectData" :key="index" style="margin-bottom: 10px">
      <project-detail-template title="" :model="item"/>
    </h-card>

    <!-- 安装、控制方式 -->
    <h-card :bordered='false' style='width: 100%' title='安装、控制方式'>
      <a-table
        :columns='installControlColumns'
        :dataSource='installControlTable'
        :pagination='false'
        bordered
        rowKey='id'
        size='small'
        style="width: 100%;"
      >
        <div slot="expandedRowRender" slot-scope="record,index">
          <a-table
            :columns='sensorColumns'
            :dataSource='record.testSensorInfo'
            :pagination='false'
            bordered
            rowKey='id'
            size='small'
            style="width: 100%;"
          >
          </a-table>
        </div>
      </a-table>
    </h-card>
    <!-- 试验设备开关机记录 -->
    <h-card :bordered='false' style='width: 100%' title='试验设备开关机记录'>
      <a-table
        :columns='switchRecordingColumns'
        :dataSource='switchRecordingTable'
        :pagination='false'
        bordered
        rowKey='id'
        size='small'
        style="width: 100%;"
      >
      </a-table>
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
    <h-card title="振动工装" :style="{ marginBottom: 0, height: 'auto' }" :showCollapse="true">
      <div slot="content">
        <a-table :columns="toolsProductColumns" :dataSource="toolsProductData" :pagination="false" bordered
                 size="small">
        </a-table>
      </div>
    </h-card>
    <h-card style="height: auto" title="曲线图片">
      <h-upload-file v-model="pictureData" :isEdit="false" isWriteRemarks style="width: 100%"></h-upload-file>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import ProjectDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate";
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate";
import {dateTimeFormatByStamp} from '@/utils/util'
import TestPieceDetail from "@views/hifar/hifar-environmental-test/task/components/TestPieceDetail";

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
      default: () => {
      },
    },
    productTable: {
      type: [Array, Object],
      default: () => {
      },
    },
    installControlTable: {
      type: Array,
      default: () => [],
    },
    switchRecordingTable: {
      type: Array,
      default: () => [],
    },
    personArr: {
      type: [Array, Object],
      default: () => {
      },
    },
    equipData: {
      type: [Array, Object],
      default: () => {
      },
    },
    toolsProductData: {
      type: [Array],
      default: () => [],
    },
    pictureData: {
      type: [Array],
      default: () => [],
    },
  },
  components: {ProjectDetailTemplate, PieceDetailTemplate, TestPieceDetail},
  data() {
    return {
      dateTimeFormatByStamp,
      moment,
      installControlColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          }
        },
        {
          title: '安装方式',
          dataIndex: 'installMethodName',
          align: 'center',
          width: 150,
        },
        {
          title: '试验方向',
          dataIndex: 'directionName',
          align: 'center',
          width: 250,
        },
        {
          title: '几台/次',
          dataIndex: 'installNum',
          align: 'center',
          width: 150,
          scopedSlots: {customRender: 'installNum'},
        },
        {
          title: '控制方式',
          dataIndex: 'controlMethod',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
        },
      ],
      switchRecordingColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          }
        },
        {
          title: '试验开始时间',
          dataIndex: 'testStartTime',
          align: 'center',
          width: 200,
          customRender: (t, row, index) => {
            return dateTimeFormatByStamp(t)
          }
        },
        {
          title: '试验结束时间',
          dataIndex: 'testEndTime',
          align: 'center',
          width: 200,
          customRender: (t, row, index) => {
            return dateTimeFormatByStamp(t)
          }
        },
        {
          title: '耗时',
          dataIndex: 'useTime',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '值班人员',
          dataIndex: 'personName',
          align: 'center',
          width: 220,
          customRender: (t, row) => {
            let {personName, personSignTime} = row
            return personName && personSignTime ? personName + ' ' + dateTimeFormatByStamp(personSignTime) : ''
          }
        },
      ],
      toolsProductColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
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
          title: '设备名称',
          dataIndex: 'equipName',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '序号',
          dataIndex: 'equipIndex',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
          align: 'center',
          customRender: (t) => {
            return t ? t : '--'
          }
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          align: 'center',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {
          title: '备注',
          maxWidth: 150,
          ellipsis: true,
          align: 'center',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '位置',
          dataIndex: 'locationName',
          align: 'center',
          width: 150,
        },
        {
          title: '用途',
          dataIndex: 'usePurposeName',
          align: 'center',
          width: 150,
        },
        {
          title: '是否记录振动曲线',
          dataIndex: 'vibrationCurveFlag',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return t === 1 ? '是' : t === 0 ? '否' : ''
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
            return index + 1
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
            return index + 1
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
            return index + 1
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
            return index + 1
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