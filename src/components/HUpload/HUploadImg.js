/*
 * @Author: 陈乾龙
 * @Date: 2021-08-18 15:01:23
 * @LastEditTime: 2021-11-25 15:10:56
 * @LastEditors: 赵峰
 * @Description: 图片上传组件
 * @FilePath: \hifar-platform-client\src\components\HUpload\HUploadImg.js
 */
import "./HUpload.less";
import {randomUUID} from "@/utils/util";
import UploadMinxin from "./UploadMinxin";
import {isArray, isNumber, isObject, isString} from "lodash";

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
      default: true,
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
      type: [Array, String],
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
     * @Date: 2021-08-19 09:45:58
     * @Author: 陈乾龙
     * @description: 图片的长宽
     */
    width: {
      type: [Number, String],
      default: 120
    },
    height: {
      type: [Number, String],
      default: 160
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
     * @Date: 2021-08-19 14:48:22
     * @Author: 陈乾龙
     * @description: 是否设置密级
     */
    showSecret: {
      type: Boolean,
      default: false
    },
    /**
     *  @Date: 2021-08-31 13:59:22
     *  @Author: 陈乾龙
     *  @description: 是否公用
     */
    isPublic: {
      type: Boolean,
      default: false
    },
    /**
     * @Author: 赵峰
     * @Date: 2021-11-04 11:10:22
     * @description: 是否编辑
     */
    isEdit: {
      type: Boolean,
      default: true
    },
    isCollect: {
      type: Boolean,
      default: false
    },
    /**
     *  @Date: 2023-02-22 15:17:22
     *  @Author: 雷宇航
     *  @description: 是否给图片添加水印
     */
    watermark: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val && isString(val)) {
          let files = val.split(',')
          this.fileList = files.map(file => {
            return {
              url: file,
              uuid: randomUUID()
            }
          })
        } else if (isArray(val)) {
          this.fileList = val.map(file => {
            if (isObject(file)) {
              return {
                fileId: file.fileId,
                isInReport: file.isInReport || 1, // 1:进报告 2:不进报告
                url: file.url,
                uuid: randomUUID()
              }
            } else if (isString(file)) {
              return {
                url: file,
                uuid: randomUUID()
              }
            }
          })
        }
      }
    }
  },
  data() {
    return {
      inputConfig: {
        ref: "HUpload" + randomUUID()
      },
      // 上传图片组件的loading状态
      spinning: false,
    }
  },
  methods: {
    handleCollect(file) {
      file.isInReport = +file.isInReport === 1 ? 2 : 1
      this.$emit('collect', file);
    },
    /**
     * @Date: 2021-08-31 13:55:07
     * @Author: 陈乾龙
     * @description: 渲染图片上传组件
     */
    renderImageLoader(h) {
      let dom = null
      if (!this.fileList.length) {
        dom = h("a-spin", {
          props: {
            spinning: this.spinning,
            tip: "生成水印中",
          }
        }, [
          h('a-empty', {
            class: "h-upload-img",
            style: {
              margin: 0
            }
          }, [
            h('span', {
              slot: 'description',
              style: {
                color: '#bfbfbf'
              }
            }, '上传.png,.jpg,.jpeg类型的图片'),
            this.isEdit ?
              h('a-button', {
                props: {
                  type: "ghost-primary",
                  icon: 'upload',
                  size: "small"
                },
                on: {
                  click: this.clickUpload
                }
              }, '点击上传') : null
          ])
        ])
      } else {
        dom = this.renderImgList(h)
      }
      return dom
    },
    /**
     * @Date: 2021-08-31 13:54:55
     * @Author: 陈乾龙
     * @description: 渲染上传了图片列表
     */
    renderImgList(h) {
      let imgList = []
      this.fileList.map(file => {
        imgList.push(h('div', {
          class: "h-upload-img-wrapper",
          style: {
            height: isNumber(this.height) ? this.height + 'px' : isString(this.height) ? this.height : 'auto',
            width: isNumber(this.width) ? this.width + 'px' : isString(this.width) ? this.width : 'auto',
          },
          directives: [
            {
              name: 'viewer',
              value: { inline: false }
            }
          ]
        }, [
          h('img', {
            attrs: {
              src: file.url
            }
          }),
          file.url ? null : this.renderImgMask(file),
          this.renderImgAction(file)
        ]))
      })
      return h('div',
        {
          class: 'h-upload-img-list'
        },
        [
          imgList,
          this.isEdit ? this.renderImgUpload(h) : '',
        ]
      )
    },
    /**
     * @Date: 2021-08-31 13:55:33
     * @Author: 陈乾龙
     * @description: 渲染图片HOVER遮罩层
     */
    renderImgMask(file) {
      let fileDomStatus = null
      if (file.status === 'exception') {
        fileDomStatus = [
          <div>上传失败</div>,
          <a-space size="small">
            <h-icon type="icon-shanchu" style="pointer:cursor;" onclick={() => this.handleDelete(file)}/>
            <a-divider type="vertical"/>
            <a-tooltip title="重新上传">
              <a-icon type="upload" style="pointer:cursor;" onclick={() => this.calculateUploadParams(file)}/>
            </a-tooltip>
          </a-space>
        ]
      } else if (file.status === "normal") {
        fileDomStatus = [
          <div>{file.pretreatment !== 100 ? '预处理' : "上传中"}</div>,
          <div>{file.pretreatment !== 100 ? `${file.pretreatment}%` : `${file.percent}%`}</div>
        ]
      } else {
        fileDomStatus = [
          <div>上传成功</div>,
          <div>100%</div>
        ]
      }
      return this.h('div',
        {
          class: "h-upload-img-mask"
        },
        [
          this.h('a-progress',
            {
              class: 'h-upload-img-progress',
              props: {
                type: "circle",
                width: this.width - 3,
                percent: file.percent,
                status: file.status
              }
            },
            [
              this.h('div', {
                slot: "format",
                class: "h-upload-img-progress-format"
              }, [fileDomStatus])
            ]
          )
        ]
      )
    },
    renderImgAction(file) {
      let btns = []
      if (this.isEdit) {
        if (this.isCollect) {
          if (+file.isInReport === 1) {
            btns.push(<a-icon type='star' theme="filled" style='color:yellow' title='取消进报告'
                              onclick={() => this.handleCollect(file)}/>)
          } else {
            btns.push(<a-icon type='star' theme="filled" style='color:#FFF' title="进报告"
                              onclick={() => this.handleCollect(file)}/>)
          }
        }
        btns.push(<h-icon type="icon-shanchu" class="danger-text" onclick={() => this.handleDelete(file)} />)
      }
      return this.h('div', {
        class: "h-upload-img-action"
      }, btns)
    },
    renderImgUpload(h) {
      let dom = h('div', {
        class: "h-upload-com",
        style: {
          height: isNumber(this.height) ? this.height + 'px' : isString(this.height) ? this.height : 'auto',
          width: isNumber(this.width) ? this.width + 'px' : isString(this.width) ? this.width : 'auto',
        },
        on: {
          click: this.clickUpload
        }
      }, [
        h('a-icon', {
          props: {
            type: 'cloud-upload'
          },
          style: {
            fontSize: '34px'
          }
        }),
        h('span', {
          style: {
            color: "#bfbfbf"
          }
        }, "点击上传图片")
      ])
      if (this.multiple) {
        if (this.fileList.length >= Math.abs(this.max)) {
          dom = null
        }
      } else {
        if (this.fileList.length > 0) {
          dom = null
        }
      }

      return dom
    },
    // 获取图片原始对象
    getOriginFileInfo(fileList) {
      return Promise.all(Array.from(fileList).map((item) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              resolve(img);
            };
            img.onerror = reject;
            img.src = reader.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(item);
        });
      })).then((res) => {
        return res
      });
    },
    // 添加水印
    addWatermark(fileList) {
      let imgResult = [];
      for (let k = 0; k < fileList.length; k++) {
        let fileItem = fileList[k]
        let content = this.watermarkInput;
        let canvas = document.createElement("canvas"); //创建canvas容器
        canvas.width = fileItem.width; //设置canvas容器宽度
        canvas.height = fileItem.height; //设置canvas容器高度
        let ctx = canvas.getContext("2d"); //获取2d画笔
        //在canvas画布上绘制图片 ctx.drawImage(图片, x位置, y位置,  图像宽度, 图像高度);
        let height = fileItem.width * 0.08; //两个水印之间的垂直高度
        let width = fileItem.width * 0.08; //两个水印之间的水平高度
        let fontSize = fileItem.width * 0.02; //水印字体大小
        ctx.drawImage(
          fileItem,
          0,
          0,
          fileItem.width,
          fileItem.height,
        );

        //设置文本画笔样式
        ctx.textAlign = "left"; //设置文本对齐方式
        ctx.textBaseline = "top"; //设置文本基线
        ctx.font = `${fontSize}px Microsoft Yahei`; //设置文本字体属性
        ctx.fillStyle = "rgba(255, 255, 255,0.4)"; //设置文本字体颜色

        //在canvas画布上绘制文字 ctx.fillText(文字内容, x位置, y位置, 文本最大宽度)
        ctx.rotate((17 * Math.PI) / 180); //文本旋转角度设置
        ctx.translate(-fileItem.width * 0.5, -fileItem.height * 0.2);
        let i = 0,
          j = 0,
          waterMarkerWidth = content.split("").length * fontSize;
        for (i = 0; i < fileItem.width / waterMarkerWidth; i++) {
          for (j = 0; j < fileItem.height / (height - 20); j++) {
            if (j === 0) {
              ctx.fillText(
                content,
                i * (waterMarkerWidth + width),
                -height,
                fileItem.width
              );
            }
            ctx.fillText(
              content,
              i * (waterMarkerWidth + width),
              j * height,
              fileItem.width
            );
          }
        }
        imgResult.push(this.dataURLtoFile(canvas.toDataURL("image/png", 0.5), fileItem.fileName))
      }
      return imgResult
    },
    dataURLtoFile(dataurl, filename) {
      let arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type: mime});
    },
  },
  render(h) {
    return h('div', {
      class: 'h-upload-wrapper'
    }, [this.renderInput(Object.assign({}, this.inputConfig, {
      multiple: this.multiple,
      accept: this.accept || '*',
    })), this.renderImageLoader(h)])
  }
}