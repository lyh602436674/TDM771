<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-15 15:22:19
 * @LastEditTime: 2021-12-10 19:50:21
 * @LastEditors: 赵文凯
 * @Description: 没有添加到设备中的能力参数列表
 * @FilePath: \新建文件夹 (2)\tdm200-client\src\views\hifar\hifar-environmental-test\equipmentManage\modules\EquipmentParameterModal.vue
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :title="title"
    :visible="visible"
    fullScreen
    inner
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <h-card fixed>
      <h-search slot="search-form" v-model="queryParams" :data="searchForm" @change="refresh"/>
      <h-vex-table
        ref="equipmentParameterTable"
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
      title: '添加参数',
      visible: false,
      equipId: null,
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
          dataIndex: 'paramType_dictText',
          // customRender: (text, record) => {
          //   return filterDictTextByCache('hf_dev_param_type', text) || '-'
          // }
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
          equipId: this.equipId
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      url: {
        list: '/HfResEquipParamBusiness/listPageResEquipParamByNotEquipId',
        add: '/HfResEquipParamBusiness/addResEquipParam',
      },
    }
  },
  methods: {
    show(equipId) {
      this.equipId = equipId
      this.visible = true
      this.$nextTick(() => {
        this.refresh(true)
      })
    },
    refresh(bool = true) {
      this.$refs.equipmentParameterTable.refresh(bool)
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
    },
    handleSubmit() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请选择你想要的设备参数')
        return
      }
      postAction(this.url.add, {
        equipId: this.equipId,
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
    },
  },
}
</script>

<style>
</style>