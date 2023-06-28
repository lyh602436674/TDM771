<template>
  <h-card :bordered='false' style='width: 100%'>
    <a-table
      :columns='switchRecordingColumns'
      :dataSource='switchRecordingTable'
      :pagination='false'
      bordered
      rowKey='id'
      size='small'
      style="width: 100%;"
    >
    </a-table>
  </h-card>
</template>

<script>
import {dateTimeFormatByStamp} from "@/utils/util";

export default {
  name: "TestSwitchRecording",
  props: {
    switchRecordingTable: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      switchRecordingColumns: [
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
          title: '试验开始时间',
          dataIndex: 'testStartTime',
          align: 'center',
          width: 200,
          customRender: (t, row, index) => {
            return this.momentFormatFun(t, 'YYYY-MM-DD HH:mm:ss') || '--'
          }
        },
        {
          title: '试验结束时间',
          dataIndex: 'testEndTime',
          align: 'center',
          width: 200,
          customRender: (t, row, index) => {
            return this.momentFormatFun(t, 'YYYY-MM-DD HH:mm:ss') || '--'
          }
        },
        {
          title: '耗时',
          dataIndex: 'useTime',
          align: 'center',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'remarks',
          align: 'center',
          customRender: (t, row) => {
            return t || '--'
          }
        },
        {
          title: '值班人员',
          dataIndex: 'personName',
          align: 'center',
          width: 220,
          customRender: (t, row) => {
            let {personName, personSignTime} = row
            return personName && personSignTime ? personName + ' ' + dateTimeFormatByStamp(personSignTime, 'YYYY-MM-DD HH:mm:ss') : ''
          }
        },
      ],
    }
  },
}
</script>

<style scoped>

</style>