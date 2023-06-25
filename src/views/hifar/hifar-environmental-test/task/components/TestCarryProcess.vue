<template>
  <h-desc
    id="processForm"
    :data="detailData"
    class="mg-t-20"
    lableWidth="110px"
    title="实施过程">
    <h-desc-item label="试验设备">{{ detailData.equipName + '-' + detailData.equipModel || '--' }}</h-desc-item>
    <h-desc-item label="设备速率">{{ detailData.testRate || '--' }}</h-desc-item>
    <h-desc-item label="试验人员">{{ detailData.chargeUserName || '--' }}</h-desc-item>
    <h-desc-item label="入场时间">{{
        dateTimeFormatByStamp(detailData.approachTime)
      }}
    </h-desc-item>
    <h-desc-item label="离场时间">{{
        dateTimeFormatByStamp(detailData.departureTime)
      }}
    </h-desc-item>
    <h-desc-item label="开始时间">{{
        dateTimeFormatByStamp(detailData.realStartTime)
      }}
    </h-desc-item>
    <h-desc-item label="结束时间">{{
        dateTimeFormatByStamp(detailData.realEndTime)
      }}
    </h-desc-item>
    <h-desc-item label="温度(°C)">{{ detailData.temperature || '--' }}</h-desc-item>
    <h-desc-item label="湿度(RH)">{{ detailData.humidity || '--' }}</h-desc-item>
    <h-desc-item label="自检">{{ detailData.selfInspection || '--' }}</h-desc-item>
    <h-desc-item label="互检">{{ detailData.mutualInspection || '--' }}</h-desc-item>
    <h-desc-item :span="3" label="参试人员">
      {{ getTestPersonInfo() }}
    </h-desc-item>
    <h-desc-item :span="3" label="实施过程">{{ detailData.remarks || '--' }}</h-desc-item>
  </h-desc>
</template>

<script>
import {dateTimeFormatByStamp} from "@/utils/util";

export default {
  name: "TestCarryProcess",
  props: {
    detailData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dateTimeFormatByStamp,
    }
  },
  methods: {
    getTestPersonInfo() {
      let {testPersonInfo} = this.detailData, result = []
      if (testPersonInfo && testPersonInfo.length) {
        testPersonInfo.forEach((item) => {
          let res = item.testUserName ? (item.testUserName + (item.testPostName ? '(' + item.testPostName + ')' : '')) : '--'
          result.push(res)
        })
      }
      return result.length ? result.join(',') : '--'
    }
  }
}
</script>

<style scoped>

</style>