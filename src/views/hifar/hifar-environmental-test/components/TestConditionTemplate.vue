<template>
  <div>
    <vxe-table
      size="mini"
      border
      ref='TestConditionTable'
      :data='localDataSource'
      keep-source
      max-height='300'
      show-overflow
      v-if="+classifyType === 2">
      <vxe-table-column type="seq" width="40" align="center"></vxe-table-column>
      <vxe-table-column v-for="(item,index) in columns" :key="index" :field="item.key"
                        :title="item.title"></vxe-table-column>
    </vxe-table>
    <h-vex-table
      v-else
      ref="TestConditionTable"
      :columns="columns2"
      :data="localDataSource"
      size="mini"
      :height="300"
    >
    </h-vex-table>
  </div>
</template>


<script>


import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";

export default {
  name: "TestConditionTemplate",
  mixins: [entrustmentMixins],
  data() {
    const columns = [
      {
        title: '参数编号',
        dataIndex: 'paramCode',
      },
      {
        title: '试验条件',
        dataIndex: 'paramName',
      },
      {
        title: '参数类型',
        dataIndex: 'paramType_dictText',
      },
      {
        title: '单位',
        dataIndex: 'unitName',
      },
      {
        title: '曲线类型',
        dataIndex: 'curveType',
        customRender: (text) => {
          return text === '1' ? '温度/℃' : text === '2' ? '湿度/RH' : '--'
        }
      },
      {
        title: '条件',
        dataIndex: 'conditionTypeDesc',
        customRender: (text, record) => {
          return text || ''
        }
      },
    ]
    return {
      columns,
    }
  },
  computed: {
    columns2() {
      return this.columns.map(item => {
        let fields = ['paramCode', 'paramType_dictText', 'curveType']
        return {
          ...item,
          hidden: fields.includes(item.dataIndex) && this.stage !== 'stage'
        }
      })
    },
    localDataSource() {
      if (+this.classifyType === 2) {
        let {columns, res} = this.transposeData(this.dataSource)
        this.columns = columns
        return res
      }
      return () => {
        return new Promise((resolve, reject) => {
          resolve(this.dataSourceFormat(this.dataSource))
        }).then(res => {
          return res
        })
      }
    },
  },
  props: {
    dataSource: {
      type: Array,
      default: () => []
    },
    classifyType: {
      type: [String, Number],
      default: ''
    },
    stage: {
      type: String,
      default: ''
    }
  },
  methods: {
    dataSourceFormat(dataSource) {
      return dataSource.map(item => {
        return {
          ...item,
          conditionTypeDesc: item.dataType === 'string' ? item.strValue : item.conditionTypeDesc
        }
      })
    },
  }
}
</script>
