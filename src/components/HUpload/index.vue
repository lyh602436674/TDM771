<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-12 16:32:46
 * @LastEditTime: 2021-10-11 13:42:52
 * @LastEditors: 陈乾龙
 * @Description: 带密级设置的文件上传组件
 * @FilePath: \hifar-platform-client\src\components\HUpload\index.vue
-->
<template>
  <div class="h-upload">
    <input
      ref="h-upload-input"
      type="file"
      :closable="false"
      :maskClosable="false"
      :accept="accept"
      :multiple="multiple"
      @change="beforeUpload"
    />
    <div class="h-upload-action" @click="clickUpload">
      <slot></slot>
    </div>
    <h-modal
      destroyOnClose
      :title="title"
      :visible="visible"
      :width="800"
      :confirmLoading="uploadLoading"
      :getContainer="getContainer"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-button type="primary" block icon="select" @click="handleUploadFile">选择文件</a-button>
      <h-select
        v-if="showSecret"
        v-model="secretLevel"
        style="margin-top: 10px"
        placeholder="请选择密级"
        @change="handleSecretLevelChange"
      >
        <span slot="addonBefore">密级选择</span>
        <a-select-option v-for="item in secretList" :key="item.itemKey" :value="item.itemKey">
          {{ item.itemValue }}
        </a-select-option>
      </h-select>
      <a-table
        v-if="showList"
        class="h-upload-files-table"
        size="small"
        :columns="columns"
        :dataSource="filesList"
        rowKey="uuid"
        :pagination="false"
      >
        <h-select
          v-model="record.secretLevel"
          placeholder="请选择"
          size="small"
          slot="secretLevel"
          slot-scope="text, record"
          :disabled="record.disabled"
        >
          <a-select-option v-for="item in secretList" :key="item.itemKey" :value="item.itemKey">
            {{ item.itemValue }}
          </a-select-option>
        </h-select>
        <a-progress slot="progress" slot-scope="text, record" :percent="record.progress" :status="record.status" />
        <template slot="actions" slot-scope="text, record, index">
          <template v-if="record.status == 'exception'">
            <a-tooltip title="重新上传">
              <h-icon class="primary-text" type="icon-tongbu" @click="() => tryUpload(record.file)" />
            </a-tooltip>
            <a-divider type="vertical" />
          </template>
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(index, record)">
            <h-icon class="danger-text" type="icon-shanchu" />
          </a-popconfirm>
        </template>
      </a-table>
      <div slot="footer" class="h-upload-footer">
        <!-- 这个是占位符，误删除 -->
        <div>
          <!-- <a-button type="ghost-success" icon="upload" :loading="uploadLoading" @click="uploadFiles">上传</a-button> -->
        </div>
        <div>
          <a-button type="ghost-danger" icon="close" :loading="uploadLoading" @click="handleCancel">关闭</a-button>
          <a-button type="ghost-primary" icon="save" :loading="uploadLoading" @click="uploadFiles">确认</a-button>
        </div>
      </div>
    </h-modal>
  </div>
</template>

<script>
import { listByDictCode } from '@/api/api'
import { randomUUID } from '@/utils/util'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { findIndex, reduceRight } from 'lodash'
import { getAction } from '@/api/manage'
var Minio = require('minio')
var columns = [
  [
    {
      title: '文件名',
      align: 'left',
      ellipsis: true,
      dataIndex: 'name',
    },
    {
      title: '文件大小(B)',
      align: 'left',
      ellipsis: true,
      dataIndex: 'size',
    },
    {
      title: '文件类型',
      align: 'left',
      ellipsis: true,
      dataIndex: 'type',
    },
  ],
  [
    {
      title: '密级',
      ellipsis: true,
      width: 120,
      scopedSlots: {
        customRender: 'secretLevel',
      },
    },
  ],
  [
    {
      title: '上传进度',
      align: 'left',
      scopedSlots: {
        customRender: 'progress',
      },
    },
    {
      title: '操作',
      align: 'center',
      width: 100,
      fixed: 'right',
      scopedSlots: {
        customRender: 'actions',
      },
    },
  ],
]
export default {
  props: {
    title: {
      type: String,
      default: '文件上传',
    },
    /**
     * @Date: 2021-07-12 11:09:35
     * @Author: 陈乾龙
     * @description: 是否允许多文件上传
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * @Date: 2021-07-12 11:11:29
     * @Author: 陈乾龙
     * @description: 上传文件的类型，文件类型会在调试模式下打印到控制台
     */
    accept: {
      type: String,
      default: '',
    },
    /**
     * @Date: 2021-07-12 11:15:46
     * @Author: 陈乾龙
     * @description: 上传文件返回的文件列表信息
     * @param  [{name:xx,}]
     */
    value: {
      type: Array,
      default: () => [],
    },
    /**
     * @Date: 2021-07-12 12:00:08
     * @Author: 陈乾龙
     * @description: 上传文件的接口地址
     */
    action: {
      type: String,
      default: '',
    },
    /**
     * @Date: 2021-07-12 13:39:26
     * @Author: 陈乾龙
     * @description: 接口请求类型，这里只支持POST,GET
     */
    method: {
      type: String,
      default: 'POST',
    },
    /**
     * @Date: 2021-07-12 13:53:40
     * @Author: 陈乾龙
     * @description: maxSize 文件大小最大，单位kB；文件大小最小，单位kB ; 如果设置成0则认为不限制大小
     */
    maxSize: {
      type: Number,
      default: 0,
    },
    minSize: {
      type: Number,
      default: 0,
    },
    /**
     * @Date: 2021-07-12 14:50:07
     * @Author: 陈乾龙
     * @description: 是否展示上传列表
     */
    showList: {
      type: Boolean,
      default: true,
    },
    biz: {
      type: String,
      default: '',
    },
    showSecret: {
      type: Boolean,
      default: false,
    },
    /**
     * @Date: 2021-08-11 15:23:53
     * @Author: 陈乾龙
     * @description: 自定义挂载位置
     */
    getContainer: {
      type: [Function],
      default: () => {
        document.body.style.position = 'relative'
        return document.body
      },
    },
  },
  data() {
    return {
      preCls: 'dh-upload',
      uploadLoading: false,
      // 展示文件信息的列表
      filesList: this.value || [],
      columns: this.showSecret
        ? reduceRight(
            [columns[2], columns[1], columns[0]],
            (flattened, other) => {
              return flattened.concat(other)
            },
            []
          )
        : reduceRight(
            [columns[2], columns[0]],
            (flattened, other) => {
              return flattened.concat(other)
            },
            []
          ),
      visible: false,
      url: {
        minioConfig: '/OssBusiness/sts',
        upload: window._CONFIG['domianURL'] + this.action,
      },
      secretList: [],
      secretLevel: undefined,
      MinioClient: null,
      bucket: null,
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        console.log('upload 组件中数据变化', Array.isArray(val), val)
        if (Array.isArray(val)) {
          // 处理回显的数据，已上传的文件回显的时候不会携带status 和 progress 这里就用status用来判断
          this.reviewFiles(val)
        } else {
          this.filesList = []
        }
      },
    },
  },
  created() {
    if (this.showSecret) {
      this.getSecretList()
    }
  },
  methods: {
    // 数据回显,这里增加一条是否历史数据字段
    reviewFiles(val) {
      console.log('上传数据回显', val)
      this.filesList = val.map((file) => {
        if (this.showSecret && file.secretLevel != null && file.secretLevel !== undefined) {
          if (file.hasOwnProperty('status') && file.status != 'success') {
            return {
              ...file,
              disabled: false,
            }
          } else {
            return {
              ...file,
              status: 'success',
              progress: 100,
              disabled: true,
            }
          }
        } else {
          if (file.hasOwnProperty('status')) {
            return file
          } else {
            return {
              ...file,
              status: 'success',
              progress: 100,
            }
          }
        }
      })
      console.log('上传数据回显结果', this.filesList)
    },
    getSecretList() {
      //hf_sys_file_secret
      listByDictCode('hf_sys_file_secret').then((res) => {
        if (res.code == 200) {
          this.secretList = res.data
        }
      })
    },
    /**
     * @Date: 2021-07-12 11:16:47
     * @Author: 陈乾龙
     * @description: 文件上传前的操作
     */
    beforeUpload(event) {
      // 文件类型判断和文件大小判断
      let files = event.target.files
      console.log(event.target.value, event, this.$refs['h-upload-input'].value)
      let filesList = []
      let filesLength = files.length
      if (!filesLength) {
        this.$message.error('请选择文件！')
        return
      }
      for (let i = 0; i < filesLength; i++) {
        let UUID = null
        let { size, type, name } = files[i]
        if (this.maxSize && size / 1000 > this.maxSize) {
          this.$message.error(`${name}文件大小大于最大限制${this.maxSize}kB`)
          return
        }
        if (this.minSize && size / 1000 < this.minSize) {
          this.$message.error(`${name}文件大小小于最小限制${this.minSize}kB`)
          return
        }
        if (this.accept && !this.accept.includes(type)) {
          this.$message.error(`${name}文件类型不正确，请重新选择！${name}文件类型${type}，可上传类型${type}`)
          return
        }
        UUID = randomUUID()

        filesList[i] = { name, size, type, secretLevel: this.secretLevel, progress: 0, uuid: UUID, file: files[i] }
      }
      this.filesList = this.filesList.concat(filesList)
      this.$refs['h-upload-input'].value = ''
      console.log('文件上传列表数据', this.filesList)
    },
    /**
     * @Date: 2021-07-12 11:45:44
     * @Author: 陈乾龙
     * @description: 点击选择文件操作
     */
    handleUploadFile() {
      this.$refs['h-upload-input'].click()
    },
    show() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs['h-upload-input'].value = ''
        // 因为关闭会清除filesList 所以这里需要回显对应的文件列表
        this.reviewFiles(this.value)
      })
    },
    clickUpload() {
      // 当有文件列表数据时，这里当做编辑使用
      this.show()
    },
    /**
     * @Date: 2021-07-12 17:16:27
     * @Author: 陈乾龙
     * @description:批量上传文件, 这里用promise all 处理
     */
    uploadFiles() {
      let promiseAll = []
      this.filesList.map((item) => {
        // 当文件没有fileUrl 说明是没有上传的文件，这里就执行上传
        if (!item.fileUrl || item.fileUrl.length <= 5) {
          promiseAll.push(this.tryUpload(item))
        }
      })
      Promise.all(promiseAll).then((res) => {
        console.log('文件上传执行结果', res)
        for (let i = 0, len = res.length; i < len; i++) {
          if (!res[i]) {
            this.$message.error('部分文件上传失败，请删除上传失败的文件，重新上传')
            this.uploadLoading = false
            return
          }
        }
        // this.handleOk()
      })
    },
    tryUpload(_file_) {
      // 这里有两种上传方式
      // 如果action有配置，那么优先使用action上传文件
      // 否则直接使用miniIO 客户端直接上传
      if (this.action) {
        return this.httpRequestUpload(_file_)
      } else {
        return this.uploadMiniIO(_file_)
      }
    },
    async uploadMiniIO(_file_) {
      if (!this.MinioClient) {
        await this.createMinioClient()
      }
      return this.uploadByMinio(_file_)
    },
    async uploadByMinio(file) {
      let _this = this
      return new Promise((resolve, reject) => {
        console.log('需要上传的文件', file)
        var reader = new FileReader()
        reader.readAsArrayBuffer(file.file)
        reader.onload = function () {
          console.log('reader this', this)
          _this.MinioClient.putObject(
            _this.bucket,
            file.name,
            new Buffer(this.result, 'base64'),
            file.size,
            { 'Content-Type': file.type || 'application/octet-stream' },
            function (err, objInfo) {
              if (err) {
                reject(err)
              } else {
                console.log('upload callback', objInfo)
                resolve(objInfo)
              }
            }
          )
        }
      })
    },
    async createMinioClient() {
      let res = await getAction(this.url.minioConfig)
      if (res.code == 200) {
        let { accessKey, secretKey, endPoint, port, bucketName, useSSL } = res.data
        this.bucket = bucketName
        this.MinioClient = new Minio.Client({
          endPoint: endPoint,
          port: port,
          useSSL: useSSL,
          accessKey: accessKey,
          secretKey: secretKey,
          partSize: 300000000,
        })
      }
    },
    httpRequestUpload(_file_) {
      let _this = this
      return new Promise((resolve, reject) => {
        let file = Object.assign({}, _file_)
        const token = this.$ls.get(ACCESS_TOKEN)
        this.uploadLoading = true
        var params = new FormData()
        params.append('file', file.file)
        if (this.biz) {
          params.append('biz', this.biz)
        }
        var xhr = new XMLHttpRequest()
        let index = findIndex(_this.filesList, function (obj) {
          return obj.uuid == file.uuid
        })
        xhr.onerror = function () {
          _this.$message.error('请求失败')
        }
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              let response = JSON.parse(xhr.responseText)
              if (response.success) {
                _this.$set(_this.filesList[index], 'status', 'success')
                _this.$set(_this.filesList[index], 'fileUrl', response.message)
                // 释放xhr
                xhr = null
                resolve(true)
              } else {
                _this.$set(_this.filesList[index], 'status', 'exception')
                _this.$message.error(response.message)
                // 释放xhr
                xhr = null
                resolve(false)
              }
            } else {
              _this.$set(_this.filesList[index], 'status', 'exception')
              console.log('Upload Error', xhr)
              // 释放xhr
              xhr = null
              reject(xhr)
            }
          }
        }
        xhr.upload.onprogress = function (e) {
          _this.uploadLoading = true
          let progress = Math.round((e.loaded / e.total) * 100)
          _this.$set(_this.filesList[index], 'progress', progress)
        }
        xhr.open(this.method, this.url.upload, true)
        xhr.setRequestHeader('X-Access-Token', token)
        xhr.send(params)
      })
    },
    /**
     * @Date: 2021-07-12 15:05:49
     * @Author: 陈乾龙
     * @description: 删除文件操作
     */
    handleDelete(index, record) {
      console.log('删除对应文件', index, record)
      this.filesList.splice(index, 1)
    },
    /**
     * @Date: 2021-07-12 17:52:20
     * @Author: 陈乾龙
     * @description: 释放文件列表
     */
    handleOk() {
      for (let i = 0, len = this.filesList.length; i < len; i++) {
        let item = this.filesList[i]
        // 对数据密级进行判断
        if (this.showSecret && item.secretLevel == null && item.secretLevel == undefined) {
          this.$message.error(`文件必须设置密级`)
          this.uploadLoading = false
          return
        }
        if (!this.filesList[i].fileUrl) {
          this.$confirm({
            title: '确认',
            content: '列表中的文件没有上传完毕，确认结束上传？',
            onOK() {
              this.$emit('change', this.filesList)
              this.handleCancel()
            },
          })
          return
        }
      }
      this.$emit('change', this.filesList)
      this.handleCancel()
    },
    handleCancel() {
      this.filesList = []
      this.visible = false
      this.uploadLoading = false
    },
    handleSecretLevelChange() {
      this.filesList.map((item) => {
        if (item.status != 'success') {
          item.secretLevel = this.secretLevel
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>