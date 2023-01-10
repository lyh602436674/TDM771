/*
 * @Author: 陈乾龙
 * @Date: 2021-08-18 15:01:23
 * @LastEditTime: 2021-11-24 11:53:24
 * @LastEditors: 赵峰
 * @Description: 文件上传组件
 * @FilePath: \hifar-platform-client\src\components\HUpload\HUploadFile.js
 */
import "./HUpload.less";
import {randomUUID} from "@/utils/util";
import UploadMinxin from "./UploadMinxin";
import {isArray} from "lodash"

export default {
  mixins: [UploadMinxin],
  props: {
    /**
     * @Date: 2021-07-12 11:09:35
     * @Author: 陈乾龙
     * @description: 是否允许多文件上传
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * @Date: 2021-07-12 11:11:29
     * @Author: 陈乾龙
     * @description: 上传文件的类型，文件类型会在调试模式下打印到控制台
     */
    accept: {
      type: String,
      default: '',
    },
    /**
     * @Date: 2021-07-12 11:15:46
     * @Author: 陈乾龙
     * @description: 上传文件返回的文件列表信息
     * @param  [{name:xx,}]
     */
    value: {
      type: Array,
      default: () => [],
    },
    /**
     * @Date: 2021-07-12 12:00:08
     * @Author: 陈乾龙
     * @description: 上传文件的接口地址
     */
    action: {
      type: String,
      default: '',
    },
    /**
     * @Date: 2021-07-12 13:39:26
     * @Author: 陈乾龙
     * @description: 接口请求类型，这里只支持POST,GET
     */
    method: {
      type: String,
      default: 'POST',
    },
    /**
     * @Date: 2021-07-12 13:53:40
     * @Author: 陈乾龙
     * @description: maxSize 文件大小最大，单位kB；文件大小最小，单位kB ; 如果设置成0则认为不限制大小
     */
    maxSize: {
      type: Number,
      default: 0,
    },
    minSize: {
      type: Number,
      default: 0,
    },
    /**
     * @Date: 2021-08-19 09:27:25
     * @Author: 陈乾龙
     * @description: 最大文件数量，文件数量默认至少为1
     */
    max: {
      type: Number,
      default: 1
    },
    /**
     * @Date: 2021-08-19 14:47:45
     * @Author: 陈乾龙
     * @description: 文件保存目录
     */
    fileDir: {
      type: String,
      default: 'hifar/idm'
    },
    /**
     * @Date: 2021-08-31 13:59:22
     * @Author: 陈乾龙
     * @description: 是否公用
     */
    isPublic: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (isArray(val)) {
          this.fileList = val
        } else {
          this.fileList = []
        }
      },
    }
  },
  data() {
    return {
      inputConfig: {
        ref: "HUpload" + randomUUID()
      },
    }
  },
  methods: {
    renderFilesLoader(h) {
      return h('div', {
        on: {
          click: this.handleClick
        }
      }, [
        this.$slots.default
      ])
    },
    handleClick(){
      this.clickUpload()
    },
  },
  render(h) {
    return h('div', {
      style: {
        display: 'inline-block',
      }
    }, [
      this.renderInput(Object.assign({}, this.inputConfig, {multiple: this.multiple, accept: this.accept || '*',})),
      this.renderFilesLoader(h)
    ])
  }
}