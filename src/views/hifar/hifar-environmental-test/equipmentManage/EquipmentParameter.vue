<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-15 09:43:47
 * @LastEditTime: 2021-11-25 13:46:41
 * @LastEditors: 赵峰
 * @Description: 设备参数
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\equipmentManage\EquipmentParameter.vue
-->
<template>
  <div ref="equipmentParameter" style="height: 100%; width: 100%; position: relative">
    <r-l-layout style="height: 100%">
      <div slot="left" class="ep-left" style="height: 100%; overflow: auto">
        <h-card fixed title="设备列表">
          <a-input-search
            slot="search-form"
            v-model="equipQuery.keyWord"
            allowClear
            enter-button="搜索"
            placeholder="请输入设备名称或设备型号或设备编号"
            size="small"
            @search="getEquipmentTree"
            @keyup.enter.native="getEquipmentTree"
          />
          <a-tree
            v-if="equipmentTree.length"
            :replaceFields="replaceFields"
            :selectedKeys="selectedKeys"
            :treeData="equipmentTree"
            size="small"
            style="overflow: auto"
            @select="onTreeNodeSelect"
          >
            <div slot="customTitle" slot-scope="record" class="custom-title">
              <div>
                <h-icon class="warning-text" type="icon-xiangmuchengyuan"/>
                <span>
                  {{ record.title }}
                </span>
              </div>
            </div>
          </a-tree>
          <a-empty
            v-else
            style="
              height: 100%;
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
            "
          />
        </h-card>
      </div>
      <div slot="right" style="height: 100%; background: #fff">
        <div v-if="selectedKeys.length" class="ep-wrapper">
          <h-tabs :activeKey="activeTab" fixed type="card" @change="handleTabsChange">
            <a-tab-pane :key="1" tab="基本信息">
              <div style="padding: 0 10px; height: 100%; overflow: hidden">
                <equipment-detail ref="equipmentDetail" :equipId="selectedKeys.join('')"/>
              </div>
            </a-tab-pane>
            <a-tab-pane :key="2" style="height: 100%" tab="能力参数">
              <h-card :title="title + ' 能力参数'" fixed>
                <h-search
                  slot="search-form"
                  v-model="queryParams"
                  :data="searchForm"
                  :showToggleButton="false"
                  size="small"
                  @change="handleSearch('equipmentParameterTable')"/>
                <template slot="table-operator">
                  <a-button icon="plus" size="small" type="ghost-primary" @click="handleAdd">添加参数</a-button>
                  <a-button icon="delete" size="small" type="danger" @click="handleDeleteBatch">批量删除</a-button>
                </template>
                <h-vex-table
                  ref='equipmentParameterTable'
                  slot='content'
                  :columns='columns'
                  :data='loadData'
                  :rowSelection='{ selectedRowKeys: selectedRowKeys, onChange: onSelect }'
                  fixed
                >
                  <a
                    slot='conditionType'
                    slot-scope='text, record'
                    @click='handleAddCondition(record)'
                  >
                    {{ record.conditionTypeDesc || '未设置' }}
                  </a>
                  <template slot='actions' slot-scope='text, record'>
                    <a-popconfirm title='确认删除？' @confirm='() => handleDelete(record.id)'>
                      <h-icon class='danger-text' style='cursor: pointer' type='icon-shanchu'/>
                    </a-popconfirm>
                  </template>
                </h-vex-table>
              </h-card>
            </a-tab-pane>
            <!--            <a-tab-pane :key="3" style="height: 100%" tab="修正参数">-->
            <!--              <h-card :title="title + ' 修正参数'" fixed>-->
            <!--                <template slot="table-operator">-->
            <!--                  <a-button icon="plus" size="small" type="ghost-primary" @click="handleAddAmendment">添加参数</a-button>-->
            <!--                </template>-->
            <!--                <h-edit-table-->
            <!--                  ref="equipmentAmendmentParameterTable"-->
            <!--                  slot="content"-->
            <!--                  :autoLoad="false"-->
            <!--                  :columns="amendmentColumns"-->
            <!--                  :data="amendmentLoadData"-->
            <!--                  :editConfig="editConfig"-->
            <!--                  :editRules="editRules"-->
            <!--                  uid="equipmentAmendmentParameterTable"-->
            <!--                  @eidtStatus="editChange"-->
            <!--                ></h-edit-table>-->
            <!--              </h-card>-->
            <!--            </a-tab-pane>-->
            <a-tab-pane :key="4" style="height: 100%" tab="试前模板">
              <h-card :title="title + ' 试前模板'" fixed>
                <h-search
                  slot="search-form"
                  v-model="testBeforeParams"
                  :data="testSearchBar"
                  :showToggleButton="false"
                  size="small"
                  @change="handleSearch('testBefore')"
                />
                <template slot="table-operator">
                  <a-button icon="plus" size="small" type="ghost-primary"
                            @click="handleShowAddModal(1,url.testTemplateNotEquipList)">
                    添加试前模板
                  </a-button>
                  <a-button icon="delete" size="small" type="danger" @click="deleteTemplateBatch(1)"> 批量删除
                  </a-button>
                </template>
                <h-vex-table
                  ref="testBefore"
                  slot="content"
                  :columns="testColumns"
                  :data="(params) => loadTemplateData(params,1)"
                  :rowKey="(record) => record.id"
                  :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                  fixed
                >
                  <template slot="checkName" slot-scope="text, record">
                    {{ text }}
                    <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                      <h-icon class="primary-text" type="icon-moren"/>
                    </a-tooltip>
                  </template>
                  <template slot="actions" slot-scope="text, record">
              <span v-if="record.isDefault == 2">
                <a-tooltip title="设置成默认">
                  <h-icon class="primary-text" type="icon-moren" @click="handleSetTestDefault(record, 1)"/>
                </a-tooltip>
                <a-divider type="vertical"/>
              </span>
                    <a-tooltip title="删除">
                      <h-icon class="danger-text" type="icon-shanchu"
                              @click="handleTemplateDelete(record.id, 1)"/>
                    </a-tooltip>
                  </template>
                </h-vex-table>
              </h-card>
            </a-tab-pane>
            <a-tab-pane :key="5" style="height: 100%" tab="试中模板">
              <h-card :title="title + ' 试中模板'" fixed>
                <h-search
                  slot="search-form"
                  v-model="testMidParams"
                  :data="testSearchBar"
                  :showToggleButton="false"
                  size="small"
                  @change="handleSearch('testHalfway')"
                />
                <template slot="table-operator">
                  <a-button icon="plus" size="small" type="ghost-primary"
                            @click="handleShowAddModal(2,url.testTemplateNotEquipList)">
                    添加试中模板
                  </a-button>
                  <a-button icon="delete" size="small" type="danger" @click="deleteTemplateBatch(2)"> 批量删除
                  </a-button>
                </template>
                <h-vex-table
                  ref="testHalfway"
                  slot="content"
                  :columns="testColumns"
                  :data="(params) => loadTemplateData(params,2)"
                  :rowKey="(record) => record.id"
                  :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                  fixed
                >
                  <template slot="checkName" slot-scope="text, record">
                    {{ text }}
                    <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                      <h-icon class="primary-text" type="icon-moren"/>
                    </a-tooltip>
                  </template>
                  <template slot="actions" slot-scope="text, record">
              <span v-if="record.isDefault == 2">
                <a-tooltip title="设置成默认">
                  <h-icon class="primary-text" type="icon-moren" @click="handleSetTestDefault(record, 2)"/>
                </a-tooltip>
                <a-divider type="vertical"/>
              </span>
                    <a-tooltip title="删除">
                      <h-icon class="danger-text" type="icon-shanchu"
                              @click="handleTemplateDelete(record.id, 2)"/>
                    </a-tooltip>
                  </template>
                </h-vex-table>
              </h-card>
            </a-tab-pane>
            <a-tab-pane :key="6" style="height: 100%" tab="试后模板">
              <h-card :title="title + ' 试后模板'" fixed>
                <h-search
                  slot="search-form"
                  v-model="testAfterParams"
                  :data="testSearchBar"
                  :showToggleButton="false"
                  size="small"
                  @change="handleSearch('testAfter')"
                />
                <template slot="table-operator">
                  <a-button icon="plus" size="small" type="ghost-primary"
                            @click="handleShowAddModal(3,url.testTemplateNotEquipList)">
                    添加试后模板
                  </a-button>
                  <a-button icon="delete" size="small" type="danger" @click="deleteTemplateBatch(3)"> 批量删除
                  </a-button>
                </template>
                <h-vex-table
                  ref="testAfter"
                  slot="content"
                  :columns="testColumns"
                  :data="(params) => loadTemplateData(params,3)"
                  :rowKey="(record) => record.id"
                  :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                  :scroll="{ x: true }"
                  fixed
                >
                  <template slot="checkName" slot-scope="text, record">
                    {{ text }}
                    <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                      <h-icon class="primary-text" type="icon-moren"/>
                    </a-tooltip>
                  </template>
                  <template slot="actions" slot-scope="text, record">
                    <span v-if="record.isDefault == 2">
                      <a-tooltip title="设置成默认">
                        <h-icon class="primary-text" type="icon-moren" @click="handleSetTestDefault(record, 3)"/>
                      </a-tooltip>
                      <a-divider type="vertical"/>
                    </span>
                    <a-tooltip title="删除">
                      <h-icon class="danger-text" type="icon-shanchu"
                              @click="handleTemplateDelete(record.id, 3)"/>
                    </a-tooltip>
                  </template>
                </h-vex-table>
              </h-card>
            </a-tab-pane>
            <a-tab-pane :key="7" style="height: 100%" tab="巡检模板">
              <h-card :title="title + ' 巡检模板'" fixed>
                <h-search
                  slot="search-form"
                  v-model="testParams"
                  :data="pollingSearchBar"
                  :showToggleButton="false"
                  size="small"
                  @change="handleSearch('pollingTable')"
                />
                <template slot="table-operator">
                  <a-button icon="plus" size="small" type="ghost-primary"
                            @click="handleShowAddModal(4, url.obtainTemplate,'radio')">
                    添加巡检模板
                  </a-button>
                  <a-button icon="delete" size="small" type="danger" @click="deleteTemplateBatch(4)"> 批量删除
                  </a-button>
                </template>
                <h-vex-table
                  ref="pollingTable"
                  slot="content"
                  :columns="pollingColumns"
                  :data="(params) => loadTemplateData(params,4)"
                  :rowKey="(record) => record.id"
                  :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                  fixed
                >
                  <template slot="name" slot-scope="text, record">
                    {{ text }}
                    <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                      <h-icon class="primary-text" type="icon-moren"/>
                    </a-tooltip>
                  </template>
                  <template slot="actions" slot-scope="text, record">
                    <span v-if="record.isDefault == 2">
                      <a-tooltip title="设置成默认">
                        <h-icon class="primary-text" type="icon-moren" @click="handleSetTestDefault(record, 4)"/>
                      </a-tooltip>
                      <a-divider type="vertical"/>
                    </span>
                    <a-tooltip title="删除">
                      <h-icon class="danger-text" type="icon-shanchu"
                              @click="handleTemplateDelete(record.id, 4)"/>
                    </a-tooltip>
                  </template>
                </h-vex-table>
              </h-card>
            </a-tab-pane>
          </h-tabs>
        </div>
        <a-empty
          v-else
          description="请先选择一个设备"
          style="
            background: #fff;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          "
        />
      </div>
    </r-l-layout>
    <equipment-parameter-modal ref="equipmentParameterModal" @change="refresh"></equipment-parameter-modal>
    <equipment-modal ref="equipmentModal" @change="getEquipmentTree"/>
    <editor-point-modal ref="editorPointModal" @change="handleSubmitPoint"/>
    <string-modal ref="StringModal" @change="handleSubmitPoint"></string-modal>
    <date-time-modal ref="DateTimeModal" @change="handleSubmitPoint"></date-time-modal>
    <h-select-modal
      ref="hSelectModal"
      :fullScreen="true"
      :getContainer="() => $refs.equipmentParameter"
      :inner="true"
      data-id-param="equipId"
      @change="handleTemplateAdd"
    />
  </div>
</template>

<script>
import {postAction} from '@/api/manage'
import EquipmentParameterModal from './modules/EquipmentParameterModal.vue'
import EquipmentDetail from './modules/EquipmentDetail.vue'
import EquipmentModal from './modules/EquipmentModal.vue'
import StringModal from './modules/StringModal'
import DateTimeModal from './modules/DateTimeModal'
import EditorPointModal from '@/views/components/EditorPointModal'
import moment from 'moment'
import HSelectModal from '@/views/components/HSelectModal'

export default {
  provide() {
    return {
      getContainer: () => this.$refs.equipmentParameter
    }
  },
  components: {
    EquipmentParameterModal,
    EquipmentDetail,
    EquipmentModal,
    EditorPointModal,
    StringModal,
    DateTimeModal,
    HSelectModal
  },
  data() {
    return {
      id: '',
      testSearchBar: [
        {
          title: '模板名称',
          key: 'c_checkName_7',
          formType: 'input'
        }
      ],
      pollingSearchBar: [
        {
          title: '模板名称',
          key: 'c_name_7',
          formType: 'input'
        }
      ],
      activeTab: 1,
      queryParams: {},
      equipmentTree: [],
      selectedKeys: [],
      selectedTreeRows: [],
      editRules: {},
      equipQuery: {},
      editConfig: {
        trigger: 'click',
        mode: 'row',
        autoClear: true,
        showIcon: true,
        showStatus: true,
        showUpdateStatus: true,
        showAsterisk: true,
        showInsertStatus: true
      },
      replaceFields: {
        children: 'children',
        title: 'title',
        value: 'id',
        key: 'id'
      },
      loadTemplateData: (params, checkType) => {
        let data = {
          ...params,
          ...this.testParams,
          ...this.testBeforeParams,
          ...this.testMidParams,
          ...this.testAfterParams,
          equipId: this.id,
          checkType
        }
        return postAction(this.url.testEquipList, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      testBeforeParams: {},
      testMidParams: {},
      testAfterParams: {},
      testParams: {},
      testColumns: [
        {
          title: '模板名称',
          dataIndex: 'checkName',
          scopedSlots: {
            customRender: 'checkName'
          }
        },
        {
          title: '创建人',
          dataIndex: 'createUserName'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm') : '--'
          }
        },
        {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          scopedSlots: {
            customRender: 'actions'
          }
        }
      ],
      pollingColumns: [
        {
          title: '模板名称',
          dataIndex: 'name',
          scopedSlots: {
            customRender: 'name'
          }
        },
        {
          title: '创建人',
          dataIndex: 'createUserName'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm') : '--'
          }
        },
        {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          scopedSlots: {
            customRender: 'actions'
          }
        }
      ],
      searchForm: [
        {
          title: '参数名称',
          key: 'c_paramName_7',
          formType: 'input'
        },
        {
          title: '参数编码',
          key: 'c_paramCode_7',
          formType: 'input'
        }
      ],
      title: '',
      dataTypeTransform: {'string': '字符型', 'number': '数值型', 'dateTime': '日期型'},
      columns: [
        {
          title: '参数编码',
          dataIndex: 'paramCode'
        },
        {
          title: '参数名称',
          dataIndex: 'paramName'
        },
        {
          title: '参数类型',
          formType: 'dict',
          dataIndex: 'paramType_dictText',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '数据类型',
          dataIndex: 'dataType',
          customRender: (text) => {
            switch (text) {
              case 'string':
                return '字符型'
              case 'number':
                return '数据型'
              case 'dateTime':
                return '日期型'
            }
          }
        },
        {
          title: '判读条件',
          key: 'conditionTypeDesc',
          dataIndex: 'conditionType',
          scopedSlots: {
            customRender: 'conditionType'
          }
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'center',
          fixed: 'right',
          width: 80,
          scopedSlots: {
            customRender: 'actions'
          }
        }
      ],
      tagTypeTransform: {'1': '温湿度压力', '2': '运行状态', '3': '报警信息'},
      amendmentColumns: [
        {
          title: '排序',
          key: 'rank1',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, {row, column}) => {
              return h('a-input-number', {
                props: {
                  value: row[column.property]
                },
                style: {
                  width: '100%'
                },
                on: {
                  change: (value) => {
                    row[column.property] = value
                  },
                  blur: () => {
                    // this.amendmentValueChange(row)
                  }
                }
              })
            },
            renderCell: (h, renderOpts, {row, column}) => {
              return h('span', {}, [row[column.property]])
            }
          }
        },
        {
          title: '标签注释',
          key: 'tagnote'
        },
        {
          title: '标签名称',
          key: 'tagname'
        },
        {
          title: '标签类型',
          key: 'tagtype',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, {row, column}) => {
              let typeText = "--";
              switch (row.tagtype) {
                case 1:
                  typeText = '温湿度压力'
                  break;
                case 2:
                  typeText = '运行状态'
                  break;
                case 3:
                  typeText = '报警信息'
                  break
              }
              return h('span', {}, typeText)
            }
          }
        },
        {
          title: '报警上限',
          key: 'upperlimitvalue',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, {row, column}) => {
              return h('a-input-number', {
                props: {
                  value: row[column.property]
                },
                style: {
                  width: '100%'
                },
                on: {
                  change: (value) => {
                    row[column.property] = value
                  },
                  blur: () => {
                    // this.amendmentValueChange(row)
                  }
                }
              })
            },
            renderCell: (h, renderOpts, {row, column}) => {
              return h('span', {}, [row[column.property]])
            }
          }
        },
        {
          title: '报警下限',
          key: 'lowerlimitvalue',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, {row, column}) => {
              return h('a-input-number', {
                props: {
                  value: row[column.property]
                },
                style: {
                  width: '100%'
                },
                on: {
                  change: (value) => {
                    row[column.property] = value
                  },
                  blur: () => {
                    // this.amendmentValueChange(row)
                  }
                }
              })
            },
            renderCell: (h, renderOpts, {row, column}) => {
              return h('span', {}, [row[column.property]])
            }
          }
        },
        {
          title: '修正值',
          key: 'amendmentvalue',
          editRender: {
            name: 'edit',
            renderEdit: (h, renderOpts, {row, column}) => {
              return h('a-input-number', {
                props: {
                  value: row[column.property]
                },
                style: {
                  width: '100%'
                },
                on: {
                  change: (value) => {
                    row[column.property] = value
                  },
                  blur: () => {
                    // this.amendmentValueChange(row)
                  }
                }
              })
            },
            renderCell: (h, renderOpts, {row, column}) => {
              return h('span', {}, [row[column.property]])
            }
          }
        },
        {
          title: '操作',
          width: 100,
          align: 'center',
          fixed: 'right',
          cellRender: {
            name: 'cell',
            renderCell: (h, renderOpts, params) => {
              return h('h-icon', {
                props: {type: 'icon-shanchu'},
                class: 'danger-text',
                on: {
                  click: () => {
                    postAction(this.url.batchDeleteTagamendment, {ids: params.row.id}).then(res => {
                      if (res.code === 200) {
                        this.$message.success("删除成功")
                        this.refresh(true)
                      }
                    })
                  }
                }
              })
            }
          }
        }
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          equipId: this.selectedKeys.join('')
        }
        return postAction(this.url.list, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      amendmentLoadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          equipCode: this.selectedTreeRows[0].equipCode
        }
        return postAction(this.url.amendmentList, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      selectedRowKeys: [],
      selectedRows: [],
      url: {
        list: '/HfResEquipParamBusiness/listPageResEquipParamByEquipId',
        amendmentList: '/DaqBusiness/listPageDaqBusinessByEquipId',
        tagamendmentAdd: '/DaqBusiness/tagamendmentAdd',
        batchDeleteTagamendment: '/DaqBusiness/batchDelete',
        batchEditTagamendment: '/DaqBusiness/batchEdit',
        pageTag: '/DaqBusiness/pageTag',
        delete: '/HfResEquipParamBusiness/removeResEquipParam',
        tree: '/HfResEquipBusiness/listAll',
        deleteEquip: '/HfResEquipBusiness/logicRemoveById',
        editPoint: '/HfResEquipParamBusiness/modifyResEquipParamById',
        testEquipList: '/HfPrjEquipCheckBusiness/listPageByEquipId',
        testTemplateNotUnitList: '/HfPrjEquipCheckBusiness/listPageNotByUnitId',
        testTemplateAdd: '/HfPrjEquipCheckBusiness/add',
        testTemplateDel: '/HfPrjEquipCheckBusiness/removeByEquipId',
        testTemplateSetDefault: '/HfPrjEquipCheckBusiness/setIsDefault',
        testTemplateNotEquipList: '/HfPrjEquipCheckBusiness/listPageNotByEquipId',
        obtainTemplate: '/HfPrjEquipCheckBusiness/obtainTemplate'
      }
    }
  },
  created() {
    this.getEquipmentTree()
  },
  methods: {
    editChange({insertRecords, removeRecords, updateRecords}) {
      if (removeRecords.length > 0) {
        let ids = removeRecords.map(item => item.id).join(",")
        postAction(this.url.batchDeleteTagamendment, {ids}).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功")
            this.refresh(true)
          }
        })
      }
      if (updateRecords.length > 0) {
        postAction(this.url.batchEditTagamendment, {list: updateRecords}).then(res => {
          if (res.code === 200) {
            this.refresh(true)
          }
        })
      }
    },
    handleAddAmendment() {
      // 添加修正参数
      let title = '选择修正参数'
      let columns = [
        {
          title: '标签注释',
          dataIndex: 'tagnote'
        }, {
          title: '标签备注',
          dataIndex: 'note'
        }, {
          title: '标签类型',
          dataIndex: 'tagtype',
          customRender: (text) => {
            // 1：温湿度压力、2：运行状态、3：报警信息
            switch (text) {
              case 1:
                return '温湿度压力'
              case 2:
                return '运行状态'
              case 3:
                return '报警信息'
            }
            return text
          }
        }
      ]
      this.$refs.hSelectModal.title = title
      this.$refs.hSelectModal.columns = columns
      this.$refs.hSelectModal.dataIdParam = 'equipCode'
      this.$refs.hSelectModal.dataId = this.selectedTreeRows[0].equipCode
      this.$refs.hSelectModal.url = this.url.pageTag
      this.$refs.hSelectModal.searchBar = []
      this.$refs.hSelectModal.show()
    },
    async handleTemplateAdd(selectedRowKeys) {
      if (!selectedRowKeys || !selectedRowKeys.length) {
        this.$message.warning('请选择添加的模板')
        return
      }
      if (this.$refs.hSelectModal.confirmLoading) return
      this.$refs.hSelectModal.confirmLoading = true
      let params = {
        equipId: this.id
      }
      let url = null
      let ids = selectedRowKeys.join(',')
      let ref = ''
      switch (this.activeTab) {
        // 试前模板
        case 3:
          url = this.url.tagamendmentAdd
          params.ids = selectedRowKeys.join(",")
          ref = 'equipmentAmendmentParameterTable'
          break
        case 4:
          url = this.url.testTemplateAdd
          params.checkType = 1
          params.checkIds = ids
          ref = 'testBefore'
          break
        // 试中模板
        case 5:
          url = this.url.testTemplateAdd
          params.checkType = 2
          params.checkIds = ids
          ref = 'testHalfway'
          break
        // 试后模板
        case 6:
          url = this.url.testTemplateAdd
          params.checkType = 3
          params.checkIds = ids
          ref = 'testAfter'
          break
        // 巡检模板
        case 7:
          url = this.url.testTemplateAdd
          params.checkType = 4
          params.checkIds = ids
          ref = 'pollingTable'
          break
      }
      postAction(url, params).then((res) => {
        if (res.code === 200) {
          this.$message.success('添加成功')
          this.$refs.hSelectModal.handleCancel()
          this.$refs[ref].refresh(true)
        }
      }).finally(() => {
        this.$refs.hSelectModal.confirmLoading = false
      })
    },
    handleSearch(tab) {
      this.$refs[tab].refresh(true)
      this.selectedRowKeys = []
    },
    handleTemplateDelete(id, checkType) {
      this.$confirm({
        title: '确定删除',
        content: '删除后可以重新添加，确认删除？',
        onOk: async () => {
          let params = {
            equipId: this.id
          }
          params.checkIds = id
          params.checkType = checkType
          let res = await postAction(this.url.testTemplateDel, params)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.refresh(true)
          }
        }
      })
    },
    // 删除模板
    deleteTemplateBatch(checkType) {
      this.$confirm({
        title: '确定删除',
        content: '删除后可以重新添加，确认删除？',
        onOk: async () => {
          let ids = this.selectedRowKeys.join(',')
          let params = {
            equipId: this.id,
            checkIds: ids,
            checkType: checkType
          }
          let res = await postAction(this.url.testTemplateDel, params)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.refresh(true)
          }
        }
      })
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 设置检查模板默认
    handleSetTestDefault(record, checkType) {
      let params = {
        equipId: this.id,
        checkType: checkType,
        checkId: record.id
      }
      postAction(this.url.testTemplateSetDefault, params).then((res) => {
        if (res.code === 200) {
          this.$message.success('设置默认成功')
          this.refresh(true)
        }
      })
    },
    // 展示各类选项的添加弹窗
    handleShowAddModal(checkType, url, selectType) {
      let searchBar = []
      let columns = [
        {
          title: '模板名称',
          dataIndex: 'checkName'
        },
        {
          title: '创建人',
          dataIndex: 'createUserName'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm') : '--'
          }
        }
      ]
      let title = '选择检查模板'
      this.$refs.hSelectModal.customQuery = {
        checkType: checkType,
        equipId: this.id
      }
      this.$refs.hSelectModal.title = title
      this.$refs.hSelectModal.columns = columns
      this.$refs.hSelectModal.dataId = this.id
      this.$refs.hSelectModal.url = url
      this.$refs.hSelectModal.selectType = selectType || 'checkbox'
      this.$refs.hSelectModal.searchBar = searchBar
      this.$refs.hSelectModal.show()
    },
    getEquipmentTree() {
      postAction(this.url.tree, {c_equipUse_1: 1, ...this.equipQuery}).then((res) => {
        if (res.code === 200) {
          this.equipmentTree = res.data.map((item) => {
            return {
              title: item.innerName + '[' + item.equipName + ']',
              pid: 0,
              equipCode: item.equipCode,
              id: item.id,
              scopedSlots: {
                title: 'customTitle'
              }
            }
          })
        }
      })
    },
    refresh(bool = false) {
      // 这里清除选择中的选项
      this.selectedRowKeys = []
      // 关闭所有弹窗
      this.$refs.hSelectModal.handleCancel()
      let activeTab = this.activeTab
      switch (activeTab) {
        case 2:
          this.$refs.equipmentParameterTable.refresh(true)
          break
        case 3:
          this.$refs.equipmentAmendmentParameterTable.refresh(true)
          break
        case 4:
          this.$refs.testBefore.refresh(true)
          break
        case 5:
          this.$refs.testHalfway.refresh(true)
          break
        case 6:
          this.$refs.testAfter.refresh(true)
          break
        case 7:
          this.$refs.pollingTable.refresh(true)
          break
      }
    },
    handleAdd() {
      this.$refs.equipmentParameterModal.show(this.selectedKeys.join(''))
    },
    handleDeleteBatch() {
      this.$confirm({
        title: '确认删除？',
        content: '删除后数据不可恢复，确认删除？',
        onOk: () => {
          let ids = this.selectedRowKeys.toString()
          this.handleDelete(ids)
        }
      })
    },
    conditionTypeChange(row) {
      postAction(this.url.editPoint, row).then((res) => {
        if (res.code === 200) {
          this.$message.success('添加成功')
          this.refresh()
        }
      })
    },
    handleDelete(ids) {
      postAction(this.url.delete, {id: ids}).then((res) => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.selectedRowKeys = []
          this.selectedRows = []
          this.refresh()
        }
      })
    },
    onSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    // 选择了左侧的目录树
    onTreeNodeSelect(selectedKeys, event) {
      this.selectedKeys = selectedKeys[0] ? selectedKeys : this.selectedKeys
      this.id = selectedKeys[0]
      this.title = event.node.dataRef.title
      let selectedTreeRows = []
      event.selectedNodes.map((item) => {
        selectedTreeRows.push(item.data.props)
      })
      this.selectedTreeRows = selectedTreeRows
      // this.refresh(true)
      this.activeTab = 1
    },
    handleAddCondition(record) {
      if (record.dataType === 'number') {
        this.$refs.editorPointModal.show(record)
      } else if (record.dataType === 'dateTime') {
        this.$refs.DateTimeModal.show(record)
      } else {
        this.$refs.StringModal.show(record)
      }
    },
    handleTabsChange(v) {
      this.activeTab = v
      this.testParams = {}
      this.testBeforeParams = {}
      this.testMidParams = {}
      this.testAfterParams = {}
      this.$nextTick(() => {
        this.refresh(true)
      })
    },
    handleAddEquipment() {
      this.$refs.equipmentModal.add()
    },
    handleSubmitPoint(val) {
      postAction(this.url.editPoint, val).then((res) => {
        if (res.code === 200) {
          this.$message.success('添加成功')
          this.refresh()
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.ep-left {
  .h-card-wrapper {
    padding: 0;
  }

  .custom-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    > div {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex: 1;
      overflow: hidden;
      .text-overflow(1);
    }

    span {
      margin-left: 5px;
      .text-overflow(1);
    }
  }

  /deep/ .ant-tree-switcher {
    display: none !important;
  }

  .ant-tree {
    width: 100%;

    .ant-tree-node-content-wrapper {
      display: block;
      width: 100%;

      .ant-tree-title {
        display: block;
        width: 100%;
      }
    }
  }
}

.ep-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  height: 100%;
  background: #fff;
  overflow: hidden;
}

/deep/ .ant-tabs .ant-tabs-top-content {
  height: 100% !important;
}
</style>