<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-12 15:40:18
 * @LastEditTime: 2021-08-25 09:57:15
 * @LastEditors: 陈乾龙
 * @Description: 流程图工具栏
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\components\ToolsBar.vue
-->
<template>
  <div class="tools-bar">
    <a-collapse v-model="activeKey" @change="toolsbarCollapse">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0" />
      </template>
      <template v-for="(point, pointIndex) in points">
        <a-collapse-panel :key="pointIndex.toString()" :header="point.title">
          <draggable v-model="point.children" v-bind="dragOptions" @end="end" @start="move">
            <div v-for="(item, itemIndex) in point.children" class="tools-bar-tool" :key="item.key" :type="item.key">
              <div class="tool-icon">
                <template v-if="item.icon && item.icon.includes('icon-')">
                  <h-icon :type="item.icon" />
                </template>
                <a-icon v-else :type="item.icon || 'deployment-unit'"></a-icon>
              </div>
              <span>
                {{ item.title }}
              </span>
            </div>
          </draggable>
        </a-collapse-panel>
      </template>
    </a-collapse>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  components: { draggable },
  data() {
    return {
      activeKey: ['0', '1'],
      points: [
        // 系统内置节点，不要删除
        {
          title: '系统节点',
          key: 'system',
          icon: 'home',
          children: [
            {
              title: '开始节点',
              key: 'start',
              type: 'start',
              nodeType: 'node',
              icon: 'icon-kaishi',
              valiStatus: false,
            },
            {
              title: '结束节点',
              key: 'end',
              type: 'end',
              nodeType: 'node',
              icon: 'icon-jieshu',
              valiStatus: false,
            },
          ],
        },
        // 定制节点
        {
          title: '业务节点',
          key: 'customPoint',
          icon: 'build',
          children: [
            {
              title: '人员节点',
              key: 'task',
              type:'task',
              nodeType: 'node',
              icon: 'icon-zaizhi',
              valiStatus: false,
            },
            // {
            //   title: '接口节点',
            //   key: 'api',
            //   type:"api",
            //   nodeType: 'node',
            //   icon: 'icon-zujian',
            //   valiStatus: false,
            // },
          ],
        },
      ],
      dragOptions: {
        preventOnFilter: false,
        sort: false,
        disabled: false,
        ghostClass: 'tt',
        // 不使用H5原生的配置
        forceFallback: true,
        // 拖拽的时候样式
        fallbackClass: 'flow-node-draggable',
      },
      // 被拖拽出去的节点
      node: {},
    }
  },
  methods: {
    toolsbarCollapse(v) {
      console.log(v)
    },
    getMenuByType(key) {
      for (let i = 0; i < this.points.length; i++) {
        let children = this.points[i].children
        for (let j = 0; j < children.length; j++) {
          if (children[j].key === key) {
            return children[j]
          }
        }
      }
    },
    // 拖拽开始时触发
    move(event) {
      var key = event.item.attributes.type.nodeValue
      this.node = this.getMenuByType(key)
    },
    // 拖拽结束时触发
    end(event) {
      this.$emit('addNode', event, this.node)
    },
  },
}
</script>

<style lang='less' scoped>
.tools-bar {
  height: 100%;
  width: 100%;
  overflow: auto;
  &-tool {
    cursor: pointer;
    padding: 5px 10px 5px 40px;
    width: 100%;
    display: block;
    .text-overflow(1);
    user-select: none;
    // text-align: center;
    color: @heading-color;
    border: dotted 1px @heading-color;
    margin-bottom: 10px;
    border-radius: @border-radius-base;
    position: relative;
    transition: all 0.2s linear;
    .tool-icon {
      position: absolute;
      top: 50%;
      left: 15px;
      transform: translate(0, -50%);
    }
    &:hover {
      border-color: @primary-color;
      border-style: solid;
      background-color: rgba(@primary-color, 0.5);
      color: @text-color-secondary;
      &::before {
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
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
<style lang="less">
.tools-bar {
  .ant-collapse {
    .ant-collapse-item {
      .ant-collapse-header {
        padding: 5px 5px 5px 40px;
      }
    }
  }
  .ant-collapse-content {
    .ant-collapse-content-box {
      padding: 5px;
    }
  }
}
</style>