<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 15:59:25
 * @fileName: PieceDetailTemplate.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\PieceDetailTemplate.vue
 * @Description: 委托单产品信息
-->
<template>
  <div>
    <h-desc :bordered="false" :title="title">
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
    <product-file-modal ref='productFileModal' :isEdit="false"></product-file-modal>
  </div>
</template>

<script>
import moment from "moment";
import ProductFileModal from "@views/hifar/hifar-environmental-test/task/modules/ProductFileModal";

const productStatusOptions = [{key: '1', value: '1', label: '完好'}, {key: '2', value: '2', label: '损坏'}]

export default {
  name: "PieceDetailTemplate",
  components: {
    ProductFileModal
  },
  data() {
    return {
      moment,
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return index + 1
          },
        },
        {
          title: '试件名称',
          dataIndex: 'productName',
          align: 'center',
        },
        {
          title: '试件编号',
          dataIndex: 'pieceNo',
          align: 'center',
        },
        {
          title: '试件附件',
          dataIndex: 'imgNum',
          align: 'center',
          customRender: (t, row, index) => {
            return this.$createElement('a', {
              on: {
                click: (e) => {
                  this.previewProductFile(row)
                }
              }
            }, [row.imgNum || 0])
          }
        },
        {
          title: '试前状态',
          dataIndex: 'beforeStatus',
          align: 'center',
          width: 120,
          customRender: (t, row, index) => {
            return t && productStatusOptions.filter(item => item.key === t)[0].label || '--'
          }
        },
        {
          title: '试后状态',
          dataIndex: 'afterStatus',
          align: 'center',
          width: 120,
          customRender: (t, row, index) => {
            return t && productStatusOptions.filter(item => item.key === t)[0].label || '--'
          }
        },
        {
          title: '产品代号',
          dataIndex: 'productAlias',
          align: 'center',
        },
        // {
        //   title: '规格大小',
        //   dataIndex: 'productSpec',
        //   align: 'center',
        // },
        // {
        //   title: '送试单位',
        //   dataIndex: 'custName',
        //   align: 'center',
        // },
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
    // 查看试件附件
    previewProductFile(row) {
      this.$refs.productFileModal.show(row, '')
    },
  },
}
</script>

<style scoped>

</style>