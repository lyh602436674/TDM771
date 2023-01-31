<template>
  <div ref='productList' class='product-list'>
    <r-l-layout :leftMinWidth="250" style="height: 100%">
      <template slot="left">
        <div style="height: 100%;">
          <h-edit-tree
            defaultExpandAll
            ref="productTree"
            :replaceFields="replaceFields"
            :selectedKeys="selectedTreeKeys"
            :tree="treeData"
            title="产品分类"
            @onSelect="onTreeSelect"
          >
            <template slot="extra"></template>
            <a-input-search
              slot="search-form"
              v-model="queryTreeParams.keyWord"
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
        <h-card :bordered='true' fixed>
          <template slot='title'>产品管理</template>
          <h-search
            slot='search-form'
            v-model='queryParams'
            :data='searchBar'
            :showToggleButton='true'
            size='small'
            @change='refresh'
          />
          <div slot='table-operator' style='border-top: 5px'>
            <a-button v-has="'product:add'" icon='plus' size='small' type='ghost-primary' @click='handleAdd'>添加
            </a-button>
            <a-button v-has="'product:delete'" icon='delete' size='small' type='danger' @click='batchDel'>
              批量删除
            </a-button>
          </div>
          <h-vex-table
            ref='materialTable'
            slot='content'
            :columns='columns'
            :data='loadData'
            :row-selection='{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }'
            :rowKey='(record) => record.id'
            :scroll='{ x: true }'
          >
            <span slot='productAlias' slot-scope='text, record'>
              <a @click='handleDetailCode(record)'>
                {{ record.productAlias ? record.productAlias : '--' }}
              </a>
            </span>
            <span slot='action' slot-scope='text, record'>
              <a-icon
                class='primary-text'
                style='cursor: pointer'
                title='编辑'
                type='edit'
                @click='() => handleEdit(record)'
              />
              <a-divider type='vertical'/>
              <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
                <a-icon
                  class='primary-text'
                  style='cursor: pointer'
                  theme='twoTone'
                  title='删除'
                  two-tone-color='#ff4d4f'
                  type='delete'
                />
              </a-popconfirm>
            </span>
          </h-vex-table>
        </h-card>
      </div>
    </r-l-layout>
    <product-modal ref='productModal' @change='refresh'></product-modal>
  </div>
</template>

<script>
import moment from 'moment'
import {getAction, postAction} from '@/api/manage'
import productModal from './modules/productModal.vue'
import HEditTree from '@/views/components/HEditTree.js'

export default {
  components: {
    productModal,
    HEditTree
  },
  provide() {
    return {
      getContainer: () => this.$refs.productList
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      selectedRowKeys: [],
      replaceFields: {
        children: 'children',
        title: 'categoryName',
        key: 'id',
      },
      selectedTreeKeys: [],
      treeData: [],
      queryTreeParams: {
        keyWord: "",
      },
      url: {
        list: '/HfProductBaseBusiness/listPage',
        delete: '/HfProductBaseBusiness/logicRemoveById',
        tree: "/HfProductClassifyBusiness/listAll",
      },
      detailData: {},
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params,
          c_classifyId_1: this.selectedTreeKeys.toString()
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      searchBar: [
        {
          title: '产品代号',
          key: 'c_productAlias_7',
          formType: 'input'
        },
        {
          title: '产品名称',
          key: 'c_productName_7',
          formType: 'input'
        },
        {
          title: '产品型号',
          key: 'c_productModel_7',
          formType: 'input'
        },
        {
          title: '产品图号',
          key: 'c_productChartNo_7',
          formType: 'input'
        },
        {
          title: '阶段',
          key: 'c_productStage_7',
          formType: 'dict',
          dictCode: 'hf_product_stage',
        },
        {
          title: '有效性',
          key: 'c_productEffect_1',
          formType: 'select',
          options: [
            {title: '正常', value: 1, key: 1},
            {title: '停用', value: 2, key: 2}
          ]
        },
      ],
      // 表头
      columns: [
        {
          title: '产品代号',
          align: 'left',
          dataIndex: 'productAlias',
          scopedSlots: {customRender: 'productAlias'}
        },
        {
          title: '产品名称',
          dataIndex: 'productName',
          align: 'left',
        },
        {
          title: '产品型号',
          align: 'left',
          dataIndex: 'productModel'
        },
        {
          title: '规格大小',
          align: 'left',
          dataIndex: 'productSpec'
        },
        {
          title: '产品图号',
          align: 'left',
          dataIndex: 'productChartNo'
        },
        {
          title: '阶段',
          align: 'left',
          dataIndex: 'productStage_dictText'
        },
        {
          title: '有效性',
          align: 'left',
          dataIndex: 'productEffect',
          customRender: (text) => {
            return text === 1 ? '正常' : '停用'
          }
        },
        {
          title: '创建人 ',
          align: 'left',
          dataIndex: 'createUserName',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '创建时间 ',
          align: 'left',
          dataIndex: 'createTime',
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD') : '--'
          }
        },
        {
          title: '备注 ',
          align: 'left',
          dataIndex: 'remarks',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 100,
          align: 'center',
          scopedSlots: {customRender: 'action'}
        }
      ]
    }
  },
  created() {
    this.loadLeftTree()
  },
  methods: {
    refresh() {
      this.$refs.materialTable.refresh(true)
      this.selectedRowKeys = []
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    onTreeSelect(selectedKeys, event) {
      this.selectedTreeKeys = selectedKeys
      this.refresh()
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
      getAction(this.url.tree).then((res) => {
        if (res.code === 200) {
          this.treeData = this.recursive(res.data)
        }
      }).finally(() => this.confirmLoading = false)
    },
    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, {id: id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
        } else {
          this.$message.warning('删除失败')
        }
      })
    },
    // 批量删除
    batchDel() {
      let _this = this
      if (_this.selectedRowKeys.length) {
        this.$confirm({
          title: '确认删除',
          content: '删除后不可恢复，确认删除？',
          onOk: function() {
            postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
              if (res.code === 200) {
                _this.$message.success('删除成功')
                _this.refresh()
                _this.selectedRowKeys = []
                _this.selectedRows = []
              } else {
                _this.$message.warning(res.msg)
              }
            })
          }
        })
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    // 添加
    handleAdd() {
      let record = {
        productEffect: 1
      }
      this.$refs.productModal.show(record, '添加')
    },
    // 编辑
    handleEdit(record) {
      this.$refs.productModal.show(record, '编辑')
    },
    // 详情
    handleDetail(record) {
      this.detailData = record
      this.$refs.productDetailModal.showModal()
    },
    // 点击产品代号跳转详情
    handleDetailCode(record) {
      this.handleDetail(record)
    }
  }
}
</script>

<style lang='less' scoped>
.product-list {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>