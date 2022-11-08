/*
 * @Author: 陈乾龙
 * @Date: 2021-11-16 11:17:24
 * @LastEditTime: 2021-11-16 11:47:14
 * @LastEditors: 陈乾龙
 * @Description: 
 * @FilePath: \hifar-platform-client\deploy_env_pro.js
 */
const fs = require('fs')
const path = require('path')
const util = require('util')
const OSS = require('ali-oss')
const moment = require('moment')

const promisifyReaddir = util.promisify(fs.readdir)
const promisifyStat = util.promisify(fs.stat)

const ALIOSSKEY = {
  region: 'oss-cn-huhehaote',
  key: 'LTAI5t6nDfnXogzQA6ZhQMWX',
  secret: 'i6jzJx47CwKrexnvCR4EZe2ln0fDgP',
  bucket: 'hifar-env'
}

const client = new OSS({
  region: ALIOSSKEY.region,
  accessKeyId: ALIOSSKEY.key,
  accessKeySecret: ALIOSSKEY.secret,
  bucket: ALIOSSKEY.bucket
})

const publicPath = path.resolve(__dirname, './dist')

async function run (proPath = '') {
  const dir = await promisifyReaddir(`${publicPath}${proPath}`)

  for (let i = 0; i < dir.length; i++) {
    const stat = await promisifyStat(path.resolve(`${publicPath}${proPath}`, dir[i]))

    if (stat.isFile()) {
      const fileStream = fs.createReadStream(path.resolve(`${publicPath}${proPath}`, dir[i]))
      console.log(`上传文件: ${proPath}/${dir[i]}`)
      await client.putStream(`${proPath}/${dir[i]}`, fileStream)
    } else if (stat.isDirectory()) {
      await run(`${proPath}/${dir[i]}`)
    }
  }
}

async function list() {
  try {
    // 不带任何参数，默认最多返回1000个文件。
    let files = []
    let result2 = {}
    let result1 = await client.list()
    // 根据nextMarker继续列出文件。
    if (result1.isTruncated) {
      reuslt2 = await client.list({
        marker: result1.nextMarker
      });
    }
    if (result1.objects && result1.objects.length > 0) {
      result1.objects.map(item => {
        console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]遍历需要删除的文件:${item.name}`)
        files.push(item.name)
      })
    }
    if(result2.objects && result2.objects.length>0){
      result2.objects.map(item=>{
        console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]遍历需要删除的文件:${item.name}`)
        files.push(item.name)
      })
    }
    if (files && files.length > 0) {
      console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]删除文件中，请稍等... ...`)
      let result = await client.deleteMulti(files, {
        quiet: true
      })
      list()
    }else{
      console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]删除文件成功，开始上传文件：`)
      run()
      return
    }
  } catch (e) {
    console.log(e)
  }
}
console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]开始删除文件：`)
list()