<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-01 17:29:49
 * @LastEditTime: 2021-09-01 17:51:08
 * @LastEditors: 陈乾龙
 * @Description: 文件夹管理
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\fileManage\modules\FolderModal.vue
-->
<template>
  <h-modal
    title="文件夹管理"
    inner
    fullScreen
    :getContainer="getContainer"
    :footer="false"
    :visible="visible"
    @cancel="handleCancel"
  >
    <h-card>
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
      <h-vex-table ref="folderTable" :columns="columns" :data="loadData"></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      queryParams: {},
      folderType: [
        {
          title: '公共文件',
          key: 0,
        },
        {
          title: '个人文件',
          key: 1,
        },
      ],
      activeFolder: '公共文件',
      activeFolderKey: [0],
      visible: false,
      columns: [
        {
          title: '名称',
          dataIndex: '',
        },
        {
          title: '排序号',
          dataIndex: '',
        },
        {
          title: '状态',
          scopedSlots: {
            customRender: 'status',
          },
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          width: 100,
          align: 'center',
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
        }
        return new Promise((resolve, reject) => {
          resolve({
            pageSize: 20,
            pageNo: 1,
            total: 0,
            data: [],
          })
        })
      },
    }
  },
  methods: {
    show(record = {}) {
      this.model = Object.assign({}, record)
      this.$nextTick(() => {
        this.visible = true
      })
    },
    handleFolderTypeChange(option) {
      this.activeFolderKey = option.keyPath
      this.activeFolder = this.folderType[option.key].title
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style>
</style>