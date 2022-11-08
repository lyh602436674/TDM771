<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 15:59:43
 * @fileName: ProjectDetailTemplate.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\ProjectDetailTemplate.vue
 * @Description: 委托单项目信息
-->
<template>
  <h-desc size="small" lableWidth="130px"  :title="title">
    <h-desc-item label="项目名称">{{ model.unitName || '--' }}</h-desc-item>
    <h-desc-item label="试验名称">{{ model.testName || '--' }}</h-desc-item>
    <h-desc-item label="技术文件">{{ model.technicalFile || '--' }}</h-desc-item>
    <h-desc-item label="检测依据">{{ model.standardCode + model.standardName || '--' }}</h-desc-item>
    <h-desc-item label="是否分包">{{ model.isSubpackage == 1 ? '是' : '否' }}</h-desc-item>
    <h-desc-item label="期望开始时间">{{
        +model.taskExpectStartTime && moment(+model.taskExpectStartTime).format('YYYY-MM-DD HH:mm:ss') || '--'
      }}
    </h-desc-item>
    <h-desc-item :span="3" label="试验条件">{{ model.testCondition || '--' }}</h-desc-item>
    <h-desc-item :span='4' label='附件'>
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
  </h-desc>
</template>

<script>
import moment from 'moment'
import {downloadFile, getFileAccessHttpUrl} from "@api/manage";

export default {
  name: "ProjectDetailTemplate",
  data() {
    return {
      moment,
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
  watch: {},
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