<!--
 * @Author: 雷宇航
 * @Date: 2022-09-29 15:48:41
 * @fileName: EntrustmentInnerModal.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\modules\EntrustmentInnerModal.vue
 * @Description: 新增/编辑委托单弹框
-->
<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    destroyOnClose
    fullScreen inner
    class="entrustModal"
    @cancel='handleCancel'>
    <div slot='footer' class='footer'>
      <a-button :loading="submitLoading" style='margin-right: 8px' type='ghost-danger' @click='handleCancel'> 关闭
      </a-button>
      <a-button :loading="submitLoading" style='margin-right: 8px' type='ghost-success' @click='handleTransientSubmit'>
        暂存
      </a-button>
      <a-button :loading="submitLoading" type='primary' @click='handleSubmit'>提交</a-button>
    </div>
    <h-card bordered>
      <template slot='title'> {{ handleType === 'add' ? '新增' : '编辑' }}内部委托试验</template>
      <a-spin :spinning="submitLoading">
        <div id="entrust" class="item-wrapper">
          <div class="item-wrapper-title">
            <span class="title">委托信息</span>
            <span class="description">填写申请单基本信息</span>
          </div>
          <div class="item-wrapper-content">
            <h-form
              ref='entrustFrom'
              v-model='entrustModel'
              :column='4'
              :formData='entrustFormData'
              style='margin-top: 40px'
            >
            </h-form>
          </div>
        </div>
        <div id="product" class="item-wrapper">
          <div class="item-wrapper-title">
            <span class="title">产品信息</span>
            <span class="description">填写产品信息</span>
          </div>
          <div class="item-wrapper-content">
            <div style="margin-top:20px">
              <a-button
                icon='plus'
                size='small'
                style='margin-right: 10px'
                type='ghost-primary'
                @click='handleAddPiece'
              >
                新增产品
              </a-button>
              <a-popconfirm title="确定删除吗?" @confirm="handleDelete">
                <a-button v-if='selectedPieceRows.length' icon='minus' size='small' type='danger'>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
            <div class="vxe-table-box" style="margin-bottom: 20px">
              <vxe-table
                ref='pieceTable'
                :checkbox-config='{ highlight: true, strict: true }'
                :data='tableData'
                :edit-config="{
                  trigger: 'click',
                  mode: 'cell',
                  activeMethod: ({column})=> { return ['pieceNo','pieceNum'].includes(column.property)},
                }"
                :edit-rules='validRules'
                :valid-config='{ showMessage: false }'
                keep-source
                max-height='600'
                show-overflow
                style='margin-top: 10px'
                @checkbox-all='selectAllEvent'
                @checkbox-change='onSelectChange'
              >
                <vxe-table-column type='checkbox' width='60'></vxe-table-column>
                <vxe-table-column type='seq' width='60'></vxe-table-column>
                <vxe-table-column
                  :edit-render="{
                      name: 'input',
                      attrs: { type: 'text', placeholder: '请输入产品名称' },
                      events:{
                        blur: this.pieceDataBlur,
                        focus: this.pieceDataFocus,
                      }
                    }"
                  field='productName'
                  title="产品名称"
                />
                <vxe-table-column
                  :edit-render="{
                       name:'input',
                       attrs: { type: 'text', placeholder: '请输入型号/规格' },
                       events:{
                          blur: this.pieceDataBlur,
                          focus: this.pieceDataFocus,
                       }
                    }"
                  field='productAlias'
                  title="产品代号"
                />
                <vxe-table-column
                  :edit-render="{
                    showAsterisk:true,
                    name: 'input',
                    attrs: { type: 'text', placeholder: '请输入产品编号' },
                    events:{
                      blur: this.pieceDataBlur,
                      focus: this.pieceDataFocus,
                    }
                  }"
                  field='pieceNo'
                  title="产品编号"
                />
                <vxe-table-column
                  field='pieceNum'
                  title="数量"
                />
              </vxe-table>
            </div>
          </div>
        </div>
        <div id="project" class="item-wrapper">
          <div class="item-wrapper-title">
            <span class="title">项目信息</span>
            <span class="description">填写项目基本信息</span>
          </div>
          <div class="item-wrapper-content">
            <a-button
              icon='plus'
              size='small'
              style='margin:20px 0 10px'
              type='ghost-primary'
              @click='handleAddProject'
            >
              项目添加
            </a-button>
            <a-button
              icon='plus'
              size='small'
              style='margin-left:10px'
              type='ghost-primary'
              @click='handleAddHistory'
            >
              历史库新增
            </a-button>
            <project-form ref='ProjectForm' :entrustType="entrustType" :formInfoData='projectInfoData'
                          :pieceTableData="pieceTableData" style="margin-bottom:20px"
                          @change='projectFormChange'
                          @deleteProject="deleteProject"
                          @emptyData="emptyDatCallback"></project-form>
          </div>
        </div>
      </a-spin>
    </h-card>
    <hf-elevator-layer :layer-columns="layerColumns"/>
    <product-add-modal ref='productAddModal' :entrustType="entrustType" @callback='productAddCallback'/>
    <project-add-modal ref='projectAddModal' @change='projectModalCallback'/>
    <history-project-modal ref='historyProjectModal' @callback='projectModalCallback'/>
  </h-modal>
</template>

<script>
import ProjectForm from "@views/hifar/hifar-environmental-test/entrustment/components/ProjectForm";
import ProjectAddModal from "@views/hifar/hifar-environmental-test/entrustment/modules/ProjectAddModal";
import moment from "moment";
import PhemismCustomSelect from "@views/components/PhhemismCustomSelect";
import {cloneDeep, isArray} from 'lodash'
import {postAction} from "@api/manage";
import ProductAddModal from "@views/hifar/hifar-environmental-test/entrustment/modules/ProductAddModal";
import HistoryProjectModal from "@views/hifar/hifar-environmental-test/entrustment/modules/HistoryProjectModal";
import HfElevatorLayer from '@/components/HfElevatorLayer'
import {randomUUID} from "@/utils/util";
import SysUserSelect from '@/views/components/SysUserSelect'

export default {
  name: "EntrustmentInnerModal",
  components: {
    HfElevatorLayer,
    HistoryProjectModal,
    ProductAddModal,
    ProjectAddModal,
    ProjectForm,
    PhemismCustomSelect,
    SysUserSelect
  },
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    const nameValid = ({cellValue}) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!cellValue) {
            reject(new Error('产品编号不能为空'))
          } else {
            resolve()
          }
        }, 100)
      })
    }
    return {
      moment,
      visible: false,
      submitLoading: false,
      handleType: 'add',
      submitStatus: 1,
      entrustModel: {},
      entrustType: '1',
      tableData: [],
      selectedPieceRows: [],
      projectInfoData: [],
      validRules: {
        pieceNo: [{required: true, message: '产品编号不能为空'}, {validator: nameValid}]
      },
      entrustModelInfo: {},
      pieceModelInfo: [],
      projectModelInfo: [],
      secretLevelArr: [],
      staticTableData: [],
      layerColumns: [],
      entrustFormData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true
        },
        {
          title: '运行单号',
          key: 'entrustCode',
          formType: 'input',
          disabled: true,
          hidden: this.handleType !== 'edit'
        },
        {
          title: '委托日期',
          key: 'entrustTime',
          formType: 'datePick',
          validate: {
            rules: [{required: true, message: '请选择委托日期'}]
          }
        },
        {
          title: '委托单类型',
          key: 'entrustType',
          formType: 'dict',
          dictCode: 'hf_entrustlist_entrustType',
          disabled: true,
          validate: {
            rules: [{required: true, message: '请选择委托单类型', trigger: 'blur'}]
          },
        },
        {
          title: '要求试验时间',
          key: 'requireTestTime',
          formType: 'datePick',
          showTime: true,
          format: "YYYY-MM-DD HH:mm:ss",
          validate: {
            rules: [{required: true, message: '请选择要求试验时间'}]
          }
        },
        {
          title: '密级',
          key: 'secretLevelCode',
          formType: 'dict',
          dictCode: 'hf_entrustlist_secondary',
          validate: {
            rules: [{required: false, message: '请选择密级'}]
          },
        },
        {
          title: '试件数量',
          key: 'pieceCount',
          formType: 'input',
          disabled: true,
        },
        {
          title: '送试单位',
          key: 'custId',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请选择送试单位'}]
          },
          component: (
            <phemism-custom-select
              ref='PhemismCustomSelect'
              placeholder={'请选择委托单位'}
              v-decorator={['custId', {rules: [{required: true, initialValue: []}]}]}
              selectedName={() => {
                return this.entrustModel.custName
              }}
              onchange={this.selectCustomerChange}
            />
          )
        },
        {
          title: '联系人',
          key: 'linkName',
          formType: 'input',
          validate: {
            rules: [{required: false, message: '请输入联系人'}]
          }
        },
        {
          title: '联系方式',
          key: 'linkMobile',
          formType: 'input',
          validate: {
            rules: [{required: false, message: '请输入联系方式'}]
          }
        },
        {
          title: '试验性质',
          key: 'testPropertyCode',
          formType: 'dict',
          dictCode: 'env_test_quality',
          validate: {
            rules: [{required: true, message: '请选择试验性质'}]
          },
        },
        {
          title: '优先级',
          key: 'priority',
          formType: 'dict',
          dictCode: 'hf_entrust_priority',
          validate: {
            rules: [{required: true, message: '请选择优先级'}]
          },
        },
        {
          title: '预计时长',
          key: 'expectedTime',
          formType: 'input-number',
          validate: {
            rules: [{required: true, message: '请输入预计时长'}]
          },
          style: {
            width: '100%'
          }
        },
        {
          title: '任务编码',
          key: 'outSourceCode',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入任务编码'}]
          }
        },
        {
          title: '是否生成报告',
          key: 'isBuildingReport',
          formType: 'radio',
          radioType: 'radioButton',
          defaultValue: 1,
          options: [
            {title: '是', value: 1, key: 1},
            {title: '否', value: 2, key: 2}
          ],
        },
        {
          title: '是否拍照',
          key: 'isPhotograph',
          formType: 'radio',
          radioType: 'radioButton',
          defaultValue: 1,
          options: [
            {title: '是', value: 1, key: 1},
            {title: '否', value: 2, key: 2}
          ],
        },
        {
          title: '发起人',
          key: 'initiator',
          component: (
            <sys-user-select
              v-decorator={['initiator', {initialValue: []}]}
              v-on:change={this.initiatorChange}
            />
          ),
          validate: {
            rules: [{required: true, message: '请选择发起人'}]
          }
        },
        {
          title: '电话',
          key: 'phone',
          formType: 'input',
        },
        {
          title: '测试软件/测试方法',
          key: 'testMethod',
          formType: 'textarea',
          placeholder: '例：运行XX测试软件V1.00/使用XX测试工装进行监测/使用FLUKE45测量输出电压等',
          style: {
            width: '100%',
          },
          validate: {
            rules: [{required: true, message: '请输入测试软件/测试方法'}]
          },
          autoSize: {minRows: 2},
          span: 4
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          style: {
            width: '100%',
          },
          autoSize: {minRows: 4},
          span: 4
        },
      ],
      activePieceRow: "",
      url: {
        save: "HfEnvEntrustBusiness/saveEntrust",
        setSecretLevel: '/MinioBusiness/modifyAttachSecretLevelByIds',
        edit: "/HfEnvEntrustBusiness/queryById"
      },
    }
  },
  computed: {
    pieceTableData() {
      return this.tableData
    },
  },
  watch: {
    tableData(val) {
      this.$nextTick(() => {
        this.$refs.entrustFrom.form.setFieldsValue({pieceCount: val.length})
      })
    }
  },
  methods: {
    show(record, type) {
      this.visible = true
      this.handleType = type
      this.selectedPieceRows = []
      if (record.id) {
        this.handleEdit(record.id)
      } else {
        this.handleAdd()
      }
    },
    // 新增默认值
    handleAdd() {
      this.entrustModel = {
        entrustTime: moment(),
        entrustType: '1',
        secretLevelCode: 1,
      }
      this.tableData = []
      this.projectInfoData = []
      this.$nextTick(() => {
        this.buildLayer()
        this.handleScroll()
      })
    },
    handleEdit(id) {
      this.submitLoading = true
      postAction(this.url.edit, {id, type: '1'}).then(res => {
        if (res.code === 200) {
          let obj = Object.assign({}, res.data)
          obj.entrustTime = obj.entrustTime && +obj.entrustTime !== 0 ? moment(+obj.entrustTime) : moment()
          obj.requireTestTime = obj.requireTestTime && +obj.requireTestTime !== 0 ? moment(+obj.requireTestTime) : moment()
          this.entrustType = obj.entrustType
          this.entrustModel = obj
          this.tableData = []
          this.tableData = obj.pieceInfo
          this.projectInfoData = obj.projectInfo
          this.buildLayer(obj.projectInfo)
          this.handleScroll()
          this.pieceSorting(this.tableData)
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
    initiatorChange(value, option) {
      this.$refs.entrustFrom.form.setFieldsValue({phone: option.mobile})
    },
    handleScroll() {
      // 滚动条滚动时电梯层自动定位，暂时先不做
      // document.addEventListener('scroll', (e) => {
      //   console.log(e, 'e')
      // }, true)
    },
    buildLayer(column) {
      let defaultLayer = [
        {
          title: "委托信息",
          id: "entrust"
        },
        {
          title: "产品信息",
          id: "product"
        },
        {
          title: "项目信息",
          id: "project"
        },
      ]
      this.layerColumns = []
      column && column.length && column.forEach((item, index) => {
        defaultLayer.push({
          title: item.unitName || item.testName,
          id: 'projectItem' + index
        })
      })
      this.layerColumns = defaultLayer
    },
    selectCustomerChange(val, record) {
      let [customer] = record
      this.entrustModel.custName = customer.custName ? customer.custName : ''
      this.$refs.entrustFrom.form.setFieldsValue(
        {
          custName: customer.custName,
          custId: customer.id,
          custAddress: customer.custAddress,
          linkMobile: customer.linkMobile,
          linkName: customer.linkName,
        }
      )
    },
    //内部新增产品
    handleAddPiece() {
      this.$refs.productAddModal.show()
    },
    pieceDataFocus({row, column}) {
      // 记录一下编辑前的数据
      this.activePieceRow = row[column.property]
    },
    pieceDataBlur({row, rowIndex, column}) {
      // 判断一下输入框失去焦点后数据是否已经改变，改变了再去做变更
      setTimeout(() => {
        if (row[column.property] !== this.activePieceRow) {
          this.setProjectPieceNos(row)
        }
      }, 1)
    },
    // 产品删除
    handleDelete() {
      const $table = this.$refs.pieceTable
      $table.removeCheckboxRow()
      let getRemoveRecords = $table.getRemoveRecords()
      let tableData = this.tableData
      for (let j = 0; j < getRemoveRecords.length; j++) {
        let index = tableData.findIndex(item => item.id === getRemoveRecords[j].id)
        if (index >= 0) {
          let item = tableData[index]
          tableData.splice(index, 1)
          this.setProjectPieceNos(item)
        }
      }
      this.tableData = tableData
      this.selectedPieceRows = []
    },
    // 动态设置项目中已选产品
    setProjectPieceNos(row) {
      if (this.projectInfoData.length) {
        let ProjectForm = this.$refs.ProjectForm
        let projectFormItem = ProjectForm.$refs.projectFormItem
        let getPieceNos = (tableData) => tableData.map(record => record.pieceNo).toString()
        let getPieceIds = (tableData) => tableData.map(record => record.id).toString()
        let project = this.projectInfoData
        for (let i = 0; i < project.length; i++) {
          if (project[i].pieceIds.includes(row.id)) {
            let resData = this.tableData.filter(_item => project[i].pieceIds.includes(_item.id))
            let pieceNos = getPieceNos(resData)
            let pieceIds = getPieceIds(resData)
            projectFormItem[i].$refs['projectInfoForm' + i].form.setFieldsValue({pieceIds, pieceNos})
            projectFormItem[i].model.pieceNos = pieceNos
            projectFormItem[i].model.pieceIds = pieceIds
          }
        }
      }
    },
    //  多选
    onSelectChange({records}) {
      this.selectedPieceRows = records
    },
    // 全选
    selectAllEvent({records}) {
      this.selectedPieceRows = records
    },
    async handleAddHistory() {
      let errMap = await this.$refs.pieceTable.validate().catch(errMap => errMap)
      if (errMap) return this.$message.warning('请填写产品编号')
      if (!this.tableData.length) return this.$message.warning('请先添加产品')
      let pieceIds = this.tableData.map(item => item.id).toString()
      let projectIds = this.projectInfoData.map(item => item.unitId)
      this.$refs.historyProjectModal.show(pieceIds, projectIds)
    },
    // 选择项目
    async handleAddProject() {
      let errMap = await this.$refs.pieceTable.validate().catch(errMap => errMap)
      if (errMap) return this.$message.warning('请填写产品编号')
      if (!this.tableData.length) return this.$message.warning('请先添加产品')
      if (!this.selectedPieceRows.length) return this.$message.warning('请先选择产品')
      let projectIds = this.projectInfoData.map(item => item.unitId)
      this.$refs.projectAddModal.show(projectIds)
    },

    // 选择项目弹框返回数据
    projectModalCallback(recordId, record) {
      let extendRecord = cloneDeep(record)
      if (this.projectInfoData.length) {
        for (let i = 0; i < extendRecord.length; i++) {
          for (let j = 0; j < this.projectInfoData.length; j++) {
            // 选择项目时项目id的字段是id，如果是从后端返回的就是unitId
            if (extendRecord[i].id === this.projectInfoData[j].unitId) {
              extendRecord.splice(i, 1)
              i--
              break
            }
          }
        }
      }
      let selectedPiece = this.selectedPieceRows
      // let {projectResult} = this.$refs.ProjectForm.validateProjectForm(this.projectInfoData, false)
      // console.log(projectResult, 'projectResult')
      // projectResult.forEach(item => {
      //   item.attachIds = (isArray(item.fileInfo) && item.fileInfo.length) ? item.fileInfo : item.attachIds
      // })
      // this.projectInfoData = projectResult.concat(extendRecord.map((item, index) => {
      //   return {
      //     ...item,
      //     // 给选择之后的项目添加unitId字段
      //     unitId: item.id,
      //     testCondition: item.remarks,
      //   }
      // })).map((v, i) => {
      //   return {
      //     ...v,
      //     pieceIds: v.pieceIds || (selectedPiece.length ? selectedPiece.map(_item => _item.id).toString() : ''),
      //     pieceNos: v.pieceNos || (selectedPiece.length ? selectedPiece.map(_item => _item.pieceNo).toString() : '')
      //   }
      // })
      extendRecord = extendRecord.map((item, index) => {
        return {
          ...item,
          // 给选择之后的项目添加unitId字段
          unitId: item.id,
          testCondition: item.remarks,
        }
      })
      this.projectInfoData.push(...extendRecord);
      this.projectInfoData.forEach((item, index) => {
        item.pieceIds = item.pieceIds || (selectedPiece.length ? selectedPiece.map(_item => _item.id).toString() : '')
        item.pieceNos = item.pieceNos || (selectedPiece.length ? selectedPiece.map(_item => _item.pieceNo).toString() : '')
      })
      this.buildLayer(this.projectInfoData)
    },
    // 新增产品弹框返回数据
    productAddCallback(values) {
      let result = []
      for (let i = 0; i < values.length; i++) {
        let v = values[i]
        let getZero = v.pieceStartNo && v.pieceStartNo[0] === '0' && v.pieceStartNo.substring(0, v.pieceStartNo.lastIndexOf('0') + 1) || ''
        for (let j = 0; j < +v.pieceNum; j++) {
          result.push({
            ...v,
            productId: v.id,
            id: randomUUID(),
            pieceNum: 1,
            pieceNo: v.piecePrefix ? v.piecePrefix + getZero + (+v.pieceStartNo + j) : v.pieceStartNo ? +v.pieceStartNo + j : ''
          })
        }
      }
      this.tableData = this.tableData.concat(result)
    },
    // 产品分类：根据产品名称和代号进行分类
    pieceSorting(data, name = 'productName', model = 'productAlias') {
      let result = [], hash = {}
      for (let i = 0; i < data.length; i++) {
        let field = hash[data[i][name] + data[i][model]]
        if (!field) {
          result.push({
            ...data[i],
            pieceNameModel: data[i][name] + data[i][model],
            pieceIds: [data[i].id],
            pieceNos: [data[i].pieceNo],
          })
          hash[data[i][name] + data[i][model]] = data[i]
        } else {
          for (let j = 0; j < result.length; j++) {
            let item = result[j];
            if (item.pieceNameModel === data[i][name] + data[i][model]) {
              item.pieceIds.push(data[i].id);
              item.pieceNos.push(data[i].pieceNo);
              break;
            }
          }
        }
      }
      return result
    },
    //项目信息为空时
    emptyDatCallback() {
      this.submitLoading = false
    },
    deleteProject() {
      this.buildLayer(this.projectInfoData)
    },
    // 项目信息返回数据
    projectFormChange(data, bool, status) {
      //bool 是否进行了数据必填验证
      let projectData = cloneDeep(data)
      projectData.forEach((item) => {
        item.pieceIds = isArray(item.pieceIds) && item.pieceIds.length > 0 ? item.pieceIds.join(',') : item.pieceIds
        item.pieceNos = isArray(item.pieceNos) && item.pieceNos.length > 0 ? item.pieceNos.join(',') : item.pieceNos
        item.standardId = isArray(item.standardId) && item.standardId.length > 0 ? item.standardId[0] : item.standardId
      })
      if (bool) {
        if (projectData.length) {
          this.projectModelInfo = projectData
        } else {
          this.submitLoading = false
          this.projectModelInfo = []
        }
      } else {
        this.projectModelInfo = projectData
      }
      this.setSecretLevelByFileList(this.secretLevelArr)
      this.submitRequest(this.submitStatus)
    },
    //暂存 不需要验证任何表单和表格
    handleTransientSubmit() {
      this.submitStatus = 1
      this.validateEntrustForm(false).then(res => {
        let entrustModelInfo = cloneDeep(res)
        this.buildEntrustData(entrustModelInfo)
        this.getPiecesTableData(false).then(data => {
          this.pieceModelInfo = data
          this.$refs.ProjectForm.submitHandle(false)
        })
      })
    },
    //提交
    handleSubmit() {
      this.submitStatus = 10
      this.validateEntrustForm(true).then(res => {
        let entrustModelInfo = cloneDeep(res)
        this.buildEntrustData(entrustModelInfo)
        this.getPiecesTableData(true).then(data => {
          if (data.length) {
            this.pieceModelInfo = data
            this.$refs.ProjectForm.submitHandle(true, 10)
          } else {
            this.submitLoading = false
            return this.$message.warning('请添加产品！')
          }
        })
      })
    },
    // 暂存-提交请求
    submitRequest(status) {
      let {entrustModelInfo, pieceModelInfo, projectModelInfo} = this
      // 项目中实际用到的产品
      let projectOfPiece = projectModelInfo.reduce((pre, next) => {
        return pre.concat(...next.pieceIds.split(','))
      }, [])
      // 判断产品列表中的数量和项目实际用到的产品数量
      if (pieceModelInfo.length !== projectOfPiece.length && status === 10) {
        let pieceNosDom = [], index = 0, pieceIds = []
        let usedPieceIds = projectModelInfo.reduce((pre, next) => {
          return pre.concat(next.pieceIds.split(','))
        }, [])
        let allPieceIds = cloneDeep(pieceModelInfo).map(item => item.id)
        for (let i = 0; i < usedPieceIds.length; i++) {
          if (allPieceIds.includes(usedPieceIds[i])) {
            allPieceIds = allPieceIds.filter(item => item !== usedPieceIds[i])
          }
        }
        for (let i = 0; i < allPieceIds.length; i++) {
          index++
          pieceIds.push(allPieceIds[i])
          pieceNosDom.push(<div
            style={{color: 'red'}}>{` ${index}、${pieceModelInfo.filter(item => item.id === allPieceIds[i])[0].pieceNo} `}</div>)
        }
        if (pieceIds.length) {
          this.$confirm({
            title: '提示',
            content: h => {
              return h('div', {}, [
                <p>还有如下编号的产品未添加分配试验项目</p>,
                <p>{pieceNosDom}</p>,
                <p>确定继续提交吗？</p>
              ])
            },
            onOk: () => {
              // 这里需要删除多余没有用到的产品
              fn.call(this, pieceIds)
            }
          })
        } else {
          fn.call(this)
        }
      } else {
        fn.call(this)
      }

      function fn(pieceIds) {
        let params = {entrustModelInfo, pieceModelInfo, projectModelInfo, status,}
        params.pieceModelInfo = pieceIds && pieceIds.length ? params.pieceModelInfo.filter(item => !pieceIds.toString().includes(item.id)) : params.pieceModelInfo
        this.submitLoading = true
        postAction(this.url.save, params).then(res => {
          if (res.code === 200) {
            this.$message.success(status === 1 ? '暂存成功' : "提交成功")
            this.handleCancel()
            this.$emit('change', true)
          } else {
            this.$message.warning(res.msg)
          }
        }).finally(() => {
          this.submitLoading = false
        })
      }
    },
    // 构建委托表单数据
    buildEntrustData(entrustModelInfo) {
      entrustModelInfo.custId = isArray(entrustModelInfo.custId) && entrustModelInfo.custId.length > 0 ? entrustModelInfo.custId[0] : entrustModelInfo.custId
      entrustModelInfo.entrustTime = entrustModelInfo.entrustTime ? entrustModelInfo.entrustTime.valueOf() : ''
      entrustModelInfo.requireTestTime = entrustModelInfo.requireTestTime ? entrustModelInfo.requireTestTime.valueOf() : ''
      this.entrustModelInfo = entrustModelInfo
    },
    // 给附件设置密级
    setSecretLevelByFileList(secretLevelArr) {
      postAction(this.url.setSecretLevel, {attachInfo: secretLevelArr})
    },
    // 验证委托信息的form表单 获取表单数据
    validateEntrustForm(bool) {
      // bool是否进行表单验证
      let entrustFrom = this.$refs.entrustFrom.form
      return new Promise((resolve, reject) => {
        if (bool) {
          entrustFrom.validateFieldsAndScroll((err, values) => {
            if (!err) {
              resolve(values)
            } else {
              this.submitLoading = false
            }
          })
        } else {
          let values = entrustFrom.getFieldsValue()
          resolve(values)
        }
      })
    },
    // 获取产品表格数据
    getPiecesTableData(bool) {
      // bool 是否进行表格验证
      let pieceTable = this.$refs.pieceTable
      let pieceInfoData = []
      return new Promise((resolve, reject) => {
        if (bool) {
          pieceTable.validate().then(() => {
            let tableData = pieceTable.getData()
            if (tableData.length === 0) {
              pieceInfoData = []
            } else {
              pieceInfoData = tableData
            }
            resolve(pieceInfoData)
          }).catch(err => {
            reject(err)
            this.submitLoading = false
          })
        } else {
          resolve(pieceTable.getData())
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.submitLoading = false
      this.entrustType = '1'
    },
  },
}
</script>

<style lang="less" scoped>
.item-wrapper {
  margin-bottom: 10px;
  border: 1px solid #d9d9d9;

  &-title {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid #d9d9d9;
    padding: 0 20px;
    background-color: #ecf5ff;

    .title {
      color: #000;
      font-size: 18px;
      line-height: 40px;
      position: relative;

      &:before {
        content: "";
        width: 3px;
        height: 40px;
        background-color: #409EFF;
        position: absolute;
        left: -20px;
      }
    }

    .description {
      display: inline-block;
      margin-left: 10px;
    }
  }

  &-content {
    padding: 0 20px;
  }
}

/deep/ .ant-radio-button-wrapper:first-child {
  border-radius: 4px;
}

/deep/ .ant-radio-button-wrapper:last-child {
  border-radius: 4px;
}

/deep/ .ant-radio-button-wrapper {
  border-radius: 4px;
  margin-right: 10px;
  min-width: 80px;
  text-align: center;
}

.entrustModal /deep/ .ant-modal-close-x {
  line-height: 33px !important;
}

/deep/ .vxe-table-box .vxe-table .vxe-body--column.col--valid-error .vxe-cell--valid .vxe-cell--valid-msg {
  background: transparent !important;
}
</style>