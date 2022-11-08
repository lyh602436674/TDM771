<template>
  <div style="height: 100%">
    <a-button v-if="itemIndex !== 0 || !filterUnitCode(currentProject.unitCode)" size="small" style="margin-bottom: 5px"
              type="primary" @click="handleAdd"> 新增
    </a-button>
    <vxe-table
      :ref="'pointTable' + projectIndex + itemIndex"
      :class="'pointTable' + projectIndex + itemIndex"
      :auto-resize="true"
      :data="itemAbilityInfo"
      :edit-config="{
                trigger: 'click',
                mode: 'cell',
                activeMethod: ()=>{return true}
              }"
      border
      height="300"
      highlight-hover-row
      keep-source
      show-overflow
      size="mini"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column field="paramName" title="试验条件"></vxe-table-column>
      <vxe-table-column field="unitName" title="单位">
        <template #default="{ row }">
          {{ row.unitName || '--' }}
        </template>
      </vxe-table-column>
      <vxe-table-column field="curveType" title="曲线类型">
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
              <a-select-option v-for="item in selectOptionItem" :key="item.key" :value="item.key">{{
                  item.title
                }}
              </a-select-option>
            </a-select>
          </template>
        </template>
        <template v-slot="{row}">
          <span v-if="row.dataType === 'select'">{{ getSelectOption(row) }}</span>
          <span v-else>{{ row.conditionTypeDesc }}</span>
        </template>
      </vxe-table-column>
      <vxe-table-column align="center" title="操作" width="100">
        <template #default="{ row,rowIndex }">
          <a-popconfirm title="确定删除吗?" @confirm="() => removeEvent(row,rowIndex)">
            <a-icon
              v-if="row.paramName !== '初试类型'"
              class="primary-text"
              style="cursor: pointer"
              theme="twoTone"
              title="删除"
              two-tone-color="#ff4d4f"
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
  },
  data() {
    return {
      selectOptionItem: [
        {title: "先高温", key: '1'},
        {title: "先低温", key: '2'},
      ],
      selectTemplate: false
    }
  },
  methods: {
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
      row.minValue = row.conditionTypeDesc
    },
    inputChangeOfSelect(row) {
      row.minValue = row.conditionTypeDesc
    },
    removeEvent(row, rowIndex) {
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
</style>