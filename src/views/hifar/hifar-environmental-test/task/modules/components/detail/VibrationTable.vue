<!--
 * @Author: 赵峰
 * @Date: 2021-11-05 12:03:37
 * @LastEditTime: 2021-11-05 13:42:53
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\components\detail\VibrationTable.vue
-->
<template>
  <div class="test-record vibration">
    <div class="vibration-wrapper">
      <div style="height: 100%; overflow: auto; padding: 5px">
        <div>
          <h-card title="安装控制方式" :bordered="false">
            <h-edit-table
              uid="installationTable"
              ref="installationTable"
              slot="content"
              :autoLoad="false"
              :columns="installationColumns"
              :data="loadInstallation"
              @eidtStatus="handleEditStatusChange"
            ></h-edit-table>
          </h-card>
        </div>
        <div>
          <h-card title="传感设备" :bordered="false">
            <h-edit-table
              uid="sensorTable"
              ref="sensorTable"
              slot="content"
              :autoLoad="false"
              :columns="sensorColumns"
              :data="loadSensor"
              @eidtStatus="handleEditStatusChange"
            >
            </h-edit-table>
          </h-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import HEditTable from '@/components/HEditTable'
import { postAction } from '@/api/manage'
import { isArray } from 'lodash'
import EditTableDictSelect from '../EditTableDictSelect.vue'
import TestDirectionSelect from '../TestDirectionSelect.vue'
Vue.component('editTableDictSelect', EditTableDictSelect)
Vue.component('testDirectionSelect', TestDirectionSelect)

export default {
  components: { HEditTable, },
  props: {
    record: {
      type: Object,
    },
  },
  data() {
    return {
      loading: false,
      testId: null,
      model: {},
      // 编辑状态
      edit: false,
      url: {
        installation: '/HfEnvTaskTestBusiness/listPageForInstallMethod',
        sensor: '/HfEnvTaskTestBusiness/listPageForTestSensor',
        submit: '/HfEnvTaskTestBusiness/saveTestInstallMethodAndSensor',
      },
      installationColumns: [
        {
          title: '安装方式',
          key: 'installMethodName',
          formatter: ({ cellValue, row, column }) => {
            return cellValue || '--'
          },
        },
        {
          title: '试验方向',
          key: 'testDirectionName',
          editRender: {
            name: 'edit',
            renderCell: (h, renderOpts, { row, column }) => {
              let { testDirectionName, testDirectionInfo } = row
              if (testDirectionName) {
                return [<span>{row[column.property] || '--'}</span>]
              }
              testDirectionName = []
              if (isArray(testDirectionInfo)) {
                testDirectionInfo.map((test) => {
                  testDirectionName.push(test.testDirectionName)
                })
              }
              return [<span>{testDirectionName.join(',') || '--'}</span>]
            },
          },
        },
        {
          title: '几台/次',
          key: 'installNum',
          formatter: ({ cellValue, row, column }) => {
            return cellValue || '--'
          },
        },
        {
          title: '控制方式',
          key: 'controlMethod',
          formatter: ({ cellValue, row, column }) => {
            return cellValue || '--'
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formatter: ({ cellValue, row, column }) => {
            return cellValue || '--'
          },
        },
      ],
      loadInstallation: (params) => {
        let data = {
          ...params,
          id: this.testId,
        }
        return postAction(this.url.installation, data).then((res) => {
          if (res.code == 200) {
            res.data.data.map((item) => {
              if (isArray(item.testDirectionInfo)) {
                item.testDirectionIds = []
                item.testDirectionInfo.map((test) => {
                  item.testDirectionIds.push(test.testDirectionId)
                })
              }
            })
            return res.data
          }
        })
      },
      sensorColumns: [
        {
          title: '名称',
          key: 'equipName',
        },
        {
          title: '序号',
          key: 'rowSort',
        },
        {
          title: '内部名称',
          key: 'innerName',
          formatter: ({ cellValue, row, column }) => {
            return cellValue || '--'
          },
        },
        {
          title: '检定有效期',
          key: 'checkValid',
          formatter: ({ cellValue }) => {
            let time = parseFloat(cellValue)
            if (isNaN(time) || time <= 0) {
              return '--'
            }
            return moment(time).format('YYYY-MM-DD HH:mm:ss')
          },
        },
        {
          title: '备注',
          key: 'remarks',
          formatter: ({ cellValue }) => {
            return cellValue || '--'
          },
        },
        {
          title: '位置',
          key: 'locationName',
          formatter: ({ cellValue, row, column }) => {
            return cellValue || '--'
          },
        },
        {
          title: '用途',
          key: 'usePurposeName',
          formatter: ({ cellValue, row, column }) => {
            return cellValue || '--'
          },
        },
      ],
      loadSensor: (params) => {
        let data = {
          ...params,
          id: this.testId,
        }
        return postAction(this.url.sensor, data).then((res) => {
          if (res.code == 200) {
            res.data.data.map((sensor) => {
              sensor.sensorId = sensor.equipId
            })
            return res.data
          }
        })
      },
    }
  },
  mounted() {
    if (this.record && this.record.id) {
      this.testId = this.record.id
      this.model = Object.assign({}, this.record)
      this.refresh(true)
    }
  },
  methods: {
    handleAddInstallation() {
      this.edit = true
      this.$refs.installationTable.insert({
        installMethodName: undefined,
      })
    },
    handleDeleteInstallation(params) {
      this.edit = true
      this.$refs.installationTable.delete(params)
    },
    handleAddSensor() {
      this.edit = true
      let { tableData } = this.$refs.sensorTable.getTableData()
      let selectedSensors = tableData.map((sensor) => {
        return {
          id: sensor.sensorId,
        }
      })
      this.$refs.sensorSelectModal.show(selectedSensors, this.model.equipId, this.testId)
    },
    handleInsertSensor(selectedSensorKeys, selectedSensors) {
      this.$refs.sensorTable.insert(selectedSensors)
    },
    handleDeleteSensor(params) {
      this.edit = true
      this.$refs.sensorTable.delete(params)
    },
    /**
     * @Date: 2021-11-03 11:22:00
     * @Author: 陈乾龙
     * @description: 处理直接点击历史数据时，是否进入编辑状态
     * @param {*} tableData 返回表格数据集（获取插入、删除、更改的数据，对于增删改查表格非常方便） {insertRecords=[],removeRecords=[],updateRecords=[]} = tableData
     */
    handleEditStatusChange(tableData) {
      let { insertRecords, removeRecords, updateRecords } = tableData
      if (insertRecords.length > 0 || removeRecords.length > 0 || updateRecords.length > 0) {
        this.edit = true
      }
    },
    /**
     * @Date: 2021-11-03 11:37:05
     * @Author: 陈乾龙
     * @description: 提交系统数据
     */
    handleSubmit() {
      // 这里应该做表格校验，目前HEditTable加了校验会有样式问题，暂时没有事件解决
      let installTable = this.$refs.installationTable.getTableData()
      let sensorTable = this.$refs.sensorTable.getTableData()
      let params = {
        testId: this.testId,
        installMethodInfo: [],
        sensorInfo: [],
      }
      installTable.tableData.map((test) => {
        let installMethodInfo = {
          installMethodCode: test.installMethodCode,
          installMethodName: test.installMethodName,
          controlMethod: test.controlMethod,
          installNum: test.installNum,
          testDirectionIds: test.testDirectionIds.join(','),
          remarks: test.remarks,
        }
        params.installMethodInfo.push(installMethodInfo)
      })
      sensorTable.tableData.map((sensor) => {
        params.sensorInfo.push({
          equipId: sensor.sensorId,
          locationName: sensor.locationName,
          locationCode: sensor.locationCode,
          usePurposeName: sensor.usePurposeName,
          usePurposeCode: sensor.usePurposeCode,
        })
      })
      postAction(this.url.submit, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success('提交成功')
            this.edit = false
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    refreshInstallation(type = true) {
      this.$refs.installationTable.refresh(type)
    },
    refreshSensor(type = true) {
      this.$refs.sensorTable.refresh(type)
    },
    refresh(type = true) {
      this.refreshInstallation(type)
      this.refreshSensor(type)
    },
  },
}
</script>

<style lang='less' scoped>
@import '../../testRecord/index.less';
.vibration {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  > div {
    width: 100%;
  }
  &-wrapper {
    flex: 1;
    overflow: hidden;
  }
  &-btns {
    border-top: solid 1px @border-color-base;
    padding: 10px;
    text-align: right;
  }
}
</style>