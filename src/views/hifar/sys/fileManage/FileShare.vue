<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-06 10:57:33
 * @LastEditTime: 2021-10-28 16:22:48
 * @LastEditors: 赵峰
 * @Description: 文件分享
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\fileManage\FileShare.vue
-->
<template>
  <div class="file-share">
    <h-card fixed>
      <div slot="content" class="file-share-wrapper">
        <a-tabs type="card" @change="handleTabsChange" style="width: 100%">
          <a-tab-pane key="1">
            <span slot="tab">
              <a-icon type="share-alt" />
              分享我的
            </span>
          </a-tab-pane>
          <a-tab-pane key="2">
            <span slot="tab">
              <a-icon type="share-alt" />
              我分享的
            </span>
          </a-tab-pane>
        </a-tabs>
        <div slot="content" style="flex: 1; width: 100%">
          <h-card :bordered="false" fixed>
            <a-breadcrumb slot="title">
              <a-breadcrumb-item> <a-icon type="home" @click="() => handleGoFolder({ id: 0 })" /> </a-breadcrumb-item>
              <a-breadcrumb-item v-for="item in breadcrumb" :key="item.id">
                <a href="javascript:;" @click="() => handleGoFolder(item)">
                  {{ item.fileName }}
                </a>
              </a-breadcrumb-item>
            </a-breadcrumb>
            <h-vex-table
              ref="shareFileTable"
              slot="content"
              :columns="activeTab == 2 ? mySharedcolumns : sharedTocolumns"
              :data="loadData"
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
              <template slot="createUserName" slot-scope="text, record">
                <template v-if="activeTab == 1">
                  <a-tag v-for="(item, index) in record.shareUserList" :key="index">
                    {{ item.createUserName }}
                  </a-tag>
                </template>
                <template v-else>
                  <a-tag v-for="(item, index) in record.sharedUserList" :key="index">
                    {{ item.sharedUserName }}
                  </a-tag>
                </template>
              </template>
              <template slot="actions" slot-scope="text, record">
                <a-tooltip v-if="record.fileType == 2" title="下载">
                  <a-icon type="download" class="primary-text" @click="() => handleDownload(record)" />
                  <a-divider type="vertical" />
                </a-tooltip>
                <a-tooltip v-if="activeTab == 2" title="撤销">
                  <a-icon
                    type="arrow-left"
                    class="danger-text"
                    style="cursor: pointer"
                    @click="() => handleRevoke(record)"
                  />
                </a-tooltip>
              </template>
            </h-vex-table>
          </h-card>
        </div>
      </div>
    </h-card>
  </div>
</template>

<script>
import { postAction, getFileAccessHttpUrl, downloadFile } from '@/api/manage'
export default {
  data() {
    return {
      activeTab: '1',
      sharedTocolumns: [
        {
          title: '名称',
          dataIndex: 'fileName',
          scopedSlots: {
            customRender: 'fileName',
          },
        },
        {
          title: '分享人',
          dataIndex: 'createUserName',
          scopedSlots: {
            customRender: 'createUserName',
          },
        },
        {
          title: '操作',
          width: 80,
          align: 'center',
          dataIndex: 'actions',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      mySharedcolumns: [
        {
          title: '名称',
          dataIndex: 'fileName',
          scopedSlots: {
            customRender: 'fileName',
          },
        },
        {
          title: '接收人',
          dataIndex: 'createUserName',
          scopedSlots: {
            customRender: 'createUserName',
          },
        },
        {
          title: '操作',
          width: 80,
          align: 'center',
          dataIndex: 'actions',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      selectedKeys: [],
      breadcrumb: [],
      loadData: (params) => {
        let url = null
        if (this.activeTab == 1) {
          url = this.url.sharedToMe
        } else {
          url = this.url.myShareList
        }
        let data = {
          ...params,
          ...this.queryParams,
          pid: this.selectedKeys.join(''),
        }
        return postAction(url, data).then((res) => {
          if (res.code == 200) {
            this.breadcrumb = res.ext ? (res.ext.parentList ? res.ext.parentList : []) : []
            return res.data
          }
        })
      },
      url: {
        myShareList: '/BaseFolderFileBusiness/listPageByPidForMyShare',
        sharedToMe: '/BaseFolderFileBusiness/listPageByPidForShareToMy',
        revoke: '/BaseFolderFileBusiness/cancelShareFile',
      },
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.shareFileTable.refresh(bool)
    },
    handleTabsChange(v) {
      this.activeTab = v
      this.queryParams = {}
      this.selectedKeys = []
      this.refresh(true)
    },
    handleGoFolder(item) {
      this.selectedKeys = [item.id]
      this.refresh()
    },
    // 进入下一级目录
    handleOpenFolder(record) {
      // 点击目录
      if (record.fileType == 1) {
        this.selectedKeys = [record.id]
        this.refresh(true)
      }
    },
    handleDownload(record) {
      let { filePath, fileName } = record
      let fileAccessUrl = getFileAccessHttpUrl(filePath)
      downloadFile(fileAccessUrl, fileName)
    },
    handleRevoke(record) {
      this.$confirm({
        title: '确认撤销',
        content: '撤销后无法恢复',
        onOk: () => {
          let params = {
            fileIds: record.id,
          }
          postAction(this.url.revoke, params).then((res) => {
            if (res.code == 200) {
              this.$message.success('撤销成功')
              this.refresh(true)
            }
          })
        },
      })
    },
  },
}
</script>

<style lang="less">
.file-share {
  width: 100%;
  height: 100%;
  &-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    height: 100%;
    .h-card-wrapper {
      .ant-card-body {
        padding: 10px 0;
      }
    }
  }
}
</style>