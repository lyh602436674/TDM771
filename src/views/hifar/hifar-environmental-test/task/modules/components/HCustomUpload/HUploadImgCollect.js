import HUploadImg from '@comp/HUpload/HUploadImg'
import {isNumber, isString} from "lodash";
import {randomUUID} from "@/utils/util";
import {postAction} from "@api/manage";
import {Empty} from 'ant-design-vue';

export default {
  name: "HUploadImgCollect",
  extends: HUploadImg,
  data() {
    return {
      url: {
        delete: '/MinioBusiness/logicRemoveById',
        attachList: '/MinioBusiness/listByRefId',
        collectImage: "/HfEnvPieceBusiness/takePhoto",
      },
      loading: false,
    }
  },
  props: {
    propsData: {
      type: Object,
      default: () => ({})
    },
    selectedTreeRows: {
      type: Object,
      default: () => ({})
    },
    isInReport: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    propsData: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val && Object.keys(val).length) {
          // this.watermarkInput = val.productAlias + ' ' + val.pieceNo + ' ' + this.customParams.testDirection
          this.watermarkInput = this.customParams.testDirection.split('-')[1]
        }
      }
    }
  },
  methods: {
    autoCollectImage() {
      if (this.loading) return
      this.loading = true
      let {equipId, pieceId, pieceNo, productName, productAlias, testDirection} = this.propsData
      let params = {
        pieceId: pieceId || randomUUID(),
        equipId,
        pieceNo,
        productName,
        productAlias,
        testDirection,
        watermarkInput: this.watermarkInput,
      }
      postAction(this.url.collectImage, params).then(res => {
        if (res.code === 200) {
          this.$message.success('采集成功')
          this.$emit('success')
        } else {
          this.$message.error('采集失败')
        }
      }).finally(() => {
        this.loading = false
      })
    },
    renderImgList(h) {
      let imgList = []
      this.fileList.map((file, index) => {
        imgList.push(h('div', {
          class: "h-upload-img-wrapper",
          style: {
            height: isNumber(this.height) ? this.height + 'px' : isString(this.height) ? this.height : 'auto',
            width: isNumber(this.width) ? this.width + 'px' : isString(this.width) ? this.width : 'auto',
          },
          directives: [
            {
              name: 'viewer',
              value: {inline: false}
            }
          ]
        }, [
          h('img', {
            attrs: {
              src: file.url
            }
          }),
          file.url ? null : this.renderImgMask(file),
          this.renderImgAction(file, index)
        ]))
      })
      return h('a-spin', {
        props: {
          spinning: this.spinning,
          tip: "生成水印中",
        }
      }, [h('div',
        {
          class: 'h-upload-img-list'
        },
        [
          imgList,
          this.isEdit ? this.renderImgUpload(h) : '',
          this.isEdit ? this.renderAutoCollect(h) : ''
        ]
      )])
    },
    renderAutoCollect(h) {
      return h('div', {
        class: "h-upload-com",
        style: {
          height: isNumber(this.height) ? this.height + 'px' : isString(this.height) ? this.height : 'auto',
          width: isNumber(this.width) ? this.width + 'px' : isString(this.width) ? this.width : 'auto',
          marginBottom: "10px"
        },

      }, [
        this.uploadBtnPopover(h, h('div', {
          style: {
            width: "100%",
            height: "50%"
          },
        }, [
          h('a-icon', {
            props: {
              type: this.loading ? 'loading' : 'video-camera'
            },
            style: {
              fontSize: '34px',
              display: "block",
              marginTop: "10px"
            }
          }),
          h('span', {
            style: {
              color: "#bfbfbf",
              display: "block",
              textAlign: "center"
            }
          }, "自动采集")
        ]), this.autoCollectImage),
        h('div', {
          style: {
            width: "100%",
            height: "50%"
          },
          on: {
            click: this.handlePreview
          }
        }, [
          h('a-icon', {
            props: {
              type: 'eye'
            },
            style: {
              fontSize: '34px',
              display: "block",
              marginTop: "10px"
            }
          }),
          h('span', {
            style: {
              color: "#bfbfbf",
              display: "block",
              textAlign: "center"
            }
          }, "预览")]),
      ])
    },
    renderImgUpload(h) {
      let dom = this.uploadBtnPopover(h, h('button', {
        class: "h-upload-com",
        style: {
          height: isNumber(this.height) ? this.height + 'px' : isString(this.height) ? this.height : 'auto',
          width: isNumber(this.width) ? this.width + 'px' : isString(this.width) ? this.width : 'auto',
          marginRight: "10px",
        },
      }, [
        h('a-icon', {
          props: {
            type: 'cloud-upload'
          },
          style: {
            fontSize: '34px',
          }
        }),
        h('span', {
          style: {
            color: "#bfbfbf"
          }
        }, "点击上传图片")
      ]), this.popoverSubmit)
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
    popoverCancel() {
    },
    handlePreview() {
      if (!this.selectedTreeRows.cameraIp) return this.$message.warning('未配置摄像机IP地址')
      window.open('http://' + this.selectedTreeRows.cameraIp, '_blank')
    },
    popoverSubmit() {
      this.clickUpload()
    },
    uploadBtnPopover(h, slot, callback) {
      // slot的父级标签必须能接受 mouseenter、mouseleave、focus、click 事件。
      return h('a-popover', {
          props: {
            placement: "topRight",
            title: "请输入水印内容",
            trigger: "click",
          }
        }, [
          slot,
          h('div', {slot: "content"}, [
              <hInput style={{width: '250px'}} value={this.watermarkInput} onBlur={e => {
                this.watermarkInput = e.target.value;
              }}/>,
              <div style={{width: "100%", marginTop: "10px", display: "flex", justifyContent: "right"}}>
                {/*<a-button onClick={this.popoverCancel}>{'取消'}</a-button>*/}
                <a-button style={{marginLeft: "5px"}} type="primary"
                          onClick={() => callback()}>{'确定'}</a-button>
              </div>
            ]
          )
        ]
      )
    },
    renderImageLoader(h) {
      let dom = null
      if (!this.fileList.length) {
        dom = h('a-spin', {
          props: {
            spinning: this.spinning,
            tip: "生成水印中",
          }
        }, [
          h('a-empty', {
            props: {
              image: Empty.PRESENTED_IMAGE_SIMPLE
            },
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
              this.uploadBtnPopover(h, h('a-button', {
                props: {
                  type: "ghost-primary",
                  icon: 'upload',
                  size: "small"
                },
              }, '点击上传'), this.popoverSubmit)
              : null,
            this.uploadBtnPopover(h, this.isEdit ?
              <a-button style={{marginLeft: '10px'}} icon={this.loading ? 'loading' : 'video-camera'} size="small"
                        type={"ghost-primary"}>{'自动采集'}</a-button> : null, this.autoCollectImage),
            this.isEdit ?
              <a-button style={{marginLeft: '10px'}} icon={this.loading ? 'loading' : 'video-camera'} size="small"
                        type={"ghost-primary"}
                        onClick={this.handlePreview}>{'预览'}</a-button> : null
          ])
        ])
      } else {
        dom = this.renderImgList(h)
      }
      return dom
    },
  }
}