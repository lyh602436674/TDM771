import HUploadFile from '@comp/HUpload/HUploadFile'
import moment from "moment";
import {postAction} from "@api/manage";
import {randomUUID} from "@/utils/util";

export default {
  name: "HUploadFileCollect",
  extends: HUploadFile,
  data() {
    return {
      moment,
      popoverVisible: false,
      startTime: null,
      endTime: null,
      url: {
        delete: '/MinioBusiness/logicRemoveById',
        attachList: '/MinioBusiness/listByRefId',
        collectVideo: "/HfEnvPieceBusiness/recordVideo",
      },
    }
  },
  props: {
    propsData: {
      type: Object,
      default: () => ({})
    },
  },
  methods: {
    popoverCancel() {
      this.popoverVisible = false
    },
    popoverSubmit() {
      this.autoCollectVideo()
      this.popoverVisible = false
    },
    autoCollectVideo() {
      let params = {
        equipId: this.propsData.equipId,
        pieceId: this.propsData.pieceId || randomUUID(),
        pieceNo: this.propsData.pieceNo,
        productName: this.propsData.productName,
        startTime: this.startTime,
        endTime: this.endTime,
      }
      postAction(this.url.collectVideo, params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    renderUploadAction(h) {
      let actions = []
      if (this.isEdit) {
        actions.push(<a-button size="small" type="ghost-primary" icon="plus"
                               onclick={this.clickUpload}>{this.fileList.length ? '继续上传' : '上传文件'}</a-button>,
          <a-popover placement="topRight" visible={this.popoverVisible} title="请选择采集时间区间" trigger="click">
            <div slot="content">
              <div>
                <span>开始时间：</span>
                <a-date-picker style={{width: "150px"}} value={this.startTime} format={'YYYY-MM-DD HH:mm:ss'}
                               showTime={true} onChange={(val) => {
                  this.startTime = moment(val).format('YYYY-MM-DD HH:mm:ss')
                }}/>
              </div>
              <div style={{marginTop: "10px"}}>
                <span>结束时间：</span>
                <a-date-picker style={{width: "150px"}} value={this.endTime} format={'YYYY-MM-DD HH:mm:ss'}
                               showTime={true} onChange={(val) => {
                  this.endTime = moment(val).format('YYYY-MM-DD HH:mm:ss')
                }}/>
              </div>
              <div style={{width: "100%", marginTop: "10px", display: "flex", justifyContent: "right"}}>
                <a-button onClick={this.popoverCancel}>{'取消'}</a-button>
                <a-button style={{marginLeft: "5px"}} type="primary"
                          onClick={this.popoverSubmit}>{'确定'}</a-button>
              </div>
            </div>
            <a-button size="small" onClick={() => this.popoverVisible = true} type="ghost-primary"
                      icon="video-camera">{'自动采集'}</a-button>
          </a-popover>
        )
      }
      return h('div', {
          slot: "table-operator",
          class: "h-upload-file-actions"
        },
        [
          this.renderFilesInfo(h),
          h('a-space', {
            props: {
              size: 'small'
            }
          }, actions)
        ]
      )
    },
  }
}
