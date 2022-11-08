<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-13 14:35:01
 * @LastEditTime: 2021-08-30 17:08:42
 * @LastEditors: 陈乾龙
 * @Description: 流程基本信息和节点的基本信息
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\components\FlowForm.vue
-->
<template>
  <div class="flow-form">
    <div ref="flowFormContent" class="flow-form-content">
      <a-collapse v-model="activeKey" accordion>
        <template #expandIcon="props">
          <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0" />
        </template>
        <a-collapse-panel key="0" header="流程基本信息">
          <h-form v-model="localFlowInfo" ref="flowForm" :formData="formData" :column="1" />
          <h-descriptions class="flow-variables" title="流程变量" bordered :column="1">
            <a-descriptions-item v-for="(item, index) in flowVariableKeys" class="flow-variable-item" :key="item">
              <h-form
                :ref="item"
                v-model="flowVariables[index]"
                :formData="flowVariableForm"
                :column="1"
                @onValueChange="(v) => handleVariableChange(index, v)"
              />
            </a-descriptions-item>
            <a-descriptions-item>
              <a-button type="primary" ghost block icon="plus" @click="handleAddFlowVariable"> 添加变量 </a-button>
            </a-descriptions-item>
          </h-descriptions>
        </a-collapse-panel>
        <!-- 流程节点的基本信息 -->
        <a-collapse-panel key="1" header="流程节点信息">
          <a-empty v-if="!localNode.id" description="请设置流程节点并选中"></a-empty>
          <template v-else>
            <flow-node-info v-if="localNode.nodeType === 'node'" :node="localNode" @change="handleEmitNodeChange" />
            <flow-line-info
              v-else-if="localNode.nodeType === 'line'"
              :node="localNode"
              @change="handleEmitNodeChange"
              @delete="handleDelete"
            />
          </template>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <div class="flow-form-footer">
      <a-button type="primary" block :loading="loading" @click="handleSubmit" style="margin-bottom: 10px">
        暂存
      </a-button>
      <a-button type="success" block :loading="loading" @click="handlePublish">发布</a-button>
    </div>
  </div>
</template>

<script>
import { isObject, isEmpty, cloneDeep } from 'lodash'
import { duplicateCheck } from '@/api/api'
import { randomUUID } from '@/utils/util'
import FlowNodeInfo from './FlowNodeInfo'
import FlowLineInfo from './FlowLineInfo'
export default {
  inject: {
    flowInfo: {
      default: () => {
        return () => {}
      },
    },
  },
  provide() {
    return {
      getFlowVariables: () => {
        return this.flowVariables
      },
    }
  },
  props: {
    node: {
      type: Object,
      default: () => {},
    },
  },
  components: { FlowNodeInfo, FlowLineInfo },
  computed: {
    localFlowInfo: {
      get() {
        return Object.assign({}, this.flowInfo())
      },
      set(val) {
        return val
      },
    },
  },
  watch: {
    node: {
      immediate: true,
      handler(val) {
        console.log('激活的节点发生变化', val)
        if (isObject(val) && !isEmpty(val)) {
          this.activeKey = ['1']
        } else {
          this.activeKey = ['0']
        }
        this.localNode = val || {}
      },
    },
  },
  data() {
    return {
      activeKey: ['0'],
      loading: false,
      formData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '流程名称',
          key: 'proName',
          formType: 'input',
          validate: {
            rules: [
              {
                required: true,
                validator: (rule, value, callback) => {
                  console.log('test', value)
                  if (!value) {
                    this.activeKey = ['0']
                    callback('请输入流程名称')
                    return
                  }
                  let val = value.trim()
                  if (!val) {
                    this.activeKey = ['0']
                    callback('请输入流程名称')
                    return
                  } else {
                    callback()
                  }
                },
              },
            ],
          },
        },
        {
          title: '流程编码',
          key: 'proCode',
          formType: 'input',
          validate: {
            rules: [{ required: true, validator: this.validateProCode }],
          },
        },
        {
          title: '流程分类',
          key: 'proTypeCode',
          formType: 'dict',
          dictCode: 'hf_flow_type',
          validate: {
            rules: [{ required: true, message: '请选择流程分类' }],
          },
          change: (v, dict) => {
            this.$refs.flowForm.form.setFieldsValue({ proTypeName: dict.title })
          },
        },
        {
          title: '回调地址',
          key: 'callback',
          formType: 'input',
        },
        {
          title: '表单路径',
          key: 'formPath',
          formType: 'input',
        },
        {
          key: 'proTypeName',
          formType: 'input',
          hidden: true,
        },
        {
          title: '流程备注',
          key: 'remarks',
          formType: 'textarea',
        },
      ],
      localNode: this.node || {},
      flowVariableForm: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '变量名称',
          key: 'name',
          formType: 'input',
          validate: { rules: [{ required: true, message: '请输入变量名称' }] },
        },
        {
          title: '变量编码',
          key: 'code',
          formType: 'input',
          validate: { rules: [{ required: true, message: '请输入变量编码' }] },
        },
        {
          title: '变量类型',
          key: 'type',
          formType: 'select',
          options: [
            {
              title: '数值',
              key: 'number',
              value: 'number',
            },
            {
              title: '字符串',
              key: 'string',
              value: 'string',
            },
          ],
          validate: { rules: [{ required: true, message: '请选择变量类型' }] },
        },
        {
          title: '默认值',
          key: 'value',
          formType: 'input',
        },
      ],
      flowVariableKeys: [],
      flowVariables: [],
    }
  },
  methods: {
    /**
     * @Date: 2021-08-17 17:16:51
     * @Author: 陈乾龙
     * @description: 点击提交流程的基本信息
     */
    handleSubmit() {
      let allForm = [].concat([this.flowForm()], this.flowVariableForms())
      Promise.all(allForm)
        .then((values) => {
          console.log('校验流程表单数据', values)
          // 这里收到的所有的数据
          let base = values.shift()
          let varList = values
          base.varList = varList
          this.$emit('submit', {
            id: base.id,
            base: base,
          })
        })
        .catch((err) => {
          console.log('流程Form校验错误：', err)
        })
    },
    handlePublish() {
      let allForm = [].concat([this.flowForm()], this.flowVariableForms())
      Promise.all(allForm)
        .then((values) => {
          console.log('校验流程表单数据', values)
          // 这里收到的所有的数据
          let base = values.shift()
          base.id = base.id || randomUUID()
          let varList = values
          base.varList = varList
          this.$emit('publish', {
            id: base.id,
            base: base
          })
        })
        .catch((err) => {
          console.log('流程Form校验错误：', err)
        })
    },
    flowForm() {
      return new Promise((resolve, reject) => {
        this.$refs.flowForm.form.validateFieldsAndScroll((err, values) => {
          if (err) {
            reject(err)
          } else {
            resolve(values)
          }
        })
      })
    },
    flowVariableForms() {
      return this.flowVariableKeys.map((key) => {
        return new Promise((resolve, reject) => {
          this.$refs[key][0].form.validateFieldsAndScroll((err, values) => {
            if (err) {
              reject(err)
            } else {
              resolve(values)
            }
          })
        })
      })
    },
    /**
     * @Date: 2021-08-17 17:16:29
     * @Author: 陈乾龙
     * @description: 校验流程code是否重复
     */
    validateProCode(rule, value, callback) {
      if (!value) {
        this.activeKey = ['0']
        callback('请输入流程编码')
        return
      }
      let val = value.trim()
      if (!val) {
        callback('请输入流程编码')
        this.activeKey = ['0']
        return
      }
      let id = this.$refs.flowForm.form.getFieldValue('id')
      if (id) {
        callback()
        return
      }
      var params = {
        tableName: 'HfWfPrdBase',
        columnName: 'proCode',
        columnValue: value,
      }
      duplicateCheck(params)
        .then((res) => {
          if (res.code == 200) {
            if (res.data.num == 0) {
              callback()
            } else {
              this.activeKey = ['0']
              callback('流程编码重复，请重新定义')
            }
          }
        })
        .catch((err) => {
          this.activeKey = ['0']
          callback('流程编码错误,请重新输入')
        })
    },
    handleVariableChange(index, value) {
      let flowVariables = cloneDeep(this.flowVariables)
      flowVariables[index] = Object.assign({}, flowVariables[index] || {}, value)
      this.flowVariables = cloneDeep(flowVariables)
    },
    // 添加流程变量信息
    handleAddFlowVariable() {
      let uuid = randomUUID()
      this.flowVariableKeys.push(uuid)
      this.flowVariables.push({
        id: uuid,
        name: '',
        code: '',
        type: 'number',
        value: '',
      })
      this.$nextTick(() => {
        var domContext = this.$refs.flowFormContent
        domContext.scrollTop = domContext.scrollHeight
      })
    },
    // 节点或连线的数据信息发生改变，需要统一释放出去
    handleEmitNodeChange(node) {
      this.$emit('nodeInfoChange', node)
    },
    // 删除连线
    handleDelete(node) {
      this.$emit('delete', node)
    },
  },
}
</script>

<style lang="less">
.flow-form {
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding-bottom: 100px;
  position: relative;
  .ant-collapse-content > .ant-collapse-content-box {
    padding: 10px 5px;
  }
  &-content {
    height: 100%;
    overflow: auto;
    .h-descriptions.flow-variables {
      .ant-descriptions-item-content {
        padding: 5px;
      }
    }
  }
  &-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: right;
    padding: 10px;
    background: #fff;
    border-top: solid 1px @border-color-base;
  }
}
</style>