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
    }
  },
  methods: {
    transformArray(arr) {
      let output = [];

      arr.forEach((item) => {
        let index = parseInt(item.name.match(/\d+/)[0]);
        let key = item.name.replace(/\d+/g, '');

        if (!output[index - 1]) {
          output[index - 1] = {index};
        }

        output[index - 1][key] = item.value;
      });

      return output;
    },
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

<style scoped>

</style>