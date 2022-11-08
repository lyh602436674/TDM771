<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-15 16:41:50
 * @LastEditTime: 2021-11-30 11:31:28
 * @LastEditors: 马潭龙
 * @Description: 设备详情信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\EquipmentDetail.vue
-->
<template>
  <div class="equipment-detail">
    <div v-if="!isEdit" style="height: 100%; width: 100%; overflow: auto">
      <h-descriptions title="设备基本信息">
        <span slot="extra" v-has="'equip:edit'" style="padding: 0 20px 0 0">
          <a-tooltip title="编辑">
            <a-icon class="primary-text" type="edit" @click="handleShowEdit"/>
          </a-tooltip>
        </span>
        <a-descriptions-item>
          <table border width="100%">
            <tr>
              <th :width="120">设备编号</th>
              <td>{{ model.equipCode || '--' }}</td>
              <th :width="120">设备名称</th>
              <td>{{ model.equipName || '--' }}</td>
              <td colspan="2" rowspan="8" style="position: relative">
                <img
                  :src="model.imgUrl"
                  alt=""
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
                />
              </td>
            </tr>
            <tr>
              <th :width="120">设备类型</th>
              <td>{{ model.equipTypeCode_dictText || '--' }}</td>
              <th :width="120">设备用途</th>
              <td>{{ model.equipUse_dictText || '--' }}</td>
            </tr>
            <tr>
              <th :width="120">内部名称</th>
              <td>{{ model.innerName || '--' }}</td>
              <th :width="120">资产编号</th>
              <td>{{ model.assetsCode || '--' }}</td>
            </tr>
            <tr>
              <th :width="120">出厂编号</th>
              <td>{{ model.leaveCode || '--' }}</td>
              <th :width="120">生产厂家</th>
              <td>{{ model.factoryName || '--' }}</td>
            </tr>
            <tr>
              <th :width="120">购买日期</th>
              <td>{{ model.buyTime && model.buyTime != 0 ? model.buyTime.format('YYYY-MM-DD') : '--' }}</td>
              <th :width="120">负责人</th>
              <td>{{ model.managerName || '--' }}</td>
            </tr>
            <tr>
              <th :width="120">设备型号</th>
              <td>{{ model.equipModel || '--' }}</td>
              <th :width="120">设备状态</th>
              <td>
                {{ model.status_dictText || '--' }}
              </td>
            </tr>
            <tr>
              <th :width="120">检定编号</th>
              <td>{{ model.checkCode || '--' }}</td>
              <th :width="120">检定日期</th>
              <td>{{ model.checkTime && model.checkTime != 0 ? model.checkTime.format('YYYY-MM-DD') : '--' }}</td>
            </tr>
            <tr>
              <th :width="120">检定周期</th>
              <td colspan="3">{{ model.checkPeriod }} {{ model.checkUnit | filterCheckUnit(model.checkUnit) }}</td>
            </tr>
            <tr>
              <th :width="120">技术参数</th>
              <td colspan="5">
                <span v-if="model.technology">
                  {{ model.technology || '--' }}
                </span>
                <a-empty v-else description="此设备无技术参数说明"/>
              </td>
            </tr>
            <tr>
              <th :width="120">设备附件</th>
              <td colspan="5">
                <h-upload-file
                  v-if="model.attachInfo && model.attachInfo.length"
                  v-model="model.attachInfo"
                  :isEdit="false"
                />
                <a-empty v-else description="此设备无说明书"/>
              </td>
            </tr>
          </table>
        </a-descriptions-item>
      </h-descriptions>
    </div>
    <div v-else-if="isEdit" class="info-wrapper">
      <div style="height: 100%; overflow: auto; padding-bottom: 60px">
        <h-descriptions title="基本信息">
          <a-descriptions-item>
            <equipment-form ref="efForm" @change="handleSubmit"/>
          </a-descriptions-item>
        </h-descriptions>
      </div>
      <div class="info-footer">
        <a-space>
          <a-button type="ghost-danger" @click="handleCancel">取消</a-button>
          <a-button type="ghost-primary" @click="handleEdit">确定</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'
import {getAction, postAction} from '@/api/manage'
import EquipmentForm from './EquipmentForm'
import {isArray} from 'lodash'

export default {
  props: {
    equipId: {
      default: null,
    },
  },
  mixins: [mixin],
  watch: {
    equipId(val) {
      this.localEquipId = val
      this.getEquipDetail()
    },
  },
  components: {EquipmentForm},
  filters: {
    filterCheckUnit(type) {
      let v = parseInt(type)
      switch (v) {
        case 1:
          return '日'
        case 2:
          return '月'
        case 3:
          return '年'
      }
    },
  },
  data() {
    return {
      moment,
      model: {},
      isEdit: false,
      localEquipId: this.equipId,
      url: {
        detail: '/HfResEquipBusiness/queryById',
        edit: '/HfResEquipBusiness/modifyById',
      },
    }
  },
  created() {
    if (this.localEquipId) {
      this.getEquipDetail()
    }
  },
  methods: {
    getEquipDetail() {
      getAction(this.url.detail, {id: this.localEquipId}).then((res) => {
        if (res.code == 200) {
          res.data.buyTime = res.data.buyTime && res.data.buyTime != 0 ? moment(parseFloat(res.data.buyTime)) : ''
          res.data.checkTime =
            res.data.checkTime && res.data.checkTime != 0 ? moment(parseFloat(res.data.checkTime)) : ''
          res.data.managerId = res.data.managerId && res.data.managerId != 0 ? res.data.managerId : undefined
          if (res.data.attachInfo && res.data.attachInfo.length > 0) {
            let attachInfo = null
            attachInfo = res.data.attachInfo.map((file) => {
              return Object.assign({}, file, {
                name: file.fileName,
                size: parseFloat(file.fileSize),
                uploadTime: file.createTime,
                percent: 100,
                url: file.filePath,
                type: null,
                uuid: file.id,
                fileId: file.id,
                status: 'success',
              })
            })
            res.data.attachInfo = attachInfo
          }
          console.log(res.data.attachInfo)
          this.model = res.data
          if (this.$refs.efForm) {
            this.$refs.efForm.model = this.model
          }
        }
      })
    },
    handleShowEdit() {
      this.isEdit = true
      this.$nextTick(() => {
        this.$refs.efForm.model = this.model
      })
    },
    handleEdit() {
      this.$refs.efForm.validateForm()
    },
    handleSubmit(values) {
      let params = {
        ...values,
        equipUse: 1,
      }
      if (params.buyTime) {
        params.buyTime = params.buyTime.valueOf()
      }
      if (params.checkTime) {
        params.checkTime = params.checkTime.valueOf()
      }
      if (isArray(params.imgUrl)) {
        let imgUrl = []
        imgUrl = params.imgUrl.map((item) => {
          return item.url
        })
        params.imgUrl = imgUrl.join(',')
      }
      if (isArray(params.attachInfo)) {
        let attachInfo = params.attachInfo.map((file) => {
          return file.fileId
        })
        params.attachIds = attachInfo.join(',')
      }
      postAction(this.url.edit, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('修改成功')
          this.isEdit = false
          this.getEquipDetail()
        }
      })
    },
    handleCancel() {
      this.isEdit = false
    },
  },
}
</script>

<style lang="less">
.equipment-detail {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;

  .info-wrapper {
    height: 90%;
    overflow: hidden;
    position: relative;
  }

  .info-footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: solid 1px @border-color-base;
    height: 60px;
    line-height: 58px;
    text-align: right;
    padding: 0 20px;
    background: #fff;
  }

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