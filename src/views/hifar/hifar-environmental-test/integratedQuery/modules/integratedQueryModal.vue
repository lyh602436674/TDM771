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
    <a-spin :spinning="loading">
      <div style="padding : 10px ">
        <a-tabs v-model="activeTab" size="small" type="card" @change="handleTabsChange">
          <a-tab-pane
            v-for="(item, index) in entrustInfo"
            :key="index"
            :tab="item.entrustCode">
            <div id="basicInfo">
              <detail-base-info showPreviewBtn :detailDataObj="item"></detail-base-info>
            </div>
            <div id="piece">
              <piece-detail-template titlle="试件信息" :dataSource="item.pieceInfo"/>
            </div>
            <div id="project">
              <template v-for="(item,index) in item.projectInfo">
                <project-detail-template
                  :key="index"
                  :model="item"
                  :title="'项目信息' + '(' + item.entrustCode + ')'"
                  class="mg-t-20"></project-detail-template>
              </template>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
  </h-modal>
</template>

<script>
import EntrustDetail from "@views/hifar/hifar-environmental-test/entrustment/components/EntrustDetail.vue";
import {postAction} from "@api/manage";
import DetailBaseInfo from "@views/hifar/hifar-environmental-test/entrustment/components/DetailBaseInfo.vue";
import PieceDetailTemplate from "@views/hifar/hifar-environmental-test/entrustment/components/PieceDetailTemplate.vue";
import ProjectDetailTemplate
  from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectDetailTemplate.vue";

export default {
  name: "integratedQueryModal",
  components: {ProjectDetailTemplate, PieceDetailTemplate, DetailBaseInfo, EntrustDetail},
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  props: {
    queryType: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      modalTitle: "详情",
      visible: false,
      loading: false,
      activeTab: 0,
      entrustInfo: [],
      url: {
        queryById: '/HfEnvReportEntrustBusiness/queryById',
      }
    }
  },
  methods: {
    show(ids, type) {
      this.visible = true
      let titleType = {
        1: "委托单信息",
        2: "运行单信息",
      }
      this.modalTitle = titleType[type]
      this.getEntrustDetail(ids, type)
    },
    handleTabsChange(key) {
      this.activeTab = key
    },
    getEntrustDetail(ids, type) {
      this.loading = true
      postAction(this.url.queryById, {
        ids, type, queryType: this.queryType
      }).then(res => {
        if (res.code === 200) {
          this.entrustInfo = res.data
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style scoped>

</style>