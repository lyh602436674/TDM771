export default {
  methods: {
    /**
     *  200厂：温度变化试验（E04）、温度冲击试验(E20)、湿热试验（E03）、热真空试验（E07）、低温试验（E01），高温试验（E02），可靠性试验试验条件(E15) 试验条件部分保持不变。
     *  其余的试验，只保留结构化条件输入。
     */

    /**
     *  771所二期：只有气候试验类型
     */
    filterUnitCode(type) {
      // 200厂： return ['E01', 'E02', 'E03', 'E04', 'E07', 'E15', 'E20'].includes(type)
      return [1].includes(+type)
    },
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
      });
      let columns = []
      columns = columnKeys.map((key) => {
        return {
          title: key,
          key: key
        };
      });

      let keys = Object.keys(result);
      let maxLength = Math.max(...keys.map(key => result[key].length));
      let res = [];
      for (let i = 0; i < maxLength; i++) {
        let newObj = {};
        keys.forEach(key => {
          newObj[key] = result[key][i] || '';
        });
        res.push(newObj);
      }
      return {columns, res}
    },
  }
}