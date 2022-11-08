<template>
  <a-drawer title="字典列表" :width="screenWidth" @close="onClose" :visible="visible">
    <!-- 抽屉内容的border -->
    <h-card>
      <div slot="title">
        <a-row :gutter="[10, 10]">
          <a-col :sm="12" :md="8">
            <h-input v-model="queryParam.c_itemValue_7" type="" size="small" placeholder="请输入数据值">
              <span slot="addonBefore">数据值</span>
            </h-input>
          </a-col>
          <a-col :sm="12" :md="8">
            <h-select v-model="queryParam.c_status_1" size="small" placeholder="请选择状态">
              <span slot="addonBefore">状态</span>
              <a-select-option value="1">正常</a-select-option>
              <a-select-option value="2">禁用</a-select-option>
            </h-select>
          </a-col>
          <a-col :sm="12" :md="8">
            <span style="float: left" class="table-page-search-submitButtons">
              <a-button type="primary" icon="search" size="small" @click="searchQuery">搜索</a-button>
              <a-button icon="reload" size="small" style="margin-left: 8px" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </div>
      <div slot="table-operator">
        <a-button size="small" icon="plus" type="primary" @click="handleAdd">新增字典项</a-button>
      </div>
      <div slot="content">
        <a-table
          ref="table"
          rowKey="id"
          size="small"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          @change="handleTableChange"
          :rowClassName="getRowClassname"
        >
          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)">
              <a-icon type="edit" />
              编辑
            </a>
            <a-divider type="vertical" />
            <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
              <a class="danger-text">
                <h-icon type="icon-shanchu" />
                删除
              </a>
            </a-popconfirm>
          </span>
        </a-table>
      </div>
    </h-card>
    <dict-item-modal ref="modalForm" @ok="modalFormOk"></dict-item-modal>
    <!-- 字典数据 -->
  </a-drawer>
</template>

<script>
import { filterObj } from '@/utils/util'
import DictItemModal from './modules/DictItemModal'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

export default {
  name: 'DictItemList',
  mixins: [JeecgListMixin],
  components: { DictItemModal },
  data() {
    return {
      columns: [
        {
          title: '键值',
          align: 'center',
          dataIndex: 'itemKey',
        },
        {
          title: '数据值',
          align: 'center',
          dataIndex: 'itemValue',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 140,
          scopedSlots: { customRender: 'action' },
        },
      ],
      queryParam: {
        dictId: '',
        dictName: '',
        itemText: '',
        delFlag: '1',
        status: [],
      },
      title: '操作',
      visible: false,
      screenWidth: 800,
      model: {},
      dictId: '',
      status: 1,
      labelCol: {
        xs: { span: 5 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 12 },
      },
      validatorRules: {
        itemText: { rules: [{ required: true, message: '请输入名称!' }] },
        itemValue: { rules: [{ required: true, message: '请输入数据值!' }] },
      },
      url: {
        list: '/SysDictItemBusiness/listByDictId',
        delete: '/SysDictItemBusiness/logicRemoveById',
        deleteBatch: '/sys/dictItem/deleteBatch',
      },
    }
  },
  created() {
    // 当页面初始化时,根据屏幕大小来给抽屉设置宽度
    this.resetScreenSize()
  },
  methods: {
    add(dictId) {
      this.dictId = dictId
      this.edit({})
    },
    edit(record) {
      if (record.id) {
        this.dictId = record.id
      }
      this.queryParam = {}
      this.model = Object.assign({}, record)
      this.model.dictId = this.dictId
      this.model.status = this.status
      this.visible = true
      // 当其它模块调用该模块时,调用此方法加载字典数据
      this.loadData()
    },

    getQueryParams() {
      //update--begin--autor:wangshuai-----date:20191204------for：清空总条数 teambition JT-113------
      this.ipagination.total = 0
      //update--end--autor:wangshuai-----date:20191204------for：清空总条数 teambition JT-113------
      var param = Object.assign({}, this.queryParam)
      param.dictId = this.dictId
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      if (this.superQueryParams) {
        param['superQueryParams'] = encodeURI(this.superQueryParams)
        param['superQueryMatchType'] = this.superQueryMatchType
      }
      return filterObj(param)
    },

    // 添加字典数据
    handleAdd() {
      this.$refs.modalForm.add(this.dictId)
      this.$refs.modalForm.title = '新增'
    },
    showDrawer() {
      this.visible = true
    },
    onClose() {
      this.visible = false
      this.dataSource = []
    },
    // 抽屉的宽度随着屏幕大小来改变
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 600) {
        this.screenWidth = screenWidth
      } else {
        this.screenWidth = 600
      }
    },
    //update--begin--autor:wangshuai-----date:20191204------for：系统管理 数据字典禁用和正常区别开，添加背景颜色 teambition JT-22------
    //增加样式方法返回值
    getRowClassname(record) {
      if (record.status == 0) {
        return 'data-rule-invalid'
      }
    },
    //update--end--autor:wangshuai-----date:20191204------for：系统管理 数据字典禁用和正常区别开，添加背景颜色 teambition JT-22------
  },
}
</script>
<style lang="less" scoped>
//update--begin--autor:wangshuai-----date:20191204------for：系统管理 数据字典禁用和正常区别开，添加背景颜色 teambition JT-22------
/deep/ .data-rule-invalid {
  background: #f4f4f4;
  color: #bababa;
}
//update--begin--autor:wangshuai-----date:20191204------for：系统管理 数据字典禁用和正常区别开，添加背景颜色 teambition JT-22------
</style>