/*
 * @Author: 陈乾龙
 * @Date: 2021-06-02 13:42:13
 * @LastEditTime: 2021-06-04 14:10:28
 * @LastEditors: 陈乾龙
 * @Description: 
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\views\hifar\sys\tools\fileManage\mixins\mixin.js
 */
import {getAction,deleteAction} from '@/api/manage'
import { ACCESS_TOKEN } from "@/store/mutation-types"
import {randomUUID} from '@/utils/util'
export default {
  data(){
    return {
      uploadLoading:false,
      uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
      detailLoading: false,
      filesDetailList: {},
      url: {
        list: '/hifarsys/hfSysTools/list',
        filesList: '/hifarsys/hfSysTools/getFileList',
        filesDetail: '/hifarsys/hfSysTools/getFileList',
        saveFiles:'/hifarsys/hfSysTools/addTools',
        delTools: '/hifarsys/hfSysTools/deleteTool',
      },
      uploadFilesList:[],
      progress:null
    }
  },
  methods:{
    refresh(type = false) {
      this.loadData(type)
      this.handleGetFilesDetail()
    },
    handleDelete(record) {
      this.$confirm({
        title: `确认删除${record.toolName}`,
        content: `删除后将不可恢复，确认删除？`,
        onOk: async () => {
          let params = { id: record.id }
          let response = await deleteAction(this.url.delTools, params)
          if (response.success == true) {
            this.$message.success('删除成功')
            this.refresh()
          } else {
            this.$message.error('删除失败', response.message)
          }
        },
      })
    },
    async handleGetFilesDetail() {
      if (this.detailLoading || !this.expandedRowKeys.length) return
      this.detailLoading = true
      this.filesDetailList={}
      let params = {
        toolId: this.expandedRowKeys.join(),
        pageNo: 1,
        pageSize: 200,
      }
      let response = await getAction(this.url.filesDetail, params)
      if ((response.success = true)) {
        let filesDetailList = {}
        response.result.records.map(item=>{
          filesDetailList[item.id] = {
            ...item,
            status:'success'
          }
        })
        this.filesDetailList = filesDetailList
      }
      this.detailLoading = false
    },
    handleBeforeUpload(file, fileList){
      let newFile={}
      let uuid = randomUUID()
      file.uuid = uuid
      newFile[uuid]={
        uuid: uuid,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        status:'normal',
        percent:0
      }
      this.filesDetailList=Object.assign({},this.filesDetailList,newFile)
    },
    customUploadRequest(request){
      console.log("customUploadRequest",request)
      this.uploadLoading=true
      this.uploadRequest(request)

    },
    async uploadRequest(request){
      const token = this.$ls.get(ACCESS_TOKEN)
      let _this = this
      var params = new FormData()
      params.append('file',request.file)
      var xhr = new XMLHttpRequest();
      xhr.onerror = function(){
        _this.$message.error('请求失败')
      }
      xhr.onreadystatechange = function(){
        if(xhr.readyState==4){
          if(xhr.status==200){
            let response = JSON.parse(xhr.responseText)
            if(response.success){
              _this.$set(_this.filesDetailList[request.file.uuid],'status','success')
              _this.$set(_this.filesDetailList[request.file.uuid],'fileUrl',response.message)
            }else{
              _this.$set(_this.filesDetailList[request.file.uuid],'status','exception')
              _this.$message.error(response.message)
            }
          }else{
            _this.$set(_this.filesDetailList[request.file.uuid],'status','exception')
            console.log("errpr",xhr)
          }
        }
      }
      xhr.upload.onloadend = function(e){
        _this.uploadLoading=false
      }
      xhr.upload.onprogress = function(e){
        let progress = Math.round(e.loaded/e.total*100)
        _this.$set(_this.filesDetailList[request.file.uuid],'percent',progress)
      }
      xhr.open(request.method,request.action,true)
      xhr.setRequestHeader('X-Access-Token',token)
      xhr.send(params)
    }
  }
}