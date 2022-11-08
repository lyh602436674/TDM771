<!--
 * @Author: 赵峰
 * @Date: 2021-09-16 13:51:34
 * @LastEditTime: 2021-11-30 13:42:08
 * @LastEditors: 马潭龙
 * @Descripttion: 试品管理
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\product\ProductList.vue
-->
<template>
  <div ref='productList' class='product-list'>
    <h-card fixed :bordered='true'>
      <template slot='title'>试品管理</template>
      <h-search
        v-model='queryParams'
        slot='search-form'
        size='small'
        :showToggleButton='true'
        :data='searchBar'
        @change='refresh'
      />
      <div slot='table-operator' style='border-top: 5px'>
        <a-button v-has="'product:add'" size='small' @click='handleAdd' type='ghost-primary' icon='plus'>添加</a-button>
        <template>
          <a-button v-has="'product:delete'" type='danger' size='small' icon='delete' @click='batchDel'>
            批量删除
          </a-button>
        </template>
      </div>

      <h-vex-table
        slot='content'
        ref='materialTable'
        :scroll='{ x: true }'
        :columns='columns'
        :data='loadData'
        :rowKey='(record) => record.id'
        :row-selection='{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }'
      >
        <span slot='productAlias' slot-scope='text, record'>
          <a href='javascript:;' @click='handleDetailCode(record)'>
            {{ record.productAlias ? record.productAlias : '--' }}
          </a>
        </span>
        <span slot='action' slot-scope='text, record'>
          <a-icon
            type='edit'
            title='编辑'
            class='primary-text'
            style='cursor: pointer'
            @click='() => handleEdit(record)'
          />
          <a-divider type='vertical' />
          <a-icon
            type='eye'
            title='详情'
            class='primary-text'
            style='cursor: pointer'
            @click='() => handleDetail(record)'
          />
          <a-divider type='vertical' />
          <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
            <a-icon
              type='delete'
              title='删除'
              class='primary-text'
              style='cursor: pointer'
              theme='twoTone'
              two-tone-color='#ff4d4f'
            />
          </a-popconfirm>
        </span>
      </h-vex-table>
      <product-modal ref='productModal' @change='refresh'></product-modal>
      <product-detail-modal ref='productDetailModal' :detail='detailData' :config='formData'></product-detail-modal>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import productModal from './modules/productModal.vue'
import productDetailModal from './modules/productDetailModal.vue'
import mixin from '@/views/hifar/hifar-environmental-test/mixin.js'

export default {
  components: {
    productModal,
    productDetailModal
  },
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => this.$refs.productList
    }
  },
  data() {
    return {
      moment,
      queryParams: {
        c_productType_1: 'inside'
      },
      selectedRowKeys: [],
      url: {
        list: '/HfProductBaseBusiness/listPage',
        delete: '/HfProductBaseBusiness/logicRemoveById'
      },
      detailData: {},
      loadData: (params) => {
        let data = {
          ...this.queryParams,
          ...params
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code == 200) {
            return res.data
          }
        })
      },
      searchBar: [
        {
          title: '试品代号',
          key: 'c_productAlias_7',
          formType: 'input'
        },
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
          title: '试品型号',
          key: 'c_productModel_7',
          formType: 'input'
        },
        // {
        //   title: '试品图号',
        //   key: 'c_drawNo_7',
        //   formType: 'input'
        // },
        // {
        //   title: '试品规格',
        //   key: 'c_productSpec_7',
        //   formType: 'input'
        // }
      ],
      formData: [
        {
          title: '试品代号',
          key: 'productAlias',
          formType: 'input'
        },
        {
          title: '试品工号',
          key: 'productCode',
          formType: 'input'
        },
        {
          title: '试品名称',
          key: 'productName',
          formType: 'input'
        },
        {
          title: '试品型号',
          key: 'productModel',
          formType: 'input'
        },
        // {
        //   title: '图号',
        //   key: 'drawNo',
        //   formType: 'input'
        // },
        // {
        //   title: '试品规格',
        //   key: 'productSpec',
        //   formType: 'input'
        // },
        {
          title: '机号范围',
          key: 'baseNumberCode',
          formType: 'input'
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          span: 2
        }
      ],
      // 表头
      columns: [
        {
          title: '试品工号',
          align: 'left',
          dataIndex: 'productCode'
        },
        {
          title: '试品代号',
          align: 'left',
          dataIndex: 'productAlias',
          scopedSlots: {customRender: 'productAlias'}
        },
        {
          title: '试品名称',
          align: 'left',
          dataIndex: 'productName'
        },
        {
          title: '机号范围 ',
          align: 'left',
          dataIndex: 'baseNumberCode',
          customRender: (text, record) => {
            return text || '--'
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
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 100,
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    }
  },
  methods: {
    refresh() {
      this.$refs.materialTable.refresh(true)
      this.selectedRowKeys = []
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, { id: id }).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
        } else {
          this.$message.warning('删除失败')
        }
      })
    },

    // // 批量删除
    // batchDel() {
    //   let _this = this
    //   this.$confirm({
    //     title: '确认删除',
    //     content: '删除后不可恢复，确认删除？',
    //     onOk: function () {
    //       postAction(_this.url.delete, { id: _this.selectedRowKeys.join() }).then((res) => {
    //         if (res.code === 200) {
    //           _this.$message.success('删除成功')
    //           _this.refresh()
    //           _this.selectedRowKeys = []
    //         } else {
    //           _this.$message.warning('删除失败')
    //         }
    //       })
    //     },
    //   })
    // },
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
      let record = {}
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
    // 点击试品代号跳转详情
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