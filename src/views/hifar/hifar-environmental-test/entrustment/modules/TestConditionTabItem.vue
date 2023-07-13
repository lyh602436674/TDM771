<template>
  <div style="height: 100%">
    <div
      style="display: flex;width: 100%;margin-bottom: 5px;align-items: center;justify-content: space-between">
      <a-button size="small" v-if="isStage || !filterProjectByType"
                type="primary" @click="handleAdd"> 新增
      </a-button>
      <h-select v-if="filterProjectByType && isStage" v-model="highLowTemperatureExtend"
                :options="selectOptionItem"
                style="width: 200px;" @change="temperatureChange">
        <span slot="addonBefore">初始类型</span>
      </h-select>
    </div>
    <vxe-table
      :ref="'pointTable' + projectIndex + itemIndex"
      :class="'pointTable' + projectIndex + itemIndex"
      :auto-resize="true"
      :data="itemAbilityInfo"
      :edit-config="{ trigger: 'click', mode: 'cell',  activeMethod: () =>  true }"
      border
      height="300"
      highlight-hover-row
      keep-source
      show-overflow
      size="mini"
    >
      <vxe-table-column type="seq" width="40" align="center"></vxe-table-column>
      <vxe-table-column v-if="isStage" field="paramCode" title="参数编号"></vxe-table-column>
      <vxe-table-column field="paramName" title="试验条件"></vxe-table-column>
      <vxe-table-column v-if="isStage" field="paramType_dictText" title="参数类型"></vxe-table-column>
      <vxe-table-column field="unitName" title="单位">
        <template #default="{ row }">
          {{ row.unitName || '--' }}
        </template>
      </vxe-table-column>
      <vxe-table-column v-if="isStage" field="curveType" title="曲线类型">
        <template #default="{ row }">
          {{ row.curveType === '1' ? '温度/℃' : row.curveType === '2' ? '湿度/RH' : '--' }}
        </template>
      </vxe-table-column>
      <vxe-table-column :edit-render="{}"
                        class-name="conditionTypeDesc" field="conditionTypeDesc"
                        title="条件">
        <template #edit="{row,rowIndex}">
          <a-input v-if="row.dataType === 'string'" v-model="row.conditionTypeDesc" size="small"
                   @blur="inputChangeOfString(row,rowIndex)"></a-input>
          <a-input-number v-if="row.dataType === 'number'" v-model="row.conditionTypeDesc"
                          size="small"
                          style="width: 100%"
                          @blur="inputChangeOfNumber(row,rowIndex)"></a-input-number>
          <template v-if="row.dataType === 'select'">
            <a-select v-model="row.conditionTypeDesc" @change="inputChangeOfSelect(row)"
                      :getPopupContainer="getSelectContainer(rowIndex)" size="small" style="width: 100%">

            </a-select>
          </template>
        </template>
        <template v-slot="{row}">
          <span v-if="row.dataType === 'select'">{{ getSelectOption(row) }}</span>
          <span v-else>{{ row.conditionTypeDesc }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column v-if="isStage" align="center" title="操作" width="100">
        <template #default="{ row,rowIndex }">
          <a-popconfirm :class="[getDelFlag(row) ? '' : 'nonePointerEvents']" title="确定删除吗?"
                        @confirm="() => removeEvent(row,rowIndex)">
            <a-icon
              :class="[getDelFlag(row) ? 'danger-text' : 'disabled-text']"
              style="cursor: pointer"
              title="删除"
              type="delete"
            />
          </a-popconfirm>
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";
import {PROJECT_RELEVANCY_TEST_CONDITION} from "@views/hifar/constants"

export default {
  name: "TestConditionTabItem",
  mixins: [entrustmentMixins],
  props: {
    projectIndex: {
      type: [String, Number],
      default: 0
    },
    itemIndex: {
      type: [String, Number],
      default: 0
    },
    itemAbilityInfo: {
      type: [Array, Object],
      default: () => []
    },
    currentProject: {
      type: Object,
      default: () => {
      }
    },
    highLowTemperature: {
      type: [Number, String],
      default: '1'
    },
    stage: {
      type: String,
      default: ''
    },
  },
  computed: {
    filterProjectByType() {
      return this.filterUnitCode(this.currentProject.classifyType)
    },
    isStage() {
      return ['stage'].includes(this.stage)
    },
  },
  watch: {
    highLowTemperature: {
      immediate: true,
      handler(val) {
        this.highLowTemperatureExtend = val
      },
    },
  },
  data() {
    return {
      sysDelFlag: PROJECT_RELEVANCY_TEST_CONDITION,
      selectOptionItem: [
        {label: "先高温", key: '1', value: '1'},
        {label: "先低温", key: '2', value: '2'},
      ],
      selectTemplate: false,
      highLowTemperatureExtend: undefined,
    }
  },
  methods: {
    getDelFlag(row) {
      if (!this.sysDelFlag) {
        return row.delFlag;
      }
      return true
    },
    temperatureChange(val) {
      this.$emit('temperatureChange', val)
    },
    getSelectOption(row) {
      return this.selectOptionItem[+row.conditionTypeDesc - 1].title;
    },
    getSelectContainer(rowIndex) {
      let el = document.querySelector('.pointTable' + this.projectIndex + this.itemIndex)
      return () => el.querySelectorAll('.conditionTypeDesc')[rowIndex]
    },
    handleAdd() {
      this.$emit('add', this.projectIndex, this.itemIndex)
    },
    inputChangeOfString(row) {
      row.strValue = row.conditionTypeDesc
    },
    inputChangeOfNumber(row) {
      row.minValue = Number(row.conditionTypeDesc)
    },
    inputChangeOfSelect(row) {
      row.minValue = row.conditionTypeDesc
    },
    removeEvent(row, rowIndex) {
      if (!this.getDelFlag(row)) return
      this.$refs['pointTable' + [this.projectIndex] + [this.itemIndex]].remove(row)
      this.$emit('delete', row, rowIndex, this.projectIndex, this.itemIndex)
    },
  }
}
</script>

<style scoped>
>>> .conditionTypeDesc {
  position: relative
}

.nonePointerEvents {
  pointer-events: none
}
</style>