<!--
 * @Author: 赵峰
 * @Date: 2021-09-09 11:14:48
 * @LastEditTime: 2021-11-18 13:56:29
 * @LastEditors: 马潭龙
 * @Descripttion: 报告详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\reports\modules\ReportDetailModal.vue
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    title="委托详情"
    @cancel="handleCancel"
  >
    <div slot="footer" class="footer">
      <template v-if="[10,15,30,31].includes(detailData.status) && mainActiveKey === '1'">
        <a-button
          :loading="submitLoading"
          v-has="pageOption.pass"
          type="primary"
          @click="handleCheckPass(detailData.id,0)"> {{ "审核" + pageOption.typeText }}
        </a-button>
        <a-button v-has="pageOption.reject" type="ghost-primary" @click="handleCheck(detailData)">
          {{ pageOption.typeText + "驳回" }}
        </a-button>
      </template>
      <a-button type="ghost-danger" @click="handleCancel"> 关闭</a-button>
    </div>
    <a-spin :spinning="spinning">
      <h-card :bordered="false">
        <h-tabs :activeKey="activeKey" :animated="true" @change="handleTabsChange">
          <a-tab-pane key="1" :tab='viewDetailType === "1" ? "委托信息" : "运行单信息"'>
            <entrust-detail ref="EntrustDetail" :viewDetailType="viewDetailType"
                            :detailData="detailData"></entrust-detail>
          </a-tab-pane>
          <a-tab-pane key="2" tab="委托单预览">
            <div class="autoHeight">
              <embed
                v-if="detailData.reportPath"
                ref="iframe"
                :src="detailData.reportPath"
                frameborder="0"
                height="100%"
                scrolling="auto"
                width="100%"
              />
              <a-empty v-else style="margin-top: 160px"/>
            </div>
          </a-tab-pane>
        </h-tabs>
      </h-card>
    </a-spin>

  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import EntrustDetail from '@views/hifar/hifar-environmental-test/entrustment/components/EntrustDetail';

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },

  props: {
    pageOption: {
      type: Object,
      default: () => ({}),
    },
    mainActiveKey: {
      type: String,
      default: '',
    },
  },
  components: {
    EntrustDetail,
  },

  data() {
    return {
      visible: false,
      spinning: false,
      submitLoading: false,
      activeKey: '1',
      entrustId: '',
      detailData: {},
      model: {},
      type: '',
      url: {
        detail: '/HfEnvEntrustBusiness/queryById',
        check: '/HfEnvEntrustBusiness/submitConfirm',
        reject: '/HfEnvEntrustBusiness/reject',
        externalManage: '/HfEnvEntrustBusiness/externalManage'
      },
      numPages: 1, // pdf文件总页数
      pdfUrl: null,
      currentPage: 0,
      pageCount: 0,
      outsourcingUnit: '',
      viewDetailType: '',
      rejectRemarks: '',
      testCondition: 2,
      testProgress: 2
    }
  },
  methods: {
    show(record, type) {
      this.viewDetailType = type
      this.visible = true
      this.entrustId = record.id
      this.model = record
      this.loadDetail(record.id, type)
    },
    handleCancel() {
      this.visible = false
      this.submitLoading = false
      this.rejectRemarks = ''
    },
    handleTabsChange(v) {
      this.activeKey = v
    },
    loadDetail(id, type) {
      this.spinning = true
      let url = this.url.detail
      postAction(url, {id, type}).then((res) => {
        if (res.code === 200) {
          this.detailData = res.data
        }
      }).finally(() => {
        this.spinning = false
      })
    },
    handleCheck(record, title) {
      this.$confirm({
        title: '请填写驳回意见',
        content: h => {
          return h('div', {}, [
            h('a-textarea', {
              props: {
                autoSize: {minRows: 6},
                value: this.rejectRemarks,
              },
              on: {
                click: e => {
                  this.rejectRemarks = e.target.value
                }
              }
            }),
          ])
        },
        onOk: () => {
          postAction(this.url.reject, {
            id: record.id,
            typeNo: this.pageOption.typeNo,
            rejectRemarks: this.rejectRemarks
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('驳回成功')
              this.handleCancel();
              this.$emit('change', true)
            } else {
              this.$message.warning(res.msg)
            }
          })
        },
        onCancel: () => {

        }
      })
    },
    handleCheckPass(id, isForce) {
      if (this.submitLoading) return
      this.submitLoading = true
      postAction(this.url.check, {id, isForce, typeNo: this.pageOption.typeNo}).then((res) => {
        if (res.code === 200) {
          this.$message.success(this.pageOption.typeText + '成功')
          this.loadDetail(this.entrustId)
          this.handleCancel();
          this.$emit('change', true)
        } else {
          if (res.msg.includes('没有合适的设备')) {
            let testNames = res.data.map(item => item.testName).join(',')
            this.$confirm({
              title: '提示',
              content: testNames + '没有匹配到合适的设备，是否继续通过?',
              onOk: () => {
                postAction(this.url.check, {id, isForce: 1, typeNo: this.pageOption.typeNo}).then(res => {
                  if (res.code === 200) {
                    this.$message.success(this.pageOption.typeText + '成功')
                    this.handleCancel()
                    this.$emit('change', true)
                  } else {
                    this.$message.warning(res.msg)
                    this.submitLoading = false
                  }
                })
              },
              onCancel: () => {
                this.submitLoading = false
              }
            })
          }
        }
      })
    }
  }
}
</script>
<style lang='less' scoped>
iframe {
  position: absolute;
  top: 48px;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 0;
}

.autoHeight {
  min-height: 700px;
  height: 800px;
}

/deep/ .ant-tabs-content {
  padding: 0 10px;
}
</style>
