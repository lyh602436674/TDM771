<!--
 * @Author: 雷宇航
 * @Date: 2022-10-09 10:44:38
 * @fileName: productAddModal.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\modules\productAddModal.vue
 * @Description: 新增产品弹框
-->
<template>
  <h-modal
    :getContainer="getContainer"
    :visible="visible"
    destroyOnClose
    :fullScreen="entrustType === '1'"
    inner
    :title="modalTitle"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button type="ghost-danger" @click="handleCancel">关闭</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
    <template v-if="entrustType === '1'">
      <h-search v-model='queryParams' :data='searchForm' class="common-search" size='default' @change='refresh(true)'/>
      <div class="product_table">
        <vxe-table
          ref="xTable"
          size="small"
          :auto-resize="true"
          :data="productData"
          :edit-config="{ trigger: 'click', mode: 'row'}"
          :edit-rules="validRules"
          :checkbox-config="{ highlight: true, strict: true, trigger: 'row' }"
          :valid-config="{ showMessage:false }"
          border
          keep-source
          show-overflow
          @checkbox-all='onSelectAllChange'
          @checkbox-change="onSelectChange"
        >
          <vxe-table-column align="center" type="checkbox" width="60"></vxe-table-column>
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <vxe-table-column
            field="productName"
            title="产品名称"
          />
          <vxe-table-column
            field="productAlias"
            title="产品代号"
          />
          <vxe-table-column
            :edit-render="{}"
            field="pieceNo"
            title="产品编号"
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
      </div>
    </template>
    <template v-if="entrustType === '2'">
      <h-form
        ref="addProductForm"
        v-model="model"
        :column="1"
        :formData='formData'
        @change="formChange"
      >
      </h-form>
      <div class="help">产品编号：连续的编号请以' - '分隔，其他情况请以' , '分隔</div>
    </template>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import {pick} from 'lodash'

export default {
  name: "productAddModal",
  inject: {
    getContainer: {
      default: () => document.body,
    },
  },
  props: {
    entrustType: {
      type: String,
    },
  },
  computed: {
    modalTitle() {
      return {"1": "选择产品", "2": "新增产品"}[this.entrustType]
    },
  },
  data() {
    return {
      visible: false,
      model: {},
      queryParams: {},
      productData: [],
      searchForm: [
        {
          title: '产品名称',
          key: 'c_productName_7',
          formType: 'input'
        },
        {
          title: '产品代号',
          key: 'c_productAlias_7',
          formType: 'input'
        },
      ],
      pagination: {
        pageNo: 1,
        pageSize: 15,
        total: 0,
      },
      formData: [
        {
          title: '产品名称',
          key: 'productName',
          formType: 'input',
        },
        {
          title: '产品代号',
          key: 'productAlias',
          formType: 'input',
        },
        {
          title: '编号前缀',
          key: 'piecePrefix',
          formType: 'input',
          style: {
            width: '100%',
          }
        },
        {
          title: '编号',
          key: 'pieceNo',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入产品编号',}],
          }
        },
        {
          title: '产品数量',
          key: 'pieceNum',
          formType: 'input-number',
          style: {
            width: '100%',
          }
        },
      ],
      validRules: {
        pieceNum: [{required: true, type: 'number', min: 1, max: 200}],
      },
      url: {
        list: '/HfProductBaseBusiness/listPage',
      },
      selectedRows: [],
      selectedRowKeys: [],
    }
  },
  methods: {
    show() {
      this.visible = true
      if (this.entrustType === '1') {
        this.refresh(true)
      }
    },
    formChange(values) {
      this.$emit('callback', values)
      this.$refs.addProductForm.form.resetFields()
      this.handleCancel()
    },
    async handleOk() {
      if (this.entrustType === '1') {
        this.$emit('callback', this.selectedRows)
        this.handleCancel()
      }
      if (this.entrustType === '2') {
        this.$refs.addProductForm.validateForm()
      }
    },
    handleCancel() {
      this.visible = false
    },
    refresh(bool = false) {
      if (bool) {
        this.pagination.pageNo = 1
      }
      this.loadData(pick(this.pagination, ['pageNo', 'pageSize']))
    },
    onSelectChange({records}) {
      this.selectedRows = records
      this.selectedRowKeys = records.map(item => item.id)
    },
    onSelectAllChange({records}) {
      this.selectedRows = records
      this.selectedRowKeys = records.map(item => item.id)
    },
    loadData(params) {
      if (this.loading) return
      this.loading = true
      let data = {
        ...params,
        ...this.queryParams,
      }
      postAction(this.url.list, data).then((res) => {
        if (res.code === 200) {
          this.productData = res.data.data
          this.pagination = {
            pageNo: res.data.pageNo,
            pageSize: res.data.pageSize,
            total: res.data.totalCount,
          }
        }
      }).finally(() => {
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
  }
}
</script>

<style scoped>
.help {
  width: 100%;
  color: red;
  text-align: center;
}
</style>
<style lang='less' scoped>
/deep/ .common-search .ant-row-flex {
  margin: 0 !important;
}

.product-record-pagination {
  padding: 10px 30px 0;
  text-align: right;
  width: 100%;
}

/deep/ .product_table .vxe-table .vxe-body--column.col--valid-error .vxe-cell--valid .vxe-cell--valid-msg {
  background: transparent !important;
}
</style>