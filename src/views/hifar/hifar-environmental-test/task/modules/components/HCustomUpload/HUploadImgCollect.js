import HUploadImg from '@comp/HUpload/HUploadImg'
import {isNumber, isString} from "lodash";
import {randomUUID} from "@/utils/util";
import {postAction} from "@api/manage";

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
  },
  methods: {
    autoCollectImage() {
      if (this.loading) return
      this.loading = true
      let params = {
        equipId: this.propsData.equipId,
        pieceId: this.propsData.pieceId || randomUUID(),
        pieceNo: this.propsData.pieceNo,
        productName: this.propsData.productName,
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
          this.isEdit ? <div style={{width: this.width + 'px', height: this.height + 'px'}} class={"h-upload-com"}
                             onClick={this.autoCollectImage}>
            <a-icon style={{fontSize: '34px',}} type={this.loading ? 'loading' : 'video-camera'}/>
            <span style={{color: "#bfbfbf"}}>{'自动采集'}</span>
          </div> : ''
        ]
      )
    },
    renderImgUpload(h) {
      let dom = h('div', {
        class: "h-upload-com",
        style: {
          height: isNumber(this.height) ? this.height + 'px' : isString(this.height) ? this.height : 'auto',
          width: isNumber(this.width) ? this.width + 'px' : isString(this.width) ? this.width : 'auto',
          marginRight: "10px",
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
            fontSize: '34px',

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
    renderImageLoader(h) {
      let dom = null
      if (!this.fileList.length) {
        dom = h('a-empty', {
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
            }, '点击上传') : null,
          <a-button style={{marginLeft: '10px'}} icon={this.loading ? 'loading' : 'video-camera'} size="small"
                    type={ "ghost-primary"}
                    onClick={this.autoCollectImage}>{'自动采集'}</a-button>
        ])
      } else {
        dom = this.renderImgList(h)
      }
      return dom
    },
  }
}