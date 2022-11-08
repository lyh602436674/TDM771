<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-27 09:31:14
 * @LastEditTime: 2021-08-31 16:03:11
 * @LastEditors: 陈乾龙
 * @Description: 签名签章管理
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\signature\Signature.vue
-->
<template>
  <div ref="signature" style="height: 100%; width: 100%">
    <h-card fixed title="签名签章">
      <h-search v-model="queryParams" slot="search-form" :data="searchForm" @change="refresh" />
      <h-vex-table ref="signatureTable" slot="content" :columns="columns" :data="loadData">
        <template slot="autographUrl" slot-scope="text, record">
          <viewer>
            <img v-if="text" :src="text" alt="" srcset="" style="display: inline-block; width: 20px; height: 20px" />
            <img
              v-else
              src="../../../../assets/signature-name.png"
              alt=""
              srcset=""
              style="display: inline-block; width: 20px; height: 20px"
            />
          </viewer>
        </template>
        <template slot="signatureUrl" slot-scope="text, record">
          <viewer>
            <img v-if="text" :src="text" alt="" srcset="" style="display: inline-block; width: 20px; height: 20px" />
            <img
              v-else
              src="../../../../assets/signature-stamp.png"
              alt=""
              srcset=""
              style="display: inline-block; width: 20px; height: 20px"
            />
          </viewer>
        </template>
        <template slot="actions" slot-scope="text, record">
          <a-icon type="setting" class="primary-text" title="设置签名签章" @click="() => handleSetSignature(record)" />
        </template>
      </h-vex-table>
    </h-card>
    <signature-upload ref="signatureUpload" @change="refresh"></signature-upload>
  </div>
</template>

<script>
import moment from 'moment'
import { postAction } from '@/api/manage'
import SignatureUpload from './modules/SignatureUpload.vue'
export default {
  provide() {
    return {
      getContainer: () => this.$refs.signature,
    }
  },
  components: { SignatureUpload },
  data() {
    return {
      queryParams: {},
      searchForm: [
        {
          title: '用户名称',
          key: 'c_idName_7',
          formType: 'input',
        },
        {
          title: '用户账号',
          key: 'c_userCode_7',
          formType: 'input',
        },
        {
          title: '手机号码',
          key: 'c_mobile_7',
          formType: 'input',
        },
        {
          title: '座机号码',
          key: 'c_telephone_7',
          formType: 'input',
        },
      ],
      columns: [
        {
          title: '用户名称',
          dataIndex: 'idName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '用户账号',
          dataIndex: 'userCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '用户性别',
          dataIndex: 'sex',
          customRender: (text) => {
            return text == 1 ? '男' : text == 2 ? '女' : '保密'
          },
        },
        {
          title: '用户电话',
          dataIndex: 'mobile',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '座机号',
          dataIndex: 'telephone',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '签名',
          width: 60,
          align: 'center',
          scopedSlots: {
            customRender: 'autographUrl',
          },
        },
        {
          title: '签章',
          width: 60,
          align: 'center',
          scopedSlots: {
            customRender: 'signatureUrl',
          },
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          customRender: (text) => {
            return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
        },
        {
          title: '操作',
          dataIndex: 'actions',
          width: 80,
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      url: {
        list: '/SysSignatureBusiness/listPage',
      },
    }
  },
  methods: {
    refresh(bool = false) {
      this.$refs.signatureTable.refresh(bool)
    },
    loadData(params) {
      let data = {
        ...params,
        ...this.queryParams,
      }
      return postAction(this.url.list, data).then((res) => {
        if (res.code == 200) {
          return res.data
        }
      })
    },
    handleSetSignature(record) {
      this.$refs.signatureUpload.show(record)
    },
  },
}
</script>
