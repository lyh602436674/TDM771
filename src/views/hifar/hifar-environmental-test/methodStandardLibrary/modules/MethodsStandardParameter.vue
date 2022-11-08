<!--
 * @Author: 赵文凯
 * @Date: 2021-12-10 19:44:04
 * @LastEditTime: 2021-12-10 19:44:04
 * @LastEditors: 赵文凯
 * @Description:
 * @FilePath: \新建文件夹 (2)\tdm200-client\src\views\hifar\hifar-environmental-test\methodStandardLibrary\modules\EquipmentParameter.vue
-->

<template>
  <h-modal
    inner
    fullScreen
    :title="title"
    :visible="visible"
    :getContainer="getContainer"
    :destroyOnClose="true"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card fixed>
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh"/>
      <h-vex-table
        ref="standardParameterTable"
        slot="content"
        :columns="columns"
        :data="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelect }"
      ></h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import moment from 'moment'
import {postAction} from '@api/manage'
import {filterDictTextByCache} from '@comp/_util/JDictSelectUtil'

export default {
  inject: {
    getContainer: {
      default: () => {
        return () => document.body
      },
    },
  },
  data() {
    return {
      queryParams: {},
      title: '操作',
      visible: false,
      methodId: null,
      searchForm: [
        {
          title: '参数名称',
          key: 'c_paramName_7',
          formType: 'input',
        },
        {
          title: '参数编号',
          key: 'c_paramCode_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '参数编号',
          dataIndex: 'paramCode',
        },
        {
          title: '参数名称',
          dataIndex: 'paramName',
        },
        {
          title: '参数类型',
          formType: 'dict',
          dataIndex: 'paramType',
          customRender: (text, record) => {
            return filterDictTextByCache('hf_dev_param_type', text) || '-'
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
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
        },
      ],
      selectedRowKeys: [],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          // equipId: this.methodId
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/HfResEquipParamBusiness/listPageResEquipParamByNotEquipId',
        add: '/HfMethodStaLibParamBusiness/addMethodStaLibParam',
      },
    }
  },
  methods: {
    show(methodId) {
      this.methodId = methodId
      this.visible = true
      this.selectedRowKeys = []
    },
    refresh(bool = true) {
      this.$refs.standardParameterTable.refresh(bool)
    },
    onSelect(selectedRowKeys, selectedRows) {
      console.log(selectedRowKeys, selectedRows)
      this.selectedRowKeys = selectedRowKeys
    },
    handleSubmit() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请选择你想要的参数')
        return
      }
      postAction(this.url.add, {
        methodId: this.methodId,
        abilityParamIds: this.selectedRowKeys.join(','),
      }).then((res) => {
        if (res.code == 200) {
          this.$message.success('添加成功')
          this.$emit('change', true)
          this.handleCancel()
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.selectedRowKeys = []
    },
  },
}
</script>

<style>
</style>