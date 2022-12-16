<template>
  <div style="height: 100%">
    <vxe-table ref='workTable'
               :data='tableData'
               @cell-click="handleCellClick"
               @menu-click="handleMenuClick"
               :mouse-config="{selected: true}"
               height="100%"
               :loading="tableLoading"
               size="medium"
               :menu-config="tableEdit ? menuConfig : {}"
               autoResize round border stripe
               :edit-config="{
                  trigger: 'click',
                  mode: 'cell',
                  activeMethod: activeCellMethod
                }"
               keep-source
               show-overflow>
      <vxe-table-column field='dutyTime' title="日期" align="center">
        <div slot='default' slot-scope='{row, rowIndex}'>
          <div style="display: flex;width: 100%;justify-content: center">
            <div class="time" style="padding:0 5px">
              {{ row.dutyTime && moment(+row.dutyTime).format('YYYY-MM-DD') || '--' }}
            </div>
            <div class="week" style="padding:0 5px">{{ row.week }}</div>
          </div>
        </div>
      </vxe-table-column>
      <template>
        <vxe-table-column v-if="tableEdit" :edit-render="{}" field="proNameId" align="center" title="排班">
          <template #edit="{row,rowIndex,column}">
            <a-select v-model="row.proNameId" show-search
                      @change="(e) => handleUserChange(e,row,rowIndex,[{key:'proPhone',value:'mobile'},{key:'proName',value:'idName'}])"
                      :getPopupContainer="(node)=> node.parentNode" style="width: 100%" :filter-option="filterOption">
              <a-select-option v-for="item in userList" :key="item.id" :value="item.id">
                {{ item.idName }}
              </a-select-option>
            </a-select>
          </template>
          <template v-slot="{row}">
            <span>{{ row.proName }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column v-else field="proName" align="center" title="排班"/>
      </template>
      <vxe-table-column
        align="center"
        field='proPhone'
        title="联系方式"
      />
      <template>
        <vxe-table-column v-if="tableEdit" :edit-render="{}" field="practicalNameId" align="center" title="实际">
          <template #edit="{row,rowIndex}">
            <a-select v-model="row.practicalNameId" show-search
                      @change="(e) => handleUserChange(e,row,rowIndex,[{key:'practicalPhone',value:'mobile'},{key:'practicalName',value:'idName'}])"
                      :getPopupContainer="(node)=> node.parentNode" style="width: 100%" :filter-option="filterOption">
              <a-select-option v-for="item in userList" :key="item.id" :value="item.id">{{
                  item.idName
                }}
              </a-select-option>
            </a-select>
          </template>
          <template v-slot="{row}">
            <span>{{ row.practicalName }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column v-else field="practicalName" align="center" title="实际"/>
      </template>
      <vxe-table-column
        field='practicalPhone'
        title="联系方式"
        align="center"
      />
      <template>
        <vxe-table-column v-if="tableEdit" :edit-render="{}" field="proNameId2" align="center" title="排班">
          <template #edit="{row,rowIndex}">
            <a-select v-model="row.proNameId2" show-search autoFocus
                      @change="(e) => handleUserChange(e,row,rowIndex,[{key:'proPhone2',value:'mobile'},{key:'proName2',value:'idName'}])"
                      :getPopupContainer="(node)=> node.parentNode" style="width: 100%" :filter-option="filterOption">
              <a-select-option v-for="item in userList" :key="item.id" :value="item.id">{{
                  item.idName
                }}
              </a-select-option>
            </a-select>
          </template>
          <template v-slot="{row}">
            <span>{{ row.proName2 }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column v-else field="proName2" align="center" title="排班"/>
      </template>
      <vxe-table-column
        field='proPhone2'
        title="联系方式"
        align="center"
      />
      <template>
        <vxe-table-column v-if="tableEdit" :edit-render="{}" field="practicalNameId2" align="center" title="实际">
          <template #edit="{row,rowIndex}">
            <a-select v-model="row.practicalNameId2" show-search
                      @change="(e) => handleUserChange(e,row,rowIndex,[{key:'practicalPhone2',value:'mobile'},{key:'practicalName2',value:'idName'}])"
                      :getPopupContainer="(node)=> node.parentNode" style="width: 100%" :filter-option="filterOption">
              <a-select-option v-for="item in userList" :key="item.id" :value="item.id">{{
                  item.idName
                }}
              </a-select-option>
            </a-select>
          </template>
          <template v-slot="{row}">
            <span>{{ row.practicalName2 }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column v-else field="practicalName2" align="center" title="实际"/>
      </template>
      <vxe-table-column
        field='practicalPhone2'
        title="联系方式"
        align="center"
      />
    </vxe-table>
  </div>
</template>

<script>
import moment from "moment";
import {isObject, isEmpty, cloneDeep} from 'lodash'

export default {
  name: "userTable",
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    userList: {
      type: Array,
      default: () => []
    },
    tableEdit: {
      type: Boolean,
      default: false
    },
    tableLoading: {
      type: Boolean,
      default: false
    },
    tableDataName: {
      type: String,
      default: 'tableData',
      required: true
    },
  },
  watch: {
    /*
    dutyTime = 日期
    proNameId = 排班人id
    proName = 排班人姓名
    proPhone = 排班人联系方式
    practicalNameId =实际id
    practicalName = 实际人姓名
    practicalPhone =实际人联系方式
    proNameId2 = 第二列
    proName2 =
    proPhone2 =
    practicalNameId2 =
    practicalName2 =
    practicalPhone2 =
    * */
    tableData: {
      immediate: true,
      deep: true,
      handler(val) {
        this.localTableData = val
      },
    },
  },
  data() {
    return {
      moment,
      localTableData: [],
      copyRecord: {},
      dataConfig: [
        ['proNameId', 'proName', 'proPhone'],
        ['practicalNameId', 'practicalName', 'practicalPhone'],
        ['proNameId2', 'proName2', 'proPhone2'],
        ['practicalNameId2', 'practicalName2', 'practicalPhone2'],
      ],
      menuConfig: {
        visibleMethod: ({type, options, column, row}) => {
          if (type !== 'body') return false
          options.forEach(list => {
            list.forEach(item => {
              if (['dutyTime'].includes(column.property)) {
                item.disabled = true
                item.visible = false
              } else {
                item.disabled = false
                item.visible = true
              }
              if (['pasteCell', 'pasteRow'].includes(item.code)) {
                item.disabled = !Object.keys(this.copyRecord).length
              }
              if (['copyCell', 'clearCell'].includes(item.code)) {
                item.disabled = !row[column.property]
              }
            })
          })
          return true
        },
        body: {
          options: [
            [
              {code: 'copyCell', name: "复制此单元格",},
              {code: 'copyRow', name: "复制整行"},
            ],
            [
              {code: 'clearCell', name: "清除此单元格"},
              {code: 'clearRow', name: "清除整行"},
            ],
            [
              {code: 'pasteCell', name: "粘贴此单元格"},
              {code: 'pasteRow', name: "粘贴整行"},
            ]
          ],
        },
      },
    }
  },
  methods: {
    handleUserChange(id, row, rowIndex, setData) {
      for (let i = 0; i < setData.length; i++) {
        this.$set(this.localTableData[rowIndex], setData[i].key, this.userList.filter(item => item.id === id)[0][setData[i].value])
      }
    },
    activeCellMethod({row}) {
      return this.tableEdit
      // return +row.dutyTime / 1000 >( +moment().format('X') - 24 * 60 * 60)
    },
    handleCellClick({row, rowIndex, column}) {

    },
    handleMenuClick({menu, row, column, rowIndex}) {
      switch (menu.code) {
        case "copyCell":
          this.copyRecord = {}
          this.dataConfig.forEach(item => {
            if (item.includes(column.property)) {
              item.forEach(v => {
                this.copyRecord[v] = row[v]
              })
            }
          })
          break;
        case "copyRow":
          this.copyRecord = {}
          this.dataConfig.flat().forEach(item => {
            this.copyRecord[item] = row[item]
          })
          break;
        case 'clearCell':
          this.dataConfig.forEach(item => {
            if (item.includes(column.property)) {
              item.forEach(v => {
                this.tableData[rowIndex][v] = ''
              })
            }
          })
          break
        case 'clearRow':
          this.dataConfig.flat().forEach(item => {
            this.tableData[rowIndex][item] = ''
          })
          break
        case 'pasteCell':
          if (this.copyRecord.hasOwnProperty(column.property)) {
            let tableData = cloneDeep(this.tableData)
            tableData[rowIndex] = {...tableData[rowIndex], ...this.copyRecord}
            this.$refs.workTable.loadData(tableData)
            this.$emit('change', this.tableDataName, tableData)
          }
          break;
        case 'pasteRow':
          let tableData = cloneDeep(this.tableData)
          tableData[rowIndex] = {...tableData[rowIndex], ...this.copyRecord}
          this.$refs.workTable.loadData(tableData)
          this.$emit('change', this.tableDataName, tableData)
      }
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
  }
}
</script>

<style scoped>

</style>