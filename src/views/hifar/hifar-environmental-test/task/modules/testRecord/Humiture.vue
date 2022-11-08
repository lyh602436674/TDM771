<!--
 * @Author: 陈乾龙
 * @Date: 2021-10-29 11:25:07
 * @LastEditTime: 2021-11-29 14:31:23
 * @LastEditors: 马潭龙
 * @Description: 温湿度试验类型记录
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\modules\testRecord\Humiture.vue
-->
<template>
  <div style="width: 100%; height: 100%">
    <h-card fixed title="温湿度试验记录">
      <template slot="table-operator">
        <a-button size="small" icon="plus" type="primary" @click="handleAddHumiture"> 新增 </a-button>
      </template>
      <h-edit-table
        uid="humiture"
        ref="humitureTable"
        slot="content"
        :autoLoad="false"
        :editConfig="editConfig"
        :editRules="humitureRules"
        :columns="humitureColumns"
        :data="loadHumiture"
        @eidtStatus="handleEditStatusChange"
      ></h-edit-table>
    </h-card>
    <check-ensure-modal ref="checkEnsureModal" />
  </div>
</template>

<script>
import { postAction } from '@/api/manage'
import CheckEnsureModal from '../components/CheckEnsureModal.vue'
export default {
  components: { CheckEnsureModal },
  props: {
    record: {
      type: Object,
    },
  },
  data() {
    return {
      url: {
        list: '/HfEnvTaskTestBusiness/listPageForTestTemhum',
        submit: '/HfEnvTaskTestBusiness/saveTestTemhum',
      },
      testId: null,
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
      humitureRules: {},
      humitureColumns: [
        // 温度
        {
          title: '温度/℃',
          key: 'temperature',
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
              return h('span', {}, [row[column.property] || '点击填写温度'])
            },
          },
        },
        // 湿度
        {
          title: '湿度/RH',
          key: 'humidity',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, { row, column }) => {
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
              return h('span', {}, [row[column.property] || '点击填写湿度'])
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
                    this.handleDeleteHumitureTable(params)
                  },
                },
              })
            },
          },
        },
        // {
        //   title: '试验员',
        //   key: 'testUserName',
        //   editRender: {
        //     name: 'edit',
        //     renderEdit: (h, renderOpts, { row, column }) => {
        //       return h(
        //         'div',
        //         {
        //           class: 'humiture-check-ensure',
        //           on: {
        //             click: () => {
        //               this.$refs.checkEnsureModal.show(row, this.handleEnsureCheckEnsure)
        //             },
        //           },
        //         },
        //         [row[column.property]]
        //       )
        //     },
        //     renderCell: (h, renderOpts, { row, column }) => {
        //       return h(
        //         'span',
        //         {
        //           class: {
        //             'danger-text': !row[column.property],
        //           },
        //         },
        //         [row[column.property] || '未确认']
        //       )
        //     },
        //   },
        // },
        // {
        //   title: '核验员',
        //   key: 'checkUserName',
        //   editRender: {
        //     name: 'edit',
        //     renderEdit: (h, renderOpts, { row, column }) => {
        //       return h(
        //         'div',
        //         {
        //           class: 'humiture-check-ensure',
        //           on: {
        //             click: () => {
        //               this.$refs.checkEnsureModal.show(row, this.handleEnsureCheckEnsure)
        //             },
        //           },
        //         },
        //         [row[column.property]]
        //       )
        //     },
        //     renderCell: (h, renderOpts, { row, column }) => {
        //       return h(
        //         'span',
        //         {
        //           class: {
        //             'danger-text': !row[column.property],
        //           },
        //         },
        //         [row[column.property] || '未核验']
        //       )
        //     },
        //   },
        // },
      ],
      loadHumiture: (params) => {
        let data = {
          ...params,
          id: this.record.id,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
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
    handleAddHumiture() {
      this.$refs.humitureTable.insert({
        temperature: undefined,
        humidity: undefined,
      })
    },
    // 删除
    handleDeleteHumitureTable(params) {
      this.edit = true
      this.$refs.humitureTable.delete(params)
    },
    handleEditStatusChange(tableData) {
      let { insertRecords, removeRecords, updateRecords } = tableData
      if (insertRecords.length > 0 || removeRecords.length > 0 || updateRecords.length > 0) {
        this.edit = true
      }
    },
    handleEnsureCheckEnsure() {
      let humitureTable = this.$refs.humitureTable.getTableData()
      let params = {
        testId: this.testId,
        testTemhumInfo: [],
      }
      humitureTable.tableData.map((test) => {
        let testTemhumInfo = {
          temperature: test.temperature,
          humidity: test.humidity,
        }
        params.testTemhumInfo.push(testTemhumInfo)
      })
      postAction(this.url.submit, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('提交成功')
          this.edit = false
        }
      })
    },
    refreshHumitureTable(type = true) {
      this.$refs.humitureTable.refresh(type)
    },
    refresh(type = true) {
      this.refreshHumitureTable(type)
    },
  },
}
</script>

<style lang="less">
.humiture-check-ensure {
  width: 100%;
  height: 30px;
  padding: 4px 11px;
  border-radius: @border-radius-base;
  border: solid 1px @border-color-base;
  background: #fff;
  cursor: pointer;
  &:before {
    content: '点击确认';
  }
}
</style>