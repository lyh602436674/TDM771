<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 15:59:43
 * @fileName: ProjectDetailTemplate.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\ProjectDetailTemplate.vue
 * @Description: 委托单项目信息
-->
<template>
  <h-desc size="small" lableWidth="130px" :data="model" :title="title">
    <h-desc-item label="项目名称">{{ model.unitName || '--' }}</h-desc-item>
    <h-desc-item label="试验名称">{{ model.testName || '--' }}</h-desc-item>
    <h-desc-item label="已选样品">{{ model.pieceNos || '--' }}</h-desc-item>
    <h-desc-item label="试验标准">{{ model.standardCode + model.standardName || '--' }}</h-desc-item>
    <h-desc-item label="最终用户">{{ model.lastUser_dictText || '--' }}</h-desc-item>
    <h-desc-item label="是否加电">{{ model.isPowerUp === '1' ? '是' : '否' }}</h-desc-item>
    <h-desc-item label="报告中是否显示最终用户">{{ model.isShowUserInReport === '1' ? '是' : '否' }}</h-desc-item>
    <h-desc-item label="加电时间">{{ model.powerUpTime_dictText || '--' }}</h-desc-item>
    <h-desc-item :span="3" label="试验判据">
      <span slot='content' v-html="spaceToBr(model.testCriteria)"></span>
    </h-desc-item>
    <h-desc-item :span="3" label="合格判据">
      <span slot='content' v-html="spaceToBr(model.conformityCriteria)"></span>
    </h-desc-item>
    <h-desc-item :span="3" label="试验依据">
      <span slot='content' v-html="spaceToBr(model.testEvidence)"></span>
    </h-desc-item>
    <h-desc-item :span="3" label="试验条件">
      <span slot='content' v-html="spaceToBr(model.testCondition)"></span>
    </h-desc-item>
    <h-desc-item :span='3' label='附件'>
      <div slot='content'>
        <template v-if='model.fileInfo && model.fileInfo.length'>
          <div v-for='(item, index) in model.fileInfo' :key='index' class='url-list'>
            <span>{{ index + 1 }}、{{ item.fileName }}</span>
            <a-button icon='download' size='small' type='primary' style="margin-left: 10px"
                      @click='handleDownload(item.filePath, item.fileName)'>
              下载
            </a-button>
          </div>
        </template>
        <span v-else>暂无附件</span>
      </div>
    </h-desc-item>
    <h-desc-item v-if="filterUnitCode(model.classifyType)" :span='3' label='试验曲线'>
      <div slot='content' style="width: 100%;height: 100%;">
        <img v-if="model.curveUrl" :src="model.curveUrl" alt="试验曲线" style="width: 100%;height: 100%;">
        <span v-else>无</span>
      </div>
    </h-desc-item>
    <h-desc-item :span='3' label='试验条件结构化'>
      <template slot='content'>
        <template v-if="!model.abilityRequire.length">
          <a-empty style="width: 100%"></a-empty>
        </template>
        <a-tabs v-else :default-active-key="0" style="width: 100%">
          <template v-for="(proItem,itemIndex) in model.abilityRequire">
            <a-tab-pane :key="itemIndex"
                        :tab="proItem.type === 'stage' ? proItem.title + itemIndex : proItem.title">
              <test-condition-template :classifyType="model.classifyType" :data-source="proItem.abilityInfo || []"/>
            </a-tab-pane>
          </template>
        </a-tabs>
      </template>
    </h-desc-item>
    <h-desc-item :span='3' label='测试设备'>
      <a-table
        slot='content'
        :columns="equipColumns"
        :dataSource="model.testEquipInfo || []"
        :pagination="false"
        bordered
        rowKey="id"
        size="small"
        style="width: 100%"
      />
    </h-desc-item>
  </h-desc>
</template>

<script>
import moment from 'moment'
import {downloadFile, getFileAccessHttpUrl} from "@api/manage";
import TestConditionTemplate from "@views/hifar/hifar-environmental-test/components/TestConditionTemplate";
import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";
import {spaceToBr} from "@/utils/util";

export default {
  name: "ProjectDetailTemplate",
  components: {TestConditionTemplate},
  mixins: [entrustmentMixins],
  data() {
    return {
      spaceToBr,
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
    }
  },
  props: {
    model: {
      type: Object,
      default: () => {
      }
    },
    title: {
      type: String,
      default: '项目信息'
    }
  },
  methods: {
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
  },
}
</script>

<style scoped>
.url-list {
  margin-bottom: 10px
}
</style>