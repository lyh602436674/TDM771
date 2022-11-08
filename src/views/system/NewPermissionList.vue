<template>
  <h-card :bordered="false">
    <!-- 操作按钮区域 -->
    <div slot="table-operator">
      <a-button v-has="'menu:add'" size="small" type="ghost-primary" icon="plus" @click="handleAdd">新增菜单</a-button>
      <!-- <a-button size="small" v-if="selectedRowKeys.length > 0" type="danger" icon="delete" @click="batchDel">
        批量删除
      </a-button> -->
    </div>
    <!-- table区域-begin -->
    <div slot="content">
      <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 5px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{
          selectedRowKeys.length
        }}</a
        >项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div> -->
      <a-table
        size="small"
        rowKey="id"
        :scroll="{ x: true }"
        :columns="columns"
        :pagination="false"
        :dataSource="dataSource"
        :loading="loading"
        :expandedRowKeys="expandedRowKeys"
        @expand="expandSubmenu"
        @expandedRowsChange="handleExpandedRowsChange"
      >
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleAddSub(record)">添加下级</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)" placement="topLeft">
                  <a class="danger-text">删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <!-- 字符串超长截取省略号显示 -->
        <span slot="path" slot-scope="text">
          <h-ellipsis :value="text" :length="25" />
        </span>
        <!-- 字符串超长截取省略号显示-->
        <span slot="component" slot-scope="text">
          <h-ellipsis :value="text" />
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <permission-modal ref="modalForm" @ok="modalFormOk" />
  </h-card>
</template>

<script>
import { rebuildRouter } from '@/utils/hasPermission'
import PermissionModal from './modules/PermissionModal'
import { getSystemMenuList, getSystemSubmenu, getSystemSubmenuBatch } from '@/api/api'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'title',
  },
  {
    title: '菜单类型',
    dataIndex: 'menuType',
    customRender: function (text) {
      if (text == 'menu') {
        return '菜单'
      } else if (text == 'menu') {
        return '菜单'
      } else if (text == 'btn') {
        return '按钮/权限'
      } else {
        return text
      }
    },
  },
  {
    title: '图标',
    dataIndex: 'icon',
    customRender: (text) => {
      return text || '--'
    },
  },
  {
    title: '组件',
    dataIndex: 'menuLayout',
    scopedSlots: { customRender: 'component' },
  },
  {
    title: '路径',
    dataIndex: 'path',
    scopedSlots: { customRender: 'path' },
  },
  {
    title: '排序',
    dataIndex: 'rowSort',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    align: 'center',
    fixed: 'right',
    width: 150,
  },
]

export default {
  name: 'PermissionListAsync',
  mixins: [JeecgListMixin],
  components: {
    PermissionModal,
  },
  data() {
    return {
      description: '这是菜单管理页面',
      // 表头
      columns: columns,
      loading: false,
      // 展开的行，受控属性
      expandedRowKeys: [],
      url: {
        delete: '/OrgMenuBusiness/logicRemoveById',
        deleteBatch: '/sys/permission/deleteBatch',
      },
    }
  },
  methods: {
    loadData() {
      this.loading = true
      getSystemMenuList()
        .then((res) => {
          if (res.code == 200) {
            this.dataSource = rebuildRouter(res.data)
            return this.loadDataByExpandedRows(this.dataSource)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    expandSubmenu(expanded, record) {
      if (expanded && (!record.children || record.children.length === 0)) {
        getSystemSubmenu({ parentId: record.id }).then((res) => {
          if (res.success) {
            record.children = res.result
          }
        })
      }
    },
    // 根据已展开的行查询数据（用于保存后刷新时异步加载子级的数据）
    loadDataByExpandedRows(dataList) {
      if (this.expandedRowKeys.length > 0) {
        // return getSystemSubmenuBatch({ parentIds: this.expandedRowKeys.join(',') }).then((res) => {
        //   if (res.success) {
        //     let childrenMap = res.result
        //     let fn = (list) => {
        //       if (list && list.length > 0) {
        //         list.forEach((data) => {
        //           if (this.expandedRowKeys.includes(data.id)) {
        //             data.children = childrenMap[data.id]
        //             fn(data.children)
        //           }
        //         })
        //       }
        //     }
        //     fn(dataList)
        //   }
        // })
      } else {
        return Promise.resolve()
      }
    },
    handleAddSub(record) {
      this.$refs.modalForm.title = '添加子菜单'
      this.$refs.modalForm.edit({ pid: record.id, menuType: 'menu' })
    },
    handleExpandedRowsChange(expandedRows) {
      this.expandedRowKeys = expandedRows
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>