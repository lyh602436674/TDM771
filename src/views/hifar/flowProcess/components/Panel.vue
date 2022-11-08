<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-12 15:06:00
 * @LastEditTime: 2021-08-25 11:14:57
 * @LastEditors: 陈乾龙
 * @Description: 流程图设计面板
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\components\Panel.vue
-->
<template>
  <div class="flow-process">
    <!-- 流程图设计面板导航栏 -->
    <div class="flow-process-navbar"></div>
    <!-- 流程图设计面板内容 -->
    <div class="flow-process-content">
      <!-- 流程图设计工具箱 -->
      <div class="flow-process-toolsbar">
        <tools-bar ref="toolsBar" @addNode="addNode"></tools-bar>
      </div>
      <!-- 流程图设计绘图面板 -->
      <div class="flow-process-drawPanel">
        <flow-drawer ref="flowDrawer" @clickNode="handleActiveNode" @deleteNode="handleDelete"></flow-drawer>
      </div>
      <!-- 流程图定义信息和节点信息 -->
      <div class="flow-process-pointInfo">
        <flow-form
          ref="flowForm"
          :node="activeNode"
          @submit="handleSubmit"
          @publish="handlePublish"
          @nodeInfoChange="handleNodeInfoChange"
          @delete="handleDeleteLine"
        ></flow-form>
      </div>
    </div>
  </div>
</template>

<script>
import { isEmpty, find } from 'lodash'
import ToolsBar from './ToolsBar.vue'
import FlowDrawer from './FlowDrawer.vue'
import FlowForm from './FlowForm'
import { filterObj } from '@/utils/util'
import { postAction } from '@/api/manage'
export default {
  components: { ToolsBar, FlowDrawer, FlowForm },
  provide() {
    return {
      flowInfo: () => {
        return this.localFlow
      },
    }
  },
  props: {
    value: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val.id) {
          postAction(this.url.query, { id: val.id }).then((res) => {
            if (res.code == 200) {
              let { base, nodeList, lineList } = res.data
              this.localFlow = base
              this.$nextTick(() => {
                if (nodeList && lineList) {
                  this.$refs.flowDrawer.dataReload(nodeList, lineList)
                }
              })
            }
          })
        } else {
          this.localFlow = val
        }
      },
    },
  },
  data() {
    return {
      localFlow: {},
      activeNode: {},
      activeLine: {},
      url: {
        add: '/FlowDefBusiness/add',
        save: '/FlowDefBusiness/saveFlow',
        edit: '/FlowDefBusiness/modifyById',
        query: '/FlowDefBusiness/queryById',
        publish: '/FlowDefBusiness/publishFLow',
      },
    }
  },
  methods: {
    validateValues() {
      let { nodeList, lineList } = this.$refs.flowDrawer
      let nodeListEmpty = isEmpty(nodeList)
      let lineListEmpty = isEmpty(lineList)
      console.log('提交数据校验节点信息', nodeList)
      console.log('提交数据校验连线信息', lineList)
      if (nodeListEmpty || lineListEmpty) {
        this.$message.error('请确定节点和节点之间的连线条件关系是否建立')
        return false
      }
      if (!nodeListEmpty) {
        let startNode = find(nodeList, (obj) => {
          return obj.type == 'start'
        })
        if (!startNode) {
          this.$message.error('请设置开始节点并连线')
          return false
        }
        let endNode = find(nodeList, (obj) => {
          return obj.type == 'end'
        })
        if (!endNode) {
          this.$message.error('请设置结束节点并连线')
          return false
        }
        // 校验所有节点是否设置了参数
        for (let i = 0, len = nodeList.length; i < len; i++) {
          let node = nodeList[i]
          if (node.type !== 'start' && node.type !== 'end') {
            // 校验人员选择设置
            if (!node.needSelect) {
              node.needSelect = 2
            }
            // 校验审核方式
            if (!node.approveType) {
              node.approveType = 'or'
            }
            if (!node.approveParams) {
              switch (node.approveType) {
                case 'or':
                  node.approveParams = 'any'
                  break
                case 'and':
                  node.approveParams = 'AllWait'
                  break
              }
            }
            // 校验是否设置了dealType
            if (!node.dealType) {
              this.$message.error(`请设置节点[${node.name}]审核方式`)
              return false
            }
            console.log('校验', node)
            switch (node.dealType) {
              // 校验指定处理人
              case 'user':
                if (!node.dealUsers || !node.dealUsers.length) {
                  this.$message.error(`请设置节点[${node.name}]审批人`)
                  return false
                }
                break
              // 校验用户自定义
              case 'role':
                if (!node.dealUsers || node.dealUsers.length <= 0) {
                  this.$message.error(`请设置节点[${node.name}]角色`)
                  return false
                }
                break
              case 'start':
                break
              case 'var':
                if (node.dealUsers && node.dealUsers.length <= 0) {
                  this.$message.error(`请设置节点[${node.name}]流程变量`)
                  return false
                }
                break
              default:
                return false
            }
          }
        }
      }
      return true
    },
    // 请求后端接口,保存流程
    handleSubmit(values) {
      let { nodeList, lineList } = this.$refs.flowDrawer
      let nodeListEmpty = isEmpty(nodeList)
      let lineListEmpty = isEmpty(lineList)
      if (!values.id) {
        // 没有流程id，说明是新建
        if (nodeListEmpty && lineListEmpty) {
          this.addFlow(values)
        } else {
          if (!this.validateValues()) {
            return
          }
          // 整合数据
          let params = {
            id: values.id,
            ...values,
            nodeList: nodeList,
            lineList: lineList,
          }
          this.addFlowAll(params)
        }
      } else {
        if (!this.validateValues()) {
          return
        }
        // 整合数据
        let params = {
          id: values.id,
          ...values,
          nodeList: nodeList,
          lineList: lineList,
        }
        this.editFlowAll(params)
      }
    },
    handlePublish(values) {
      let { nodeList, lineList } = this.$refs.flowDrawer
      // 整合数据
      let params = {
        id: values.id,
        ...values,
        nodeList: nodeList,
        lineList: lineList,
      }
      postAction(this.url.publish, { proData: params, id: params.id }).then((res) => {
        if (res.code == 200) {
          this.$message.success('发布成功！')
          this.$emit('change', true)
        }
      })
    },
    // 单独添加流程定义
    addFlow(values) {
      this.$confirm({
        title: '确认保存?',
        content: '还没有设置流程，确认保存空流程?',
        onOk: () => {
          if (this.$refs.flowForm.loading) return
          this.$refs.flowForm.loading = true
          let params = {
            ...values.base,
          }
          delete params.varList
          params = filterObj(params)
          postAction(this.url.add, params)
            .then((res) => {
              if (res.code == 200) {
                this.$message.success('保存成功！')
                this.$emit('change', true)
              }
            })
            .finally(() => {
              this.$refs.flowForm.loading = false
            })
        },
      })
    },
    async addFlowAll(params) {
      let res = await postAction(params.id ? this.url.edit : this.url.add, params.base).finally(() => {
        this.$refs.flowForm.loading = false
      })
      if (res.code == 200) {
        if (res.data.id) {
          this.localFlow = Object.assign({}, this.localFlow, { id: res.data.id })
          params.id = res.data.id
          params.base.id = res.data.id
        }
        this.$refs.flowForm.loading = true
        res = await postAction(this.url.save, { proData: params, id: params.id }).finally(() => {
          this.$refs.flowForm.loading = false
        })
        if (res.code == 200) {
          this.$message.success('保存成功！')
          this.$emit('change', true)
        }
      }
    },
    async editFlowAll(params) {
      let res = await postAction(this.url.save, { proData: params, id: params.id }).finally(() => {
        this.$refs.flowForm.loading = false
      })
      if (res.code == 200) {
        this.$message.success('保存成功！')
        this.$emit('change', true)
      }
    },
    // 接受来自FlowForm 释放出来的节点信息，并传给FlowDrawer,在FlowDrawer内部统一处理节点和连线信息
    handleNodeInfoChange(node) {
      this.$refs.flowDrawer.handleNodeInfoChange(node)
    },
    addNode(event, node) {
      this.$refs.flowDrawer.addNode(event, node)
    },
    handleActiveNode(node) {
      this.activeNode = node
    },
    handleDeleteLine(line) {
      this.$refs.flowDrawer.handleDeleteLine(line)
    },
    // 删除节点或者连线的回调
    handleDelete(node) {
      console.log('删除节点或者连线的回调', node)
      if (node.id === this.activeNode.id) {
        this.activeNode = {}
      }
    },
  },
}
</script>

<style lang='less' scoped>
.flow-process {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  div {
    box-sizing: border-box;
  }
  &-navbar {
    padding: 0 5px;
    height: 56px;
    border-bottom: solid 1px @border-color-base;
  }
  &-content {
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 56px;
    height: 100%;
    width: 100%;
    background: #efefef;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
  }
  &-toolsbar {
    width: 230px;
    height: 100%;
  }
  &-pointInfo {
    width: 300px;
    height: 100%;
  }
  &-drawPanel {
    border-right: solid 1px @border-color-base;
    border-left: solid 1px @border-color-base;
    flex: 1;
    height: 100%;
    overflow: auto;
    display: flex;
  }
}
</style>