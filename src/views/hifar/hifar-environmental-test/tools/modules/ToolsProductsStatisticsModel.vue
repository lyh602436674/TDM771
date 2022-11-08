<!--
  * 工装统计
  * @Author: 朱巍巍
  * @Date: 2022/6/6$ 15:50$
  * @LastEditTime: 2022/6/6$ 15:50$
  * @LastEditors: 朱巍巍
  * @Description: $
  * @FilePath: $
 -->
<template>
  <h-modal
    :title='title'
    :visible='visible'
    :width='width'
    :getContainer='getContainer'
    :confirm-loading='confirmLoading'
    inner
    destoryOnClose
    @submit='handleClickSubmit'
    @cancel='handleCancel'
  >
    <h-card>
      <h-search
        v-model='queryParam'
        slot='search-form'
        size='small'
        :showToggleButton='true'
        :data='searchBar'
        @change='refresh'
      />
      <h-vex-table
        slot='content'
        ref='infoTable'
        height='600px'
        :scroll='{ x: true ,y:true}'
        :columns='columns'
        :data='queryDataSource'
        :rowKey='(record) => record.id'
        :row-selection='{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }'
        :customConfig='{ storage: { visible: true, resizable: true } }'
      >
      </h-vex-table>
    </h-card>
  </h-modal>
</template>

<script>
import { postAction } from '@api/manage'
export default {
  name: 'ToolsProductsStatisticsModel',
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  mixins: [],
  data() {
    return {
      title: '统计',
      visible: false,
      width: 1200,
      confirmLoading: false,
      type: '',
      dataSource: [],
      columns: [],
      columns1: [
        {
          title: '借用部门',
          align: 'left',
          ellipsis: true,
          dataIndex: 'borrwoDeptName',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '工装编号',
          align: 'left',
          width: 120,
          dataIndex: 'toolsCode'
        },
        {
          title: '工装名称',
          dataIndex: 'toolsName',
          align: 'left',
        }, {
          title: '借用次数',
          dataIndex: 'borrowSum',
          align: 'left',
          customRender: (text) => {
            return text || '0'
          }
        },
        {
          title: '按时归还次数',
          dataIndex: 'returnOnTimeSum',
          align: 'left',
          customRender: (text) => {
            return text || '0'
          }
        },
        {
          title: '未按时归还次数',
          dataIndex: 'returnTimeOutSum',
          align: 'left',
          customRender: (text) => {
            return text || '0'
          }
        }
      ],
      columns2: [
        {
          title: '借用部门',
          align: 'left',
          ellipsis: true,
          width: 120,
          dataIndex: 'borrwoDeptName',
          customRender: (text) => {
            return text || '--'
          }
        },
        {
          title: '总借用次数',
          align: 'left',
          width: 120,
          dataIndex: 'borrowSum',
          customRender: (text) => {
            return text || '0'
          }
        },
        {
          title: '按时归还次数',
          dataIndex: 'returnOnTimeSum',
          align: 'left',
          customRender: (text) => {
            return text || '0'
          }
        },
        {
          title: '未按时归还次数',
          dataIndex: 'returnTimeOutSum',
          align: 'left',
          customRender: (text) => {
            return text || '0'
          }
        }
      ],
      queryDataSource: (params) => {
        let data = {
          ...this.queryParam,
          ...params,
          type: this.type,
        }
        return postAction(this.url.statistics, data).then((res) => {
          if (res.code == 200) {
            this.$emit('change', res.data.totalCount)
            return res.data
          }
        })
      },
      queryParam: {},
      searchBar: [
        {
          title: '借用部门',
          formType: 'input',
          key: 'c_borrwoDeptName_7'
        },
        {
          title: '工装编号',
          formType: 'input',
          key: 'c_toolsCode_7'
        },
        {
          title: '工装名称',
          formType: 'input',
          key: 'c_toolsName_7'
        },
  /*      {
          title: '借用日期',
          formType: 'input',
          key: 'person'
        }*/
      ],
      selectedRowKeys: [],
      url: {
        statistics:'/HfToolsProducts/statisticsData'
      }
    }
  },
  methods: {
    show(type) {
      this.type = type
      if ('1' == type) {
        this.columns = [...this.columns1]
      } else {
        this.columns = [...this.columns2]
      }
      this.visible = true
    },
    handleClickSubmit() {

    },
    refresh() {
      this.$refs.infoTable.refresh(true)
      this.selectedRowKeys = []
    },
    handleCancel() {
      this.visible = false
      this.dataSource = []
      this.columns = []
    },
    onSelectChange() {

    }
  }
}
</script>

<style scoped>

</style>