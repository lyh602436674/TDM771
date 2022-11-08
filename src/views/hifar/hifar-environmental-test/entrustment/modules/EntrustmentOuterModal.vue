<!--
 * @Author: 雷宇航
 * @Date: 2022-10-08 13:43:35
 * @fileName: EntrustmentOuterModal.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\modules\EntrustmentOuterModal.vue
 * @Description: 外部委托单新增编辑弹框
-->
<template>
  <h-modal
    :getContainer='getContainer'
    :visible='visible'
    destroyOnClose
    fullScreen inner
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
      <template slot='title'> {{ handleType === 'add' ? '新增' : '编辑' }}外部委托试验</template>
      <a-spin :spinning="submitLoading">
        <div class="item-wrapper">
          <div class="item-wrapper-title">
            <span class="title">委托信息</span>
            <span class="description">填写申请单基本信息</span>
          </div>
          <div class="item-wrapper-content">
            <h-form
              ref='entrustFrom'
              v-model='entrustModel'
              :column='3'
              :formData='entrustFormData'
              style='margin-top: 40px'
            >
            </h-form>
          </div>
        </div>
        <div class="item-wrapper">
          <div class="item-wrapper-title">
            <span class="title">样品信息</span>
            <span class="description">填写样品信息</span>
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
                新增样品
              </a-button>
              <a-popconfirm title="确定删除吗?" @confirm="handleDelete">
                <a-button v-if='selectedRowKeys.length' icon='minus' size='small' type='danger'>
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
                  activeMethod: ({column})=> { return column.property !== 'pieceNum'},
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
                      attrs: { type: 'text', placeholder: '请输入样品名称' },
                      events:{
                        blur: this.pieceDataBlur,
                        focus: this.pieceDataFocus,
                      }
                    }"
                  field='productName'
                  title="样品名称"
                />
                <vxe-table-column
                  :edit-render="{
                   name:'input',
                   attrs: { type: 'text', placeholder: '请输入图号' },
                   events:{
                        blur: this.pieceDataBlur,
                        focus: this.pieceDataFocus,
                      }
                }"
                  field='productAlias'
                  title="图号"
                />
                <vxe-table-column
                  :edit-render="{
                    showAsterisk:true,
                    name: 'input',
                    attrs: { type: 'text', placeholder: '请输入样品编号' },
                    events:{
                        blur: this.pieceDataBlur,
                        focus: this.pieceDataFocus,
                     }
                  }"
                  field='pieceNo'
                  title="样品编号"
                />
                <vxe-table-column
                  :edit-render="{
                   name:'input',
                   attrs: { type: 'number', placeholder: '请输入样品数量' },
                }"
                  field='pieceNum'
                  title="样品数量"
                />
              </vxe-table>
            </div>
          </div>
        </div>
        <div class="item-wrapper">
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
            <new-test-project-form ref='ProjectForm' :entrustType="entrustType" :formInfoData='projectInfoData'
                                   :pieceTableData="pieceTableData" style="margin-bottom:20px"
                                   @change='projectFormChange'
                                   @emptyData="emptyDatCallback"></new-test-project-form>
          </div>
        </div>
      </a-spin>
    </h-card>
    <project-add-modal ref='projectAddModal' @change='projectModalCallback'></project-add-modal>
    <product-add-modal ref='productAddModal' :entrustType="entrustType"
                       @callback='productAddCallback'></product-add-modal>
  </h-modal>
</template>

<script>
import NewTestProjectForm from "@views/hifar/hifar-environmental-test/entrustment/components/NewTestProjectForm";
import ProjectAddModal from "@views/hifar/hifar-environmental-test/entrustment/modules/ProjectAddModal";
import ProductSelectModal from "@views/hifar/hifar-environmental-test/entrustment/modules/ProductSelectModal";
import moment from "moment";
import PhemismCustomSelect from "@views/components/PhhemismCustomSelect";
import {cloneDeep, isArray} from 'lodash'
import {postAction} from "@api/manage";
import {randomUUID} from "@/utils/util";
import ProductAddModal from "@views/hifar/hifar-environmental-test/entrustment/modules/ProductAddModal";

export default {
  name: "NewEntrustmentModal",
  components: {ProductAddModal, ProductSelectModal, ProjectAddModal, NewTestProjectForm, PhemismCustomSelect},
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
            reject(new Error('样品编号不能为空'))
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
      entrustType: '2',
      tableData: [],
      selectedRowKeys: [],
      projectInfoData: [],
      validRules: {
        pieceNo: [{required: true, message: '样品编号不能为空'}, {validator: nameValid}]
      },
      entrustModelInfo: {},
      pieceModelInfo: [],
      projectModelInfo: [],
      secretLevelArr: [],
      staticTableData: [],
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
          title: '申请日期',
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
          validate: {
            rules: [{required: true, message: '请选择委托单类型', trigger: 'blur'}]
          },
          disabled: true,
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
          title: '工作令号',
          key: 'workOrderNo',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入工作令号', trigger: 'blur'}]
          },
        },
        {
          title: '产品名称',
          key: 'productName',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入产品名称', trigger: 'blur'}]
          },
        },
        {
          title: '委托单位',
          key: 'custId',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请选择委托单位'}]
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
          title: '申请人',
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
          title: '试验目的',
          key: 'testPurpose',
          formType: 'dict',
          dictCode: 'en_test_purpose',
          validate: {
            rules: [{required: true, message: '请选择试验目的'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '要求完成时间',
          key: 'requireCompletionTime',
          formType: 'datePick',
          validate: {
            rules: [{required: true, message: '请选择要求完成时间'}]
          }
        },
        {
          title: '样品制造单位',
          key: 'sampleMakeUnit',
          formType: 'input',
          validate: {
            rules: [{required: false, message: '请输入样品制造单位'}]
          }
        },
        {
          title: '样品状态',
          key: 'sampleStatus',
          formType: 'dict',
          dictCode: 'en_sample_status',
          validate: {
            rules: [{required: true, message: '请选择样品状态'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '样品提供方式',
          key: 'sampleProvisionMethod',
          formType: 'dict',
          dictCode: 'en_sample_pro_method',
          validate: {
            rules: [{required: true, message: '请选择样品提供方式'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '样品处置方式',
          key: 'sampleDisposeMethod',
          formType: 'dict',
          dictCode: 'en_sample_dis_method',
          validate: {
            rules: [{required: true, message: '请选择样品处置方式'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '性能测试',
          key: 'performanceTest',
          formType: 'dict',
          dictCode: 'en_performance_test',
          validate: {
            rules: [{required: true, message: '请选择性能测试'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '测试地点',
          key: 'testAddress',
          formType: 'dict',
          dictCode: 'en_test_address',
          validate: {
            rules: [{required: true, message: '请选择测试地点'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '检测照片',
          key: 'testPicture',
          formType: 'dict',
          dictCode: 'en_test_picture',
          validate: {
            rules: [{required: true, message: '请选择检测照片'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '检测报告',
          key: 'testReport',
          formType: 'dict',
          dictCode: 'en_test_report',
          validate: {
            rules: [{required: true, message: '请选择检测报告'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '报告形式',
          key: 'reportForm',
          formType: 'dict',
          dictCode: 'en_report_form',
          validate: {
            rules: [{required: true, message: '请选择报告形式'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '报告份数',
          key: 'reportNum',
          formType: 'input-number',
          style: {
            width: '100%'
          }
        },
        {
          title: '报告领取方式',
          key: 'reportCollectionMethod',
          formType: 'dict',
          dictCode: 'en_report_coll_method',
          validate: {
            rules: [{required: true, message: '请选择报告领取方式'}]
          },
          change: (val, option) => {
          }
        },
        {
          title: '试验依据',
          key: 'testEvidence',
          formType: 'input',
          validate: {
            rules: [{required: false, message: '请输入试验依据'}]
          }
        },
        {
          title: '试验要求',
          key: 'testRequire',
          formType: 'input',
          validate: {
            rules: [{required: true, message: `请输入试验要求`}]
          }
        },
        {
          title: '备注',
          key: 'remarks',
          formType: 'textarea',
          style: {
            width: '100%',
          },
          autoSize: {minRows: 4},
          span: 3
        },
        {
          title: '委托单附件',
          key: 'attachIds',
          span: 3,
          component: (
            <h-upload-file showSecret={true} secretLevel={1} v-decorator={['attachIds', {initialValue: []}]}/>
          )
        }
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
  methods: {
    show(record, type) {
      this.visible = true
      this.handleType = type
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
        attachIds: [],
        entrustType: '2',
        secretLevelCode: 1
      }
      this.tableData = []
      this.projectInfoData = []
    },
    handleEdit(id) {
      this.submitLoading = true
      postAction(this.url.edit, {id}).then(res => {
        if (res.code === 200) {
          let obj = Object.assign({}, res.data)
          let fileList = []
          obj.attachInfo.length && obj.attachInfo.forEach(item => {
            fileList.push({
              fileId: item.id,
              size: item.fileSize,
              status: item.status == 9 ? 'success' : 'exception',
              url: item.filePath,
              name: item.fileName,
              uuid: item.id,
              percent: 100,
              uploadTime: item.createTime,
              secretLevel: item.secretLevel,
              type: item.viewType == 2 ? 'image/jpeg' : 'text/plain',
              replaceStatus: item.replaceStatus
            })
          })
          obj.attachIds = fileList || []
          obj.entrustTime = obj.entrustTime && obj.entrustTime != 0 ? moment(parseFloat(obj.entrustTime)) : moment()
          obj.requireCompletionTime = obj.requireCompletionTime && obj.requireCompletionTime != 0 ? moment(parseFloat(obj.requireCompletionTime)) : moment()
          this.entrustType = obj.entrustType
          this.entrustModel = obj
          this.tableData = []
          this.tableData = obj.pieceInfo
          this.projectInfoData = obj.projectInfo
          this.pieceSorting(this.tableData, 'productName', 'productAlias')
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
    // 外部样品新增
    handleAddPiece() {
      this.$refs.productAddModal.show()
    },
    // 新增样品弹框返回数据
    productAddCallback(values) {
      if (values.pieceNo.includes('-') && values.pieceNo.includes(',')) {
        this.tableData.push(...this.splitByBoth(values))
      } else if (values.pieceNo.includes(',')) {
        this.tableData.push(...this.splitByComma(values, values.pieceNo.split(',')))
      } else if (values.pieceNo.includes('-')) {
        this.tableData.push(...this.splitByHorizontalLine(values, values.pieceNo.split('-')))
      } else {
        this.tableData.push({
          id: randomUUID(),
          productName: values.productName,
          pieceNum: 1,
          productAlias: values.productAlias,
          pieceNo: (values.piecePrefix || '') + values.pieceNo,
        })
      }
      this.setProjectPieceNos()
    },
    splitByHorizontalLine(values, arr) {
      //根据横杠分隔
      let tableData = []
      let num = +arr[1] + 1 - +arr[0] > +values.pieceNum ? +arr[0] + +values.pieceNum - 1 : +arr[1]
      for (let i = +arr[0]; i <= num; i++) {
        tableData.push({
          id: randomUUID(),
          productName: values.productName,
          pieceNum: 1,
          productAlias: values.productAlias,
          pieceNo: (values.piecePrefix || '') + i,
        })
      }
      return tableData
    },
    splitByComma(values, arr) {
      // 根据逗号分隔
      let tableData = []
      arr.forEach(item => {
        tableData.push({
          id: randomUUID(),
          productName: values.productName,
          pieceNum: 1,
          productAlias: values.productAlias,
          pieceNo: (values.piecePrefix || '') + item,
        })
      })
      return tableData
    },
    splitByBoth(values) {
      // 逗号和横杠都存在
      let commaArr = values.pieceNo.split(',')
      let tableData = []
      for (let i = 0; i < commaArr.length; i++) {
        if (commaArr[i].includes('-')) {
          tableData.push(...this.splitByHorizontalLine(values, commaArr[i].split('-')))
        } else {
          tableData.push({
            id: randomUUID(),
            productName: values.productName,
            pieceNum: 1,
            productAlias: values.productAlias,
            pieceNo: (values.piecePrefix || '') + commaArr[i],
          })
        }
      }
      return tableData
    },
    pieceDataFocus({row, column}) {
      // 记录一下编辑前的数据
      this.activePieceRow = row[column.property]
    },
    pieceDataBlur({row, rowIndex, column}) {
      // 判断一下输入框失去焦点后数据是否已经改变，改变了再去做变更和提醒
      setTimeout(() => {
        if (row[column.property] !== this.activePieceRow) {
          this.setProjectPieceNos()
        }
      }, 1)
    },
    // 样品删除
    handleDelete() {
      const $table = this.$refs.pieceTable
      $table.removeCheckboxRow()
      let getRemoveRecords = $table.getRemoveRecords()
      let getTableData = this.tableData
      for (let i = 0; i < getTableData.length; i++) {
        for (let j = 0; j < getRemoveRecords.length; j++) {
          if (getTableData[i].id === getRemoveRecords[j].id) {
            this.tableData.splice(i, 1)
            i--
            break
          }
        }
      }
      this.selectedRowKeys = []
      this.setProjectPieceNos()
    },
    // 动态设置项目中已选样品
    setProjectPieceNos() {
      if (this.projectInfoData.length) {
        this.$message.warning('样品数据改变，也将同步项目信息中的已选样品数据改变')
        setTimeout(() => {
          let ProjectForm = this.$refs.ProjectForm
          let projectFormItem = ProjectForm.$refs.projectFormItem
          let tableData = this.$refs.pieceTable.getData()
          let pieceSorting = this.pieceSorting(tableData, 'productName', 'productAlias')
          let pieceIds = index => pieceSorting[index] ? pieceSorting[index].pieceIds.toString() : ''
          let pieceNos = index => pieceSorting[index] ? pieceSorting[index].pieceNos.toString() : ''
          for (let i = 0; i < this.projectInfoData.length; i++) {
            projectFormItem[i].$refs['projectInfoForm' + i].form.setFieldsValue({
              pieceIds: pieceIds(i),
              pieceNos: pieceNos(i)
            })
            projectFormItem[i].model.pieceNos = pieceNos(i)
          }
        }, 1)
      }
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
    //  多选
    onSelectChange(records) {
      this.selectedRowKeys = records.records
    },
    // 全选
    selectAllEvent(records) {
      this.selectedRowKeys = records.records
    },
    // 选择项目
    async handleAddProject() {
      let errMap = await this.$refs.pieceTable.validate().catch(errMap => errMap)
      if (errMap) return this.$message.warning('请填写样品编号')
      if (!this.tableData.length) return this.$message.warning('请先添加样品')
      this.$refs.projectAddModal.visible = true
      await this.$refs.projectAddModal.getProjectTree()
      this.$refs.projectAddModal.selectedRowKeys = this.projectInfoData && this.projectInfoData.length && this.projectInfoData.map(item => item.unitId) || []
    },
    // 选择项目弹框返回数据
    projectModalCallback(recordId, record) {
      let pieceTableData = this.$refs.pieceTable.getData()
      let pieceSorting = this.pieceSorting(pieceTableData, 'productName', 'productAlias')
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
      this.projectInfoData = this.projectInfoData.concat(extendRecord.map((item, index) => {
        return {
          ...item,
          // 给选择之后的项目添加unitId字段
          unitId: item.id,
          testCondition: item.remarks,
        }
      })).map((v, i) => {
        return {
          ...v,
          pieceIds: pieceSorting[i] ? pieceSorting[i].pieceIds.toString() : '',
          pieceNos: pieceSorting[i] ? pieceSorting[i].pieceNos.toString() : ''
        }
      })
    },
    // 样品分类：根据样品名称和图号进行分类
    pieceSorting(data, name, model) {
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
    // 项目信息返回数据
    projectFormChange(data, bool, status) {
      //bool 是否进行了数据必填验证
      let projectData = cloneDeep(data)
      projectData.forEach((item) => {
        item.pieceIds = isArray(item.pieceIds) && item.pieceIds.length > 0 ? item.pieceIds.join(',') : item.pieceIds
        item.pieceNos = isArray(item.pieceNos) && item.pieceNos.length > 0 ? item.pieceNos.join(',') : item.pieceNos
        item.standardId =
          isArray(item.standardId) && item.standardId.length > 0 ? item.standardId[0] : item.standardId
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
            return this.$message.warning('请添加样品！')
          }
        })
      })
    },
    // 暂存-提交请求
    submitRequest(status) {
      let {entrustModelInfo, pieceModelInfo, projectModelInfo} = this
      // 项目中实际用到的样品
      let projectOfPiece = projectModelInfo.reduce((pre, next) => {
        return pre.concat(...next.pieceIds.split(','))
      }, [])
      // 判断样品列表中的数量和项目实际用到的样品数量
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
                <p>还有如下编号的样品未添加分配试验项目</p>,
                <p>{pieceNosDom}</p>,
                <p>确定继续提交吗？</p>
              ])
            },
            onOk: () => {
              // 这里需要删除多余没有用到的样品
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
      let attachIds = [], secretLevelArr = []
      entrustModelInfo.attachIds.length && entrustModelInfo.attachIds.forEach(item => {
        attachIds.push(item.fileId)
        secretLevelArr.push({
          id: item.fileId,
          secretLevel: item.secretLevel
        })
      })
      this.secretLevelArr = secretLevelArr
      entrustModelInfo.attachIds = attachIds.length > 0 ? attachIds.join(',') : ''
      entrustModelInfo.custId = isArray(entrustModelInfo.custId) && entrustModelInfo.custId.length > 0 ? entrustModelInfo.custId[0] : entrustModelInfo.custId
      entrustModelInfo.entrustTime = entrustModelInfo.entrustTime ? entrustModelInfo.entrustTime.valueOf() : ''
      entrustModelInfo.requireCompletionTime = entrustModelInfo.requireCompletionTime ? entrustModelInfo.requireCompletionTime.valueOf() : ''
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
    // 获取样品表格数据
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
      this.entrustType = '2'
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

/deep/ .ant-modal-close-x {
  line-height: 33px !important;
}

/deep/ .vxe-table-box .vxe-table .vxe-body--column.col--valid-error .vxe-cell--valid .vxe-cell--valid-msg {
  background: transparent !important;
}
</style>