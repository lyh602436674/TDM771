<template>
  <div>
    <h-vex-table
      ref="TestConditionTable"
      :columns="columns"
      :data="localDataSource"
      size="mini"
      :height="300"
    >
    </h-vex-table>
  </div>
</template>

<script>
import {filterDictTextByCache} from "@comp/_util/JDictSelectUtil";

export default {
  name: "TestConditionTemplate",
  data() {
    return {
      columns: [
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
            if (record.paramName === '初始类型') {
              return text === '1' ? '先高温' : text === '2' ? '先低温' : '--'
            }
            return text
          }
        },
      ],
    }
  },
  computed: {
    localDataSource() {
      return () => {
        return new Promise((resolve, reject) => {
          resolve(this.dataSource)
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
  },
  methods: {}
}
</script>

<style scoped>

</style>