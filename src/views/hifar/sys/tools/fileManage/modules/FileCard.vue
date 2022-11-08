<!--
 * @Author: 陈乾龙
 * @Date: 2021-06-03 18:34:18
 * @LastEditTime: 2021-06-11 17:57:58
 * @LastEditors: 陈乾龙
 * @Description: 文件展示用Card，需要嵌套到a-card-grid组件中才可以正常使用
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\views\hifar\sys\tools\fileManage\modules\FileCard.vue
-->
<template>
  <div style="position: relative">
    <mask-progress v-if="file.status != 'success'" :status="file.status"  :percent="file.percent" @maskClick="handleMaskClick"></mask-progress>
    <a-card class="file-card" :bordered="false" :body-style="{ padding: 0}">
      <a-card-meta>
        <div slot="title" class="card-title">
          <h-icon :type="file.fileType | fileTypeFilter(file.fileType)"></h-icon>
          <a-tooltip :title="file.fileName">
            <a>{{ file.fileName }}</a>
          </a-tooltip>
        </div>
        <div slot="description" class="card-description">
          {{ file.fileSize | sizeFormat(file.fileSize) }}
          <h-icon type="icon-shichang" />
          {{ moment(file.createTime).format('YY-MM-DD') }}
        </div>
      </a-card-meta>
      <template slot="actions" class="ant-card-actions">
        <h-icon key="delete" type="icon-shanchu" class="danger-text" @click="deleteFile" />
        <a-icon key="download" type="download" class="primary-text" v-if="file.fileUrl && file.status=='success'" @click="handleDownload" />
      </template>
    </a-card>
  </div>
</template>

<script>
/**
 * @description: 文件展示用card，业务组件，依赖文件查询接口返回的数据格式
 */
import {getFileAccessHttpUrl, downloadFile,deleteAction } from '@/api/manage'
import moment from 'moment'
import MaskProgress from '../components/MaskProgress'
export default {
  // mixins: [mixin],
  components: { MaskProgress },
  props: {
    /**
     * @description: 接受到的文件数据
     * @param {object} [fileName,fileSize,fileType,fileUrl]
     */
    file: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      moment,
      url: {
        delFiles:'/hifarsys/hfSysFile/delete'
      },
    }
  },
  methods: {
    handleMaskClick(){
      if(this.file.status=='exception'){
        this.deleteFile()
      }
    },
    deleteFile() {
      console.log(this.file)
      if(!this.file.id){
        this.$emit('delete',this.file)
        return
      }
      this.$confirm({
        title: `确认删除${this.file.fileName}`,
        content: `删除后将不可恢复，确认删除？`,
        onOk: async () => {
          let params = { ids: this.file.id }
          let response = await deleteAction(this.url.delFiles, params)
          if (response.success == true) {
            this.$message.success('删除成功')
            this.$emit('change',true)
          } else {
            this.$message.error('删除失败', response.message)
          }
        },
      })
    },
    handleDownload() {
      console.log(this.file)
      let fileAccessUrl = getFileAccessHttpUrl(this.file.fileUrl)
      downloadFile(fileAccessUrl,this.file.fileName)
    },
  },
}
</script>

<style lang="less" scoped>
.file-card {
  .card-title {
    box-sizing: border-box;
    padding:3px 0 0;
    a {
      color: rgba(0, 0, 0, 0.85);
      margin-left: 12px;
      line-height: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: top;
      font-size: 14px;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        color: #1890ff;
      }
    }
  }

  .card-description {
    color: rgba(0, 0, 0, 0.45);
    height: 30px;
    line-height: 22px;
    overflow: hidden;
  }

  .ant-card-meta-description {
    color: rgba(0, 0, 0, 0.45);
    height: 24px;
    line-height: 22px;
    overflow: hidden;
  }
}
</style>