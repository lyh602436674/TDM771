<!--
 * @Author: 陈乾龙
 * @Date: 2021-10-29 11:23:44
 * @LastEditTime: 2021-11-29 14:12:05
 * @LastEditors: 马潭龙
 * @Description: 震动类型试验记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\testRecord\Vibration.vue
-->
<template>
  <div class="test-record vibration">
    <div class="vibration-wrapper">
      <div style="height: 100%; overflow: auto; padding: 5px">
        <div>
          <h-card title="安装控制方式" :bordered="false">
            <div slot="table-operator">
              <a-button size="small" type="ghost-primary" icon="plus" @click="handleAddInstallation"> 新增 </a-button>
            </div>
            <h-edit-table
              uid="installationTable"
              ref="installationTable"
              slot="content"
              :autoLoad="false"
              :editConfig="editConfig"
              :editRules="installMethodEditRules"
              :columns="installationColumns"
              :data="loadInstallation"
              @eidtStatus="handleEditStatusChange"
            ></h-edit-table>
          </h-card>
        </div>
        <div>
          <h-card title="传感设备" :bordered="false">
            <div slot="table-operator">
              <a-button size="small" type="ghost-primary" icon="plus" @click="handleAddSensor"> 新增 </a-button>
            </div>
            <h-edit-table
              uid="sensorTable"
              ref="sensorTable"
              slot="content"
              :autoLoad="false"
              :editConfig="editConfig"
              :columns="sensorColumns"
              :data="loadSensor"
              @eidtStatus="handleEditStatusChange"
            >
              <template slot="actions">
                <h-icon type="icon-shanchu" class="danger-text" />
              </template>
            </h-edit-table>
          </h-card>
        </div>
      </div>
    </div>
    <sensor-select-modal ref="sensorSelectModal" @change="handleInsertSensor" />
  </div>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import { postAction } from '@/api/manage'
import { isArray } from 'lodash'
import EditTableDictSelect from '../components/EditTableDictSelect.vue'
import TestDirectionSelect from '../components/TestDirectionSelect.vue'
import SensorSelectModal from '../components/SensorSelectModal'
Vue.component('editTableDictSelect', EditTableDictSelect)
Vue.component('testDirectionSelect', TestDirectionSelect)

export default {
  components: { SensorSelectModal },
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
      editConfig: {
        trigger: 'click',
        mode: 'row',
        autoClear: true,
        showIcon: true,
        showStatus: true,
        showUpdateStatus: true,
        showAsterisk: true,
        showInsertStatus: true,
      },
      installMethodEditRules: {},
      installationColumns: [
        {
          title: '安装方式',
          key: 'installMethodName',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, { row, column, $rowIndex, $columnIndex }) => {
              return h('editTableDictSelect', {
                props: {
                  dictCode: 'hf_install_method',
                  value: row.installMethodCode,
                },
                on: {
                  change(v, option) {
                    row[column.property] = option.itemValue
                    row['installMethodCode'] = v
                  },
                },
              })
            },
            renderCell: (h, renderOpts, { row, column }) => {
              return [<span>{row[column.property] || '--'}</span>]
            },
          },
        },
        {
          title: '试验方向',
          key: 'testDirectionName',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, { row, $rowIndex, column }) => {
              let directionIds = []
              let { testDirectionInfo } = row
              if (isArray(testDirectionInfo)) {
                testDirectionInfo.map((item) => {
                  directionIds.push(item.testDirectionId)
                })
              }
              return h('test-direction-select', {
                props: {
                  value: directionIds,
                },
                on: {
                  change(v, options = []) {
                    let itemValue
                    if (isArray(options)) {
                      itemValue = options.map((item) => {
                        return item.testDirectionName
                      })
                    }
                    row[column.property] = itemValue.join(',')
                    row['testDirectionIds'] = v
                    row['testDirectionInfo'] = options
                  },
                },
              })
            },
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
          editRender: {
            name: 'edit',
            renderEdit: function (h, renderOpts, { row, column }) {
              return h('a-input-number', {
                props: {
                  value: row[column.property],
                },
                style: {
                  width: '100%',
                },
                on: {
                  change: (value) => {
                    row[column.property] = value
                  },
                },
              })
            },
            renderCell: (h, renderOpts, { row, column }) => {
              return h('span', {}, [row[column.property] || '--'])
            },
          },
        },
        {
          title: '控制方式',
          key: 'controlMethod',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, { row, column }) => {
              return h('a-input', {
                props: {
                  value: row[column.property],
                },
                style: {
                  width: '100%',
                },
                on: {
                  change: (event) => {
                    let value = event.target.value
                    row[column.property] = value
                  },
                },
              })
            },
            renderCell: (h, renderOpts, { row, column }) => {
              return h('span', {}, [row[column.property]] || '--')
            },
          },
        },
        {
          title: '备注',
          key: 'remarks',
          editRender: {
            name: 'edit',
            renderEdit: function (h, renderOpts, { row, column }) {
              return h('a-input', {
                props: {
                  value: row[column.property],
                },
                attrs: {
                  style: {
                    width: '100%',
                  },
                },
                on: {
                  change: (e) => {
                    let value = e.target.value
                    row[column.property] = value
                  },
                },
              })
            },
            renderCell: (h, renderOpts, { row, column }) => {
              return h('span', {}, [row[column.property || '--']])
            },
          },
        },
        {
          title: '操作',
          key: 'actions',
          width: 70,
          align: 'center',
          fixed: 'right',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, params) => {
              return h('h-icon', {
                props: { type: 'icon-shanchu' },
                class: 'danger-text',
                on: {
                  click: () => {
                    this.handleDeleteInstallation(params)
                  },
                },
              })
            },
          },
        },
      ],
      loadInstallation: (params) => {
        let data = {
          ...params,
          id: this.record.id,
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
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, { row, column, $rowIndex, $columnIndex }) => {
              return h('edit-table-dict-select', {
                props: {
                  dictCode: 'hf_sensor_location',
                  value: row.locationCode,
                },
                on: {
                  change(v, option) {
                    row[column.property] = option.itemValue
                    row['locationCode'] = v
                  },
                },
              })
            },
            renderCell: (h, renderOpts, { row, column }) => {
              return [<span>{row[column.property] || '--'}</span>]
            },
          },
        },
        {
          title: '用途',
          key: 'usePurposeName',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, { row, column, $rowIndex, $columnIndex }) => {
              return h('edit-table-dict-select', {
                props: {
                  dictCode: 'hf_sensor_purpose',
                  value: row.usePurposeCode,
                },
                on: {
                  change(v, option) {
                    row[column.property] = option.itemValue
                    row['usePurposeCode'] = v
                  },
                },
              })
            },
            renderCell: (h, renderOpts, { row, column }) => {
              return [<span>{row[column.property] || '--'}</span>]
            },
          },
        },
        {
          title: '操作',
          key: 'actions',
          width: 60,
          width: 70,
          align: 'center',
          fixed: 'right',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, params) => {
              return h('h-icon', {
                props: { type: 'icon-shanchu' },
                class: 'danger-text',
                on: {
                  click: () => {
                    this.handleDeleteSensor(params)
                  },
                },
              })
            },
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
@import './index.less';
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