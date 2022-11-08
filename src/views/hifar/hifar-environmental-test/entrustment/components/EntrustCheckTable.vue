<!--
 * @Author: 雷宇航
 * @Date: 2022-01-06 13:49:02
 * @LastEditTime: 2022-01-07 09:33:03
 * @LastEditors: 雷宇航
 * @Descripttion: 委托审核Table
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\components\EntrustCheckTable.vue
-->
<template>
  <h-card :bordered="false" fixed>
    <h-search
      slot="search-form"
      v-model="queryParams"
      :data="searchBar"
      :showToggleButton="true"
      size="small"
      @change="refresh"
    />
    <h-vex-table
      ref="dataCheckTable"
      slot="content"
      :columns="columns"
      :data="loadData"
      :rowKey="(record) => record.id"
      :scroll="{ x: true }"
    >
      <span slot="entrustNo" slot-scope="text, record">
        <h-icon v-if="record.entrustType === '1'" type='icon-nei'/>
        <h-icon v-else type='icon-wai'/>
        <a @click="handleDetail(record,'1')"> {{ text || '--' }}</a>
      </span>
      <span slot="entrustCode" slot-scope="text, record">
        <a v-if="text" @click="handleDetail(record)"> {{ text }}</a>
        <span v-else>--</span>
      </span>
      <span slot="status" slot-scope="text, record">
        <a-badge :color='record.status | wtStatusColorFilter' :text='record.status | wtStatusFilter(record.entrustType)'/>
      </span>
    </h-vex-table>
    <entrust-detail-modal
      ref="EntrustDetailModal"
      @change="refresh(true)"
    ></entrust-detail-modal>
  </h-card>
</template>

<script>
import moment from "moment";
import {postAction} from "@/api/manage";
import mixin from '@/views/hifar/hifar-environmental-test/mixin.js'
import EntrustDetailModal from "../modules/EntrustDetailModal";

export default {
  mixins: [mixin],
  props: ["status"],
  components: {
    EntrustDetailModal,
  },
  watch: {
    status: {
      immediate: true,
      handler(val) {
        this.statusParams = val;
        this.refresh(true);
      },
    },
  },
  data() {
    return {
      moment,
      queryParams: {},
      statusParams: {},
      id: "",
      title: "",
      url: {
        list: "/HfEnvEntrustBusiness/listPage",
        copy: '/HfEnvEntrustBusiness/copyById',
        flowNode: '/FlowBusiness/listStartNextData',
        submitUrl: '/HfEnvEntrustBusiness/submit',
        delete: '/HfEnvEntrustBusiness/logicRemoveById',
      },
      unitId: "",
      searchBar: [
        {
          title: "运行单号",
          key: "c_entrustCode_7",
          formType: "input",
        },
        {
          title: "委托单号",
          key: "c_entrustNo_7",
          formType: "input",
        },
        {
          title: "委托单位",
          key: "c_custName_7",
          formType: "input",
        },
        {
          title: "联系人",
          key: "c_linkName_7",
          formType: "input",
        },
        {
          title: "联系方式",
          key: "c_LinkMobile_7",
          formType: "input",
        },
      ],
      columns: [
        {
          title: '运行单号',
          align: 'left',
          width: 140,
          dataIndex: 'entrustCode',
          scopedSlots: {customRender: 'entrustCode'},
          fixed: 'left'
        },
        {
          title: '委托单号',
          align: 'left',
          width: 160,
          dataIndex: 'entrustNo',
          scopedSlots: {customRender: 'entrustNo'},
          fixed: 'left'
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status',
          minWidth: 100,
          scopedSlots: {customRender: 'status'}
        },
        {
          title: '试验项目',
          align: 'left',
          dataIndex: 'unitNames',
          minWidth: 100,
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '样品名称',
          align: 'left',
          minWidth: 200,
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: "型号/规格",
          align: "left",
          dataIndex: "productModel",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "图号",
          align: "left",
          dataIndex: "productAlias",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '委托单位',
          align: 'left',
          minWidth: 100,
          dataIndex: 'custName',
          customRender: (text, record) => {
            return text || "--";
          }
        },

        {
          title: '委托日期',
          align: 'left',
          dataIndex: 'entrustTime',
          minWidth: 100,
          customRender: (time) => {
            return time && time != 0 ? moment(parseInt(time)).format('YYYY-MM-DD') : '--'
          }
        },
        {
          title: "联系人",
          align: "center",
          dataIndex: "linkName",
          width: 120,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "联系方式",
          align: "center",
          width: 150,
          dataIndex: "linkMobile",
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "委托人",
          align: "center",
          dataIndex: "entrustPerson",
          width: 120,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: "委托人手机号",
          align: "center",
          width: 150,
          dataIndex: "entrustPersonPhone",
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '创建人 ',
          align: 'left',
          minWidth: 100,
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建时间 ',
          align: 'left',
          minWidth: 140,
          dataIndex: 'createTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
      ],
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          ...this.statusParams
        };
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data;
          }
        });
      },
    };
  },

  methods: {
    refresh(bool = true) {
      this.$nextTick(() => {
        this.$refs.dataCheckTable.refresh(bool);
      })
    },
    handleDetail(record,type) {
      this.$refs.EntrustDetailModal.show(record,type);
    },
    // 提交--需要下一处理人
    handleSubmit(record) {
      let _this = this
      postAction(_this.url.flowNode, {priId: record.flowId, proCode: record.entrustFlowCode}).then((res) => {
        if (res.code == 200) {
          if (res.data.needSelectNextUser == 2) {
            _this.submitHandle(record.id)
          } else {
            _this.$refs.TaskSubmitModal.show(record, 'list')
          }
        }
      })
    },
    // 本页面提交--不需要下一处理人
    submitHandle(id) {
      postAction(this.url.submitUrl, {id: id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('提交成功')
          this.refresh()
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 复制
    handleCopyItem(record) {
      let url = this.url.copy
      postAction(url, {id: record.id}).then((res) => {
        if (res.code == 200) {
          this.$message.success('复制成功!')
          this.refresh(true)
        }
      })
    },
    // 删除
    handleDelete(id) {
      postAction(this.url.delete, {id: id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh(true)
        }
      })
    },
  },
};
</script>
<style lang="less" scoped>
/deep/ .h-card.ant-card .ant-card-body {
  padding: 0;
}
</style>
