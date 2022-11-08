<!--
 * @Author: 赵峰
 * @Date: 2021-09-16 11:20:56
 * @LastEditTime: 2021-11-05 14:53:31
 * @LastEditors: 赵峰
 * @Descripttion: 环境试验---试品选择
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\entrustment\modules\ProductSelectModal.vue
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :visible="visible"
    destroyOnClose
    fullScreen
    inner
    title="选择试品"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <a-alert v-if="messageErrorShow" :message="messageError" show-icon type="error"/>
    <h-search v-model='queryParams' :data='searchForm' class="common-search" size='default' @change='refresh(true)'/>
    <h-card :border="false" class="product_table">
      <vxe-table
        ref="xTable"
        :auto-resize="true"
        :data="tableProductData"
        :edit-config="{
          trigger: 'click',
          mode: 'row',
        }"
        :edit-rules="validRules"
        :radio-config="{ highlight: true, strict: true, trigger: 'row' }"
        :valid-config="{showMessage:false}"
        border
        keep-source
        show-overflow
        @radio-change="onSelectChange"
      >
        <vxe-table-column align="center" type="radio" width="60"></vxe-table-column>
        <vxe-table-column type="seq" width="60"></vxe-table-column>
        <vxe-table-column
          field="productCode"
          title="试品工号"
        />
        <vxe-table-column
          field="productAlias"
          title="试品代号"
        />
        <vxe-table-column
          field="productName"
          title="试品名称"
        />
        <vxe-table-column
          field="baseNumberCode"
          title="机号范围"
        />
        <vxe-table-column
          :edit-render="{}"
          field="pieceNo"
          title="试品编号"
        >
          <template #edit="{row,rowIndex}">
            <a-input v-model="row.pieceNo"></a-input>
          </template>
        </vxe-table-column>
      </vxe-table>
      <div class="product-record-pagination">
        <a-pagination
          v-model="pagination.pageNo"
          :pageSize="pagination.pageSize"
          :pageSizeOptions="['20', '30', '40', '50', '100']"
          :showTotal="showTotal"
          :total="pagination.total"
          showSizeChanger
          size="small"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
        />
      </div>
    </h-card>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import {pick} from 'lodash'

export default {
  components: {},
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },

  data() {
    return {
      searchForm: [
        {
          title: '试品工号',
          key: 'c_productCode_7',
          formType: 'input'
        },
        {
          title: '试品名称',
          key: 'c_productName_7',
          formType: 'input'
        },
        {
          title: '试品代号',
          key: 'c_productAlias_7',
          formType: 'input'
        },
      ],
      visible: false,
      loading: false,
      nameDisabled: true,
      messageErrorShow: false,
      messageError: '',
      queryParams: {},
      url: {
        list: '/HfProductBaseBusiness/listPage',
      },
      selectedRowKeys: {},
      tableProductData: [],
      pagination: {
        pageNo: 1,
        pageSize: 20,
        total: 0,
      },
      validRules: {
        pieceNum: [{required: true, type: 'number', min: 1, max: 200}],
        // startNum: [{ required: true, message: '启始号不能为空' }],
      },
    }
  },
  methods: {
    show() {
      this.visible = true
      this.refresh(true)
    },
    handleCancel() {
      this.visible = false
    },
    openNotificationWithIcon(type, desc) {
      this.$notification[type]({
        duration: 2,
        message: '请选择',
        description: desc,
      })
    },
    refresh(bool = false) {
      if (bool) {
        this.pagination.pageNo = 1
      }
      this.loadData(pick(this.pagination, ['pageNo', 'pageSize']))
    },
    //  单选
    onSelectChange(records) {
      this.rowValidate()
    },
    loadData(params) {
      if (this.loading) return
      this.loading = true
      let data = {
        ...params,
        ...this.queryParams,
      }
      postAction(this.url.list, data)
        .then((res) => {
          if (res.code == 200) {
            res.data.data.map((item) => {
              ;(item.startNum = ''), (item.pieceNum = ''), (item.pieceNoPrefix = ''), (item.pieceNoSuffix = '')
            })
            this.tableProductData = res.data.data
            this.pagination = {
              pageNo: res.data.pageNo,
              pageSize: res.data.pageSize,
              total: res.data.totalCount,
            }
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handlePageChange(v) {
      this.pagination.current = v
      this.refresh(false)
    },
    handleSizeChange(v, s) {
      this.pagination = Object.assign({}, this.pagination, {
        pageNo: 1,
        pageSize: s,
      })
      this.$nextTick(() => {
        this.refresh(true)
      })
    },
    showTotal(total, range) {
      return range[0] + '-' + range[1] + ' 共' + total + '条'
    },
    async rowValidate() {
      const $table = this.$refs.xTable
      const selectRecords = $table.getRadioRecord()
      if (selectRecords) {
        const errMap = await $table.validate(selectRecords).catch((errMap) => errMap)
        if (!errMap) {
          return selectRecords
        }
      } else {
        this.openNotificationWithIcon('error', '请选择试品数据！')
        return false
      }
    },
    async handleSubmit() {
      let res = await this.rowValidate()
      if (res) {
        let data = {
          productId: res.id,
          // pieceNoPrefix: res.pieceNoPrefix,
          // pieceNoSuffix: res.pieceNoSuffix,
          // startNum: res.startNum,
          // pieceNum: res.pieceNum,
          productAlias: res.productAlias,
          productCode: res.productCode,
          productName: res.productName,
          pieceNo: res.pieceNo,
        }
        this.$emit('change', data)
        this.handleCancel()
      }
    },
  },
}
</script>
<style lang='less' scoped>
/deep/ .common-search .ant-row-flex {
  margin: 0 !important;
}

.product-record-pagination {
  padding: 10px 10px 0;
  text-align: right;
  width: 100%;
  border-top: solid 1px @border-color-base;
}

/deep/ .product_table .vxe-table .vxe-body--column.col--valid-error .vxe-cell--valid .vxe-cell--valid-msg {
  background: transparent !important;
}
</style>