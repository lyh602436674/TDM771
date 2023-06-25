<template>
  <h-card :bordered='false' style='width: 100%'>
    <a-table
      :columns='testEquipColumns'
      :dataSource='testEquipInfo'
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
  name: "TestTestEquip",
  props: {
    testEquipInfo: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      testEquipColumns: [
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
        {title: '设备编号', dataIndex: 'equipCode'},
        {title: '设备名称', dataIndex: 'equipName'},
        {
          title: '计量有效期',
          dataIndex: 'checkValid',
          customRender: (t, record) => {
            return dateTimeFormatByStamp(record.checkValid, 'YYYY-MM-DD')
          }
        },
        {title: '设备型号', dataIndex: 'equipModel'},
      ],
    }
  },
}
</script>

<style scoped>

</style>