<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 15:59:25
 * @fileName: PieceDetailTemplate.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\PieceDetailTemplate.vue
 * @Description: 委托单样品信息
-->
<template>
  <h-desc :title="title" :bordered="false">
    <a-table
      :columns="columns[entrustType]"
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
      columns: {
        1: [
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
            title: '样品名称',
            dataIndex: 'productName',
            align: 'center',
          },
          {
            title: '型号/规格',
            dataIndex: 'productModel',
            align: 'center',
          },
          {
            title: '样品编号',
            dataIndex: 'pieceNo',
            align: 'center',
          },
          {
            title: '样品数量',
            dataIndex: 'pieceNum',
            align: 'center',
          }
        ],
        2: [
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
            title: '样品名称',
            dataIndex: 'productName',
            align: 'center',
          },
          {
            title: '图号',
            dataIndex: 'productAlias',
            align: 'center',
          },
          {
            title: '样品编号',
            dataIndex: 'pieceNo',
            align: 'center',
          },
          {
            title: '样品数量',
            dataIndex: 'pieceNum',
            align: 'center',
          },
        ],
      },
    }
  },
  props: {
    dataSource: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '样品信息'
    },
    entrustType: {
      type: [String, Number],
      default: 1
    }
  },
  watch: {},
  methods: {

  },
}
</script>

<style scoped>

</style>