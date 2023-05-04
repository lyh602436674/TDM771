<template>
  <h-modal
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    @cancel="handleCancel"
  >
    <div style="height: 100%;padding:10px 20px">
      <!-- 基本信息 -->
      <h-desc
        id="basicInfo"
        :data="model"
        class="mg-t-20"
        lableWidth="110px"
        title="基本信息">
        <h-desc-item label="任务编号">{{ model.equipName + '-' + model.equipModel || '--' }}</h-desc-item>
        <h-desc-item label="记录编号">{{ model.recordNo || '--' }}</h-desc-item>
        <h-desc-item label="设备速率">{{ model.testRate || '--' }}</h-desc-item>
        <h-desc-item label="试验人员">{{ model.chargeUserName || '--' }}</h-desc-item>
        <h-desc-item label="入场时间">{{
            model.approachTime && model.approachTime != 0
              ? moment(parseInt(model.approachTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="离场时间">{{
            model.departureTime && model.departureTime != 0
              ? moment(parseInt(model.departureTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="开始时间">{{
            model.realStartTime && model.realStartTime != 0
              ? moment(parseInt(model.realStartTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="结束时间">{{
            model.realEndTime && model.realEndTime != 0
              ? moment(parseInt(model.realEndTime)).format('YYYY-MM-DD HH:mm:ss')
              : '--'
          }}
        </h-desc-item>
        <h-desc-item label="温度(°C)">{{ model.temperature || '--' }}</h-desc-item>
        <h-desc-item label="湿度(RH)">{{ model.humidity || '--' }}</h-desc-item>
        <h-desc-item label="自检">{{ model.selfInspection || '--' }}</h-desc-item>
        <h-desc-item label="互检">{{ model.mutualInspection || '--' }}</h-desc-item>
        <h-desc-item :span="3" label="参试人员">
          {{ testPersonInfo.length ? testPersonInfo.join(',') : '--' }}
        </h-desc-item>
        <!--        <h-desc-item :span="3" label="测试设备">-->
        <!--          {{ testEquipInfo.length ? testEquipInfo.join(',') : '&#45;&#45;' }}-->
        <!--        </h-desc-item>-->
        <h-desc-item :span="3" label="实施过程">{{ model.remarks || '--' }}</h-desc-item>
      </h-desc>
      <!--      试件信息-->
      <test-piece-detail
        id="piece"
        :dataSource="testPieceInfo"
        class="mg-t-20"
        title="试件信息"/>
      <!-- 测试设备 -->
      <h-desc
        id="testEquip"
        :bordered="false"
        class="mg-t-20"
        lableWidth="110px"
        title="测试设备">
        <a-table
          :columns="equipColumns"
          :dataSource="testEquipInfo"
          :pagination="false"
          bordered
          rowKey="id"
          size="small"
          style="width: 100%"
        />
      </h-desc>
      <!-- 安装、控制方式 -->
<!--      <h-desc id="installControl" class="mg-t-20" title='安装、控制方式'>-->
<!--        <h-card :bordered='false' style='width: 100%'>-->
<!--          <a-table-->
<!--            :columns='installControlColumns'-->
<!--            :dataSource='installControlTable'-->
<!--            :pagination='false'-->
<!--            bordered-->
<!--            rowKey='id'-->
<!--            size='small'-->
<!--            style="width: 100%;"-->
<!--          >-->
<!--            <div slot="expandedRowRender" slot-scope="record,index">-->
<!--              <a-table-->
<!--                :columns='sensorColumns'-->
<!--                :dataSource='record.testSensorInfo'-->
<!--                :pagination='false'-->
<!--                bordered-->
<!--                rowKey='id'-->
<!--                size='small'-->
<!--                style="width: 100%;"-->
<!--              >-->
<!--              </a-table>-->
<!--            </div>-->
<!--          </a-table>-->
<!--        </h-card>-->
<!--      </h-desc>-->
      <!-- 试前检查 -->
      <h-desc
        :id="checkTypeMap[testCheckType].id"
        :bordered="false"
        class="mg-t-20"
        lableWidth="110px"
        :title="checkTypeMap[testCheckType].title"
      >
        <h-vex-table
          ref="beforeCheckInfo"
          :columns="columns"
          :data="checkTableInfo"
          :pagination="false"
          bordered
          style="width: 100%; height: 200px"
        >
          <span slot="itemRes" slot-scope="text, record">
            <h-icon v-if="record.itemRes === '2'" class="success-text" type="icon-wancheng1"/>
            <h-icon v-else-if="record.itemRes === '3'" class="danger-text" type="icon-chacha"/>
            <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
          </span>
        </h-vex-table>
      </h-desc>
      <!-- 参试人员 -->
      <h-desc id="person" class="mg-t-20" title='参试人员'>
          <a-table
            :columns='testPersonColumns'
            :dataSource='testPersonTable'
            :pagination='false'
            bordered
            rowKey='id'
            size='small'
            style="width: 100%;"
          />
      </h-desc>
      <hf-elevator-layer :layer-columns="layerColumns"></hf-elevator-layer>
    </div>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@api/manage'
import AbnormalRecordTable
  from '@/views/hifar/hifar-environmental-test/task/modules/components/detail/AbnormalRecordTable'
import TerminationRecordTable
  from '@/views/hifar/hifar-environmental-test/task/modules/components/detail/TerminationRecordTable'
import TestReportInfo from '@views/hifar/hifar-environmental-test/task/components/TestReportInfo'
import DetailBaseInfo from '@views/hifar/hifar-environmental-test/entrustment/components/DetailBaseInfo';
import ProjectDetailTemplate from '@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate';
import HfElevatorLayer from "@comp/HfElevatorLayer";
import TestPieceDetail from "@views/hifar/hifar-environmental-test/task/components/TestPieceDetail";

export default {
  components: {
    ProjectDetailTemplate,
    TestPieceDetail,
    AbnormalRecordTable,
    TerminationRecordTable,
    TestReportInfo,
    DetailBaseInfo,
    HfElevatorLayer
  },
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  computed: {
    layerColumns() {
      return [
        {
          title: "基本信息",
          id: "basicInfo"
        },
        {
          title: "试件信息",
          id: "piece"
        },
        {
          title: "测试设备",
          id: "testEquip"
        },
        {
          title: "试前检查",
          id: "testBeforeCheck",
          hidden: this.testCheckType === 'before'
        },
        {
          title: "试中检查",
          id: "testInCheck",
          hidden: this.testCheckType === 'middle'
        },
        {
          title: "试后检查",
          id: "testAfterCheck",
          hidden: this.testCheckType === 'after'
        },
      ]
    },
  },
  data() {
    return {
      moment,
      testPersonColumns:[],
      testPersonTable:[],
      installControlTable: [],
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
      equipColumns: [
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
      checkTypeMap: {
        before: {title: "试前检查", id: "testBeforeCheck", portKey: "beforeCheckInfo"},
        middle: {title: "试中检查", id: "testInCheck", portKey: "inCheckInfo"},
        after: {title: "试后检查", id: "testAfterCheck", portKey: "afterCheckInfo"},
      },
      checkId: '',
      testCheckType: 'before',
      url: {
        before: "/HfEnvHistoryTestBusiness/beforeDetail",
        middle: "/HfEnvHistoryTestBusiness/inDetail",
        after: "/HfEnvHistoryTestBusiness/afterDetail",
        detail: '/HfEnvTaskTestBusiness/queryById',
        checkInfo: '/HfEnvTaskTestBusiness/queryTestCheckItem',
      },
      model: {},
      testPieceInfo: [],
      testEquipInfo: [],
      testPersonInfo: [],
      title: '',
      visible: false,
      columns: [
        {
          title: '检查项名称',
          align: 'left',
          dataIndex: 'itemName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查项内容',
          align: 'left',
          dataIndex: 'itemContent',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查项要求',
          align: 'left',
          dataIndex: 'itemRequire',
          minWidth: 25,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查结果',
          align: 'left',
          dataIndex: 'itemRes',
          scopedSlots: {customRender: 'itemRes'}
        },
        {
          title: '检查人',
          align: 'left',
          dataIndex: 'fillUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '复核人',
          align: 'left',
          dataIndex: 'checkUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        }
      ],
      checkTableInfo: () => {
        return postAction(this.url.checkInfo, {id: this.checkId}).then((res) => {
          if (res.code === 200) {
            return res.data[this.checkTypeMap[this.testCheckType].portKey]
          }
        })
      },
    }
  },
  methods: {
    show(record, type) {
      this.visible = true
      this.testCheckType = type
      this.checkId = record.taskid
      this.loadDetailData(record.taskid)
    },
    handleCancel() {
      this.visible = false
    },
    loadDetailData(id) {
      postAction(this.url[this.testCheckType], {id}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          this.testEquipInfo = data.testEquipInfo
          let testPersonInfoArr = data.testPersonInfo
          let testPersonInfo = []
          this.model = data
          if (testPersonInfoArr.length) {
            testPersonInfoArr.forEach((item) => {
              let res = item.testUserName ? (item.testUserName + (item.testPostName ? '(' + item.testPostName + ')' : '')) : '--'
              testPersonInfo.push(res)
            })
          }
          // 试件信息
          this.testPieceInfo = data.testPieceInfo
          this.testPersonInfo = testPersonInfo
        }
      })
    },
  }
}
</script>
<style lang='less' scoped>
.mg-t-20 {
  margin-top: 20px !important;
}

</style>
