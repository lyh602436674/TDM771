<!--
 * @Author: 赵峰
 * @Date: 2021-09-16 11:56:41
 * @LastEditTime: 2021-11-24 11:49:56
 * @LastEditors: 赵峰
 * @Descripttion:
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\PointList.vue
-->
<template>
  <h-modal
    :confirmLoading="loading"
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    :width="600"
    destroyOnClose
    fullScreen
    inner
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card :bordered="false" fixed>
      <h-search
        slot="search-form"
        v-model="queryParams"
        :data="searchData"
        :showToggleButton="false"
        size="small"
        @change="handleSearch"
      />
      <h-vex-table
        ref="pointTable"
        :columns="columns"
        :historySelect="historySelect"
        :data="loadData"
        :rowSelection="{ selectedRowKeys, onChange: onSelect, type }"
        style="width: 100%"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import {filterDictTextByCache} from '@comp/_util/JDictSelectUtil'

export default {
  inject: {
    getContainer: {
      default: () => document.body,
    },
    unitId: {
      default: () => null,
    },
    craftUnitId: {
      default: () => null,
    },
  },
  props: {
    historySelect: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      moment,
      title: '选择试验条件',
      type: 'checkbox',
      visible: false,
      loading: false,
      queryParams: {},
      searchData: [
        {
          title: '参数编号',
          key: 'c_paramCode_7',
          formType: 'input',
        },
        {
          title: '参数名称',
          key: 'c_paramName_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '参数编号',
          dataIndex: 'paramCode',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '参数名称',
          dataIndex: 'paramName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '参数类型',
          dataIndex: 'paramType_dictText',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '数据类型',
          dataIndex: 'dataType',
          customRender: (text) => {
            switch (text) {
              case 'string':
                return '字符型'
              case 'number':
                return '数值型'
              case 'dateTime':
                return '日期型'
            }
          },
        },
        {
          title: '曲线类型',
          dataIndex: 'curveType',
          customRender: (text, record) => {
            return text === '1' ? '温度/℃' : text === '2' ? '湿度/RH' : '--'
          }
        },
        {
          title: '单位名称',
          dataIndex: 'unitName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
      ],
      url: {
        list: '/HfEnvEntrustBusiness/listPageAbilityParamByNotIds',
      },
      selectedRowKeys: [],
      selectedRows: [],
    }
  },

  methods: {
    triggerChange() {
      this.$emit('change', this.selectedRowKeys, this.selectedRows)
    },
    handleSubmit() {
      this.handleCancel()
      this.triggerChange()
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCancel() {
      this.selectedRowKeys
      this.visible = false
    },
    showSelectModal(record) {
      let abilityParamIds = []
      let unitPointArr = []
      this.visible = true
      if (record) {
        unitPointArr = record.abilityInfo
      }
      if (unitPointArr.length > 0) {
        unitPointArr.forEach((item) => {
          abilityParamIds.push(item.paramId)
        })
      }
      this.abilityParamIds = abilityParamIds.length > 0 ? abilityParamIds.join(',') : ''
    },
    handleSearch() {
      this.refresh(true)
    },
    refresh(bool = false) {
      this.$refs.pointTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
        abilityParamIds: this.abilityParamIds ? this.abilityParamIds : '',
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code === 200) {
          return res.data
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>
</style>