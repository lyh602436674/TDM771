<!--
 * @Author: 赵峰
 * @Date: 2021-11-17 18:21:04
 * @LastEditTime: 2021-11-25 14:18:54
 * @LastEditors: 赵峰
 * @Descripttion: 系统内通用Excel导入弹窗组件
 * @FilePath: \hifar-platform-client\src\components\HFileImport\index.vue
-->
<template>
  <h-modal
    destroyOnClose
    inner
    :title="title"
    :visible="visible"
    :width="550"
    :confirmLoading="confirmLoading"
    :getContainer="getContainer"
    :footer="false"
    :dialogStyle="{ top: '100px' }"
    @cancel="handleCancel"
  >
    <h-card :bordered="false" style="width: 100%">
      <div style="width: 100%; display: flex; align-item: center; justify-content: center; text-align: center">
        <a-upload
          size="small"
          name="file"
          :showUploadList="false"
          :multiple="false"
          :headers="tokenHeader"
          :action="importExcelUrl"
          :data="paramsData"
          accept=".xls,.xlsx"
          @change="handleImportExcel"
        >
          <a-alert
            size="small"
            class="h-attachment-download-description"
            type="info"
            style="width: 492px; margin: 0 0 10px 0"
          >
            <a slot="description" href="javascript:;" class="primary-text">
              <a-icon type="upload"></a-icon>点击选择上传文件
            </a>
          </a-alert>
        </a-upload>
      </div>
      <a-spin v-if="upLoadShow" tip="导入正在执行中,请稍后..." style="margin-bottom: 18px">
        <div class="spin-content"></div>
      </a-spin>

      <span>
        上传数据时，请使用模板文件将数据整理好后，再上传。
        <a href="javascript:;" class="primary-text" @click="downloadTemplate"> 点击下载模板 </a>
      </span>
      <div style="color: red; margin: 10px 0">提示：请选择‘xls’或‘xlsx’格式的文件</div>
      <div v-if="importResult" class="result-containter">
        <div style="margin: 10px">
          <h3>导入记录:</h3>
          <div>
            导入时间：{{
              importResult.createTime && importResult.createTime != 0
                ? moment(parseInt(importResult.createTime)).format('YYYY-MM-DD HH:mm:ss')
                : ''
            }}
          </div>
          <p>
            导入结果：共{{ importResult.totalCount }}条，成功<span class="success-text">{{
              importResult.successCount
            }}</span
            >条，失败<span class="danger-text"> {{ importResult.errorCount }} </span>条
          </p>
          <a v-if="importResult.errorCount != 0" href="javascript:;" class="primary-text" @click="handleDownload">
            点击下载查看失败数据
          </a>
        </div>
      </div>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction, downloadFile } from '@/api/manage'
import moment from 'moment'
import { isEmpty } from 'lodash'
import mixin from '@/views/hifar/mixin.js'
export default {
  mixins: [mixin],
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  props: {
    intervalTime: {
      type: [String, Number],
      default: 15000,
    },
  },
  data() {
    return {
      moment,
      title: '',
      visible: false,
      confirmLoading: false,
      upLoadShow: false,
      url: {
        importExcelUrl: '',
        importHistory: '/HfImportRecordBusiness/queryByImportCode',
      },
      paramsData: {},
      importResult: null,
      timer: null,
      importCode:null
    }
  },
  methods: {
    show(type, url, record) {
      this.visible = true
      let importCode = record.importCode
      this.paramsData = record
      this.title = type + '导入'
      this.url.importExcelUrl = url
      this.importCode = importCode
      if (!isEmpty(record) && importCode) {
        this.loadData()
        this.timer = setInterval(() => {
          this.loadData()
        }, this.intervalTime)
      }
    },
    handleCancel() {
      this.visible = false
      if (this.importCode) {
        clearInterval(this.timer)
      }
      this.$emit('change', true)
    },
    //获取导入结果
    loadData() {
      postAction(this.url.importHistory, { importCode: this.paramsData.importCode }).then((res) => {
        if (res.code == 200) {
          this.upLoadShow = false
          const { data } = res
          this.importResult = isEmpty(data) ? null : data
        }
      })
    },
    // 导入
    handleImportExcel(info) {
      console.log("info",info)
      this.upLoadShow = true
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        if (info.file.response.code === 200) {
          this.$message.success(`${info.file.response.msg || `${info.file.name} 文件上传成功`}`)
          if (this.importCode) {
            this.loadData()
          }
        } else {
          this.$message.error(`${info.file.name} ${info.file.response.msg || '导入失败'}.`)
        }
      } else if (info.file.status === 'error') {
        this.$message.error(`文件导入失败: ${info.file.msg} `)
      }
    },
    //下载模板
    downloadTemplate() {
      this.$emit('downloadExcel', true)
    },
    handleDownload() {
      const { filePath, fileName } = this.importResult
      downloadFile(filePath, fileName)
    },
  },
  beforeDestroy() {
    if (this.importCode) {
      clearInterval(this.timer)
    }
  },
}
</script>

<style lang="less" scoped>
.h-attachment-download-description {
  margin-top: 20px;
}
.spin-content {
  width: 100%;
  border: 1px solid #91d5ff;
  background-color: #e6f7ff;
  padding: 60px;
}
.result-containter {
  color: #000;
  background: #eee;
  padding: 10px;
  span {
    font-size: 22px;
    margin: 0 5px;
  }
}
</style>