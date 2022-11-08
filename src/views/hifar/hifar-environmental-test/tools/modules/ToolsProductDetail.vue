<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    :width='1000'
    destroyOnClose
    inner
    title='工装详情'
    @cancel='handleCancel'
  >
    <div style='padding: 5px 15px'>
      <div class='info_containter'>
        <div class='left'>
          <viewer :url='detailData.picurl||defaultImg' style='width:100%;height:100%'>
            <img :src='detailData.picurl||defaultImg' alt='设备图片' class='h-upload-img-wrapper'
                 style='width:100%;height:100%;cursor:pointer'/>
          </viewer>
        </div>
        <h-descriptions :column='2' bordered class='right' title='基本信息'>
          <a-descriptions-item label='工装名称'>
            {{ detailData.toolsName ? detailData.toolsName : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='工装编号'>
            {{ detailData.toolsCode ? detailData.toolsCode : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='工装规格'>
            {{ detailData.toolsSize ? detailData.toolsSize : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='借用部门'>
            {{ detailData.borrwoDeptName ? detailData.borrwoDeptName : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='借用人'>
            {{ detailData.borrowPersonName ? detailData.borrowPersonName : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='借用日期'>
            {{
              detailData.borrowDate && detailData.borrowDate != 0
                ? moment(parseInt(detailData.borrowDate)).format('YYYY-MM-DD')
                : '--'
            }}
          </a-descriptions-item>
          <a-descriptions-item label='检定日期'>
            {{
              detailData.verificationDate && detailData.verificationDate != 0
                ? moment(parseInt(detailData.verificationDate)).format('YYYY-MM-DD')
                : '--'
            }}
          </a-descriptions-item>
          <a-descriptions-item label='在库状态'>
            {{ detailData.larbaryStatus_dictText || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='存放地点'>
            {{ detailData.location ? detailData.location : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='责任人'>
            {{ detailData.person ? detailData.person : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='责任部门'>
            {{ detailData.deptName ? detailData.deptName : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='生产厂家'>
            {{ detailData.factory ? detailData.factory : '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='启用日期'>
            {{
              detailData.activeDate && detailData.activeDate != 0
                ? moment(parseInt(detailData.activeDate)).format('YYYY-MM-DD')
                : '--'
            }}
          </a-descriptions-item>
          <a-descriptions-item label='设备状态'>
            {{ detailData.toolsStatus_dictText || '--' }}
          </a-descriptions-item>
          <a-descriptions-item label='工装分类'>
            {{
              detailData.classify_dictText || '--'
            }}
          </a-descriptions-item>
          <a-descriptions-item :span='2' label='备注'>
            <a-textarea v-model='detailData.remake' readOnly/>
          </a-descriptions-item>
        </h-descriptions>
      </div>
    </div>
    <div slot='footer' class='footer'>
      <a-button type='ghost-danger' @click='handleCancel'> 关闭</a-button>
    </div>
  </h-modal>

</template>

<script>
import moment from 'moment'

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  name: 'ToolsProductDetail',
  props: {
    detailData: {
      type: Object,
      default: () => {
      }
    }
  },
  watch: {
    detailData: {
      immediate: true,
      handler(val) {
        this.detailData = val
      }
    }
  },
  data() {
    return {
      visible: false,
      detailData: {},
      toolsId: '',
      moment,
      defaultImg: require('./../assets/image/default.png'),
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.toolsId = record.id
      this.detailData = record
    },
    handleCancel(e) {
      this.visible = false
      this.activeKey = '1'
    },
    handleTabsChange(v) {
      this.activeKey = v
      console.log('this.toolsId', this.toolsId)
    }
  }
}
</script>
<style lang='less' scoped>
/deep/ .h-card.ant-card .ant-card-body {
  padding: 0 5px;
}

.info_containter {
  display: flex;

  .left {
    width: 300px;
    height: 300px;
    margin-top: 41px;
  }

  .right {
    margin-left: 10px;
    width: calc(100% - 300px);
  }
}
</style>