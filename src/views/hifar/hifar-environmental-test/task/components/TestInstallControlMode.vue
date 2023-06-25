<template>
  <h-card :bordered='false' style='width: 100%'>
    <a-table
      :columns='installControlColumns'
      :dataSource='installControlTable'
      :pagination='false'
      bordered
      rowKey='id'
      size='small'
      style="width: 100%;"
    >
      <div slot="expandedRowRender" slot-scope="record,index">
        <a-table
          :columns='sensorColumns'
          :dataSource='record.testSensorInfo'
          :pagination='false'
          bordered
          rowKey='id'
          size='small'
          style="width: 100%;"
        >
        </a-table>
      </div>
    </a-table>
  </h-card>
</template>

<script>
import moment from "moment/moment";

export default {
  name: "TestInstallControlMode",
  data() {
    return {
      installControlColumns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          }
        },
        {
          title: '安装方式',
          dataIndex: 'installMethodName',
          align: 'center',
          width: 150,
        },
        {
          title: '试验方向',
          dataIndex: 'directionName',
          align: 'center',
          width: 250,
        },
        {
          title: '几台/次',
          dataIndex: 'installNum',
          align: 'center',
          width: 150,
          scopedSlots: {customRender: 'installNum'},
        },
        {
          title: '控制方式',
          dataIndex: 'controlMethod',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
        },
      ],
      sensorColumns: [
        {
          title: '设备名称',
          dataIndex: 'equipName',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '序号',
          dataIndex: 'equipIndex',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          align: 'center',
          customRender: (t, record) => {
            return +record.checkValid && moment(+record.checkValid).format('YYYY-MM-DD') || '--'
          }
        },
        {
          title: '备注',
          maxWidth: 150,
          ellipsis: true,
          align: 'center',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          },
        },
        {
          title: '位置',
          dataIndex: 'locationName',
          align: 'center',
          width: 150,
        },
        {
          title: '用途',
          dataIndex: 'usePurposeName',
          align: 'center',
          width: 150,
        },
        {
          title: '是否记录振动曲线',
          dataIndex: 'vibrationCurveFlag',
          align: 'center',
          width: 150,
          customRender: (t, row, index) => {
            return t === 1 ? '是' : t === 0 ? '否' : ''
          }
        },
      ],
    }
  },
  props: {
    installControlTable: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>

</style>