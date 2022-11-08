<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-12 18:37:57
 * @LastEditTime: 2021-08-30 16:47:00
 * @LastEditors: 陈乾龙
 * @Description: 
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\components\FlowNode.vue
-->
<template>
  <div ref="node" class="node-container" :style="nodeContainerStyle" @click="clickNode" @mouseup="changeNodeSite">
    <a-popover
      trigger="click"
      :visible="node.viewOnly && visible"
      :arrowPointAtCenter="true"
      :defaultVisible="node.viewOnly && activeElement.nodeId == node.id"
      :title="node.userName"
      :getPopupContainer="() => $refs.node"
    >
      <div slot="content">
        <div v-if="node.rsStatus == 1" class="success-text">
          <a-icon type="check-circle" style="margin-right: 10px" />
          <span>{{ node.userName }}{{ node.opinion }}</span>
        </div>
        <div v-else-if="node.rsStatus == 2" class="danger-text">
          <a-icon type="close-circle" style="margin-right: 10px" />
          <span>{{ node.userName }}:{{ node.opinion }}</span>
        </div>
        <div v-else>待审核</div>
      </div>
      <!-- 不同节点有不同的样式 -->
      <div :class="nodeContainerClass">
        <div class="node-type-1" v-if="node.key == 'start' || node.key == 'end'">
          <!-- 节点类型的图标 -->
          <div :class="['node-icon', !node.viewOnly && 'flow-node-drag']">
            <template v-if="node.icon && node.icon.includes('icon-')">
              <h-icon :class="nodeIcoClass" :type="node.icon" />
            </template>
            <a-icon :class="nodeIcoClass" v-else :type="node.icon || 'deployment-unit'"></a-icon>
          </div>
          <!-- 节点名称 -->
          <div class="ef-node-text" :show-overflow-tooltip="true">
            {{ node.name }}
          </div>
        </div>
        <div class="node-type-2" v-else>
          <div :class="['node-name', !node.viewOnly && 'flow-node-drag']">
            <div style="display: flex; justify-content: flex-start; align-items: center">
              <h-icon v-if="node.icon && node.icon.includes('icon-')" :class="nodeIcoClass" :type="node.icon" />
              <a-icon v-else :class="nodeIcoClass" :type="node.icon || 'deployment-unit'"></a-icon>
              <span
                :class="[!node.viewOnly && 'flow-node-drag']"
                style="margin: 0 0 0 10px; display: inline-block; flex: 1; overflow: hidden"
              >
                {{ node.name }}
              </span>
            </div>
            <a-icon v-if="!node.viewOnly" class="node-close" type="close" @click="handleDeleteNode" />
          </div>
          <div class="node-condition">
            {{ node.dealType | filterDealType(node.dealType) }}
          </div>
        </div>
      </div>
    </a-popover>
  </div>
</template>

<script>
export default {
  props: {
    node: Object,
    activeElement: Object,
  },
  data() {
    return {
      visible: false,
    }
  },
  filters: {
    filterDealType(type) {
      switch (type) {
        case 'user':
          return '指定用户'
        case 'start':
          return '发起人自己'
        case 'role':
          return '指定角色'
        case 'var':
          return '流程变量'
        default:
          return '未设置审核条件'
      }
    },
  },
  computed: {
    nodeContainerClass() {
      return {
        'node-wrapper': true,
        'node-active': this.activeElement.nodeId === this.node.id,
      }
    },
    // 节点容器样式 用于拖拽
    nodeContainerStyle() {
      return {
        top: this.node.top,
        left: this.node.left,
      }
    },
    nodeIcoClass() {
      var nodeIcoClass = {}
      // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
      nodeIcoClass['flow-node-drag'] = this.node.viewOnly ? false : true
      return nodeIcoClass
    },
  },
  methods: {
    // 点击节点
    clickNode() {
      console.log('点击的节点', this.node)
      if (!this.node.viewOnly) {
        this.$emit('clickNode', this.node.id, this.node)
      } else {
        this.visible = !this.visible
      }
    },
    // 鼠标移动后抬起
    changeNodeSite() {
      // 避免抖动
      if (this.node.left == this.$refs.node.style.left && this.node.top == this.$refs.node.style.top) {
        return
      }
      this.$emit('changeNodeSite', {
        nodeId: this.node.id,
        key: this.node.key,
        type: this.node.type,
        left: this.$refs.node.style.left,
        top: this.$refs.node.style.top,
      })
    },
    // 删除节点
    handleDeleteNode() {
      this.$emit('deleteNode', this.node)
    },
  },
}
</script>
<style lang="less" scoped>
.node-type {
  &-1 {
    display: block;
    padding: 5px 10px;
    .text-overflow(1);
    position: relative;
    .node-icon {
      padding: 0 10px;
      &:hover {
        cursor: crosshair;
      }
    }
  }
  &-2 {
    .node-name {
      padding: 5px;
      background-color: @warning-color;
      cursor: crosshair;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .node-close {
        cursor: pointer;
      }
    }
    .node-condition {
      padding: 10px;
      cursor: pointer;
      color: #333;
      .text-overflow(1);
    }
  }
}
.node-container {
  user-select: none;
  color: @heading-color;
  position: absolute;
  .node-wrapper {
    border: dotted 1px @heading-color;
    border-radius: @border-radius-base;
    background-color: #fff;
    width: 170px;
    position: relative;
    &:hover {
      border-color: @primary-color;
      background: rgba(@primary-color, 0.3);
      .node-type-1 {
        &:before {
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          content: '';
          height: 100%;
          width: 3px;
          background-color: @primary-color;
        }
      }
    }
    &.node-active {
      border: solid 2px greenyellow;
      z-index: 10;
      color: #fff;
      background: rgba(@success-color, 0.3);
      .node-close {
        display: block;
      }
      .node-type-1 {
        color: #333;
        &:before {
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          content: '';
          height: 100%;
          width: 3px;
          background-color: @primary-color;
        }
      }
    }
  }
}
</style>