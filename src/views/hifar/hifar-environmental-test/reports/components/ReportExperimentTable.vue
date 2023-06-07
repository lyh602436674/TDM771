<template>
  <h-card :border='true' :fixed='true' style="height:100%" class="card-wrapper">
    <h-search
      slot='search-form'
      v-model='queryParam'
      :data='searchBar'
      :showToggleButton='true'
      size='small'
      style='width: 100%'
      @change='refresh(true)'
    />
    <h-vex-table
      ref='reportProductTable'
      slot='content'
      :columns='columns'
      class="templateSelect"
      :data='loadData'
      @toggleRowExpand="handleToggleRowExpand"
      showExpand
      :expand-config="{accordion:true,trigger:'row'}"
      :rowKey="(record) => record.id"
    >

      <!--  :row-selection="{ selectedRowKeys, onSelect }"    -->
      <span slot="expandContent" slot-scope="row,rowIndex">
        <h-vex-table
          ref='subTable'
          :row-class-name="tableClassRowName"
          :columns='subColumns'
          :data='loadSubData'
          @toggleRowExpand="handleToggleSubRowExpand"
          :style="{height: `${tableHeight}px`}"
          showExpand
          :auto-load="false"
          :row-selection="{ selectedRowKeys: selectedSubRowKeys, onSelect: onSubSelect,trigger:'row'}"
          :rowKey="(record) => record.id"
        >
          <span class="piece-wrapper" slot="pieceNo" slot-scope="text, subRow, subRowIndex">
             <a-tooltip :title="subRow.pieceNoExtend">
                <span class="pieceNo">{{ subRow.pieceNoExtend }}</span>
             </a-tooltip>
              <a-popover v-if="subRow.relation && subRow.relation.length" placement="right"
                         v-model="subRow.popoverVisible" trigger="click">
                <div class="popover-content" slot="content">
                  <a-checkbox-group :value="subRow.pieceResult"
                                    @change="checked => handleSubTableCheckboxChange(checked,subRow)">
                    <a-checkbox
                      v-for="item in subRow.relation"
                      :key="item.pieceId"
                      :data-title="item.pieceNo"
                      :value="item.pieceId"
                    >
                      {{ item.pieceNo }}
                    </a-checkbox>
                  </a-checkbox-group>
                  <div class="popover-footer">
                    <a-button size="small" type="danger" @click="handlePopCancel(subRow)">取消</a-button>
                    <a-button size="small" type="ghost-primary" @click="handlePopReload(subRow)">重置</a-button>
                    <a-button size="small" type="primary" @click="handlePopSubmit(subRow)"> 确定</a-button>
                  </div>
                </div>
                <a-button @click.stop="handleSelectPiece(subRow)" class="chooseBtn" size="small"
                          type="primary">选择</a-button>
              </a-popover>
          </span>
          <span slot="reportFlag" slot-scope="text, record">
             <a-badge :color='text | testStatusColorFilter' :text='text | testStatusFilter'/>
          </span>
          <div slot="expandContent" slot-scope="subRow,subRowIndex" style="width: max-content;margin-left: 150px">
            <a-checkbox-group :value="subRow.checkboxValue" @change="checked => handleCheckboxChange(checked,subRow)">
              <a-checkbox
                v-for="item in checkboxOptions"
                :key="item.value"
                :data-title="item.title"
                :value="item.value"
              >
                {{ item.title }}
              </a-checkbox>
            </a-checkbox-group>
          </div>
        </h-vex-table>
      </span>
    </h-vex-table>
  </h-card>
</template>

<script>
import {postAction} from '@/api/manage'
import moment from 'moment'
import mixin from '@/views/hifar/hifar-environmental-test/mixin.js'

export default {
  mixins: [mixin],
  props: {
    reportFlag: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      moment,
      selectedRowKeys: [],
      selectedSubRowKeys: [],
      selectedSubRow: [],
      checkboxOptions: [
        {title: "试验准备状态检查单", value: "1"},
        {title: "试验照片", value: "2"},
        {title: "试验曲线", value: "3"},
        {title: "试验图谱", value: "4"},
        {title: "试验条件附件", value: "5"},
      ],
      queryParam: {},
      tableHeight: 40,
      url: {
        subList: '/HfEnvReportBusiness/listPageTest',
        list: "/HfEnvReportBusiness/listPageEntrustByReportFlag"
      },
      // 搜索
      searchBar: [
        {
          title: '产品名称',
          key: 'c_productName_7',
          formType: 'input'
        },
        {
          title: '项目名称',
          key: 'c_unitName_7',
          formType: 'input'
        },
        {
          title: '委托单号',
          key: 'c_entrustNo_7',
          formType: 'input'
        },
        {
          title: '运行单号',
          key: 'c_entrustCode_7',
          formType: 'input'
        },
        {
          title: '委托单位',
          key: 'c_custName_7',
          formType: 'input'
        },
        {
          title: '联系人',
          key: 'c_custLinkName_7',
          formType: 'input'
        },
        {
          title: '联系电话',
          key: 'c_custLinkMobile_7',
          formType: 'input'
        },
      ],
      // 表头
      subColumns: [
        {
          title: '试验编号',
          align: 'left',
          dataIndex: 'testCode',
        },
        {
          title: '运行单号',
          align: 'left',
          dataIndex: 'entrustCode',
        },
        {
          title: '产品编号',
          align: 'left',
          dataIndex: 'pieceNo',
          scopedSlots: {customRender: 'pieceNo'},
        },
        {
          title: '设备型号',
          align: 'left',
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '报告中是否显示最终用户',
          align: 'left',
          dataIndex: 'equipModel',
          customRender: (text, record) => {
            return text === '1' ? '是' : '否'
          }
        },
        {
          title: '最终用户',
          align: 'left',
          dataIndex: 'lastUser_dictText',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '项目名称',
          align: 'left',
          dataIndex: 'unitName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'reportFlag',
          scopedSlots: {customRender: 'reportFlag'},
        },
      ],
      columns: [
        {
          title: '委托单号',
          align: 'left',
          dataIndex: 'entrustNo',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '运行单号',
          align: 'left',
          dataIndex: 'entrustCode',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品名称',
          align: 'left',
          dataIndex: 'productName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品编号',
          align: 'left',
          dataIndex: 'pieceNo',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '产品代号',
          align: 'left',
          dataIndex: 'productAlias',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '项目名称',
          align: 'left',
          dataIndex: 'unitName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '试验性质',
          align: 'center',
          width: 120,
          dataIndex: 'testPropertyCode_dictText',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '委托单位',
          align: 'left',
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '联系人 ',
          align: 'left',
          dataIndex: 'custLinkName',
          customRender: (text, record) => {
            return text || '--';
          }
        },
        {
          title: '联系人电话 ',
          align: 'left',
          dataIndex: 'custLinkMobile',
          customRender: (text, record) => {
            return text || '--';
          }
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          c_reportType_1: '1',
          reportFlag: this.reportFlag, // 50 待出 60 已出
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      loadSubData: params => {
        let data = {
          entrustId: this.expandedRow.entrustId,
          entrustNo: this.expandedRow.entrustNo,
          reportFlag: this.reportFlag, // 50 待出 60 已出
        }
        return postAction(this.url.subList, data).then(res => {
          if (res.code === 200) {
            this.tableHeight = res.data.length * 40 + 40
            return res.data.map(item => {
              return {
                ...item,
                popoverVisible: false,
                pieceNoExtend: item.pieceNo,
                pieceResult: item.relation ? item.relation.map(v => v.pieceId) : [],
                relationResult: item.relation || [],
                checkboxValue: ['1', '2', '3', '4', '5'],
              }
            })
          }
        })
      },
      expandedRow: {},
    }
  },
  methods: {
    refresh(bool = true) {
      this.$refs.reportProductTable.refresh(bool)
    },
    handlePopCancel(subRow) {
      this.$set(subRow, 'popoverVisible', false)
    },
    handlePopReload(subRow) {
      this.$set(subRow, 'pieceResult', subRow.relation.map(v => v.pieceId))
    },
    handlePopSubmit(subRow) {
      let result = subRow.relation.filter((item) => {
        return subRow.pieceResult.includes(item.pieceId);
      });
      this.$set(subRow, 'relationResult', result)
      this.$set(subRow, 'pieceNoExtend', result.map(item => item.pieceNo).toString())
      this.$set(subRow, 'popoverVisible', false)
    },
    handleSelectPiece(subRow) {
      // subRow.popoverVisible = true
    },
    handleSubTableCheckboxChange(checked, subRow) {
      subRow.pieceResult = checked
    },
    handleCheckboxChange(checked, subRow) {
      subRow.checkboxValue = checked
    },
    handleToggleSubRowExpand({expanded, row}) {
      if (expanded) {
        this.tableHeight += 41
      } else {
        this.tableHeight -= 41
      }
    },
    handleToggleRowExpand({expanded, row}) {
      if (expanded) {
        this.expandedRow = row
        this.$nextTick(() => {
          this.$refs.subTable.refresh(true)
        })
      } else {
        this.expandedRow = {}
        this.selectedSubRowKeys = []
        this.selectedSubRow = []
      }
    },
    tableClassRowName({row}) {
      if (row.overdue === 1) {
        return 'table-row-overdue'
      }
    },
    onSubSelect(selectedRowKeys, selectedRow) {
      this.selectedSubRowKeys = selectedRowKeys
      this.selectedSubRow = selectedRow
      this.$emit('change', selectedRowKeys, selectedRow)
    },
    // onSelect(selectedRowKeys, selectedRow) {
    //   this.selectedRowKeys = selectedRowKeys
    //   this.$emit('change', selectedRowKeys, selectedRow)
    // },
  }
}
</script>
<style lang="less" scoped>

.popover-footer {
  padding-top: 10px;

  .ant-btn {
    margin-left: 5px;
  }
}

.popover-content {
  .ant-checkbox-wrapper {
    margin-bottom: 5px !important;
    margin-left: 0 !important;
    display: block !important;
  }
}

.piece-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;


  .pieceNo {
    width: calc(100% - 44px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chooseBtn {

  }
}

.templateSelect {
  /deep/ .table-row-overdue {
    background-color: #faa4a4;
  }

  /deep/ .vxe-table--render-default .vxe-body--expanded-cell {
    padding: 10px !important;
  }
}
</style>
<style lang="less" scoped>
.h-report-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;

  .h-report-left {
    height: 100%;
  }
}

.h-card-fixed .ant-card-body {
  display: block;
}

/deep/ .ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop {
  display: none;
}
</style>

<style lang="less">
.ant-popover-inner {
  .ant-popover-inner-content {
    max-height: 650px !important;
    overflow: auto !important;
  }
}
</style>