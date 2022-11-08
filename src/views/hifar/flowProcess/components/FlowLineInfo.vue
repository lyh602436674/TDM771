<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-17 11:52:01
 * @LastEditTime: 2021-08-20 17:33:32
 * @LastEditors: 陈乾龙
 * @Description: 流程连线信息
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\components\FlowLineInfo.vue
-->
<template>
  <div>
    <h-card style="margin-top: 10px" :bordered="false" :bodyStyle="{ padding: 0 }">
      <div slot="search-form">
        <a-button type="ghost-danger" block icon="delete" @click="handleDeleteLine" style="margin-bottom: 10px">
          删除连线
        </a-button>
        <a-button
          v-if="localFlowVariables && localFlowVariables.length"
          type="ghost-primary"
          icon="plus"
          block
          @click="handleOpenLineConditionSelect"
        >
          选择条件
        </a-button>
      </div>
      <template slot="content">
        <a-descriptions size="small" layout="vertical" bordered :column="1">
          <a-descriptions-item label="条件基本信息">
            <h-form
              v-model="lineNode"
              ref="lineNode"
              :formData="formData"
              :column="1"
              @onValueChange="handleLineNodeChange"
              @change="lineNodeChange"
            />
          </a-descriptions-item>
          <template v-if="selectedConditions.length">
            <a-descriptions-item v-for="item in selectedConditions" :key="item.id" :label="item.name">
              <div class="line-condition">
                <a-select
                  v-model="item.type"
                  placeholder="请选择判断条件"
                  style="width: 40%"
                  :options="options"
                  @change="handleLineChange"
                />
                <div style="flex: 1">
                  <a-input v-model="item.value" placeholder="请输入条件判断值" @change="handleLineChange" />
                </div>
              </div>
            </a-descriptions-item>
          </template>
          <a-descriptions-item v-else label="流程条件">
            <a-empty description="请先在流程基本信息中添加流程变量" />
          </a-descriptions-item>
        </a-descriptions>
      </template>
    </h-card>
    <h-modal
      title="流程条件"
      inner
      :getContainer="getContainer"
      :visible="visible"
      @cancel="handleCancel"
      @submit="handleSubmit"
    >
      <a-checkbox-group v-model="selectedConditionKeys" @change="handleCheckChange">
        <a-checkbox v-for="(item, index) in localFlowVariables" :key="index" :value="item.id">
          {{ item.name }}
        </a-checkbox>
      </a-checkbox-group>
    </h-modal>
  </div>
</template>

<script>
import { find, isArray } from 'lodash'
export default {
  inject: {
    getContainer: {
      default: () => [],
    },
    getFlowVariables: {
      default: () => {
        return () => []
      },
    },
  },
  props: {
    node: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    node: {
      immediate: true,
      handler(val) {
        this.lineNode = val || {}
        this.selectedConditions = val.conditions || []
        if (isArray(this.selectedConditions)) {
          this.selectedConditionKeys = this.selectedConditions.map((item) => {
            return item.id
          })
        }
        this.priority = val.priority || 1
      },
    },
  },
  computed: {
    localFlowVariables() {
      let variables = this.getFlowVariables() || []
      return variables.map((item) => {
        return {
          id: item.id,
          name: item.name,
          code: item.code,
        }
      })
    },
  },
  data() {
    return {
      visible: false,
      selectedConditions: [],
      lineNode: {},
      selectedConditionKeys: [],
      formData: [
        {
          title: '条件名称',
          key: 'name',
          formType: 'input',
          validate: { rules: [{ required: true, message: '请输入条件名称' }] },
        },
        {
          title: '优先级',
          key: 'priority',
          formType: 'input',
          validate: {
            initialValue: 1,
            rules: [
              {
                required: true,
                validator: (rules, value, callback) => {
                  if (!value) {
                    callback('请输入优先级')
                    return
                  }
                  if (!/^\+?[1-9][0-9]*$/.test(value)) {
                    callback('请输入大于0的正整数')
                    return
                  }
                  callback()
                },
              },
            ],
          },
        },
      ],
      options: [
        {
          title: '等于',
          key: 'A1',
          value: 'A1',
        },
        {
          title: '不等于',
          key: 'A2',
          value: 'A2',
        },
        {
          title: '大于',
          key: 'A3',
          value: 'A3',
        },
        {
          title: '大于等于',
          key: 'A4',
          value: 'A4',
        },
        {
          title: '小于',
          key: 'A5',
          value: 'A5',
        },
        {
          title: '小于等于',
          key: 'A6',
          value: 'A6',
        },
      ],
      priority: 1,
    }
  },
  methods: {
    handleCheckChange(v) {
      this.selectedConditionKeys = v
    },
    handleOpenLineConditionSelect() {
      if (!this.localFlowVariables.length) {
        this.$message.error('请现在流程基本信息里设置流程变量')
        return
      }
      this.visible = true
    },
    handleLineNodeChange() {
      this.$refs.lineNode.validateForm()
    },
    lineNodeChange(values) {
      console.log('lineNodeChange', values)
      this.priority = parseFloat(values.priority)
      this.lineNode = Object.assign({}, this.lineNode, values)
      this.handleLineChange()
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit() {
      this.selectedConditions = this.selectedConditionKeys.map((key) => {
        return find(this.localFlowVariables, (obj) => {
          return obj.id == key
        })
      })
      this.handleCancel()
    },
    handleLineChange() {
      this.$emit(
        'change',
        Object.assign({}, this.lineNode, {
          conditions: this.selectedConditions,
          priority: this.priority,
        })
      )
    },
    handleDeleteLine() {
      this.$emit('delete', this.lineNode)
    },
  },
}
</script>
<style lang="less" scoped>
.line-condition {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
</style>