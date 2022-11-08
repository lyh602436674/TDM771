<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-24 16:20:19
 * @LastEditTime: 2021-08-25 14:10:53
 * @LastEditors: 陈乾龙
 * @Description: 任务节点选择对应的人员列表
 * @FilePath: \hifar-platform-client\src\views\hifar\myTask\components\TaskSelectUser.vue
-->
<template>
  <div style="width: 100%">
    <template v-if="userList.length > 6">
      <a-button type="ghost-primary" icon="select" block @click="handleSelectUsers">选择用户</a-button>
      <a-space size="small" style="width: 100%; margin: 10px 0">
        <a-tag v-for="item in selectedRows" :key="item.id">{{ item.name }}</a-tag>
      </a-space>
    </template>
    <template v-else>
      <template v-if="needSelectNextUser == 1">
        <a-radio-group v-if="selectNextUserType == 1" v-model="radioChecked" @change="onRadioChange">
          <a-radio v-for="item in userList" :key="item.id" :value="item.id"> {{ item.name }} </a-radio>
        </a-radio-group>
        <a-checkbox-group v-else-if="selectNextUserType == 2" v-model="checkboxChecked" @change="onCheckboxChange">
          <a-checkbox v-for="item in userList" :key="item.id" :value="item.id"> {{ item.name }} </a-checkbox>
        </a-checkbox-group>
      </template>
    </template>
    <h-modal
      inner
      fullScreen
      :getContainer="getContainer"
      :visible="visible"
      destroyOnClose
      @cancel="handleCancel"
      @submit="handleSubmit"
    >
      <h-card fixed>
        <h-vex-table
          slot="content"
          :columns="columns"
          :data="loadData"
          :rowSelection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onSelect,
            type: selectNextUserType == 1 ? 'radio' : 'checkbox',
          }"
        ></h-vex-table>
      </h-card>
    </h-modal>
  </div>
</template>

<script>
import { isArray, isString } from 'lodash'
export default {
  inject: {
    getContainer: {
      default: () => {
        return () => []
      },
    },
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [Array, String],
      default: () => [],
    },
    selectNextUserType: {
      type: Number,
      default: 1,
    },
    needSelectNextUser: {
      type: Number,
      default: 2,
    },
  },
  watch: {
    list: {
      immediate: true,
      handler(val) {
        console.log('user list change', val)
        this.userList = val || []
      },
    },
    value: {
      immediate: true,
      handler(val) {
        let localValue = null
        if (isArray(val)) {
          localValue = val
        } else if (isString(val) && !!val) {
          localValue = val.split(',')
        } else {
          localValue = []
        }
        switch (this.selectNextUserType) {
          case 1:
            this.radioChecked = localValue.join(',')
            break
          case 2:
            this.radioChecked = localValue
        }
      },
    },
  },
  data() {
    return {
      visible: false,
      columns: [
        {
          title: '用户姓名',
          dataIndex: 'name',
        },
      ],

      selectedRowKeys: [],
      selectedRows: [],
      userList: this.list || [],
      radioChecked: null,
      checkboxChecked: [],
    }
  },
  methods: {
    onRadioChange(evt) {
      console.log('radio change', evt)
      let value = evt.target.value
      this.radioChecked = value
      this.$emit('change', [this.radioChecked])
      this.$emit('input', [this.radioChecked])
    },
    onCheckboxChange(value) {
      this.checkboxChecked = value
      this.$emit('change', this.checkboxChecked)
      this.$emit('input', this.checkboxChecked)
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleSelectUsers() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.$emit('change', this.selectedRowKeys)
      this.$emit('input', this.selectedRowKeys)
      this.visible = false
    },
    loadData(params) {
      return new Promise((resolve, reject) => {
        resolve({
          pageSize: this.userList.length,
          pageNo: 1,
          total: this.userList.length,
          data: this.userList,
        })
      })
    },
  },
}
</script>

<style>
</style>