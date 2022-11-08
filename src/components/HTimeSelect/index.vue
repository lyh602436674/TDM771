<!--
 * @Author: 赵峰
 * @Date: 2021-10-20 14:50:08
 * @LastEditTime: 2021-10-29 16:57:32
 * @LastEditors: 赵峰
 * @Descripttion: 时间选择器 年月日 时分秒 分开
 * @FilePath: \hifar-platform-client\src\components\HTimeSelect\index.vue
-->
<template>
  <div class="h-time-select">
    <a-date-picker :value="initVal" :size="size" :disabled-date="disabledDate"
                   :allowClear='false'
                   style="margin-right: 5px; width: 56%" @change="onChange">
      <span slot="suffixIcon"></span>
    </a-date-picker>
    <a-time-picker :value="initVal" :disabled-hours="disabledHours" :disabled-minutes="disabledMinutes"
                   :disabled-seconds="disabledSeconds" style="width: 44%" placeholder='时间'
                   :default-open-value="moment()" :format="timeFormat"
                   @change="onTimeChange"/>
  </div>
</template>

<script>
import moment from 'moment'
import {isString} from 'lodash'

export default {
  props: {
    size: {
      type: String,
      default: 'default',
    },
    timeFormat: {
      type: String,
      default: 'HH:mm:ss',
    },
    value: {
      type: [Object, String, Number],
      // default: () => moment(),
    },
    disabledDate: {
      type: Function,
      default: undefined
    },
    disabledHours: {
      type: Function,
      default: undefined
    },
    disabledMinutes: {
      type: Function,
      default: undefined
    },
    disabledSeconds: {
      type: Function,
      default: undefined
    },
  },

  data() {
    return {
      moment,
      initVal: this.value || undefined,
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.initVal = undefined
        } else {
          if (isString(val)) {
            if (!isNaN(parseFloat(val))) {
              this.initVal = moment(val)
            } else {
              this.initVal = moment(parseFloat(val))
            }
          } else if (val instanceof moment) {
            this.initVal = val
          } else {
            this.initVal = undefined
          }
        }
      },
    },
  },
  methods: {
    onChange(date, dateString) {
      this.initVal = date
      this.$emit('input', date, dateString)
      this.$emit('change', date, dateString)
    },
    onTimeChange(time, timeString) {
      this.initVal = time
      this.$emit('input', time, timeString)
      this.$emit('change', time, timeString)
    },
  },
}
</script>
<style lang='less' scoped>
.h-time-select {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>