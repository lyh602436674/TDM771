<template>
  <h-vex-table
    ref="testCheckTable"
    :columns="columns"
    :data="loadData"
    :pagination="false"
    :auto-load="!!testId"
    bordered
    style="width: 100%; height: 200px"
  >
    <span slot="itemRes" slot-scope="text, record">
      <h-icon v-if="record.itemRes === '1'" class='success-text' type='icon-wancheng1'/>
      <h-icon v-else-if="record.itemRes === '2'" class='danger-text' type='icon-chacha'/>
      <h-icon v-else-if="record.itemRes === '3'" class='danger-text' type='icon-xieti'/>
      <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="record.itemRes"></span>
    </span>
  </h-vex-table>
</template>

<script>
import {postAction} from "@api/manage";
import moment from "moment/moment";

export default {
  name: "TestCheck",
  props: {
    testId: {
      type: String,
      default: ""
    },
    dataField: {
      type: String,
      default: "",
      required: true,
    }
  },
  data() {
    return {
      list: '/HfEnvTaskTestBusiness/queryTestCheckItem',
      columns: [
        {
          title: '检查项名称',
          align: 'left',
          dataIndex: 'itemName',
          minWidth: 10,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查项内容',
          align: 'left',
          dataIndex: 'itemContent',
          minWidth: 10,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查项要求',
          align: 'left',
          dataIndex: 'itemRequire',
          minWidth: 25,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '检查结果',
          align: 'left',
          dataIndex: 'itemRes',
          minWidth: 10,
          scopedSlots: {customRender: 'itemRes'}
        },
        {
          title: '检查人',
          align: 'left',
          dataIndex: 'fillUserName',
          customRender: (text, record) => {
            return text ? text + ' ' + this.formatTime(record.fillTime) : ''
          }
        },
        {
          title: '复核人',
          align: 'left',
          dataIndex: 'checkUserName',
          customRender: (text, record) => {
            return text ? text + ' ' + this.formatTime(record.checkTime) : ''
          }
        }
      ],
      loadData: () => {
        return postAction(this.list, {id: this.testId}).then((res) => {
          if (res.code === 200) {
            return res.data[this.dataField]
          }
        })
      }
    }
  },
  methods: {
    formatTime(time) {
      return (time && +time) ? moment(+time).format('YYYY-MM-DD HH:mm:ss') : ''
    },
  }
}
</script>

<style scoped>

</style>