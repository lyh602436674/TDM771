<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-28 16:08:31
 * @LastEditTime: 2021-11-26 11:36:27
 * @LastEditors: 马潭龙
 * @Description: 理化检测 项目信息
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\project\modules\UnitInfo.vue
-->
<template>
  <div ref="pcUnitInfo" class="pc-unit-info">
    <a-tabs :activeKey="activeKey" class="pc-unit" size="small" type="card" @change="handleTabChange">
      <a-tab-pane :key="0" tab="基本信息">
        <h-card :bordered="false" :title="title">
          <a-descriptions slot="content" :column="2" bordered size="small">
            <a-descriptions-item label="项目名称"> {{ unitInfo.unitName || '--' }}</a-descriptions-item>
            <a-descriptions-item label="项目编码"> {{ unitInfo.unitCode || '--' }}</a-descriptions-item>
            <a-descriptions-item label="所属分类">{{ unitInfo.classifyName || '--' }}</a-descriptions-item>
            <a-descriptions-item :span="2" label="备注">{{ unitInfo.remarks || '--' }}</a-descriptions-item>
          </a-descriptions>
        </h-card>
      </a-tab-pane>
      <!-- 方法库 -->
      <a-tab-pane :key="1" tab="方法库">
        <h-card :bordered="false" :title="title + ' 试验方法'" fixed>
          <h-search
            slot="search-form"
            v-model="experimentQueryParams"
            :data="experimentSearchBar"
            :showToggleButton="false"
            size="small"
            @change="() => handleSearch('experiment')"
          />
          <template slot="table-operator">
            <a-button icon="plus" size="small" type="ghost-primary" @click="() => handleShowAddModal(1)">
              添加方法
            </a-button>
            <template>
              <a-button
                v-has="'entrustment:delete'"
                icon="delete"
                size="small"
                type="danger"
                @click="() => deleteBatch(1)"
              >
                批量删除
              </a-button>
            </template>
          </template>
          <h-vex-table
            ref="experiment"
            slot="content"
            :columns="experimentColumns"
            :data="experimentLoadData"
            :rowKey="(record) => record.id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            :scroll="{ x: true }"
          >
            <template slot="actions" slot-scope="text, record">
              <a-tooltip title="删除">
                <h-icon class="danger-text" type="icon-shanchu" @click="() => handleDelete(1, record.id)"/>
              </a-tooltip>
            </template>
          </h-vex-table>
        </h-card>
      </a-tab-pane>
      <!-- 报告模板 -->
      <a-tab-pane :key="5" tab="报告模板">
        <h-card :bordered="false" :title="title + ' 报告模板'" fixed>
          <h-search
            slot="search-form"
            v-model="reportTempParams"
            :data="tempSearchBar"
            :showToggleButton="false"
            size="small"
            @change="() => handleSearch('reportTemp')"
          />
          <template slot="table-operator">
            <a-button icon="plus" size="small" type="ghost-primary" @click="() => handleShowAddModal(5)">
              添加模板
            </a-button>
            <a-button icon="delete" size="small" type="danger" @click="deleteBatch(5)"> 批量删除</a-button>
          </template>
          <h-vex-table
            ref="reportTemp"
            slot="content"
            :columns="tempColumns"
            :data="reportTempLoadData"
            :rowKey="(record) => record.id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            :scroll="{ x: true }"
          >
            <template slot="name" slot-scope="text, record">
              {{ record.name }}
              <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                <h-icon class="primary-text" type="icon-moren"/>
              </a-tooltip>
            </template>
            <template slot="actions" slot-scope="text, record">
              <a-tooltip v-if="record.isDefault == 2" title="设置成默认">
                <h-icon
                  :class="record.isDefault == 2 ? 'primary-text' : 'danger-text'"
                  type="icon-moren"
                  @click="() => handleSetDefault(record, 'report')"
                />
                <a-divider type="vertical"/>
              </a-tooltip>
              <a-tooltip title="删除">
                <h-icon class="danger-text" type="icon-shanchu" @click="() => handleDelete(5, record.id)"/>
              </a-tooltip>
            </template>
          </h-vex-table>
        </h-card>
      </a-tab-pane>
      <!-- 试前模板 -->
      <a-tab-pane :key="7" tab="试前模板">
        <h-card :bordered="false" :title="title + ' 试前模板'" fixed>
          <h-search
            slot="search-form"
            v-model="testParams"
            :data="testSearchBar"
            :showToggleButton="false"
            size="small"
            @change="() => handleSearch('testBefore')"
          />
          <template slot="table-operator">
            <a-button icon="plus" size="small" type="ghost-primary" @click="() => handleShowAddModal(7, 1)">
              添加试前模板
            </a-button>
            <a-button icon="delete" size="small" type="danger" @click="deleteBatch(7, 1)"> 批量删除</a-button>
          </template>
          <h-vex-table
            ref="testBefore"
            slot="content"
            :columns="testColumns"
            :data="testBeforeLoadData"
            :rowKey="(record) => record.id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            :scroll="{ x: true }"
            fixed
          >
            <template slot="checkName" slot-scope="text, record">
              {{ record.checkName }}
              <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                <h-icon class="primary-text" type="icon-moren"/>
              </a-tooltip>
            </template>
            <template slot="actions" slot-scope="text, record">
              <span v-if="record.isDefault == 2">
                <a-tooltip title="设置成默认">
                  <h-icon class="primary-text" type="icon-moren" @click="() => handleSetTestDefault(record, 1)"/>
                </a-tooltip>
                <a-divider type="vertical"/>
              </span>
              <a-tooltip title="删除">
                <h-icon class="danger-text" type="icon-shanchu" @click="() => handleDelete(7, record.id, 1)"/>
              </a-tooltip>
            </template>
          </h-vex-table>
        </h-card>
      </a-tab-pane>
      <!-- 试中模板 -->
      <a-tab-pane :key="8" tab="试中模板">
        <h-card :bordered="false" :title="title + ' 试中模板'" fixed>
          <h-search
            slot="search-form"
            v-model="testParams"
            :data="testSearchBar"
            :showToggleButton="false"
            size="small"
            @change="() => handleSearch('testHalfway')"
          />
          <template slot="table-operator">
            <a-button icon="plus" size="small" type="ghost-primary" @click="() => handleShowAddModal(7, 2)">
              添加试中模板
            </a-button>
            <a-button icon="delete" size="small" type="danger" @click="deleteBatch(7, 2)"> 批量删除</a-button>
          </template>
          <h-vex-table
            ref="testHalfway"
            slot="content"
            :columns="testColumns"
            :data="testHalfwayLoadData"
            :rowKey="(record) => record.id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            :scroll="{ x: true }"
            fixed
          >
            <template slot="checkName" slot-scope="text, record">
              {{ record.checkName }}
              <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                <h-icon class="primary-text" type="icon-moren"/>
              </a-tooltip>
            </template>
            <template slot="actions" slot-scope="text, record">
              <span v-if="record.isDefault == 2">
                <a-tooltip title="设置成默认">
                  <h-icon class="primary-text" type="icon-moren" @click="() => handleSetTestDefault(record, 2)"/>
                </a-tooltip>
                <a-divider type="vertical"/>
              </span>
              <a-tooltip title="删除">
                <h-icon class="danger-text" type="icon-shanchu" @click="() => handleDelete(7, record.id, 2)"/>
              </a-tooltip>
            </template>
          </h-vex-table>
        </h-card>
      </a-tab-pane>
      <!-- 试后模板 -->
      <a-tab-pane :key="9" tab="试后模板">
        <h-card :bordered="false" :title="title + ' 试后模板'" fixed>
          <h-search
            slot="search-form"
            v-model="testParams"
            :data="testSearchBar"
            :showToggleButton="false"
            size="small"
            @change="() => handleSearch('testAfter')"
          />
          <template slot="table-operator">
            <a-button icon="plus" size="small" type="ghost-primary" @click="() => handleShowAddModal(7, 3)">
              添加试后模板
            </a-button>
            <a-button icon="delete" size="small" type="danger" @click="deleteBatch(7, 3)"> 批量删除</a-button>
          </template>
          <h-vex-table
            ref="testAfter"
            slot="content"
            :columns="testColumns"
            :data="testAfterLoadData"
            :rowKey="(record) => record.id"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            :scroll="{ x: true }"
            fixed
          >
            <template slot="checkName" slot-scope="text, record">
              {{ record.checkName }}
              <a-tooltip v-if="record.isDefault == 1" title="默认模板">
                <h-icon class="primary-text" type="icon-moren"/>
              </a-tooltip>
            </template>
            <template slot="actions" slot-scope="text, record">
              <span v-if="record.isDefault == 2">
                <a-tooltip title="设置成默认">
                  <h-icon class="primary-text" type="icon-moren" @click="() => handleSetTestDefault(record, 3)"/>
                </a-tooltip>
                <a-divider type="vertical"/>
              </span>
              <a-tooltip title="删除">
                <h-icon class="danger-text" type="icon-shanchu" @click="() => handleDelete(7, record.id, 3)"/>
              </a-tooltip>
            </template>
          </h-vex-table>
        </h-card>
      </a-tab-pane>
    </a-tabs>
    <!-- 通用选择弹窗 -->
    <h-select-modal
      ref="hSelectModal"
      :fullScreen="true"
      :getContainer="() => $refs.pcUnitInfo"
      :inner="true"
      @change="handleAdd"
    />
    <!-- 实施过程弹窗 -->
    <process-desc-modal ref="processDescModal" @change="handleSearch('processDesc')"/>
  </div>
</template>

<script>
import {getAction, postAction} from '@/api/manage'
import HSelectModal from '@/views/components/HSelectModal'
import ProcessDescModal from './ProcessDescModal'
import moment from 'moment'
import mixin from '@/views/hifar/mixin.js'

export default {
  components: {HSelectModal, ProcessDescModal},
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => this.$refs.pcUnitInfo,
    }
  },
  inject: ['groupCode'],
  data() {
    return {
      id: null,
      // ready 子组件是否
      title: '',
      activeKey: 0,
      // 试验项目信息
      unitInfo: {},
      // 试验方法相关配置
      experimentQueryParams: {},
      experimentSearchBar: [
        {
          title: '方法名称',
          formType: 'input',
          key: 'c_standardName_7',
        },
      ],
      experimentColumns: [
        {
          title: '方法名称',
          dataIndex: 'standardName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '方法编号',
          dataIndex: 'standardCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '发布机构',
          dataIndex: 'publishOrg',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          align: 'center',
          width: 80,
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      experimentReady: false,
      experimentLoadData: (params) => {
        let data = {
          ...params,
          ...this.experimentQueryParams,
          unitId: this.id,
        }
        return postAction(this.url.experiment, data).then((res) => {
          if (res.code == 200) {
            this.experimentReady = true
            return res.data
          }
        })
      },
      // 设备库相关配置
      equipmentQueryParams: {},
      equipmentSearchBar: [
        {
          title: '设备名称',
          key: 'c_equipName_7',
          formType: 'input',
        },
      ],
      equipmentColumns: [
        {
          title: '设备名称',
          dataIndex: 'equipName',
        },
        {
          title: '设备编号',
          dataIndex: 'equipCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '内部名称',
          dataIndex: 'innerName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '设备型号',
          dataIndex: 'equipModel',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      equipmentReady: false,
      equipmentLoadData: (params) => {
        let data = {
          ...params,
          ...this.equipmentQueryParams,
          unitId: this.id,
        }
        return postAction(this.url.equipment, data).then((res) => {
          if (res.code == 200) {
            this.equipmentReady = true
            return res.data
          }
        })
      },
      // 指标库相关配置
      parameterQueryParams: {},
      parameterSearchBar: [
        {
          title: '参数名称',
          key: 'c_paramName_7',
          formType: 'input',
        },
        {
          title: '参数编号',
          key: 'c_paramCode_7',
          formType: 'input',
        },
      ],
      parameterColumns: [
        {
          title: '参数编号',
          dataIndex: 'paramCode',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '参数名称',
          dataIndex: 'paramName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '数据类型',
          dataIndex: 'dataType',
          customRender: (text) => {
            switch (text) {
              case 'string':
                return '字符型'
              case 'number':
                return '数值型'
            }
          },
        },
        {
          title: '曲线类型',
          dataIndex: 'curveType',
          customRender: (t) => {
            return t === '1' ? '温度/℃' : t === '2' ? '湿度/RH' : '--'
          }
        },
        {
          title: '单位',
          dataIndex: 'unitName',
          customRender: (text) => {
            return text || '--'
          },
        },
        {
          title: '操作',
          width: 100,
          align: 'center',
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      parameterReady: false,
      parameterLoadData: (params) => {
        let data = {
          ...params,
          ...this.parameterQueryParams,
          unitId: this.id,
        }
        return postAction(this.url.parameter, data).then((res) => {
          if (res.code == 200) {
            this.parameterReady = true
            return res.data
          }
        })
      },
      // 模板通用
      tempSearchBar: [
        {
          title: '模板名称',
          key: 'c_name_7',
          formType: 'input',
        },
      ],
      tempColumns: [
        {
          title: '模板名称',
          dataIndex: 'name',
          scopedSlots: {
            customRender: 'name',
          },
        },
        {
          title: '操作',
          align: 'center',
          width: 100,
          fixed: 'right',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      // 数据模板相关配置
      dataTempParams: {},
      dataTempReady: false,
      dataTempLoadData: (params) => {
        let data = {
          ...this.dataTempParams,
          ...params,
          unitId: this.id,
          templateType: 'data',
        }
        return postAction(this.url.template, data).then((res) => {
          if (res.code == 200) {
            this.dataTempReady = true
            return res.data
          }
        })
      },
      // 报告模板相关配置
      reportTempParams: {},
      reportTempReady: false,
      reportTempLoadData: (params) => {
        let data = {
          ...this.reportTempParams,
          ...params,
          unitId: this.id,
          templateType: 'report',
        }
        return postAction(this.url.template, data).then((res) => {
          if (res.code == 200) {
            this.reportTempReady = true
            return res.data
          }
        })
      },
      // 工作中心
      workcenterParams: {},
      workcenterSearchBar: [
        {
          title: '中心名称',
          key: 'c_workName_7',
          formType: 'input',
        },
      ],
      workcenterColumns: [
        {
          title: '中心名称',
          dataIndex: 'workName',
        },
        {
          title: '负责人',
          dataIndex: 'idName',
          customRender: (text, record) => {
            return record.centerManagerList.length ? record.centerManagerList[0].idName : '--'
          }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text.length ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm') : '--'
          },
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
        },
        {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      workcenterReady: false,
      workcenterLoadData: (params) => {
        let data = {
          ...params,
          ...this.workcenterParams,
          unitId: this.id,
          dataType: 'work',
        }
        return postAction(this.url.workcenter, data).then((res) => {
          if (res.code == 200) {
            this.workcenterReady = true
            return res.data
          }
        })
      },
      // 试前、试中、试后模板
      testBeforeTemplateReady: false,
      testHalfwayTemplateReady: false,
      testAfterTemplateReady: false,
      testParams: {},
      testSearchBar: [
        {
          title: '模板名称',
          key: 'c_checkName_7',
          formType: 'input',
        },
      ],
      testColumns: [
        {
          title: '模板名称',
          dataIndex: 'checkName',
          scopedSlots: {
            customRender: 'checkName',
          },
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: (text) => {
            return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm') : '--'
          },
        },
        {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      testBeforeLoadData: (params) => {
        let data = {
          ...params,
          ...this.testParams,
          unitId: this.id,
          checkType: 1,
        }
        return postAction(this.url.testUnitList, data).then((res) => {
          if (res.code == 200) {
            this.testBeforeTemplateReady = true
            return res.data
          }
        })
      },
      testHalfwayLoadData: (params) => {
        let data = {
          ...params,
          ...this.testParams,
          unitId: this.id,
          checkType: 2,
        }
        return postAction(this.url.testUnitList, data).then((res) => {
          if (res.code == 200) {
            this.testHalfwayTemplateReady = true
            return res.data
          }
        })
      },
      testAfterLoadData: (params) => {
        let data = {
          ...params,
          ...this.testParams,
          unitId: this.id,
          checkType: 3,
        }
        return postAction(this.url.testUnitList, data).then((res) => {
          if (res.code == 200) {
            this.testAfterTemplateReady = true
            return res.data
          }
        })
      },
      // 实施过程
      processDescReady: false,
      processDescParams: {},
      processDescSearchBar: [
        {
          title: '过程名称',
          key: 'c_processName_7',
          formType: 'input',
        },
      ],
      processDescColumns: [
        {
          title: '过程名称',
          dataIndex: 'processName',
        },
        {
          title: '过程描述',
          dataIndex: 'processDesc',
        },
        {
          title: '备注',
          dataIndex: 'remarks',
        },
        {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      processDescLoadData: (params) => {
        let data = {
          ...params,
          ...this.processDescParams,
          unitId: this.id,
        }
        return postAction(this.url.processDescList, data).then((res) => {
          if (res.code == 200) {
            this.processDescReady = true
            return res.data
          }
        })
      },
      // 公用属性
      selectedRowKeys: [],
      url: {
        detail: '/HfPrjUnitBaseBusiness/queryById',
        experiment: '/HfPrjUnitStandardBusiness/listPageStandardByUnitId',
        equipment: '/HfPrjUnitEquipBusiness/listPageEquipByUnitId',
        parameter: '/HfPrjUnitParamBusiness/listPageByUnitId',
        template: '/HfPrjUnitTemplateBusiness/listPageTemplateByUnitId',
        experimentList: '/HfPrjUnitStandardBusiness/listPageStandardByNotUnitId',
        equipmentList: '/HfPrjUnitEquipBusiness/listPageEquipByNotUnitId',
        parameterList: '/HfPrjUnitParamBusiness/listPageAbilityParamByNotUnitId',
        tempateList: '/HfPrjUnitTemplateBusiness/listPageTemplateByNotUnitId',
        experimentAdd: '/HfPrjUnitStandardBusiness/addUnitStandardIds',
        equipmentAdd: '/HfPrjUnitEquipBusiness/addUnitEquips',
        parameterAdd: '/HfPrjUnitParamBusiness/add',
        templateAdd: '/HfPrjUnitTemplateBusiness/addUnitTemplates',
        experimentDel: '/HfPrjUnitStandardBusiness/removeUnitStandards',
        equipmentDel: '/HfPrjUnitEquipBusiness/removeUnitEquips',
        parameterDel: '/HfPrjUnitParamBusiness/logicRemoveById',
        templateDel: '/HfPrjUnitTemplateBusiness/removeUnitTemplates',
        templateDefault: '/HfPrjUnitTemplateBusiness/setDefaultTemplate',
        workcenter: '/HfPrjUnitWorkBusiness/listPageCenterByUnitId',
        workcenterList: '/HfPrjUnitWorkBusiness/listPageCenterByNotUnitId',
        workcenterAdd: '/HfPrjUnitWorkBusiness/addUnitCenters',
        workcenterDel: '/HfPrjUnitWorkBusiness/removeUnitCenters',
        testUnitList: '/HfPrjUnitCheckBusiness/listPageByUnitId',
        testTempateNotUnitList: '/HfPrjUnitCheckBusiness/listPageNotByUnitId',
        testTempateAdd: '/HfPrjUnitCheckBusiness/add',
        testTempateDel: '/HfPrjUnitCheckBusiness/removeByUnitId',
        testTempateSetDefault: '/HfPrjUnitCheckBusiness/setIsDefault',
        processDescList: '/HfPrjUnitProcessDescBusiness/listPageByUnitId',
        processDescDelete: '/HfPrjUnitProcessDescBusiness/remove',
      },
    }
  },
  methods: {
    show(activeKey, id) {
      this.id = id
      // 这里清除选择中的选项
      this.selectedRowKeys = []
      // 关闭所有弹窗
      this.$refs.hSelectModal.handleCancel()
      this.activeKey = activeKey || 0
      switch (activeKey) {
        case 0:
          this.getUnitInfo()
          break
        case 1:
          if (this.experimentReady) {
            this.$refs.experiment.refresh()
          }
          return
        case 2:
          if (this.equipmentReady) {
            this.$refs.equipment.refresh()
          }
          break
        case 3:
          if (this.parameterReady) {
            this.$refs.parameter.refresh()
          }
          break
        case 4:
          if (this.dataTempReady) {
            this.$refs.dataTemp.refresh()
          }
          break
        case 5:
          if (this.reportTempReady) {
            this.$refs.reportTemp.refresh()
          }
          break
        case 6:
          if (this.workcenterReady) {
            this.$refs.workcenter.refresh()
          }
          break
        case 7:
          if (this.testBeforeTemplateReady) {
            this.$refs.testBefore.refresh()
          }
          break
        case 8:
          if (this.testHalfwayTemplateReady) {
            this.$refs.testHalfway.refresh()
          }
          break
        case 9:
          if (this.testAfterTemplateReady) {
            this.$refs.testAfter.refresh()
          }
          break
        case 10:
          if (this.processDescReady) {
            this.$refs.processDesc.refresh()
          }
          break
        default:
          this.show(0, this.id)
      }
    },
    // 展示各类选项的添加弹窗
    handleShowAddModal(type, checkType) {
      let url = null,
        columns = null,
        unitId = this.id,
        title = null,
        searchBar = []
      switch (type) {
        // 显示添加方法弹窗
        case 1:
          url = this.url.experimentList
          columns = [
            {
              title: '方法名称',
              dataIndex: 'standardName',
              customRender: (text) => {
                return text || '--'
              },
            },
            {
              title: '方法编号',
              dataIndex: 'standardCode',
              customRender: (text) => {
                return text || '--'
              },
            },
            {
              title: '备注',
              dataIndex: 'remarks',
              customRender: (text) => {
                return text || '--'
              },
            },
          ]
          searchBar = [
            {
              title: '方法名称',
              formType: 'input',
              key: 'c_standardName_7',
            },
            {
              title: '方法编号',
              key: 'c_standardCode_7',
              formType: 'input',
            },
          ]
          title = '添加方法'
          break
        case 2:
          url = this.url.equipmentList
          columns = [
            {
              title: '设备名称',
              dataIndex: 'equipName',
              customRender: (text) => {
                return text || '--'
              },
            },
            {
              title: '设备编号',
              dataIndex: 'equipCode',
              customRender: (text) => {
                return text || '--'
              },
            },
            {
              title: '备注',
              dataIndex: 'remarks',
              customRender: (text) => {
                return text || '--'
              },
            },
          ]
          title = '添加设备'
          searchBar = [
            {
              title: '设备名称',
              key: 'c_equipName_7',
              formType: 'input',
            },
            {
              title: '设备编号',
              key: 'c_equipCode_7',
              formType: 'input',
            },
          ]
          break
        case 3:
          url = this.url.parameterList
          searchBar = [
            {
              title: '参数名称',
              key: 'c_paramName_7',
              formType: 'input',
            },
            {
              title: '参数编号',
              key: 'c_paramCode_7',
              formType: 'input',
            },
          ]
          title = '新增能力参数'
          columns = [
            {
              title: '参数编号',
              dataIndex: 'paramCode',
            },
            {
              title: '参数名称',
              dataIndex: 'paramName',
            },
            {
              title: '数据类型',
              dataIndex: 'dataType',
              customRender: (text) => {
                switch (text) {
                  case 'number':
                    return '数值型'
                  case 'string':
                    return '字符型'
                  default:
                    return '--'
                }
              },
            },
            {
              title: '曲线类型',
              dataIndex: 'curveType',
              customRender: (t) => {
                return t === '1' ? '温度/℃' : t === '2' ? '湿度/RH' : '--'
              }
            },
            {
              title: '单位',
              dataIndex: 'unitName',
            },
            {
              title: '创建时间',
              dataIndex: 'createTime',
              customRender: (text) => {
                return text ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
              },
            },
            {
              title: '创建人',
              dataIndex: 'createUserName',
            },
          ]
          break
        case 4:
          url = this.url.tempateList
          columns = [
            {
              title: '模板名称',
              dataIndex: 'name',
              customRender: (text) => {
                return text || '--'
              },
            },
          ]
          title = '添加数据模板'
          this.$refs.hSelectModal.customQuery = {
            templateType: 'data',
          }
          searchBar = [
            {
              title: '模板名称',
              key: 'c_name_7',
              formType: 'input',
              customRender: (text) => {
                return text || '--'
              },
            },
            {
              title: '版本',
              key: 'c_version_7',
              formType: 'input',
              customRender: (text) => {
                return text || '--'
              },
            },
          ]
          break
        case 5:
          url = this.url.tempateList
          columns = [
            {
              title: '模板名称',
              dataIndex: 'name',
            },
            {
              title: '版本',
              dataIndex: 'version',
            },
          ]
          this.$refs.hSelectModal.customQuery = {
            templateType: 'report',
            c_reportType_1: 'report',
          }
          title = '添加报告模板'
          break
        case 6:
          url = this.url.workcenterList
          columns = [
            {
              title: '中心名称',
              dataIndex: 'workName',
            },
            {
              title: '负责人',
              dataIndex: 'idName',
              customRender: (text, record) => {
                return record.centerManagerList.length ? record.centerManagerList[0].idName : '--'
              }
            },
          ]
          title = '添加工作中心'
          this.$refs.hSelectModal.customQuery = {
            dataType: 'work',
          }
          break
        case 7:
          url = this.url.testTempateNotUnitList
          columns = [
            {
              title: '模板名称',
              dataIndex: 'checkName',
            },
            {
              title: '创建人',
              dataIndex: 'createUserName',
            },
            {
              title: '创建时间',
              dataIndex: 'createTime',
              customRender: (text) => {
                return text && text != 0 ? moment(parseFloat(text)).format('YYYY-MM-DD HH:mm') : '--'
              },
            },
          ]
          title = '选择检查模板'
          this.$refs.hSelectModal.customQuery = {
            checkType: checkType,
          }
          break
        default:
          return
      }
      this.$refs.hSelectModal.title = title
      this.$refs.hSelectModal.columns = columns
      this.$refs.hSelectModal.unitId = unitId
      this.$refs.hSelectModal.url = url
      this.$refs.hSelectModal.searchBar = searchBar
      this.$refs.hSelectModal.show()
    },
    handleSearch(tab) {
      this.$refs[tab].refresh(true)
      this.selectedRowKeys = []
    },
    handleTabChange(v) {
      console.log(v)
      this.show(v, this.id)
    },
    /**
     * @Date: 2021-08-26 17:04:27
     * @Author: 陈乾龙
     * @description: 获取项目详情
     */
    async getUnitInfo() {
      let res = await getAction(this.url.detail, {id: this.id})
      if (res.code == 200) {
        this.unitInfo = res.data
        this.title = `${this.unitInfo.unitName} - ${this.unitInfo.classifyName}`
      }
    },
    async handleAdd(selectedRowKeys) {
      if (!selectedRowKeys || !selectedRowKeys.length) {
        this.$message.warning('请选择添加的方法')
        return
      }
      if (this.$refs.hSelectModal.confirmLoading) return
      this.$refs.hSelectModal.confirmLoading = true
      let params = {
        unitId: this.id,
      }
      let url = null
      let ids = selectedRowKeys.join(',')
      console.log('hello', this.activeKey)
      switch (this.activeKey) {
        // 方法库
        case 1:
          url = this.url.experimentAdd
          params.standardIds = ids
          break
        // 设备库
        case 2:
          url = this.url.equipmentAdd
          params.equipIds = ids
          break
        // 试验条件
        case 3:
          url = this.url.parameterAdd
          params.abilityParamIds = ids
          break
        // 记录模板库
        case 4:
          url = this.url.templateAdd
          params.templateType = 'data'
          params.templateIds = ids
          break
        // 报告模板
        case 5:
          url = this.url.templateAdd
          params.templateType = 'report'
          params.templateIds = ids
          break
        // 工作中心
        case 6:
          url = this.url.workcenterAdd
          params.dataType = 'work'
          params.workIds = ids
          break
        // 试前模板
        case 7:
          url = this.url.testTempateAdd
          params.checkType = 1
          params.checkIds = ids
          break
        // 试中模板
        case 8:
          url = this.url.testTempateAdd
          params.checkType = 2
          params.checkIds = ids
          break
        // 试后模板
        case 9:
          url = this.url.testTempateAdd
          params.checkType = 3
          params.checkIds = ids
          break
      }
      console.log(url, params)
      postAction(url, params)
        .then((res) => {
          if (res.code == 200) {
            this.$message.success('添加成功')
            this.$refs.hSelectModal.handleCancel()
            this.show(this.activeKey, this.id)
          }
        })
        .finally((res) => {
          this.$refs.hSelectModal.confirmLoading = false
        })
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    deleteBatch(type, checkType) {
      if (this.selectedRowKeys.length) {
        this.handleDelete(type, this.selectedRowKeys.join(','), checkType)
      } else {
        this.openNotificationWithIcon('error', '删除提示', '请至少选择一项')
      }
    },
    handleDelete(type, id, checkType) {
      this.$confirm({
        title: '确定删除',
        content: '删除后可以重新添加，确认删除？',
        onOk: async () => {
          let params = {
            unitId: this.id,
          }
          let url = null
          switch (type) {
            case 1:
              url = this.url.experimentDel
              params.standardIds = id
              break
            case 2:
              url = this.url.equipmentDel
              params.equipIds = id
              break
            case 3:
              url = this.url.parameterDel
              params.id = id
              break
            case 4:
              url = this.url.templateDel
              params.templateType = 'data'
              params.templateIds = id
              break
            case 5:
              url = this.url.templateDel
              params.templateType = 'report'
              params.templateIds = id
              break
            case 6:
              url = this.url.workcenterDel
              params.dataType = 'work'
              params.workIds = id
              break
            case 7:
              url = this.url.testTempateDel
              params.checkIds = id
              params.checkType = checkType
              break
            case 8:
              url = this.url.processDescDelete
              params.ids = id
              break
          }
          let res = await postAction(url, params)
          if (res.code == 200) {
            this.$message.success('删除成功')
            this.show(this.activeKey, this.id)
          }
        },
      })
    },
    handleSetDefault(record, type) {
      let params = {
        unitId: this.id,
        templateType: type,
        templateId: record.id,
      }
      console.log('record', record, params)
      postAction(this.url.templateDefault, params).then((res) => {
        if (res.code == 200) {
          this.$message.success(record.name + ',设置默认成功')
          this.show(this.activeKey, this.id)
        }
      })
    },
    // 设置检查模板默认
    handleSetTestDefault(record, checkType) {
      let params = {
        unitId: this.id,
        checkType: checkType,
        checkId: record.id,
      }
      postAction(this.url.testTempateSetDefault, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('设置默认成功')
          this.show(this.activeKey, this.id)
        }
      })
    },
    // 实施过程弹窗
    handleProcessDescAdd() {
      let record = {
        unitId: this.id,
      }
      let title = '添加'
      this.$refs.processDescModal.show(record, title)
    },
    handleProcessDescEdit(record) {
      let title = '编辑'
      this.$refs.processDescModal.show(record, title)
    },
  },
}
</script>

<style lang='less'>
.pc-unit-info {
  height: 100%;
  position: relative;
}

.pc-unit {
  &.ant-tabs {
    height: 100%;

    .ant-tabs-content {
      height: calc(100% - 56px);

      .ant-tabs-tabpane-active {
        height: 100%;
      }
    }
  }
}
</style>