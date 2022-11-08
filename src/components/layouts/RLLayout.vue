<template>
  <div class="drag-box" ref="dragBox">
    <div
      ref="dragLeft"
      :class="['drag-left', 'drag-left-collapse' && isCollapse]"
      :style="{ minWidth: leftMinWidth + 'px' }"
      :data-width="leftMinWidth"
      key="0"
    >
      <slot name="left"></slot>
    </div>
    <div ref="dragResize" class="drag-resize" title="收缩侧边栏" key="1">
      <div :class="['drag-collapse-btn', isCollapse ? 'drag-collapse-btn-active' : '']" @click="handleClickDrag">
        <a-icon :type="isCollapse ? 'vertical-align-top' : 'small-dash'" />
      </div>
    </div>
    <div class="drag-right" ref="dragRight" :style="{ minWidth: rightMinWidth + 'px' }" key="2">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    leftMinWidth: {
      type: Number,
      default: 130,
    },
    rightMinWidth: {
      type: Number,
      default: 150,
    },
  },
  data() {
    return {
      isCollapse: false,
    }
  },
  mounted() {
    this.dragController()
  },
  // 方法集合
  methods: {
    dragController() {
      let _this = this
      let resize = this.$refs.dragResize
      let left = this.$refs.dragLeft
      let right = this.$refs.dragRight
      let box = this.$refs.dragBox
      // 鼠标按下事件
      resize.onmousedown = function (e) {
        //颜色改变提醒
        resize.style.background = '#818181'
        var startX = e.clientX
        resize.left = resize.offsetLeft
        this.dragging = true
        left.classList.remove('transition')
        // 鼠标拖动事件
        document.onmousemove = function (e) {
          var endX = e.clientX
          var moveLen = resize.left + (endX - startX) // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
          var maxT = box.clientWidth - resize.offsetWidth // 容器宽度 - 左边区域的宽度 = 右边区域的宽度
          if (moveLen < _this.leftMinWidth) moveLen = _this.leftMinWidth // 左边区域的最小宽度
          if (moveLen > maxT - _this.rightMinWidth) moveLen = maxT - _this.rightMinWidth //右边区域最小宽度

          resize.style.left = moveLen // 设置左侧区域的宽度
          left.style.width = moveLen + 'px'
          right.style.width = box.clientWidth - moveLen - 10 + 'px'
        }
        // // 鼠标松开事件
        document.onmouseup = function (evt) {
          //颜色恢复
          resize.style.background = ''
          document.onmousemove = null
          document.onmouseup = null
          resize.releaseCapture && resize.releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
          this.dragging = false
          left.classList.add('transition')
        }
        resize.setCapture && resize.setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
        return false
      }
    },
    handleClickDrag() {
      this.isCollapse = !this.isCollapse
      if (this.isCollapse) {
        this.$refs.dragBox.classList.add('drag-collapse')
      } else {
        this.$refs.dragBox.classList.remove('drag-collapse')
      }
    },
  },
}
</script>

<style lang='less' scoped>
@import '~@/assets/less/common_variable.less';
.drag-box {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  &::after {
    content: '';
    display: block;
    clear: both;
  }
  &.drag-collapse {
    .drag-left {
      width: 0 !important;
      min-width: 0 !important;
      overflow: hidden;
    }
    .drag-resize {
      &:hover {
        background: transparent;
        cursor: default;
      }
    }
    .drag-right {
      width: auto !important;
      flex: 1;
    }
  }
}
.transition {
  transition: all 0.2s linear;
}
.drag-resize {
  align-self: stretch;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: @disabled-color;
    color: #fff;
    cursor: w-resize;
  }
  .drag-collapse-btn {
    width: 8px;
    height: 50px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: @border-color-base;
    cursor: pointer;
    &-active {
      background: @primary-color;
      color: #fff;
      width: 15px;
      height: 60px;
      margin-left: -8px;
    }
  }
  .anticon {
    transform: rotateZ(90deg);
  }
}
.drag-left {
  align-self: stretch;
  width: calc(~'20% - 8px');
}
.drag-right {
  width: 80%;
  align-self: stretch;
}
</style>