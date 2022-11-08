<!--
 * @Author: 雷宇航
 * @Date: 2022-09-29 15:51:32
 * @fileName: NewTestProjectFormItem.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\NewTestProjectFormItem.vue
 * @Description: 项目信息表单
-->
<template>
  <div style="height: 100%; position: relative">
    <h-form
      :ref="'projectInfoForm' + index"
      v-model="model"
      :column="3"
      :formData="formData"
      style="margin-top: 18px; margin-left: 15px"
    >
    </h-form>
  </div>
</template>

<script>
import moment from 'moment'
import {isObject} from 'lodash'
import NewSampleListModal from '@/views/hifar/hifar-environmental-test/entrustment/components/NewSampleListModal'
import MethodSelectModal from '@/views/hifar/hifar-environmental-test/components/MethodSelectModal'

export default {
  components: {
    NewSampleListModal, MethodSelectModal
  },
  props: {
    project: {
      type: Object,
      default: () => {
      }
    },
    index: {
      type: [String, Number],
      default: null
    },
    pieceTableData: {
      type: Array,
      default: () => []
    },
    entrustType: {
      type: String,
      default: '1'
    },
  },
  watch: {
    project: {
      immediate: true,
      handler(val) {
        if (isObject(val) && Object.keys(val).length) {
          let obj = Object.assign({}, val)
          obj.taskExpectStartTime = obj.taskExpectStartTime && obj.taskExpectStartTime != 0 ? moment(+obj.taskExpectStartTime).format('YYYY-MM-DD HH:mm:ss') : ''
          obj.unitId = obj.unitId ? obj.unitId : obj.id
          obj.testName = obj.unitName
          let fileList = []
          obj.fileInfo && obj.fileInfo.length && obj.fileInfo.forEach(item => {
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
          this.model = obj
        }
      }
    },
    'model.pieceNos': {
      immediate: true,
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.$refs.newSampleListModal.localSelectedName = val
          })
        }
      },
    }
  },
  data() {
    return {
      moment,
      model: {},
      rowIndex: '',
      formData: [
        {
          title: '',
          key: 'unitId',
          formType: 'input',
          hidden: true
        },
        {
          title: '项目名称',
          key: 'unitName',
          formType: 'text'
        },
        {
          title: '试验名称',
          key: 'testName',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入试验名称'}]
          }
        },
        {
          title: '技术文件',
          key: 'technicalFile',
          formType: 'input',
          validate: {
            rules: [{required: true, message: '请输入技术文件'}]
          }
        },
        {
          title: '检测依据',
          key: 'standardId',
          validate: {
            rules: [{required: true, message: '请选择试验标准'}]
          },
          component: (
            <method-select-modal
              v-decorator={['standardId', {initialValue: []}]}
              selectedName={() => {
                return this.model.standardName
              }}
              itemUnitId={() => {
                return this.model.unitId
              }}
              onchange={(selectedRowKeys, selectedRows) => {
                let formName = 'projectInfoForm' + this.index
                let standardName = selectedRows[0] ? selectedRows[0].standardCode + '-' + selectedRows[0].standardName : ''
                this.model.standardId = selectedRowKeys
                this.model.standardName = standardName
                this.$refs[formName].form.setFieldsValue({standardName: standardName})
              }}
            />
          )
        },
        {
          title: "是否分包",
          key: 'isSubpackage',
          formType: 'radio',
          radioType: 'radioButton',
          options: [
            {title: '是', value: '1', key: '1'},
            {title: '否', value: '2', key: '2'}
          ],
          defaultValue: '2',
          validate: {
            rules: [{required: true, message: '请选择是否分包'}]
          }
        },
        {
          title: '',
          key: 'pieceNos',
          formType: 'input',
          hidden: true
        },
        {
          title: '已选样品',
          key: 'pieceIds',
          validate: {
            rules: [{required: true, message: '请选择样品'}]
          },
          component: (
            <new-sample-list-modal
              type="checkbox"
              ref="newSampleListModal"
              v-decorator={['pieceIds', {initialValue: []}]}
              selectedName={() => {
                return this.model.pieceNosName ? this.model.pieceNosName : this.model.pieceNos
              }}
              entrustType={this.entrustType}
              pieceTableData={this.pieceTableData}
              onchange={(selectedRowKeys, selectedRows, pieceNos) => {
                let formName = 'projectInfoForm' + this.index
                this.model.pieceIds = selectedRowKeys
                this.model.pieceNosName = pieceNos && pieceNos.length > 0 ? pieceNos.join(',') : ''
                this.$refs[formName].form.setFieldsValue({pieceNos: pieceNos.join(',')})
              }}
            />
          )
        },
        {
          title: '期望开始时间',
          key: 'taskExpectStartTime',
          formType: 'datePick',
          showTime: true,
          format: "YYYY-MM-DD HH:mm:ss"
        },
        {
          title: '试验条件',
          key: 'testCondition',
          formType: 'textarea',
          span: 3,
          placeholder: '请输入试验条件',
          autoSize: {minRows: 4},
          maxLength: 240,
          rows: 4,
          validate: {
            rules: [{required: true, message: '请输入试验条件'}],
          },
        },
        {
          title: '附件',
          key: 'attachIds',
          span: 3,
          component: (
            <h-upload-img
              accept={"image/png,image/gif,image/jpg,image/jpeg"}
              v-decorator={['attachIds', {initialValue: []}]}
            />
          ),
        }
      ],
    }
  },
  methods: {}
}
</script>
<style lang="less" scoped>

</style>