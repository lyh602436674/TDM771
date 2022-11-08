import * as Minio from 'minio'
import { getAction } from '@/api/manage'
import { ACCESS_TOKEN } from '@/store/mutation-types'

var url = {
  minioConfig: '/OssBusiness/sts',
  upload: window._CONFIG['domianURL']
}
var MinioClient = null
var bucket = null
var fileDir = 'hifar/idm'

async function createMinioClient() {
  let res = await getAction(url.minioConfig)
  if (res.code == 200) {
    let { accessKey, secretKey, endPoint, port, bucketName, useSSL } = res.data
    bucket = bucketName
    MinioClient = new Minio.Client({
      endPoint: endPoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
      partSize: 300000000
    })
  }
}

export function tryUpload(_file_, action) {
  // 这里有两种上传方式
  // 如果action有配置，那么优先使用action上传文件
  // 否则直接使用miniIO 客户端直接上传
  if (action) {
    return httpRequestUpload(_file_)
  } else {
    return uploadMiniIO(_file_)
  }
}

function httpRequestUpload(_file_) {

}

async function uploadMiniIO(_file_) {
  if (!MinioClient) {
    await createMinioClient()
  }
  return uploadByMinio(_file_)
}

async function uploadByMinio(file) {
  let _this = this
  return new Promise((resolve, reject) => {
    console.log('需要上传的文件', file)
    var reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = function() {
      console.log('reader this', this)
      MinioClient.putObject(
        bucket,
        fileDir + '/' + file.name,
        new Buffer(this.result, 'base64'),
        file.size,
        { 'Content-Type': file.type || 'application/octet-stream' },
        function(err, objInfo) {
          if (err) {
            reject(err)
          } else {
            console.log('upload callback', objInfo)
            let data = {
              bucketName: 'test',
              partSize: file.size,
              chunkCount: 1,
              fileDir: fileDir,
              url: fileDir + '/' + file.name,
              fileName: file.name,
              fileSize: file.size,
              bucketPre:"private"
            }
            resolve(data)
          }
        }
      )
    }
  })
}

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}