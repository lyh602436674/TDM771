<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 15:59:25
 * @fileName: PieceDetailTemplate.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\PieceDetailTemplate.vue
 * @Description: 委托单产品信息
-->
<template>
  <h-desc :title="title" :bordered="false">
    <a-table
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false"
      bordered
      rowKey="id"
      size="small"
      style="width: 100%; height: 100%"
    ></a-table>
  </h-desc>
</template>

<script>
import moment from "moment";

export default {
  name: "PieceDetailTemplate",
  data() {
    return {
      moment,
      columns:[
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '产品名称',
          dataIndex: 'productName',
          align: 'center',
        },
        {
          title: '产品代号',
          dataIndex: 'productAlias',
          align: 'center',
        },
        {
          title: '产品编号',
          dataIndex: 'pieceNo',
          align: 'center',
        },
        {
          title: '产品数量',
          dataIndex: 'pieceNum',
          align: 'center',
        },
      ],
    }
  },
  props: {
    dataSource: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '产品信息'
    },
  },
  watch: {},
  methods: {

  },
}
</script>

<style scoped>

</style>