<!--
 * @Author: 雷宇航
 * @Date: 2021-10-18 11:44:00
 * @LastEditTime: 2021-11-25 15:02:03
 * @LastEditors: 赵峰
 * @Description: 实验室详情弹框
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\components\WorkCenterDetailModal.vue
-->
<template>
  <h-modal
    inner
    :title="title"
    :getContainer="getContainer"
    :visible="visible"
    width="80%"
    destroyOnClose
    @cancel="handleCancel"
  >
    <h-desc title="基本信息" :bordered="true" size="small" :column="2">
      <!-- <h-desc-item label="试验室类型">
        {{ model.workType }}
      </h-desc-item> -->
      <h-desc-item label="试验部门名称">
        {{ model.workName }}
      </h-desc-item>
      <h-desc-item label="状态">
        {{ model.status == 1 ? '启用' : model.status == 88 ? '禁用' : '--' }}
      </h-desc-item>
      <h-desc-item label="人员部门" :span="2">
        {{ deptName }}
      </h-desc-item>
      <h-desc-item label="备注" :span="2">
        {{ model.remarks }}
      </h-desc-item>
    </h-desc>
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger"> 关闭</a-button>
    </div>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@api/manage'

export default {
  name: 'WorkCenterDetailModal',
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      moment,
      title: '',
      visible: false,
      model: {},
      type: null,
      userList: '',
      deptName: '',
      url: {
        workId: '/HfPrjWorkCenterBusiness/queryBaseAndUserById',
      },
    }
  },
  methods: {
    show(id) {
      this.$nextTick(() => {
        this.visible = true
        this.loadData(id)
      })
    },
    handleCancel() {
      this.visible = false
    },
    loadData(id) {
      postAction(this.url.workId, { id }).then((res) => {
        if (res.code == 200) {
          this.model = Object.assign({}, res.data)
          this.title = this.model.workName + '详情'
          this.userList = res.data.userList
            .map((item) => {
              return item.idName
            })
            .toString()
          this.deptName = res.data.userList
            .map((item) => {
              let idDept = item.deptName ? '（' + item.deptName + '）' : ''
              return item.idName + idDept
            })
            .toString()
        }
      })
    },
  },
}
</script>
<style lang="less">
</style>