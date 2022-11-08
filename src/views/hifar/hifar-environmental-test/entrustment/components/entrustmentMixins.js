export default {
  methods: {
    // 温度变化试验（E04）、温度冲击试验(E20)、湿热试验（E03）、热真空试验（E07）、低温试验（E01），高温试验（E02），可靠性试验试验条件(E15) 试验条件部分保持不变。
    // 其余的试验，只保留结构化条件输入。
    filterUnitCode(record) {
      return ['E01', 'E02', 'E03', 'E04', 'E07', 'E15', 'E20'].includes(record)
    },
  }
}