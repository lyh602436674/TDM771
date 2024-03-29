/*
 * @Author: 陈乾龙
 * @Date: 2021-08-18 15:01:36
 * @LastEditTime: 2021-11-24 14:02:05
 * @LastEditors: 赵峰
 * @Description: 上传组件公用方法和属性
 * @FilePath: \hifar-platform-client\src\components\HUpload\UploadMinxin.js
 */
import {randomUUID} from "@/utils/util"
import {findIndex} from 'lodash'
import SparkMD5 from "spark-md5"
import {downloadFile, getFileAccessHttpUrl, postAction} from '@/api/manage'
import {isArray, isEmpty, isFunction, isObject, isString} from "lodash";

export default {
  props: {
    customParams: {
      type: Object,
      default: () => {
      }
    },
    rowKey: {
      type: [String, Function],
      default: 'uuid'
    },
    secretLevel: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      h: this.$createElement,
      fileList: [],
      // 每次上传时先把本次上传的文件保存到这里，可能会用到
      originTargetFiles: [],
      // 分片大小 单位lkB
      chunkSize: 300 * 1024 * 1024,
      url: {
        auth: '/MinioBusiness/authUpload',
        finished: '/MinioBusiness/finishUpload',
      },
      extendRecords: {},
      // 图片水印内容
      watermarkInput: "",
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  methods: {
    clickUpload() {
      this.$refs[this.inputConfig.ref].value = ''
      this.$refs[this.inputConfig.ref].click()
    },
    /**
     * @Date: 2021-08-19 10:48:18
     * @Author: 陈乾龙
     * @description: 从Input中获取文件
     */
    async beforeUpload(event) {
      this.$store.commit('SET_UPLOADING', true)
      let files, targetFiles = event.target.files
      this.originTargetFiles = targetFiles
      if (this.watermark) {
        this.spinning = true
        let imageList = await this.getOriginFileInfo(targetFiles)
        files = this.addWatermark(imageList)
        this.spinning = false
      } else {
        files = targetFiles
      }
      let fileList = []
      let filesLength = files.length
      let fileTypeTxt = ''
      if (this.accept === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileTypeTxt = '.docx'
      } else {
        fileTypeTxt = this.accept
      }
      if (!filesLength) {
        this.$message.error('请选择文件！')
        return
      }
      for (let i = 0; i < filesLength; i++) {
        let UUID = null
        let {size, type, name} = files[i]
        if (this.maxSize && size / 1000 > this.maxSize) {
          this.$message.error(`${name}文件大小大于最大限制${this.maxSize}kB`)
          this.$store.commit('SET_UPLOADING', false)
          return
        }
        if (this.minSize && size / 1000 < this.minSize) {
          this.$message.error(`${name}文件大小小于最小限制${this.minSize}kB`)
          this.$store.commit('SET_UPLOADING', false)
          return
        }
        if (this.accept && !this.accept.includes(type)) {
          this.$message.error(`${name}文件类型不正确，请重新选择！${name}文件类型${type}，可上传类型${fileTypeTxt}`)
          this.$store.commit('SET_UPLOADING', false)
          return
        }
        UUID = randomUUID()
        if (this.extendRecords != undefined && Object.keys(this.extendRecords).length > 0 && this.extendRecords.replace) {
          if (i !== 0) {
            continue;
          }
          fileList[i] = {
            name,
            size,
            type,
            secretLevel: this.secretLevel,
            percent: 0,
            Title: this.extendRecords.Title,
            rowSort: this.extendRecords.rowSort,
            remarks: this.extendRecords.remarks,
            pretreatment: 0,
            status: 'normal',
            uuid: UUID,
            file: files[i],
            replaceStatus: 2
          }
        } else {
          fileList[i] = {
            name,
            size,
            type,
            secretLevel: this.secretLevel,
            percent: 0,
            pretreatment: 0,
            status: 'normal',
            uuid: UUID,
            file: files[i]
          }
        }
      }

      this.fileList = this.fileList.concat(fileList)
      // 抛出准备上传前的事件
      this.$emit('beforeUpload')
      this.$refs[this.inputConfig.ref].value = ''
      console.log('文件上传列表数据', this.fileList)
      this.beforeRequestUpload()
    },
    /**
     * @Date: 2021-08-19 10:47:57
     * @Author: 陈乾龙
     * @description: 文件上传前预处理
     */
    beforeRequestUpload() {
      let promiseAll = this.fileList.map((file, index) => {
        // 判断文件处于预加载结束状态且没有文件url的情况下，才能上传
        if (!file.pretreatment > 0 && !file.url) {
          return new Promise(async (resolve, reject) => {
            let result = await this.calculateUploadParams(file, index)
            if (result) {
              resolve(result)
            } else {
              reject(result)
            }
          })
        }
      })
      Promise.all(promiseAll).then(res => {
        if (this.extendRecords && Object.keys(this.extendRecords).length > 0 && this.extendRecords.replace) {
          let oldIndex = 0
          let [oldFile] = this.fileList.filter((item, index) => {
            if (item.uuid === this.extendRecords.uuid) {
              oldIndex = index
              return true
            }
          })
          this.fileList.splice(oldIndex, 1)
          this.handleDelete(this.extendRecords, oldIndex)
          this.fileList.sort((o1, o2) => o1.rowSort - o2.rowSort)
        }
        this.triggerChange()
      }).catch(err => {
        console.log('总体上传报错', err)
      })
    },
    /**
     * @Date: 2021-08-19 10:49:20
     * @Author: 陈乾龙
     * @description: 计算文件的上传参数
     * @param {*} file  文件
     * @return {*}
     */
    calculateUploadParams(file, index) {
      return new Promise(async (resolve, reject) => {
        let md5 = null
        md5 = await this.getFileMd5(file)
        let uploadParams = {
          bucketName: this.isPublic ? 'public' : "private",
          partSize: this.chunkSize,
          chunkCount: Math.ceil(file.size / this.chunkSize),
          fileMd5: md5,
          fileDir: this.fileDir,
          fileName: file.name,
          fileSize: file.size,
          ...this.customParams
        }
        let fileIndex = findIndex(this.fileList, obj => {
          return obj.uuid === file.uuid
        })
        // 首先获取bucket上传权限
        let authResult = await postAction(this.action || this.url.auth, uploadParams)
        if (authResult.code === 200) {
          let finishedResult = null
          switch (authResult.data.uploadStatus) {
            case 8:
              // 文件分片都已上传，直接合并
              console.log("文件分片都已上传，直接合并")
              finishedResult = await this.finishUpload(uploadParams, authResult.data.fileId)
              if (finishedResult.code === 200) {
                this.$set(this.fileList, fileIndex, Object.assign({}, this.fileList[fileIndex], {
                    status: "success",
                    percent: 100,
                    url: finishedResult.data.filePath,
                    uploadTime: finishedResult.data.createTime, fileId: finishedResult.data.fileId,
                    secretLevel: this.secretLevel,
                  },
                  this.isInReport ? this.getIsInReport() : {}
                ))
                resolve(true)
              } else {
                resolve(false)
              }

              break
            case 9:
              console.log('服务器上已经存在相同的文件', authResult)
              this.$set(this.fileList, fileIndex, Object.assign({}, this.fileList[fileIndex], {
                  status: "success",
                  percent: 100,
                  url: authResult.data.filePath,
                  uploadTime: authResult.data.createTime,
                  fileId: authResult.data.fileId,
                  secretLevel: this.secretLevel,
                },
                this.isInReport ? this.getIsInReport() : {}
              ))
              this.$nextTick(() => {
                resolve(true)
              })
              break
            default:
              // 计算当前上传了多少个分片
              let fileChunkNum = Math.ceil(file.size / this.chunkSize)
              let percentStep = 100 / fileChunkNum
              const chunkUploadUrls = authResult.data.chunkUrls
              let cb = false
              for (let item of chunkUploadUrls) {
                cb = await this.uploadChunk(item, file, fileChunkNum, percentStep, fileIndex)
              }
              finishedResult = await this.finishUpload(uploadParams, authResult.data.fileId)
              if (finishedResult.code === 200) {
                let fileListRow = {
                  status: "success",
                  percent: 100,
                  url: finishedResult.data.filePath,
                  uploadTime: finishedResult.data.createTime,
                  fileId: finishedResult.data.fileId,
                  secretLevel: this.secretLevel,
                }
                this.$set(this.fileList, fileIndex, Object.assign({}, this.fileList[fileIndex], fileListRow, this.isInReport ? this.getIsInReport() : {}))
                resolve(cb)
              } else {
                resolve(false)
              }

          }
          this.$emit('finishUpload', this.fileList[fileIndex])
          this.$store.commit('SET_UPLOADING', false)
        } else {
          this.$set(this.fileList[fileIndex], "status", 'exception')
          this.$store.commit('SET_UPLOADING', false)
        }
      })

    },
    getIsInReport() {
      return {
        isInReport: this.customParams.isInReport
      }
    },
    /**
     * @Date: 2021-08-19 16:58:44
     * @Author: 陈乾龙
     * @description: 上传分片
     * @param {Object}    item          获取到未上传的分片信息
     * @param {Object}    file          当前需要上传的文件
     * @param {Number}    fileChunkNum  总分片数量
     * @param {Number}    percentStep   单个分片的步进值
     * @param {Bumber}    fileIndex     当前文件在总的文件列表中的下标
     * @return {Boolean}
     */
    uploadChunk(item, file, fileChunkNum, percentStep, fileIndex) {
      let _this = this

      return new Promise((resolve, reject) => {
        //分片开始位置
        let start = (item.partNumber - 1) * this.chunkSize
        //分片结束位置
        let end = Math.min(file.size, start + this.chunkSize)

        //取文件指定范围内的byte，从而得到分片数据
        let chunkFile = file.file.slice(start, end)
        console.log("开始上传第" + item.partNumber + "个分片", chunkFile)
        // let formData = new FormData()
        // formData.append('file', chunkFile)
        var xhr = new XMLHttpRequest()
        xhr.onerror = function (err) {
          _this.$message.error('请求失败', err)
          reject(err)
        }
        xhr.onreadystatechange = function (argu) {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              // 释放xhr
              xhr = null
              resolve(true)
            }
          }
        }
        xhr.upload.onprogress = function (e) {
          // 计算单个分片的步进值
          let percent = Math.round((e.loaded / e.total) * 10)
          let calcPercent = 0
          if (fileChunkNum > 1) {
            calcPercent = Math.abs((item.partNumber * percentStep) + percent - 10)
            console.log('persent:', calcPercent + '%')
          } else {
            calcPercent = percent * 10
            console.log('percent2:', calcPercent + '%')
          }


          if (calcPercent >= 100) {
            calcPercent = 100
          }
          _this.$set(_this.fileList[fileIndex], 'percent', parseFloat(calcPercent.toFixed(2)))
        }
        xhr.open('put', item.uploadUrl, true)
        xhr.setRequestHeader('Content-Type', false)
        xhr.setRequestHeader('Process-Data', true)
        xhr.send(chunkFile)
      })
    },
    /**
     * @Date: 2021-08-19 18:11:39
     * @Author: 陈乾龙
     * @description:
     * @param {Object} uploadParams  上传授权参数
     * @param {String} fileId        文件ID
     * @return {Promise}
     */
    finishUpload(uploadParams, fileId) {
      let params = {
        ...uploadParams,
        fileId: fileId,
      }
      return postAction(this.url.finished, params)
    },
    /**
     * @Date: 2021-08-19 17:52:14
     * @Author: 陈乾龙
     * @description:
     * @param {Object} __file__
     * @return {Promise}  md5
     */
    getFileMd5(__file__) {
      let index = findIndex(this.fileList, obj => {
        return obj.uuid === __file__.uuid
      })
      this.$set(this.fileList[index], 'status', 'normal')
      this.$set(this.fileList[index], 'pretreatment', 0)
      this.$set(this.fileList[index], 'percent', 0)
      return new Promise((resolve) => {
        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
          chunkSize = 5 * 1024 * 1024,  // 这里是用来计算文件md5时做的分片
          file = __file__.file,
          // 计算分片数量
          chunks = Math.ceil(file.size / chunkSize),
          // 当前分片
          currentChunk = 0,
          // 计算预处理时进度步进值
          chunkPersentStep = 100 / chunks,
          spark = new SparkMD5.ArrayBuffer(),
          //   1：FileReader : 读取文件内容
          // readAsText() 读取文本文件，(可以使用Txt打开的文件)
          // readAsBinaryString(): 读取任意类型的文件，返回二进制字符串
          // readAsDataURL: 方法可以将读取到的文件编码成DataURL ，可以将资料(例如图片、excel文件)内嵌在网页之中，不用放到外部文件
          // abort: 中断读取
          //
          // 2：FileReader 提供一个完整的事件模型，用来捕获读取文件的状态
          // onabort:读取文件断片时触发
          // onerror:读取文件错误时触发
          // onload:文件读取成功时触发
          // onloadend:文件读取完毕之后，不管成功还是失败触发
          // onloadstart: 开始读取文件时触发
          // onprogress:读取文件过程中触发
          fileReader = new FileReader();
        // 监听文件读取速度
        fileReader.onload = (e) => {
          // console.log('read chunk nr', currentChunk + 1, 'of', chunks);
          spark.append(e.target.result);                   // Append array buffer
          currentChunk++;
          if (currentChunk < chunks) {
            let pretreatment = currentChunk * chunkPersentStep
            // console.log("预处理:", pretreatment.toFixed(2))
            if (pretreatment >= 100) {
              pretreatment = 100
            }
            this.$set(this.fileList[index], "pretreatment", pretreatment.toFixed(2))
            loadNext();
          } else {
            this.$set(this.fileList[index], "pretreatment", 100)
            resolve(spark.end())
          }
        };
        fileReader.onerror = function () {
          console.warn('oops, something went wrong.');
        };

        function loadNext() {
          var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
          fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
      })
    },
    /**
     * @Date: 2021-08-19 17:52:42
     * @Author: 陈乾龙
     * @description:
     * @param {Object} file 文件
     * @param {index} index 下标
     * @return {null}
     */
    handleDelete(file, index) {
      this.fileList.splice(index, 1)
      // this.fileList = this.fileList.filter((item) => item.uuid !== file.uuid)
      this.$emit('delete', file, this.fileList)
      this.$store.commit('SET_UPLOADING', false)
      // this.triggerChange()
    },
    handleBatchDelete() {
      if (!this.selectedRows.length) return this.$message.warning('请选择需要删除的文件')
      for (let i = 0; i < this.fileList.length; i++) {
        for (let j = 0; j < this.selectedRows.length; j++) {
          if (this.fileList[i].uuid === this.selectedRows[j].uuid) {
            this.handleDelete(this.fileList[i], i)
            i--
            break
          }
        }
      }
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    checkboxChange({records}) {
      let selectedRows = []
      records.map(item => {
        if (isString(this.rowKey)) {
          selectedRows[item[this.rowKey]] = item
        } else if (isFunction(this.rowKey)) {
          selectedRows[this.rowKey(item)] = item
        }
      })

      this.selectedRowKeys = Object.keys(selectedRows)
      this.selectedRows = records
      this.$emit('checkboxChange', this.selectedRowKeys, this.selectedRows)
    },
    // 渲染Input
    renderInput(config = {}) {
      return (
        <div class="h-upload-input">
          <input type="file" ref={config.ref} closeable={config.closeable || false} accept={config.accept || '*'}
                 multiple={config.multiple || false} onchange={this.beforeUpload}></input>
        </div>
      )
    },
    // 释放change事件
    triggerChange() {
      this.$emit('change', this.fileList)
      this.$emit('input', this.fileList)
    },
    // 下载文件
    handleDownload(filePath, fileName, id) {
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      if (id) {
        let detailUrl = '/MinioBusiness/queryById'
        if (this.customParams && this.customParams.detail) {
          detailUrl = this.customParams.detail
        }
        postAction(detailUrl, {id: id}).then((res) => {
          if (res.code === 200 && res.data.status === 9) {
            downloadFile(fileAccessUrl, fileName)
          } else {
            this.$message.warning(`文件[${fileName}]正在合并中，请稍后再点击下载`)
          }
        })
      } else {
        downloadFile(fileAccessUrl, fileName)
      }
    }
  }
}