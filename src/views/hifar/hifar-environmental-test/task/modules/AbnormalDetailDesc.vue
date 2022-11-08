<template>
  <h-modal
    inner
    fullScreen
    :title="title"
    :getContainer="getModalContainer"
    :visible="visible"
    destroyOnClose
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger">关闭</a-button>
    </div>
    <h-card title="基本信息" fixed :showCollapse="true">
      <h-descriptions bordered style="width: 100%" size="small" :columns="3">
        <a-descriptions-item
          v-for="(item, index) in detailDataDesc"
          :span="item.span ? item.span : 1"
          :key="index"
          :label="item.title"
        >
          {{
            item.isTime ? parseFloat(item.value) === 0 ? '--' : moment(parseFloat(item.value)).format('YYYY-MM-DD HH:mm:ss') : item.value && item.option ? item.option.filter(opItem => item.value == opItem.key)[0].value : item.value ? item.value : '--'
          }}
        </a-descriptions-item>
      </h-descriptions>
    </h-card>
    <h-card title="附件信息" fixed :showCollapse="true">
      <template v-if="attachInfo.length > 0">
        <div class="url-list" v-for="(item, index) in detailData.attachInfo" :key="index">
          <span>{{ index + 1 }}、{{ item.fileName }}</span>
          <a-button type="primary" size="small" icon="download" @click="handleDownload(item.filePath, item.fileName)"
          >下载
          </a-button>
        </div>
      </template>
      <div v-else style="width: 100%; display: flex; align-item: center; justify-content: center">
        <a-empty description="暂无附件信息"/>
      </div>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction, getFileAccessHttpUrl, downloadFile} from '@/api/manage'

export default {
  name: "AbnormalDetailDesc",
  data() {
    return {
      moment,
      title: '',
      visible: false,
      detailDataDesc: [
        {
          title: '异常类型',
          key: 'exceptionType',
          value: '',
          option: [{key: 1, value: "设备异常"}, {key: 2, value: "样品异常"}, {key: 3, value: "动力异常"}]
        },
        {title: '处理状态', key: 'dealStatus', value: '', option: [{key: 1, value: "未处理"}, {key: 3, value: "已处理"}]},
        {title: '试验样品', key: 'pieceNo', value: ''},
        {title: '记录人', key: 'recordUserName', value: ''},
        {title: '记录时间', key: 'recordTime', value: '', isTime: true, span: 2},
        {title: '异常说明', key: 'exceptionDesc', value: '', span: 3},
        {title: '处理人', key: 'dealUserName', value: ''},
        {title: '处理时间', key: 'dealTime', value: '', isTime: true, span: 2},
        {title: '处理结果', key: 'dealDesc', value: '', span: 3},
      ],
      url: {
        detail: '/HfEnvTestExceptionBusiness/queryById',
        testDetail: '/HfEnvTaskTestBusiness/queryById',
      },
      detailData: {},
      testDetailData: {},
      attachInfo: [],
    }
  },
  methods: {
    getModalContainer() {
      return document.getElementById('page-content')
    },
    handleDownload(filePath, fileName) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
    show(record) {
      this.visible = true
      this.loadDetail(record.id)
    },
    handleCancel() {
      this.visible = false
    },
    loadDetail(id) {
      postAction(this.url.detail, {id}).then((res) => {
        if (res.code === 200) {
          const {data} = res
          this.detailData = data
          this.attachInfo = data.attachInfo
          this.title = '异常记录详情：' + data.testNames
          for (let item in data) {
            for (let i = 0; i < this.detailDataDesc.length; i++) {
              if (item === this.detailDataDesc[i].key) {
                this.detailDataDesc[i].value = data[item]
              }
            }
          }
        }
      })
    },
  }
}
</script>

<style lang="less" scoped>
/deep/ .h-card-wrapper {
  height: auto;
}

.url-list {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  span {
    margin-right: 10px;
  }
}
</style>
