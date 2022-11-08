<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-01 15:57:54
 * @LastEditTime: 2021-11-30 15:22:05
 * @LastEditors: 马潭龙
 * @Description: 文件管理器
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\fileManage\FileFolder.vue
-->
<template>
  <div ref="fileManage" class="file-manage">
    <r-l-layout style="height: 100%; width: 100%" :leftMinWidth="280">
      <div slot="left" style="height: 100%">
        <h-card fixed>
          <template slot="title">
            <a-dropdown>
              <div class="folder-title">
                <a-icon type="folder" />
                <span>{{ activeFolder }}</span>
                <a-icon type="caret-down" style="font-size: 12px" />
              </div>
              <a-menu slot="overlay" :selectedKeys="activeFolderKey" @click="handleFolderTypeChange">
                <a-menu-item v-for="item in folderType" :key="item.key">
                  <a-icon type="vertical-left" />
                  <span> {{ item.title }} </span>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
          <a-space slot="extra" size="small">
            <!-- <a-tooltip title="编辑">
              <a-icon type="edit" @click="handleFolderEdit" />
            </a-tooltip> -->
            <a-tooltip title="刷新">
              <a-icon type="reload" @click="handleRefresh" />
            </a-tooltip>
          </a-space>
          <div slot="content" style="height: 100%; width: 100%; overflow: auto">
            <a-tree
              v-if="folderTree.length"
              size="small"
              show-line
              :treeData="folderTree"
              :selectedKeys="selectedKeys"
              :expandedKeys="expandedKeys"
              :replaceFields="replaceFields"
              :autoExpandParent="true"
              @select="onTreeNodeSelect"
              @expand="onTreeNodeSelect"
            >
              <span slot="customTitle" slot-scope="record">
                <!-- <a-icon class="warning-text" :type="expandedKeys.includes(record.id) ? 'folder-open' : 'folder'" /> -->
                {{ record.title }}
              </span>
            </a-tree>
            <a-empty
              v-else
              description="好空呀，添加点文件夹吧~"
              style="height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column"
            />
          </div>
        </h-card>
      </div>
      <div slot="right" style="height: 100%">
        <h-card fixed>
          <a-breadcrumb slot="title">
            <a-breadcrumb-item> <a-icon type="home" @click="() => onTreeNodeSelect([0])" /> </a-breadcrumb-item>
            <a-breadcrumb-item v-for="item in breadcrumb" :key="item.id">
              <a href="javascript:;" @click="() => onTreeNodeSelect([item.id])">
                {{ item.fileName }}
              </a>
            </a-breadcrumb-item>
          </a-breadcrumb>
          <!-- 搜索条件 -->
          <h-search v-model="queryParams" slot="search-form" :data="formData" @change="refresh" />
          <!-- 操作按钮栏 -->
          <template slot="table-operator">
            <a-button v-has="'folder:new'" size="small" icon="folder" type="ghost-primary" @click="handleAddFolder">
              新建文件夹
            </a-button>
            <a-button v-has="'folder:upload'" size="small" icon="upload" type="primary" @click="handleUploadFile">
              上传文件
            </a-button>
            <a-button v-has="'folder:share'" size="small" icon="share-alt" type="ghost-warning" @click="handleShare">
              分享
            </a-button>
            <!-- <a-button v-if="selectedRowKeys.length" size="small" icon="delete" type="danger" @click="handleDeleteBatch">
              批量删除
            </a-button> -->
            <template>
              <a-button v-has="'entrustment:delete'" type="danger" size="small" icon="delete" @click="handleDeleteBatch">
                批量删除
              </a-button>
            </template>
          </template>
          <h-vex-table
            ref="FolderTable"
            slot="content"
            :columns="columns"
            :data="loadData"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onSelect: onSelect }"
          >
            <a
              slot="fileName"
              slot-scope="text, record"
              class="primary-text"
              style="cursor: pointer"
              @click="() => handleOpenFolder(record)"
            >
              <a-icon :type="record.fileType == 1 ? 'folder' : 'file'" />
              {{ record.fileName }}
            </a>
            <template slot="actions" slot-scope="text, record">
              <a-icon
                v-if="record.fileType == 1"
                type="edit"
                class="primary-text"
                @click="() => handleEditFolder(record)"
              />
              <template v-if="record.fileType == 2">
                <a-icon
                  type="eye"
                  class="primary-text"
                  @click="() => handlePreview(record)"
                />
                <a-divider type="vertical"/>
              </template>
              <a-icon
                v-if="record.fileType == 2"
                type="download"
                class="primary-text"
                @click="() => handleDownload(record)"
              />
              <a-divider type="vertical"/>
              <a-popconfirm title="确认删除？" @confirm="() => handleDelete(record.id)">
                <h-icon type="icon-shanchu" class="danger-text"/>
              </a-popconfirm>
            </template>
          </h-vex-table>
        </h-card>
      </div>
    </r-l-layout>
    <folder-modal ref="folderModal" @change="handleRefresh"></folder-modal>
    <folder-edit-modal
      ref="folderEditModal"
      :publicFlag="activeFolderKey.join('')"
      :folderList="folderTree"
      @change="handleRefresh"
    />
    <file-upload ref="fileFolderUpload" @change="handleRefresh" />
    <file-share-modal ref="fileShareModal"></file-share-modal>
  </div>
</template>

<script>
import {downloadFile, getAction, getFileAccessHttpUrl, postAction} from '@/api/manage'
import FolderModal from './modules/FolderModal.vue'
import FolderEditModal from './modules/FolderEditModal.vue'
import {createTree} from '@/utils/hasPermission'
import moment from 'moment'
import FileUpload from './modules/FileUpload.vue'
import FileShareModal from './modules/FileShareModal.vue'
import {find} from 'lodash'
import mixin from '@/views/hifar/mixin.js'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.fileManage,
    }
  },
  components: { FolderModal, FolderEditModal, FileUpload, FileShareModal },
  mixins:[mixin],
  data() {
    return {
      queryParams: {},
      folderType: [
        {
          title: '个人文件',
          key: 1,
        },
        {
          title: '公共文件',
          key: 2,
        },
        {
          title: '部门文件',
          key: 3,
        },
      ],
      activeFolder: '公共文件',
      activeFolderKey: [2],
      folderTree: [],
      selectedKeys: [],
      expandedKeys: [],
      replaceFields: {
        children: 'children',
        title: 'fileName',
        value: 'id',
        key: 'id',
      },
      formData: [
        {
          title: '名称',
          key: 'c_fileName_7',
          formType: 'input',
        },
        {
          title: '上传者',
          key: 'c_createUserName_7',
          formType: 'input',
        },
        {
          title: '上传时间',
          key: 'createTime',
          showTime: true,
          formType: 'dateRangePick',
        },
      ],
      columns: [
        {
          title: '名称',
          dataIndex: 'fileName',
          scopedSlots: {
            customRender: 'fileName',
          },
        },
        {
          title: '文件类型',
          dataIndex: 'fileType',
          customRender: (text) => {
            return text == 1 ? '目录' : '文件'
          },
        },
        {
          title: '文件大小',
          dataIndex: 'fileSize',
          customRender: (text, record) => {
            // 单位lkB
            if (record.fileType == 1) return '--'
            if (!isNaN(parseFloat(text))) {
              let size = parseFloat(text) / 1024 / 1024
              return size.toFixed(2) + 'MB'
            }
            return 0
          },
        },
        {
          title: '上传者',
          dataIndex: 'createUserName',
        },
        {
          title: '上传时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作',
          width: 100,
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      breadcrumb: [],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          pid: this.selectedKeys.join('') || '0',
          publicFlag: this.activeFolderKey.join(''),
        }
        if (data.createTime && data.createTime.length > 0) {
          data.beginTime = moment(data.createTime[0]).format('YYYY-MM-DD') + ' 00:00:00'
          data.endTime = moment(data.createTime[1]).format('YYYY-MM-DD') + ' 23:59:59'
          data.c_createTime_4 = moment(data.beginTime).format('X') * 1000
          data.c_createTime_6 = moment(data.endTime).format('X') * 1000
        }
        delete data.beginTime
        delete data.endTime
        delete data.createTime

        return postAction(this.url.folderListByPid, data).then((res) => {
          if (res.code == 200) {
            this.breadcrumb = res.ext ? (res.ext.parentList ? res.ext.parentList : []) : []
            return res.data
          }
        })
      },
      selectedRowKeys: [],
      url: {
        folderList: '/BaseFolderFileBusiness/listAllForMyFloder',
        folderListByPid: '/BaseFolderFileBusiness/listPageForMyFileByPid',
        delete: '/BaseFolderFileBusiness/logicRemoveById',
        detail: '/BaseFolderFileBusiness/queryById',
        preview: "/BaseFolderFileBusiness/filePreView"
      },
    }
  },
  created() {
    this.loadFolderList()
  },
  methods: {
    loadFolderList() {
      let params = {
        publicFlag: this.activeFolderKey.join(''),
      }
      postAction(this.url.folderList, params).then((res) => {
        if (res.code == 200) {
          let expandedKeys = []
          let folderList = []
          let treeData = res.data.map((folder) => {
            // expandedKeys.push(folder.id)
            return {
              title: folder.fileName,
              fileType: folder.fileType,
              id: folder.id,
              pid: folder.pid || 0,
              key: folder.id,
              value: folder.id,
              scopedSlots: {
                title: 'customTitle',
              },
            }
          })
          createTree(treeData, folderList, null, '0')
          this.folderTree = folderList
          this.expandedKeys = expandedKeys
        }
      })
    },
    handleFolderTypeChange(option) {
      this.activeFolderKey = option.keyPath
      let activeType = find(this.folderType, (obj) => {
        return obj.key == this.activeFolderKey
      })
      this.activeFolder = activeType.title
      this.selectedRowKeys = []
      this.handleRefresh()
    },
    // 选择了左侧的目录树
    onTreeNodeSelect(selectedKeys, event) {
      this.selectedRowKeys = []
      this.selectedKeys = selectedKeys
      this.expandedKeys = selectedKeys
      this.refresh(true)
    },
    // 刷新文件目录Table
    refresh(bool = false) {
      this.$refs.FolderTable.refresh(bool)
    },
    // 文件目录选择
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 刷新当前文件管理器
    handleRefresh() {
      this.loadFolderList()
      this.refresh(true)
    },
    // 目录编辑
    handleFolderEdit() {
      this.$refs.folderModal.show()
    },
    // 在左侧目录树添加目录
    handleAddFolder(record = {}) {
      console.log(this.folderTree)
      record.pid = this.selectedKeys.join('')
      this.$refs.folderEditModal.folderList = [].concat(
        [],
        [
          {
            fileType: 1,
            id: '0',
            pid: '0',
            isLeaf: true,
            key: '0',
            scopedSlots: { title: 'customTitle' },
            title: '根目录',
            value: '0',
          },
        ],
        this.folderTree
      )
      this.$refs.folderEditModal.show(record)
    },
    // 编辑目录信息
    handleEditFolder(record = {}) {
      this.$refs.folderEditModal.folderList = [].concat(
        [],
        [
          {
            fileType: 1,
            id: '0',
            pid: '0',
            isLeaf: true,
            key: '0',
            scopedSlots: { title: 'customTitle' },
            title: '根目录',
            value: '0',
          },
        ],
        this.folderTree
      )
      this.$refs.folderEditModal.show(record)
    },
    // 批量删除
    handleDeleteBatch() {
      if(this.selectedRowKeys.length){
      this.$confirm({
        title: '确认删除？',
        content: '该操作会直接删除目录下的子目录和子文件，删除后文件不可恢复，确认删除？',
        onOk: () => {
          let ids = this.selectedRowKeys.join(',')
          this.handleDelete(ids)
          this.selectedRowKeys = []
        },
      })
      }else{
        this.openNotificationWithIcon('error','删除提示', '请至少选择一项')
      }
    },
    // 删除文件
    handleDelete(ids) {
      postAction(this.url.delete, { id: ids }).then((res) => {
        if (res.code == 200) {
          this.handleRefresh()
        }
      })
    },
    // 上传文件
    handleUploadFile() {
      this.$refs.fileFolderUpload.pid = this.selectedKeys.join('') || 0
      this.$refs.fileFolderUpload.publicFlag = this.activeFolderKey.join('') || 2
      this.$refs.fileFolderUpload.show()
    },
    // 进入下一级目录
    handleOpenFolder(record) {
      this.selectedRowKeys = []
      // 点击目录
      if (record.fileType == 1) {
        this.selectedKeys = [record.id]
        this.refresh(true)
      }
    },
    // 文件分享
    handleShare() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请选择要分享的文件')
        return
      }
      this.$refs.fileShareModal.show(this.selectedRowKeys)
    },
    handlePreview(record) {
      getAction(this.url.preview, {id: record.id}).then((res) => {
        if (res.code === 200) {
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = res.data
          link.setAttribute('target', '_blank')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    handleDownload(record) {
      let {filePath, fileName, id} = record
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      if (id) {
        let detailUrl = this.url.detail
        postAction(detailUrl, {id: id}).then((res) => {
          if (res.code == 200 && res.data.status == 9) {
            downloadFile(fileAccessUrl, fileName)
          } else {
            this.$message.warning(`文件[${fileName}]正在合并中，请稍后再点击下载`)
          }
        })
      } else {
        downloadFile(fileAccessUrl, fileName)
      }
    },
  },
}
</script>

<style lang="less">
.file-manage {
  width: 100%;
  height: 100%;
  position: relative;
  .folder-title {
    > span {
      display: inline-block;
      margin: 0 5px;
      font-size: 14px;
    }
  }
}
</style>
