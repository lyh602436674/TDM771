<!--
 * @Author: 雷宇航
 * @Date: 2022-11-16 10:52:49
 * @fileName: ProductCategory.vue
 * @FilePath: tdm771-client\src\views\hifar\hifar-environmental-test\product\ProductCategory.vue
 * @Description: 产品分类页面
-->
<template>
  <div ref='productCategory' class='productCategory'>
    <h-card :bordered='true' fixed>
      <template slot='title'>产品分类</template>
      <h-search
        slot='search-form'
        v-model='queryParams'
        :data='searchBar'
        :showToggleButton='true'
        size='small'
        @change='refresh'
      />
      <div slot='table-operator' style='border-top: 5px'>
        <a-button v-has="'productCategory:add'" icon='plus' size='small' type='ghost-primary' @click='handleAdd("")'>添加
        </a-button>
      </div>
      <h-vex-table
        ref='productCategoryTable'
        slot='content'
        :columns='columns'
        :showSeq="false"
        :data='loadData'
        :rowKey='(record) => record.id'
        :treeConfig="treeConfig"
      >
        <template #categoryName="text, record">
          <a @click="handleEdit(record)">{{ text || '--' }}</a>
        </template>
        <span slot='action' slot-scope='text, record'>
          <a-icon
            v-has="'productCategory:add'"
            class='primary-text'
            style='cursor: pointer'
            title='编辑'
            type='edit'
            @click='() => handleEdit(record)'
          />
          <a-divider v-has="'productCategory:delete'" type='vertical'/>
          <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
            <a-icon
              v-has="'productCategory:delete'"
              class='primary-text'
              style='cursor: pointer'
              theme='twoTone'
              title='删除'
              two-tone-color='#ff4d4f'
              type='delete'
            />
          </a-popconfirm>
          <a-divider v-has="'productCategory:add'" type='vertical'/>
          <a-icon
            v-has="'productCategory:add'"
            class='primary-text'
            style='cursor: pointer'
            title='在此分类下新增'
            type='plus'
            @click="handleAdd({categoryId:record.id})"
          />
        </span>
      </h-vex-table>
      <product-category-modal ref="productCategoryModal" @change="refresh"></product-category-modal>
    </h-card>
  </div>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import ProductCategoryModal from "@views/hifar/hifar-environmental-test/product/modules/ProductCategoryModal";

export default {
  name: "ProductCategory",
  components: {ProductCategoryModal},
  provide() {
    return {
      getContainer: () => this.$refs.productCategory
    }
  },
  watch: {
    treeData: {
      handler(val) {
        if (val.length) {
          setTimeout(() => {
            this.$refs.productCategoryTable.setAllTreeExpand(true)
          })
        }
      }
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      treeConfig: {
        children: "children",
      },
      selectedRowKeys: [],
      selectedRows: [],
      treeData: [],
      url: {
        list: '/HfProductClassifyBusiness/listAll',
        delete: '/HfProductClassifyBusiness/logicRemoveById',
      },
      loadData: (params) => {
        let data = {
          ...this.queryParams,
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            this.treeData = res.data
            return res.data
          }
        })
      },
      searchBar: [
        {
          title: '分类名称',
          key: 'categoryName',
          formType: 'input'
        },
        {
          title: '部门编码',
          key: 'department',
          formType: 'input'
        },
      ],
      // 表头
      columns: [
        {
          title: '分类名称',
          align: 'left',
          dataIndex: 'categoryName',
          treeNode: true,
          scopedSlots: {customRender: 'categoryName'}
        },
        {
          title: '部门编码',
          align: 'left',
          dataIndex: 'department',
        },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'createUserName',
        },
        {
          title: '创建时间 ',
          align: 'center',
          minWidth: 150,
          dataIndex: 'createTime',
          customRender: (text) => {
            return text && text !== '0' ? moment(+text).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '更新时间 ',
          align: 'center',
          minWidth: 150,
          dataIndex: 'updateTime',
          customRender: (text) => {
            return text && text !== '0' ? moment(+text).format('YYYY-MM-DD HH:mm:ss') : '--'
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
          width: 120,
          align: 'center',
          scopedSlots: {customRender: 'action'}
        }
      ]
    }
  },
  methods: {
    refresh() {
      this.$refs.productCategoryTable.refresh(true)
      this.selectedRowKeys = []
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    // 单个删除
    handleDelete(id) {
      postAction(this.url.delete, {id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refresh()
        } else {
          this.$message.warning('删除失败')
        }
      })
    },
    // 添加
    handleAdd(record) {
      this.$refs.productCategoryModal.show(record, '添加')
    },
    // 编辑
    handleEdit(record) {
      this.$refs.productCategoryModal.show(record, '编辑')
    },
  }
}
</script>

<style lang='less' scoped>
.productCategory {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>