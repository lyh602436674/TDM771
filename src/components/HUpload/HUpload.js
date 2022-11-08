/*
 * @Author: 陈乾龙
 * @Date: 2021-08-18 14:43:46
 * @LastEditTime: 2021-08-18 16:00:01
 * @LastEditors: 陈乾龙
 * @Description: 上传组件
 * @FilePath: \hifar-platform-client\src\components\HUpload\HUpload.js
 */
export default {
  props: {
    // 图片列表
    imageList: {
      type: Array,
      default: () => []
    },
    // 文件列表
    fileList: {
      type: Array,
      default: () => []
    },
    // 是否展示文件上传组件
    showFile: {
      type: Boolean,
      default: true
    },
    // 是否展示图片上传组件
    showImage: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      h: this.$createElement
    }
  },
  methods: {
    renderDom(h) {
      let imageUpload = null,
        fileUpload = null;
      if(this.showFile){
        fileUpload = h()
      }

    }
  },
  render(h) {
    return h("div", {}, this.renderDom(h))
  }
}