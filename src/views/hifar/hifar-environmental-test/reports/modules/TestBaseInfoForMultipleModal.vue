<template>
  <h-modal
    :title="modalTitle"
    inner
    fullScreen
    destroyOnClose
    :visible="visible"
    :getContainer="getContainer"
    @cancel="handleCancel">
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    </template>
    <div style="height: 100%;padding: 10px">
      <a-tabs v-model="activeTab" size="small" type="card" @change="handleTabsChange">
        <a-tab-pane
          v-for="(item, index) in testInfo"
          :key="index"
          :tab="getTabTitle(item)">
          <div id="piece">
            <!-- 试件信息 -->
            <test-piece-detail
              :dataSource="item.testPieceInfo"
              class="mg-t-20"
              title="试件信息"/>
          </div>
          <!-- 实施过程 -->
          <test-carry-process :detailData="item"/>
          <!-- 安装、控制方式 -->
          <h-desc v-if="!isShow(item.projectInfo[0].classifyType)" id="installControl" class="mg-t-20"
                  title='安装、控制方式'>
            <test-install-control-mode :installControlTable="item.insertMethodInfo"/>
          </h-desc>
          <!-- 测试设备 -->
          <h-desc id="testEquip" class="mg-t-20" title='测试设备'>
            <test-test-equip :testEquipInfo="item.testEquipInfo"/>
          </h-desc>
          <!-- 试验设备开关机记录 -->
          <h-desc id="switchRecording" class="mg-t-20" title='试验设备开关机记录'>
            <test-switch-recording :switchRecordingTable="item.switchOnOffInfo"/>
          </h-desc>
          <h-desc v-if="!isShow(item.projectInfo[0].classifyType)" id="toolsProduct" class="mg-t-20" title='振动工装'>
            <test-tools-product :toolsProductData="item.toolsProductData"/>
          </h-desc>
          <!-- 曲线图片 -->
          <h-desc id="picture" class="mg-t-20" title="曲线图片">
            <h-upload-file v-model="pictureData" :isEdit="false" isWriteRemarks style="width: 100%"/>
          </h-desc>
          <!-- 试前检查 -->
          <h-desc
            id="testBeforeCheck"
            :bordered="false"
            class="mg-t-20"
            title="试前检查">
            <test-check data-field="beforeCheckInfo" :testId="item.id"></test-check>
          </h-desc>
          <!-- 试中检查 -->
          <h-desc
            id="testInCheck"
            :bordered="false"
            class="mg-t-20"
            title="试中检查">
            <test-check data-field="inCheckInfo" :testId="item.id"></test-check>
          </h-desc>
          <!-- 试后检查 -->
          <h-desc
            id="testAfterCheck"
            :bordered="false"
            class="mg-t-20"
            title="试后检查">
            <test-check data-field="afterCheckInfo" :testId="item.id"></test-check>
          </h-desc>
          <!-- 试验数据 -->
          <h-desc id="testData" class="mg-t-20" title="试验数据">
            <div style="height: 100%; width: 100%; overflow: auto; padding: 20px">
              <h-desc id="attachForm" :bordered="false">
                <h-form
                  ref="attachForm"
                  v-model="model_attach"
                  :column="1"
                  :formData="attachData"
                  style="width: 100%"/>
              </h-desc>
              <h-desc id="videoForm" :bordered="false">
                <h-form v-model="model_video" :column="1" :formData="videoData" style="width: 100%"/>
              </h-desc>
            </div>
          </h-desc>
        </a-tab-pane>
      </a-tabs>
    </div>

  </h-modal>
</template>

<script>
import TestTestEquip from "@views/hifar/hifar-environmental-test/task/components/TestTestEquip.vue";
import TestSwitchRecording from "@views/hifar/hifar-environmental-test/task/components/TestSwitchRecording.vue";
import TestToolsProduct from "@views/hifar/hifar-environmental-test/task/components/TestToolsProduct.vue";
import TestInstallControlMode from "@views/hifar/hifar-environmental-test/task/components/TestInstallControlMode.vue";
import TestCheck from "@views/hifar/hifar-environmental-test/task/components/TestCheck.vue";
import TestCarryProcess from "@views/hifar/hifar-environmental-test/task/components/TestCarryProcess.vue";
import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";
import {postAction} from "@api/manage";
import TestPieceDetail from "@views/hifar/hifar-environmental-test/task/components/TestPieceDetail.vue";

export default {
  name: "TestBaseInfoForMultipleModal",
  mixins: [entrustmentMixins],
  components: {
    TestPieceDetail,
    TestCarryProcess,
    TestCheck,
    TestInstallControlMode,
    TestToolsProduct,
    TestSwitchRecording,
    TestTestEquip
  },
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      testId: "",
      visible: false,
      modalTitle: "",
      activeTab: 0,
      testInfo: [],
      pictureData: [],
      testPieceInfo: [],
      // 振动图谱
      attachData: [
        {
          title: '振动图谱',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              isEdit={false}
              v-decorator={['attachIds', {initialValue: []}]}
              customParams={{refType: 'test_attach', refId: this.checkId}}
            />
          )
        }
      ],
      // 视频
      videoData: [
        {
          title: '视频',
          key: 'attachIds',
          span: 1,
          component: (
            <h-upload-file
              isEdit={false}
              v-decorator={['attachIds', {initialValue: []}]}
              customParams={{refType: 'test_video', refId: this.checkId}}
            />
          )
        }
      ],
      model_attach: {},
      model_video: {},
      url: {
        queryDetail: "/HfEnvTaskTestBusiness/queryListByIds",
        attachList: '/MinioBusiness/listByRefId',
      }
    }
  },
  methods: {
    show(record) {
      this.testId = record.testId;
      this.modalTitle = `试验信息(${record.testCode})`;
      this.visible = true
      this.handleQueryDetail()
      this.loadImgData()
      this.loadAttachData()
      this.loadVideoData()
    },
    // 图片
    loadImgData() {
      postAction(this.url.attachList, {refType: 'test_picture', refId: this.testId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          if (data && data.length > 0) {
            this.pictureData = this.dataFormat(data)
          }
        }
      })
    },
    // 振动图谱
    loadAttachData() {
      postAction(this.url.attachList, {refType: 'test_attach', refId: this.testId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
          if (data && data.length > 0) {
            fileArr = this.dataFormat(data)
          }
          obj.attachIds = fileArr
          this.model_attach = obj
        }
      })
    },
    // 视频
    loadVideoData() {
      postAction(this.url.attachList, {refType: 'test_video', refId: this.testId}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          let fileArr = []
          let obj = {}
          if (data && data.length > 0) {
            fileArr = this.dataFormat(data)
          }
          obj.attachIds = fileArr
          this.model_video = obj
        }
      })
    },
    getTabTitle(item) {
      return item.entrustInfo.map(v => v.entrustCode).toString()
    },
    handleQueryDetail() {
      postAction(this.url.queryDetail, {id: this.testId}).then(res => {
        if (res.code === 200) {
          this.testInfo = res.data
        }
      })
    },
    dataFormat(arr) {
      return arr.map(item => {
        return {
          ...item,
          fileId: item.id,
          size: item.fileSize,
          status: item.status === 9 ? 'success' : 'exception',
          url: item.filePath,
          name: item.fileName,
          uuid: item.id,
          percent: 100,
          uploadTime: item.createTime,
          secretLevel: item.secretLevel,
          type: item.viewType === 2 ? 'image/jpeg' : 'text/plain',
        }
      })
    },
    isShow(projectClassifyType) {
      return this.filterUnitCode(projectClassifyType)
    },
    handleCancel() {
      this.visible = false
    },
    handleTabsChange(v) {
      this.activeTab = v
    },
  },
}
</script>

<style scoped lang="less">
.mg-t-20 {
  margin-top: 20px !important;
}

</style>