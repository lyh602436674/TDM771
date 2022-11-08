<!--
 * @Author: 雷宇航
 * @Date: 2022-09-29 15:48:21
 * @fileName: NewTestProjectForm.vue
 * @FilePath: tdm724-client\src\views\hifar\hifar-environmental-test\entrustment\components\NewTestProjectForm.vue
 * @Description: 项目信息
-->
<template>
  <div style="height: 100%">
    <div v-for="(item, index) in formInfoDataList" :key="index" class="panel-custom">
      <div class="panel-custom-item">
        <div class="panel-custom-item-left">
          <new-test-project-form-item ref="projectFormItem" :index="index" :entrustType="entrustType"
                                      :pieceTableData="pieceTableData" :project="item"></new-test-project-form-item>
        </div>
        <div class="panel-custom-item-right">
          <a-button
            icon="delete"
            size="small"
            style="width: 32px; height: 32px; margin-top: 10px"
            type="danger"
            @click="deleteProjectHandle(item, index)"
          ></a-button>
        </div>
      </div>
    </div>
    <div v-if="formInfoDataList.length === 0" class="emptyStyle">
      <a-empty/>
    </div>
  </div>
</template>

<script>
import NewTestProjectFormItem from '@views/hifar/hifar-environmental-test/entrustment/components/NewTestProjectFormItem'
import moment from 'moment'

export default {
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
    NewTestProjectFormItem
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
    },
    submitHandle(bool) {
      // bool 是否进行验证
      // status 提交/暂存
      const {formInfoDataList} = this
      let projectResult = [];
      if (!formInfoDataList.length) {
        if (bool) {
          this.$emit('emptyData')
          return this.$message.warning('请添加项目')
        } else {
          return this.$emit('change', [], bool)
        }
      } else {
        let errMap = null
        for (let i = 0; i < formInfoDataList.length; i++) {
          let that = this.$refs.projectFormItem[i]
          let projectForm = that.$refs['projectInfoForm' + [i]]
          if (bool) {
            projectForm.form.validateFieldsAndScroll((error, val) => {
              if (error) {
                errMap = error
              } else {
                let projectFormValue = val
                let attachIds = val.attachIds.map(item => item.fileId).toString()
                projectFormValue.unitName = that.model.unitName;
                projectFormValue.taskExpectStartTime = val.taskExpectStartTime && moment(val.taskExpectStartTime).format('x');
                projectFormValue.attachIds = attachIds;
                projectResult.push(projectFormValue)
              }
            })
            // 在循环中校验表单得用一个变量记录异常 不然无法跳出循环 并且无法进行表单校验
            if (errMap) return this.$emit('emptyData')
          } else {
            let projectFormValue = projectForm.form.getFieldsValue()
            projectFormValue.unitName = that.model.unitName
            projectFormValue.attachIds = projectFormValue.attachIds.map(item => item.fileId).toString()
            projectFormValue.taskExpectStartTime = projectFormValue.taskExpectStartTime && moment(projectFormValue.taskExpectStartTime).format('x');
            projectResult.push(projectFormValue)
          }
        }
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
    display: flex;
    margin-bottom: 10px;

    .panel-custom-item-left {
      width: 98%;
      min-height: 226px;
      border: 1px solid #e8e8e8;
      padding: 0 20px 20px;

      .collapseStyle {
        width: 93%;
        margin-left: 6%;
        font-size: 12px;
        margin-bottom: 18px;
      }
    }

    .panel-custom-item-right {
      padding-left: 5px;
      display: flex;
      align-items: center;
      flex-direction: column;
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