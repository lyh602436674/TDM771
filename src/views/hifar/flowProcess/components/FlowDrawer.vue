<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-12 17:27:54
 * @LastEditTime: 2021-08-25 17:55:03
 * @LastEditors: 陈乾龙
 * @Description: 流程图画布
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\components\FlowDrawer.vue
-->
<template>
  <div v-flowDrag :id="container" :class="container" :ref="container">
    <template v-for="node in nodeList">
      <flow-node
        :id="node.id"
        :key="node.id"
        :node="node"
        :activeElement="activeElement"
        @clickNode="clickNode"
        @changeNodeSite="changeNodeSite"
        @deleteNode="deleteNode"
      >
      </flow-node>
    </template>
  </div>
</template>

<script>
import { merge, concat, findIndex, cloneDeep, find } from 'lodash'
import draggable from 'vuedraggable'
import { randomUUID } from '@/utils/util'
import FlowNode from './FlowNode'
import './jsPlumb'
import { flowMixin } from './flowMixin'
export default {
  components: { draggable, FlowNode },
  mixins: [flowMixin],
  data() {
    return {
      container: 'flow-process-canvas',
      // jsPlumb 实例
      jsPlumb: null,
      loading: false,
      // 激活的元素
      activeElement: {
        type: undefined,
        nodeId: undefined,
        sourceId: undefined,
        targetId: undefined,
      },
      localList: {},
      nodeList: [],
      lineList: [],
    }
  },
  directives: {
    flowDrag: {
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      },
    },
  },
  mounted() {
    this.dataReload([], [])
  },
  methods: {
    // jsPlumb 初始化配置
    jsPlumbInit() {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true)

        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.activeElement = Object.assign({}, this.activeElement, {
            type: 'line',
            sourceId: conn.sourceId,
            targetId: conn.targetId,
          })
          let activeLine = find(this.lineList, (obj) => {
            return obj.id == conn.getId()
          })
          this.clickNode(activeLine.id, activeLine)
        })
        // 连线
        this.jsPlumb.bind('connection', (evt) => {
          console.log('connection', evt.connection)
          let from = evt.source.id
          let to = evt.target.id
          let id = evt.connection.getId()
          let name = '条件'
          let priority = 1

          if (this.loading) {
            let activeLineIndex = findIndex(this.lineList, (obj) => {
              return obj.from == from && obj.to == to
            })
            console.log('active lin index:', activeLineIndex)
            if (activeLineIndex < 0) {
              this.lineList.push({ id: id, nodeType: 'line', name, priority, from: from, to: to })
            } else {
              this.lineList[activeLineIndex] = Object.assign({}, this.lineList[activeLineIndex], {
                id: id,
                from: from,
                to: to,
              })
              name = this.lineList[activeLineIndex].name
            }
            this.$nextTick(() => {
              this.setLineLabel(from, to, name)
            })
          }
        })

        // 删除连线回调
        this.jsPlumb.bind('connectionDetached', (evt) => {
          console.log('删除连线的回调函数', evt)
          let lineId = evt.connection.getId()
          let line = find(this.lineList, (obj) => {
            return obj.id === lineId
          })
          this.deleteLine(line)
        })

        // 改变线的连接节点
        this.jsPlumb.bind('connectionMoved', (evt) => {
          console.log('改变连线的回调', evt)
        })

        // 连线右击
        this.jsPlumb.bind('contextmenu', (evt) => {
          console.log('contextmenu', evt)
        })

        // 连线
        this.jsPlumb.bind('beforeDrop', (evt) => {
          let from = evt.sourceId
          let to = evt.targetId
          let toNode = find(this.nodeList, (node) => {
            return node.id === to
          })
          let fromNode = find(this.nodeList, (node) => {
            return (node.id == from)
          })
          if (toNode.type == 'start') {
            this.$message.error('开始节点只能作为起始节点')
            return false
          }
          if (fromNode.type == 'end') {
            this.$message.error('结束节点只能作为终止节点')
            return false
          }
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环')
            return false
          }
          this.$message.success('连接成功')
          return true
        })

        // beforeDetach
        this.jsPlumb.bind('beforeDetach', (evt) => {
          console.log('beforeDetach', evt)
        })
        this.jsPlumb.setContainer(this.$refs[this.container])
        // 初始化节点
        this.loadFlow()
      })
    },
    // 是否具有该线
    hasLine(from, to) {
      for (var i = 0; i < this.lineList.length; i++) {
        var line = this.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from)
    },
    // 加载流程图
    dataReload(nodeList, lineList) {
      this.nodeList = []
      this.lineList = []
      this.$nextTick(() => {
        nodeList = cloneDeep(nodeList)
        lineList = cloneDeep(lineList)
        this.nodeList = nodeList
        this.lineList = lineList
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    // 加载流程图
    loadFlow() {
      // 初始化节点
      console.log('重载节点', this.nodeList)
      for (var i = 0, len = this.nodeList.length; i < len; i++) {
        let node = this.nodeList[i]
        this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        // 如果节点设置了只读，则不再设置拖动
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: 'parent',
            stop: function (el) {
              console.log('这里有个监听》拖拽结束:', el)
            },
          })
        }
      }

      // 初始化连线
      console.log('重载连线', this.lineList)
      // let lineList = cloneDeep(this.lineList)
      // this.lineList = []
      for (var i = 0, len = this.lineList.length; i < len; i++) {
        let line = this.lineList[i]
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.title || line.label || line.name,
          connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          painStyle: line.painStyle ? line.painStyle : undefined,
          name: line.title || line.label || line.name,
          priority: line.priority,
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(() => {
        this.loading = true
      })
    },
    /**
     * 拖拽结束后添加新的节点
     * @param event
     * @param node 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(event, node, mousePosition) {
      var screenX = event.originalEvent.clientX,
        screenY = event.originalEvent.clientY
      let container = this.$refs[this.container]
      var containerRect = container.getBoundingClientRect()
      var left = screenX,
        top = screenY
      // 计算是否拖入到容器中
      if (
        left < containerRect.x ||
        left > containerRect.width + containerRect.x ||
        top < containerRect.y ||
        containerRect.y > containerRect.y + containerRect.height
      ) {
        this.$message.error('请把节点拖入到画布中')
        return
      }
      left = left - containerRect.x + container.scrollLeft
      top = top - containerRect.y + container.scrollTop
      // 居中
      left -= 85
      top -= 16
      // 动态生成节点ID
      var nodeId = randomUUID()
      // 动态生成名字
      var origName = node.title
      var nodeName = origName
      var index = 1
      // 节点可能重复，对节点名称做适当修改
      while (index < 10000) {
        var repeat = false
        for (var i = 0; i < this.nodeList.length; i++) {
          let localNode = this.nodeList[i]
          // 这里拦截开始节点和结束节点，这两个节点只能有一个
          if (localNode.key === 'start' && node.key === 'start') {
            this.$message.error('开始节点只能有一个')
            return
          }
          if (localNode.key === 'end' && node.key === 'end') {
            this.$message.error('结束节点只能有一个')
            return
          }
          if (localNode.name === nodeName) {
            nodeName = origName + index
            repeat = true
          }
        }
        if (repeat) {
          index++
          continue
        }
        break
      }
      // 重组node
      var localNode = Object.assign({}, node, {
        id: nodeId,
        type: node.type,
        name: nodeName,
        key: node.key,
        left: left + 'px',
        top: top + 'px',
      })
      /**
       * 这里可以进行业务判断、是否能够添加该节点
       */
      this.nodeList = concat(this.nodeList, [localNode])
      this.$nextTick(() => {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent',
          stop: function (el) {
            // 拖拽节点结束后的对调
            console.log('addnode中给节点添加的拖拽 》 拖拽结束: ', el)
          },
        })
      })
    },
    // 点击流程图节点
    clickNode(nodeId, node) {
      this.activeElement = Object.assign(this.activeElement, {
        type: node.type,
        nodeId: nodeId,
      })
      this.$emit('clickNode', node, this.activeElement)
    },
    // 改变节点的位置
    changeNodeSite(data) {
      for (var i = 0; i < this.nodeList.length; i++) {
        let node = this.nodeList[i]
        if (node.id === data.nodeId) {
          node.left = data.left
          node.top = data.top
        }
      }
    },
    // 设置连线label
    setLineLabel(from, to, label) {
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to,
      })[0]
      if (!label || label === '') {
        conn.removeClass('flow-label')
        conn.addClass('empty-flow-label')
      } else {
        conn.addClass('flow-label')
      }
      conn.setLabel({
        label: label,
      })
      this.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.name = label
        }
      })
    },
    // 点击画布
    clickDrawPaper() {
      this.activeElement = merge(this.activeElement, {
        type: undefined,
        nodeId: undefined,
        sourceId: undefined,
        targetId: undefined,
      })
    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode(node) {
      this.$confirm({
        title: '确认删除？',
        content: '确定要删除节点' + node.name + '?',
        onOk: () => {
          /**
           * 这里需要进行业务判断，是否可以删除
           */
          this.nodeList = this.nodeList.filter(function (obj) {
            if (obj.id === node.id) {
              // 伪删除，将节点隐藏，否则会导致位置错位
              // node.show = false
              return false
            }
            return true
          })
          this.$nextTick(function () {
            this.jsPlumb.removeAllEndpoints(node.id)
            this.$emit('deleteNode', node)
          })
        },
      })
    },
    /**
     * @Date: 2021-08-17 16:22:50
     * @Author: 陈乾龙
     * @description: 删除连线
     */
    handleDeleteLine(line) {
      this.$confirm({
        title: '确认删除？',
        content: `确定删除连线${line.label || ''}？`,
        onOk: () => {
          this.deleteLine(line)
        },
      })
    },
    deleteLine(line) {
      this.lineList = this.lineList.filter(function (obj) {
        if (obj.id === line.id) {
          return false
        }
        return true
      })
      this.$nextTick(() => {
        var conn = this.jsPlumb.getConnections({
          source: line.from,
          target: line.to,
        })[0]
        this.jsPlumb.deleteConnection(conn)
        this.$emit('deleteNode', line)
      })
    },
    // 节点信息发生改变
    handleNodeInfoChange(node) {
      console.log('节点信息发生改变', node)
      // 判断节点或者线
      switch (node.nodeType) {
        case 'node':
          var index = findIndex(this.nodeList, (obj) => {
            return obj.id === node.id
          })
          let nodeList = cloneDeep(this.nodeList)
          nodeList[index] = Object.assign({}, nodeList[index], node)
          this.nodeList = cloneDeep(nodeList)
          break
        case 'line':
          var index = findIndex(this.lineList, (obj) => {
            return obj.id === node.id
          })
          let lineList = cloneDeep(this.lineList)
          lineList[index] = Object.assign({}, lineList[index], node)
          this.lineList = cloneDeep(lineList)
          this.setLineLabel(this.lineList[index].from, this.lineList[index].to, this.lineList[index].name)
          break
      }
    },
  },
}
</script>

<style lang="less" scoped>
.flow-process-canvas {
  position: relative;
  overflow: scroll;
  flex: 1;
  background: #fff;
  width: 100%;
  height: 100%;
}
</style>
<style lang="less">
/* 连线中的label 样式*/
.jtk-overlay.flow-label:not(.aLabel) {
  padding: 2px;
  background: #fff;
  border: dotted 1px @primary-color;
  border-radius: @border-radius-base;
  max-width: 120px;
  cursor: pointer;
}

/* label 为空的样式 */
.empty-flow-label {
  border-color: @danger-color;
  background: rgba(@danger-color, 0.3);
}
</style>