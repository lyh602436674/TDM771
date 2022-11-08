<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    :width='1000'
    destroyOnClose
    inner
    title='借用记录'
    @cancel='handleCancel'
  >
    <h-card :bordered='true' fixed>
      <h-search
        slot='search-form'
        v-model='queryParam'
        :data='searchBar'
        :showToggleButton='true'
        size='small'
        @change='refresh'
      />
      <div slot='table-operator' style='border-top: 5px'>
        <vxe-toolbar ref='envEquipmentOperator' custom>
        </vxe-toolbar>
      </div>
      <h-vex-table
        ref='diveceInfoTable'
        slot='content'
        :columns='columns'
        :customConfig='{ storage: { visible: true, resizable: true } }'
        :data='borrwoData'
        :row-selection='{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }'
        :rowKey='(record) => record.id'
        :scroll='{ x: true }'
        uid='envEquipmentList'
      >
        <!-- 创建日期 -->
        <span slot='createTime' slot-scope='text, record'>
        {{
            record.createTime && record.createTime !== 0 && record.createTime > 0
              ? moment(parseInt(record.createTime)).format('YYYY-MM-DD')
              : '--'
          }}
      </span>
        <!-- planReturnDate -->
        <span slot='planReturnDate' slot-scope='text, record'>
        {{
            record.planReturnDate && record.planReturnDate !== 0 && record.planReturnDate > 0
              ? moment(parseInt(record.planReturnDate)).format('YYYY-MM-DD')
              : '--'
          }}
      </span>
        <!-- 借用日期 -->
        <span slot='borrowDate' slot-scope='text, record'>
        {{
            record.borrowDate && record.borrowDate !== 0 && record.borrowDate > 0
              ? moment(parseInt(record.borrowDate)).format('YYYY-MM-DD')
              : '--'
          }}
      </span>
        <!-- actReturnDate -->
        <span slot='actReturnDate' slot-scope='text, record'>
        {{
            record.actReturnDate && record.actReturnDate !== 0 && record.actReturnDate > 0
              ? moment(parseInt(record.actReturnDate)).format('YYYY-MM-DD')
              : '--'
          }}
      </span>
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import { postAction } from '@api/manage'

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  name: 'toolsProductBorrowListModel',
  data() {
    return {
      visible: false,
      toolsId: '',
      moment,
      url: {
        countBorrow: '/HfToolsProducts/countBorrow'
      },
      defaultImg: require('./../assets/image/default.png'),
      queryParam: {},
      selectedRowKeys: [],
      searchBar: [
        {
          title: '借用部门',
          formType: 'input',
          key: 'c_borrowDeptName_7'
        },
        {
          title: '借用人',
          formType: 'input',
          key: 'c_borrowPersonName_7'
        },
        {
          title: '借用时间',
          key: 'borrowDate',
          formType: 'dateRangePick',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm') : '--'
          },
        },
      ],
      columns: [
        {
          title: '工装编号',
          align: 'left',
          ellipsis: true,
          width: 100,
          dataIndex: 'toolsCode'
        },
        {
          title: '工装名称',
          align: 'left',
          width: 100,
          dataIndex: 'toolsName'
        },
        {
          title: '工装规格',
          align: 'left',
          width: 100,
          dataIndex: 'toolsSize'
        },
        {
          title: '借用部门',
          dataIndex: 'borrowDeptName',
          align: 'left',
          width: 100
        },
        {
          title: '借用人',
          dataIndex: 'borrowPersonName',
          align: 'left',
          width: 100
        },
        {
          title: '借用日期',
          dataIndex: 'borrowDate',
          align: 'left',
          width: 100,
          scopedSlots: { customRender: 'borrowDate' }
        },
        {
          title: '使用地点',
          dataIndex: 'useLocation',
          align: 'left',
          width: 100
        },
        {
          title: '计划归还日期',
          dataIndex: 'planReturnDate',
          align: 'left',
          width: 100,
          scopedSlots: { customRender: 'planReturnDate' }
        },
        {
          title: '实际归还日期',
          dataIndex: 'actReturnDate',
          align: 'left',
          width: 100,
          scopedSlots: { customRender: 'actReturnDate' }
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          align: 'left',
          width: 100
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'left',
          width: 100,
          scopedSlots: { customRender: 'createTime' }
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'left',
          width: 100
        }
      ],
      borrwoData: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          searchType: this.expiryTime,
          toolsId: this.toolsId
        }
        if (data.borrowDate && data.borrowDate.length > 0) {
          data.beginTime = moment(data.borrowDate[0]).format('YYYY-MM-DD') + ' 00:00:00'
          data.endTime = moment(data.borrowDate[1]).format('YYYY-MM-DD') + ' 23:59:59'
          data.c_borrowDate_4 = moment(data.beginTime).format('X') * 1000
          data.c_borrowDate_6 = moment(data.endTime).format('X') * 1000
        }
        delete data.beginTime
        delete data.endTime
        delete data.handoverTime
        return postAction(this.url.countBorrow, data).then((res) => {
          if (res.code == 200) {
            let statisticsNum = res.ext
            this.$emit('change', statisticsNum)
            return res.data
          }
        })
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.$refs.diveceInfoTable.$refs.envEquipmentList.connect(this.$refs.envEquipmentOperator)
    })
  },
  methods: {
    refresh() {
      this.$refs.diveceInfoTable.refresh(true)
      this.selectedRowKeys = []
    },
    show(record) {
      this.visible = true
      this.toolsId = record.id
      console.log('toolsId>>>>>>>>>>>>>>>>>', this.toolsId)
    },
    handleCancel(e) {
      this.visible = false
      this.activeKey = '1'
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    }
  }
}
</script>

<style scoped>
/deep/ .ant-modal-body {
  height: 600px;
}
</style>