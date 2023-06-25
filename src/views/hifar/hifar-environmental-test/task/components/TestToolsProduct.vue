<template>
  <h-card :bordered='false' style='width: 100%'>
    <div slot='content'>
      <a-table
        :columns='toolsProductColumns'
        :dataSource='toolsProductData'
        :pagination='false'
        bordered
        rowKey='id'
        size='small'
      ></a-table>
    </div>
  </h-card>
</template>

<script>
export default {
  name: "TestToolsProduct",
  props: {
    toolsProductData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      toolsProductColumns: [
        {
          title: '工装编号',
          dataIndex: 'toolsCode',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '工装名称',
          dataIndex: 'toolsName',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '工装规格',
          dataIndex: 'toolsSize',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '在库状态',
          dataIndex: 'larbaryStatus_dictText',
          align: 'center',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '存放地点',
          dataIndex: 'location',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '责任部门',
          dataIndex: 'deptName',
          align: 'center',
          customRender: (t) => {
            return t || '--'
          }
        },
        {
          title: '设备状态',
          dataIndex: 'toolsStatus_dictText',
          align: 'center',
          width: 120,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '工装分类',
          align: 'center',
          dataIndex: 'classify_dictText',
          customRender: (text) => {
            return text || '--'
          }
        },
      ],
    }
  },
}
</script>

<style scoped>

</style>