<template>
  <h-card :bordered='false' style='width: 100%'>
    <a-table
      :columns='testRecordColumns'
      :dataSource='testRecordArr'
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

export default {
  name: "TestTestRecord",
  props: {
    testRecordArr: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      testRecordColumns: [
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
          title: '试验项目',
          dataIndex: 'testName',
          width: 150,
          customRender: (text, row, index) => {
            return text || '--'
          }
        },
        {
          title: "试件编号",
          dataIndex: "pieceNo",
          width: 200,
          customRender: (text, row, index) => {
            return text || '--'
          }
        },
        {
          title: '方向',
          dataIndex: 'directions',
          align: 'center',
          customRender: (text, row, index) => {
            return text || '--'
          }
        },
        {
          title: '向次',
          dataIndex: 'secondary',
          align: 'center',
          width: 150,
          customRender: (text, row, index) => {
            return text || '--'
          }
        },
        {
          title: "人员",
          dataIndex: "userName",
          width: 200,
          customRender: (text, row, index) => {
            return text || '--'
          }
        }
      ],
    }
  },
}
</script>

<style scoped>

</style>