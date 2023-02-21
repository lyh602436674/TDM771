<!--
 * @Author: 雷宇航
 * @Date: 2022-09-29 15:48:21
 * @fileName: ProjectForm.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\ProjectForm.vue
 * @Description: 项目信息
-->
<template>
  <div style="height: 100%">
    <div :id="'projectItem'+index" v-for="(item, index) in formInfoDataList" :key="index" class="panel-custom">
      <div class="panel-custom-item">
        <div class="panel-custom-item-left">
          <project-form-item ref="projectFormItem" :index="index" :entrustType="entrustType"
                             :pieceTableData="pieceTableData" :project="item"></project-form-item>
        </div>
        <div class="panel-custom-item-top-right">
          <a-popconfirm title="确定删除吗?" @confirm="() => deleteProjectHandle(item, index)">
            <a-button
              icon="delete"
              size="small"
              style="width: 32px; height: 32px"
              type="danger"
            ></a-button>
          </a-popconfirm>
        </div>
      </div>
    </div>
    <div v-if="formInfoDataList.length === 0" class="emptyStyle">
      <a-empty/>
    </div>
  </div>
</template>

<script>
import ProjectFormItem from '@views/hifar/hifar-environmental-test/entrustment/components/ProjectFormItem'
import entrustmentMixins from "@views/hifar/hifar-environmental-test/entrustment/components/entrustmentMixins";
import {isArray} from "lodash"

export default {
  mixins: [entrustmentMixins],
  props: {
    formInfoData: {
      type: Array,
      default: () => []
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
  components: {
    ProjectFormItem
  },
  watch: {
    formInfoData: {
      deep: true,
      immediate: true,
      handler(val) {
        if (!val || !val.length) {
          this.formInfoDataList = []
        } else {
          this.formInfoDataList = val
        }
      }
    }
  },
  data() {
    return {
      form: null,
      messageError: '',
      projectModel: {
        needProcess: 1
      },
      formInfoDataList: [],
      selectRow: null
    }
  },
  methods: {
    // 删除项目
    deleteProjectHandle(item, index) {
      const {formInfoDataList} = this
      formInfoDataList.splice(index, 1)
      this.formInfoDataList = formInfoDataList
      this.$emit('deleteProject')
    },
    validateProjectForm(formInfoDataList, bool) {
      let projectResult = [];
      let errMap = null
      for (let i = 0; i < formInfoDataList.length; i++) {
        let that = this.$refs.projectFormItem[i]
        let projectForm = that.$refs['projectInfoForm' + [i]]
        // 判断是否是 结构化条件 试验项目（根据项目类型判断）1：气候 2：力学 3：环境
        let filterProjectByType = this.filterUnitCode(formInfoDataList[i].classifyType)
        if (filterProjectByType) {
          that.resultEcharts()
        }
        let tabItemTableAllData = [];
        if (filterProjectByType) {
          let testConditionTabItem = that.$refs.testConditionTabItem;
          for (let j = 0; j < testConditionTabItem.length; j++) {
            let tabPanelItem = that.model.abilityRequire[j]
            let item = testConditionTabItem[j]
            let _item_ = item.$refs['pointTable' + [i] + [j]]
            let abilityInfo = _item_.getData()
            if (abilityInfo && isArray(abilityInfo) && abilityInfo.length) {
              tabItemTableAllData.push({
                title: tabPanelItem.title,
                type: tabPanelItem.type,
                highLowTemperature: tabPanelItem.highLowTemperature,
                abilityInfo,
              })
            } else {
              if (bool) {
                this.$emit('emptyData')
                return this.$message.warning(`第${i + 1}个试验项目(${formInfoDataList[i].unitName})的结构化条件未填写`)
              }
            }
          }
        } else {
          let abilityInfo = that.$refs.testConditionTabItem.$refs['pointTable' + [i] + 0].getData()
          if (abilityInfo && isArray(abilityInfo) && abilityInfo.length) {
            tabItemTableAllData.push({
              title: '试验条件',
              type: 'default',
              abilityInfo
            })
          } else {
            if (bool) {
              this.$emit('emptyData')
              return this.$message.warning(`第${i + 1}个试验项目(${formInfoDataList[i].unitName})的结构化条件未填写`)
            }
          }
        }
        if (bool) {
          projectForm.form.validateFieldsAndScroll((error, val) => {
            if (error) {
              errMap = error
            } else {
              let projectFormValue = val
              let attachIds = val.attachIds.map(item => item.fileId).toString()
              projectFormValue.pieceIds = that.model.pieceIds
              projectFormValue.pieceNos = that.model.pieceNos
              projectFormValue.unitName = that.model.unitName;
              projectFormValue.attachIds = attachIds;
              projectFormValue.abilityRequire = tabItemTableAllData;
              projectFormValue.curveUrl = that.curveUrl;
              projectFormValue.testEquip = that.equipData
              projectResult.push(projectFormValue)
            }
          })
          // 在循环中校验表单得用一个变量记录异常 不然无法跳出循环 并且无法进行表单校验
          if (errMap) return this.$emit('emptyData')
        } else {
          let projectFormValue = projectForm.form.getFieldsValue()
          projectFormValue.pieceIds = that.model.pieceIds
          projectFormValue.pieceNos = that.model.pieceNos
          projectFormValue.unitName = that.model.unitName
          projectFormValue.attachIds = projectFormValue.attachIds.map(item => item.fileId).toString()
          projectFormValue.curveUrl = that.curveUrl
          projectFormValue.testEquip = that.equipData
          projectFormValue.abilityRequire = tabItemTableAllData
          // 下面这两个是为了重新选择项目时，数据会丢失的问题
          projectFormValue.fileInfo = that.model.fileInfo
          projectFormValue.testEquipInfo = that.equipData
          projectResult.push(projectFormValue)
        }
      }
      return {projectResult, errMap}
    },
    submitHandle(bool) {
      // bool 是否进行表单校验
      const {formInfoDataList} = this
      if (!formInfoDataList.length) {
        if (bool) {
          this.$emit('emptyData')
          return this.$message.warning('请添加项目')
        } else {
          return this.$emit('change', [], bool)
        }
      } else {
        let {projectResult, errMap} = this.validateProjectForm(formInfoDataList, bool)
        if (errMap) {
          return this.$emit('emptyData')
        } else {
          this.$emit('change', projectResult, bool)
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.panel-custom {
  border-radius: 5px;
  margin-bottom: 10px;
  border: 0;
  overflow: hidden;

  .panel-custom-item {
    margin-bottom: 10px;
    position: relative;
    width: calc(100% - 45px);

    .panel-custom-item-left {
      width: 100%;
      min-height: 226px;
      border: 2px solid #d2cfcf;
      padding: 0 40px 20px 20px;
    }

    .panel-custom-item-top-right {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 99;
    }
  }
}

.emptyStyle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: 1px solid #ccc;
  padding: 100px 0;
}
</style>