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
      <r-l-layout :leftMinWidth="250" style="height: 100%">
        <template slot="left">
          <div style="height: 100%;">
            <h-edit-tree
              ref="productTree"
              defaultExpandAll
              :replaceFields="replaceFields"
              :selectedKeys="selectedTreeKeys"
              :tree="treeData"
              title="产品分类"
              @onSelect="onTreeSelect"
            >
              <template slot="extra"></template>
              <a-input-search
                slot="search-form"
                v-model="queryTreeParams.categoryName"
                allowClear
                enter-button="搜索"
                placeholder="请输入分类名称"
                size="small"
                @search="loadLeftTree"
                @keyup.enter.native="loadLeftTree"
              />
            </h-edit-tree>
          </div>
        </template>
        <div slot="right" style="height:100%;border-left: 1px solid #e8e8e8">
          <h-search v-model='queryParams' :data='searchForm' class="common-search" size='default'
                    @change='refresh(true)'/>
          <div class="switcher">
            <span class="change">自动生成编号</span>
            <h-switch
              v-model="autoCreate"
              :defaultChecked="false"
              :options="[1, 2]"
              @change="autoCreateChange"
            />
          </div>
          <div class="product_table">
            <vxe-table
              ref="xTable"
              :auto-resize="true"
              :checkbox-config="{ highlight: true, strict: true}"
              :data="productData"
              :edit-config="{ trigger: 'click', mode: 'row'}"
              :edit-rules="validRules"
              :valid-config="{ showMessage:false }"
              border
              keep-source
              show-overflow
              size="small"
              style="width: 100%"
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
              <template v-if="autoCreate === 1">
                <vxe-table-column
                  :edit-render="{
                    name: 'input',
                    attrs: { type: 'text', placeholder: '请输入编号前缀' },
                  }"
                  field="piecePrefix"
                  title="编号前缀"
                />
                <vxe-table-column
                  :edit-render="{
                    name: 'input',
                    attrs: { type: 'number', placeholder: '请输入起始号' },
                  }"
                  field="pieceStartNo"
                  title="起始号"
                />
              </template>
              <vxe-table-column
                :edit-render="{
                    showAsterisk:true,
                    name: 'input',
                    attrs: { type: 'number', placeholder: '请输入数量' },
                }"
                field="pieceNum"
                title="数量"
              />
            </vxe-table>
            <div class="product-record-pagination">
              <a-pagination
                v-model="pagination.pageNo"
                :pageSize="pagination.pageSize"
                :pageSizeOptions="['15','20', '30', '40', '50', '100']"
                :showTotal="showTotal"
                :total="pagination.total"
                showSizeChanger
                size="small"
                @change="handlePageChange"
                @showSizeChange="handleSizeChange"
              />
            </div>
          </div>
        </div>
      </r-l-layout>
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
import {getAction, postAction} from '@/api/manage'
import {pick} from 'lodash'
import HEditTree from '@/views/components/HEditTree.js'

export default {
  name: "productAddModal",
  components: {
    HEditTree
  },
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
    const pieceTableValid = ({cellValue}, msg) => {
      return new Promise((resolve, reject) => {
        if (!cellValue) {
          reject(new Error(msg))
        } else {
          resolve()
        }
      })
    }
    return {
      visible: false,
      model: {},
      queryParams: {},
      queryTreeParams: {
        keyWord: "",
      },
      productData: [],
      selectedTreeKeys: [],
      treeData: [],
      replaceFields: {
        children: 'children',
        title: 'categoryName',
        key: 'id',
      },
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
            rules: [{required: true, message: '请输入编号',}],
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
        pieceNum: [{
          required: true,
          type: 'number',
          min: 1,
          max: 200,
          validator: (params) => pieceTableValid(params, '请输入产品数量')
        }],
        pieceStartNo: [{
          required: true,
          validator: (params) => pieceTableValid(params, '请输入起始号')
        }],
      },
      url: {
        list: '/HfProductBaseBusiness/listPage',
        tree: "/HfProductClassifyBusiness/listAll",
      },
      selectedRows: [],
      selectedRowKeys: [],
      autoCreate: 2,
    }
  },
  methods: {
    show() {
      this.visible = true
      this.autoCreate = 2
      if (this.entrustType === '1') {
        this.loadLeftTree()
        this.refresh(true)
      }
    },
    recursive(arr) {
      return arr.map(item => {
        return {
          ...item,
          title: item.categoryName,
          key: item.id,
          value: item.id,
          children: item.children && item.children.length ? this.recursive(item.children) : []
        }
      })
    },
    loadLeftTree() {
      getAction(this.url.tree, {...this.queryTreeParams}).then((res) => {
        if (res.code === 200) {
          this.treeData = this.recursive(res.data)
        }
      }).finally(() => this.confirmLoading = false)
    },
    onTreeSelect(selectedKeys, event) {
      this.selectedTreeKeys = selectedKeys
      this.refresh()
    },
    formChange(values) {
      this.$emit('callback', values)
      this.$refs.addProductForm.form.resetFields()
      this.handleCancel()
    },
    autoCreateChange(val) {
      this.autoCreate = val
    },
    async handleOk() {
      if (this.entrustType === '1') {
        if (!this.selectedRows.length) return this.$message.warning('请选择产品')
        try {
          await this.$refs.xTable.validate(this.selectedRows)
          this.$emit('callback', this.selectedRows)
          this.handleCancel()
        } catch {
        }
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
        c_classifyId_1: this.selectedTreeKeys.toString(),
        queryType: 'entrust'
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

<style lang='less' scoped>
.switcher {
  text-align: right;
  display: inline-block;
  width: 100%;
  padding: 0 20px 10px;

  .change {
    vertical-align: middle;
    padding-right: 5px;
    font-size: 16px;
  }
}


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
  padding: 10px 0;
  text-align: right;
  width: 100%;
}


/deep/ .product_table .vxe-table .vxe-body--column.col--valid-error .vxe-cell--valid {
  width: 100%;
}
</style>