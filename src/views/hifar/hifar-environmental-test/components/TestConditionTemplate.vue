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
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column v-for="(item,index) in columns" :key="index" :field="item.key"
                        :title="item.title"></vxe-table-column>
    </vxe-table>
    <h-vex-table
      v-else
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
          if (record.paramName === '初始类型') {
            return text === '1' ? '先高温' : text === '2' ? '先低温' : '--'
          }
          return text
        }
      },
    ]
    return {
      columns,
    }
  },
  computed: {
    localDataSource() {
      if (+this.classifyType === 2) {
        return this.transposeData(this.dataSource)
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
    }
  },
  methods: {
    transposeData(data) {
      let columnKeys = [];
      let result = {};

      data.forEach((item) => {
        let name, value

        // 如果没有数字，则添加默认值 1
        if (!/\d/.test(item.paramName)) {
          item.paramName = item.paramName + '1';
        }
        name = item.paramName;
        value = item.dataType === 'string' ? item.strValue : item.conditionTypeDesc;


        let nameWithoutNumber = name.replace(/\d+/g, '');
        if (!columnKeys.includes(nameWithoutNumber)) {
          columnKeys.push(nameWithoutNumber);
        }

        if (!result[nameWithoutNumber]) {
          result[nameWithoutNumber] = [];
        }

        result[nameWithoutNumber].push(value);
        console.log(result, 'result')
      });

      this.columns = columnKeys.map((key) => {
        return {
          title: key,
          key: key
        };
      });


      let keys = Object.keys(result);
      let maxLength = Math.max(...keys.map(key => result[key].length));
      console.log(maxLength, 'maxLength')

      let res = [];

      for (let i = 0; i < maxLength; i++) {
        let newObj = {};
        keys.forEach(key => {
          newObj[key] = result[key][i] || '';
        });
        res.push(newObj);
      }
      return res
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
