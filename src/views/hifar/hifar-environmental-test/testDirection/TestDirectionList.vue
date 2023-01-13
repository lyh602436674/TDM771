<template>
  <div ref='testDirection' class='testDirection'>
    <h-card :bordered='true' fixed>
      <template slot='title'>试验方向</template>
      <h-search
        slot='search-form'
        v-model='queryParams'
        :data='searchBar'
        :showToggleButton='true'
        size='small'
        @change='refresh'
      />
      <div slot='table-operator' style='border-top: 5px'>
        <a-button v-has="'testDirection:add'" icon='plus' size='small' type='ghost-primary' @click='handleAdd("")'>新增
        </a-button>
      </div>
      <h-vex-table
        ref='productCategoryTable'
        slot='content'
        :treeConfig="{children: 'children',expandRowKeys}"
        :columns='columns'
        :showSeq="false"
        :data='loadData'
        rowKey='id'
        :scroll='{ x: true }'
      >
        <template #directionName="text, record">
          <a @click="handleEdit(record)">{{ text || '--' }}</a>
        </template>
        <span slot='action' slot-scope='text, record'>
          <a-icon
            class='primary-text'
            style='cursor: pointer'
            title='编辑'
            type='edit'
            @click='() => handleEdit(record)'
          />
          <a-divider v-has="'testDirection:delete'" type='vertical'/>
          <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
            <a-icon
              v-has="'testDirection:delete'"
              class='primary-text'
              style='cursor: pointer'
              theme='twoTone'
              title='删除'
              two-tone-color='#ff4d4f'
              type='delete'
            />
          </a-popconfirm>
          <a-divider v-has="'testDirection:add'" type='vertical'/>
          <a-icon
            v-has="'testDirection:add'"
            class='primary-text'
            style='cursor: pointer'
            title='在此分类下新增'
            type='plus'
            @click="handleAdd({pid:record.id})"
          />
        </span>
      </h-vex-table>
      <test-direction-modal ref="testDirectionModal" @change="handleModalChange"/>
    </h-card>
  </div>
</template>

<script>
import moment from "moment";
import {postAction} from "@api/manage";
import TestDirectionModal from "@views/hifar/hifar-environmental-test/testDirection/modules/TestDirectionModal";

export default {
  name: "TestDirectionList",
  components: {TestDirectionModal},
  provide() {
    return {
      getContainer: () => this.$refs.testDirection
    }
  },
  data() {
    return {
      moment,
      queryParams: {},
      expandRowKeys: [],
      selectedRowKeys: [],
      selectedRows: [],
      url: {
        listTree: '/HfResTestDirection/listTree',
        delete: '/HfResTestDirection/logicRemoveById',
      },
      loadData: (params) => {
        let data = {
          ...this.queryParams,
        }
        return postAction(this.url.listTree, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      searchBar: [
        {
          title: '分类',
          key: 'c_directionName_7',
          formType: 'input'
        },
        {
          title: '状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '正常',
              key: 1,
              value: 1
            },
            {
              title: '停用',
              key: 2,
              value: 2
            },
          ]
        },
        {
          title: '备注信息',
          key: 'c_remarks_7',
          formType: 'input'
        },

      ],
      // 表头
      columns: [
        {
          title: '分类名称',
          align: 'left',
          dataIndex: 'directionName',
          treeNode: true,
          scopedSlots: {customRender: 'directionName'}
        },
        {
          title: '本级排序号',
          align: 'center',
          dataIndex: 'rowSort',
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'status',
          customRender: (text) => {
            return text === 1 ? '正常' : text === 2 ? '停用' : '--'
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
          title: '备注信息',
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
    handleModalChange(record) {
      this.refresh()
      this.expandRowKeys = [record.pid]
    },
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
      this.$refs.testDirectionModal.show(record, '新增')
    },
    // 编辑
    handleEdit(record) {
      this.$refs.testDirectionModal.show(record, '编辑')
    },
  }
}
</script>

<style lang="less" scoped>
.testDirection {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>