<!--
 * @Author: 赵峰
 * @Date: 2021-09-18 15:21:10
 * @LastEditTime: 2021-09-18 15:21:10
 * @LastEditors: 赵峰
 * @Descripttion: 任务提交
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\modules\TaskSubmitModal.vue
-->
<template>
  <h-modal
    title="任务提交"
    inner
    destroyOnClose
    :width="800"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <div class="h-list-item">
      <a-radio-group v-model="nextNodeId" @change="handleNextNodeChange">
        <a-radio v-for="item in nextNodeList" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-radio>
      </a-radio-group>
    </div>
    <div class="h-list-item">
      <a-radio-group v-if="selectNextUserType == 1" v-model="radioChecked" @change="onRadioChange">
        <a-radio v-for="item in nextUserList" :key="item.id" :value="item.id"> {{ item.name }} </a-radio>
      </a-radio-group>
      <a-checkbox-group v-else-if="selectNextUserType == 2" v-model="checkboxChecked" @change="onCheckboxChange">
        <a-checkbox v-for="item in nextUserList" :key="item.id" :value="item.id"> {{ item.name }} </a-checkbox>
      </a-checkbox-group>
    </div>
  </h-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  components: {},

  data() {
    return {
      visible: false,
      confirmLoading: false,
      model: {},
      url: {
        submit: '/HfPhysicsEntrustBusiness/submit',
        flowNode: '/FlowBusiness/listStartNextData',
      },
      record: {},
      id: null,
      radioChecked: null,
      checkboxChecked: [],
      nextNodeId: null,
      nextNodeList: [],
      // 选择类型 1 选一个人 2 选择多个人
      selectNextUserType: 1,
      nextUserList: [],
      needSelectNextUser: null,
    }
  },

  methods: {
    show(record, type) {
      this.visible = true
      this.type = type
      this.id = record.id
      this.record = record
      this.loadNodeData(record)
    },
    loadNodeData(record) {
      postAction(this.url.flowNode, {
        priId: record.flowId,
        proCode: record.entrustFlowCode,
        nextNodeId: this.nextNodeId,
      }).then((res) => {
        if (res.code == 200) {
          let { nextNodeId, nextNodeList, needSelectNextUser, selectNextUserType, nextUserList } = res.data
          Object.assign(this, {
            nextNodeId,
            nextNodeList,
            needSelectNextUser: parseInt(needSelectNextUser),
            selectNextUserType: parseInt(selectNextUserType),
            nextUserList,
          })
        }
      })
    },
    handleNextNodeChange(event) {
      this.radioChecked = null
      this.checkboxChecked = []
      let value = event.target.value
      let record = this.record
      this.nextNodeId = value
      this.loadNodeData(record)
    },
    onRadioChange(evt) {
      console.log('nextNode change>>>>>>>>>单选', evt)
      let value = evt.target.value
      this.radioChecked = value
    },
    onCheckboxChange(value) {
      console.log('nextNode change》》》》》》》》》多选', value)
      this.checkboxChecked = value
    },
    handleCancel() {
      this.visible = false
      this.radioChecked = null
      this.checkboxChecked = []
    },
    handleSubmit() {
      if (this.confirmLoading) return
      this.confirmLoading = false
      let checkboxVal = this.checkboxChecked
      if (checkboxVal.length > 0) {
        checkboxVal = checkboxVal.join(',')
      }
      let params = {
        id: this.id,
        nextNodeId: this.nextNodeId,
        examineUserIds: this.selectNextUserType == 1 ? this.radioChecked : checkboxVal,
      }
      if (this.type == 'editor') {
        this.$emit('change', { examineUserIds: params.examineUserIds })
        this.handleCancel()
      } else {
        postAction(this.url.submit, params).then((res) => {
          if (res.code === 200) {
            this.$message.success('提交成功')
            this.$emit('change', { examineUserIds: params.examineUserIds })
            this.handleCancel()
          } else {
            this.$message.warning('提交失败')
          }
        })
      }
    },
  },
}
</script>
<style lang='less' scoped>
.h-list {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px;
  position: relative;
  &-item {
    padding: 10px 0;
    border-bottom: solid 1px @border-color-base;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    &:last-child {
      border-bottom: 0;
    }
    &-label {
      width: 100px;
      display: inline-block;
      padding: 0 10px;
      text-align: right;
    }
    &-content {
      flex: 1;
    }
  }
}
</style>