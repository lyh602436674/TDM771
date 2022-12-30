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
    <div style="height: 100%">
      <!-- 基本信息 -->
      <h-desc
        id="basicInfo"
        :data="model"
        class="mg-t-20"
        lableWidth="110px"
        title="基本信息">
        <h-desc-item label="任务编号">{{ model.equipName + '-' + model.equipModel || '--' }}</h-desc-item>
        <h-desc-item label="设备速率">{{ model.testRate || '--' }}</h-desc-item>
        <h-desc-item label="负责人">{{ model.chargeUserName || '--' }}</h-desc-item>
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
          slot='content'
          :columns="equipColumns"
          :dataSource="testEquipInfo"
          :pagination="false"
          bordered
          rowKey="id"
          size="small"
          style="width: 100%"
        />
      </h-desc>

      <!-- 试前检查 -->
      <h-desc
        v-if="testCheckType === 'before'"
        id="testBeforeCheck"
        :bordered="false"
        class="mg-t-20"
        lableWidth="110px"
        title="试前检查">
        <h-vex-table
          ref="beforeCheckInfo"
          :columns="columns"
          :data="beforeCheckInfo"
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
      <!-- 试中检查 -->
      <h-desc
        v-if="testCheckType === 'middle'"
        id="testInCheck"
        :bordered="false"
        class="mg-t-20"
        lableWidth="110px"
        title="试中检查">
        <h-vex-table
          ref="inCheckInfo"
          :columns="columns"
          :data="inCheckInfo"
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
      <!-- 试后检查 -->
      <h-desc
        v-if="testCheckType === 'after'"
        id="testAfterCheck"
        :bordered="false"
        class="mg-t-20"
        lableWidth="110px"
        title="试后检查">
        <h-vex-table
          ref="afterCheckInfo"
          :columns="columns"
          :data="afterCheckInfo"
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
      <hf-elevator-layer :layer-columns="layerColumns"></hf-elevator-layer>
    </div>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@api/manage'
import mixin from '@/views/hifar/mixin.js'
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
  data() {
    return {
      moment,
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
      layerColumns: [
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
          id: "testBeforeCheck"
        },
        {
          title: "试中检查",
          id: "testInCheck"
        },
        {
          title: "试后检查",
          id: "testAfterCheck"
        },
      ],
      activeTab: 0,
      checkId: '',
      testCheckType: '',
      url: {
        detail: '/HfEnvTaskTestBusiness/queryById',
        CheckInfo: '/HfEnvTaskTestBusiness/queryTestCheckItem',
        // 试验数据
        attachList: '/MinioBusiness/listByRefId',
        delete: '/MinioBusiness/logicRemoveById'
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
          minWidth: 10,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查项内容',
          align: 'left',
          dataIndex: 'itemContent',
          minWidth: 10,
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
          minWidth: 10,
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
      // 试前检查
      beforeCheckInfo: () => {
        return postAction(this.url.CheckInfo, {id: this.checkId}).then((res) => {
          if (res.code === 200) {
            return res.data.beforeCheckInfo
          }
        })
      },
      // 试中检查
      inCheckInfo: () => {
        return postAction(this.url.CheckInfo, {id: this.checkId}).then((res) => {
          if (res.code === 200) {
            return res.data.inCheckInfo
          }
        })
      },
      // 试后检查
      afterCheckInfo: () => {
        return postAction(this.url.CheckInfo, {id: this.checkId}).then((res) => {
          if (res.code === 200) {
            return res.data.afterCheckInfo
          }
        })
      },
    }
  },
  methods: {
    show(record, type) {
      this.visible = true
      this.testCheckType = type
      this.loadDetailData(record.id)
    },
    handleCancel() {
      this.visible = false
    },
    loadDetailData(id) {
      this.checkId = id
      postAction(this.url.detail, {id: id}).then((res) => {
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
