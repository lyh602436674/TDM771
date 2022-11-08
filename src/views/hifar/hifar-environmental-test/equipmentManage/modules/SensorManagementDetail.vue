<!--
 * @Author: 赵峰
 * @Date: 2021-10-25 17:10:51
 * @LastEditTime: 2021-11-05 11:30:39
 * @LastEditors: 赵峰
 * @Descripttion: 设备传感器--详情
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\SensorManagementDetail.vue
-->
<template>
  <h-modal
    :title="detailData.equipName + '--详情'"
    :visible="visible"
    :getContainer="getContainer"
    inner
    width='90%'
    destoryOnClose
    @cancel="handleCancel"
  >
    <div class="footer" slot="footer">
      <a-button @click="handleCancel" type="ghost-danger" style="margin-right: 8px"> 关闭 </a-button>
    </div>
    <div class="info_containter">
      <h-descriptions bordered size="small" style="width: 100%">
        <a-descriptions-item>
          <table border width="100%">
            <tr>
              <th :width="120">设备编号</th>
              <td>{{ detailData.equipCode || '--' }}</td>
              <th :width="120">设备名称</th>
              <td>{{ detailData.equipName || '--' }}</td>
              <td colspan="2" rowspan="6" style="position: relative">
                <viewer :url="detailData.imgUrl">
                  <img
                    class="h-upload-img-wrapper"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer"
                    :src="detailData.imgUrl"
                    alt=""
                  />
                </viewer>
              </td>
            </tr>
            <tr>
              <th :width="120">内部名称</th>
              <td>{{ detailData.innerName || '--' }}</td>
              <th :width="120">资产编号</th>
              <td>{{ detailData.assetsCode || '--' }}</td>
            </tr>
            <tr>
              <th :width="120">生产厂家</th>
              <td>{{ detailData.factoryName || '--' }}</td>
              <th :width="120">购买日期</th>
              <td>{{ detailData.buyTime && detailData.buyTime != 0 ? detailData.buyTime.format('YYYY-MM-DD') : '--' }}</td>
            </tr>
            <tr>
              <th :width="120">设备型号</th>
              <td colspan="3">{{ detailData.equipModel || '--' }}</td>
            </tr>
            <tr>
              <th :width="120">检定编号</th>
              <td>{{ detailData.checkCode || '--' }}</td>
              <th :width="120">检定日期</th>
              <td>{{ detailData.checkTime && detailData.checkTime  != 0 ? detailData.checkTime.format('YYYY-MM-DD') : '--' }}</td>
            </tr>
            <tr>
              <th :width="120">检定周期</th>
              <td colspan="3">
                {{ detailData.checkPeriod ? detailData.checkPeriod : '--' }}
                {{
                  detailData.checkUnit == 1
                    ? '日'
                    : detailData.checkUnit == 2
                    ? '月'
                    : detailData.checkUnit == 3
                    ? '年'
                    : ''
                }}
              </td>
            </tr>
            <tr>
              <th :width="120">技术参数</th>
              <td colspan="5">
                <span v-if="detailData.technologyParam">
                  {{ detailData.technologyParam || '--' }}
                </span>
                <a-empty v-else description="此设备无技术参数说明" />
              </td>
            </tr>
            <tr>
              <th :width="120">备注</th>
              <td colspan="5">
                <span v-if="detailData.remarks">
                  {{ detailData.remarks || '--' }}
                </span>
                <a-empty v-else description="暂无备注" />
              </td>
            </tr>
          </table>
        </a-descriptions-item>
      </h-descriptions>
    </div>
  </h-modal>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import { postAction } from '@/api/manage'
export default {
  mixins: [mixin],
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  data() {
    return {
      moment,
      detailData: {},
      visible: false,
      url: {
        detail: '/HfResSensorBusiness/queryById',
      },
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.loadDetailData(record.id)
    },
    handleCancel() {
      this.visible = false
      this.detailData = {}
      this.$emit('change',true)
    },
    loadDetailData(id) {
      postAction(this.url.detail, { id: id }).then((res) => {
        if (res.code == 200) {
          res.data.buyTime = moment(parseFloat(res.data.buyTime))
          res.data.checkTime = moment(parseFloat(res.data.checkTime))
          const { data } = res
          this.detailData = data
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
.info_containter {
  padding: 0 20px;
  table {
    th,
    td {
      display: table-cell;
      padding: 3px 5px !important;
      vertical-align: middle;
    }
    th {
      background: #efefef;
      text-align: center;
    }
  }
}
</style>
