<!--
  * 工装借用、归还记录
  * @Author: 朱巍巍
  * @Date: 2022/6/6$ 11:00$
  * @LastEditTime: 2022/6/6$ 11:00$
  * @LastEditors: 朱巍巍
  * @Description: $
  * @FilePath: $
 -->
<template>
  <h-modal
    :confirm-loading='confirmLoading'
    :getContainer='getContainer'
    :title='title'
    :visible='visible'
    :width='width'
    centered
    destoryOnClose
    inner
    @cancel='handleCancel'
    @submit='handleClickSubmit'
  >
    <h-card class='top-card'>
      <h-form
        v-if='visible'
        ref='modelForm'
        slot='content'
        v-model='model'
        :column='3'
        :formData='formData'
        autoFocusItem='toolsCode'
        @change='submitHandle'
      ></h-form>
    </h-card>
    <h-card class='bottom-card'>
      <div class='bottom-info'>
        <div class='img'>
          <img :preview='mainModel.picurl || defaultImg' :src='mainModel.picurl || defaultImg' alt='设备图片'>
        </div>
        <h-detail :showElevator='false' class='main-detail'>
          <h-descriptions :column='2' anchor bordered size='small' title=''>
            <a-descriptions-item label='工装编号'>
              {{ mainModel.toolsCode || '--' }}
            </a-descriptions-item>
            <a-descriptions-item label='工装名称'>
              {{ mainModel.toolsName || '--' }}
            </a-descriptions-item>
            <a-descriptions-item label='工装规格'>
              {{ mainModel.toolsSize || '--' }}
            </a-descriptions-item>
            <a-descriptions-item label='借用部门'>
              {{ mainModel.borrwoDeptName || '--' }}
            </a-descriptions-item>
            <a-descriptions-item label='借用人'>
              {{ mainModel.borrowPersonName || '-- ' }}
            </a-descriptions-item>
            <a-descriptions-item label='借用日期'>
              {{ mainModel.borrowDate | dateFilters }}
            </a-descriptions-item>
            <a-descriptions-item label='检定日期'>
              {{ mainModel.verificationDate | dateFilters }}
            </a-descriptions-item>
            <a-descriptions-item label='在库状态'>
              {{ mainModel.larbaryStatus | larbaryStatusFilters }}
            </a-descriptions-item>
            <a-descriptions-item label='存放地点'>
              {{ mainModel.location || '--' }}
            </a-descriptions-item>
            <a-descriptions-item label='责任人'>
              {{ mainModel.person || '--' }}
            </a-descriptions-item>
            <a-descriptions-item label='生成厂家'>
              {{ mainModel.factory ? mainModel.factory : '--' }}
            </a-descriptions-item>
            <a-descriptions-item label='启用日期'>
              {{ mainModel.activeDate | dateFilters }}
            </a-descriptions-item>
            <a-descriptions-item label='设备状态'>
              {{ mainModel.toolsStatus | toolsStatusFilters }}
            </a-descriptions-item>
            <a-descriptions-item label='工装分类'>
              {{ mainModel.classify | classifyFilters }}
            </a-descriptions-item>
            <a-descriptions-item label='备注'>
              {{ mainModel.remake }}
            </a-descriptions-item>
          </h-descriptions>
        </h-detail>
      </div>
    </h-card>
  </h-modal>
</template>

<script>
import { getAction, postAction } from '@api/manage'
import moment from 'moment'
import SysUserSelect from '@/views/components/SysUserSelect'

export default {
  name: 'ToolsProductsBorrowModel',
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  components: {
    SysUserSelect
  },
  filters: {
    classifyFilters(text) {
      return text === '1' ? 'A类' : text === '2' ? 'B类' : text === '3' ? 'C类' : '--'
    },
    toolsStatusFilters(text) {
      return text === '0' ? '封存' : text === '1' ? '在用' : '--'
    },
    larbaryStatusFilters(text) {
      return text === '0' ? '封存' : text === '1' ? '在用' : '--'
    },
    dateFilters(text) {
      if (!text || text == '0') {
        return '--'
      }
      return moment(+text).format('yyyy-MM-DD')
    }
  },
  data() {
    return {
      moment,
      defaultImg: require('./../assets/image/default.png'),
      title: '',
      visible: false,
      width: 1000,
      confirmLoading: false,
      model: {},
      mainModel: {},
      type: '1',
      formData: [],
      borrowFormData: [
        {
          title: 'id ',
          formType: 'input',
          key: 'id',
          span: 1,
          hidden: true
        },
        {
          title: 'toolsId ',
          formType: 'input',
          key: 'toolsId',
          span: 1,
          hidden: true
        },
        {
          title: '工装编号 ',
          formType: 'input',
          key: 'toolsCode',
          span: 1,
          validate: {
            rules: [{ required: true, message: '请输入工装编号' }]
          },
          blur: (e) => {
            if (e.target.value) {
              this.toolsCodeChange(e.target.value)
            }
          },
          keyup: (e) => {
            if (e.target.value && e.keyCode === 13) {
              this.toolsCodeChange(e.target.value)
            }
          }
        },
        {
          title: '借用部门',
          key: 'borrowDept',
          span: 1,
          component: (
            <h-depart-select
              placeholder='请选择借用部门'
              v-decorator={['borrowDept', { initialValue: undefined }]}
              v-on:change={this.borrowDeptChange}
            />
          )
        },
        {
          title: '借用人',
          key: 'borrowPerson',
          span: 1,
          component: <sys-user-select v-decorator={['borrowPerson']}
                                      v-on:change={this.managerChange}></sys-user-select>,
          validate: {
            rules: [{ required: true, message: '请选择借用人' }]
          }
        },
        {
          title: '使用地点 ',
          formType: 'input',
          key: 'useLocation',
          span: 1,
          validate: {
            rules: [{ required: true, message: '请输入使用地点' }]
          }
        },
        {
          title: '借用日期',
          formType: 'datePick',
          key: 'borrowDate',
          span: 1,
          validate: {
            rules: [{ required: true, message: '请选择借用日期' }]
          }
        },
        {
          title: '计划归还日期',
          formType: 'datePick',
          key: 'planReturnDate',
          span: 1,
          validate: {
            rules: [{ required: true, message: '请选择计划归还日期' }]
          }
        },
        {
          title: '备注',
          formType: 'textarea',
          key: 'remark',
          span: 3
        }
      ],
      returnFormData: [
        {
          title: 'id ',
          formType: 'input',
          key: 'id',
          span: 1,
          hidden: true
        },
        {
          title: 'toolsId ',
          formType: 'input',
          key: 'toolsId',
          span: 1,
          hidden: true
        },
        {
          title: '工装编号 ',
          formType: 'input',
          key: 'toolsCode',
          span: 1,
          validate: {
            rules: [{ required: true, message: '请输入工装编号' }]
          },
          blur: (e) => {
            if (e.target.value) {
              this.toolsCodeChange(e.target.value)
            }
          },
          keyup: (e) => {
            if (e.target.value && e.keyCode === 13) {
              this.toolsCodeChange(e.target.value)
            }
          }
        },
        {
          title: '上次借用部门',
          key: 'borrowDept',
          span: 1,
          component: (
            <h-depart-select
              placeholder='请选择借用部门'
              v-decorator={['borrowDept', { initialValue: undefined }]}
              v-on:change={this.userDeptChange}
            />
          ),
          disabled: true
        },
        {
          title: '上次借用人',
          key: 'borrowPerson',
          span: 1,
          component: <sys-user-select v-decorator={['borrowPerson']}
                                      v-on:change={this.managerChange}></sys-user-select>,
          validate: {
            rules: [{ required: true, message: '请选择借用人' }]
          }
        },
        {
          title: '上次借用日期',
          formType: 'datePick',
          key: 'borrowDate',
          span: 1
        },
        {
          title: '计划归还日期',
          formType: 'datePick',
          key: 'planReturnDate',
          span: 1
        },
        {
          title: '实际归还日期',
          formType: 'datePick',
          key: 'actReturnDate',
          span: 1,
          validate: {
            rules: [{ required: true, message: '请选择实际归还日期' }]
          }
        },
        {
          title: '归还部门',
          key: 'returnDept',
          span: 1,
          component: (
            <h-depart-select
              placeholder='请选择归还部门'
              v-decorator={['returnDept', { initialValue: undefined }]}
              v-on:change={this.returnDeptChange}
            />
          ),
          validate: {
            rules: [{ required: true, message: '请选择归还部门' }]
          }
        },
        {
          title: '归还人',
          key: 'returnPerson',
          span: 1,
          component: <sys-user-select v-decorator={['returnPerson']}
                                      v-on:change={this.managerChange1}></sys-user-select>,
          validate: {
            rules: [{ required: true, message: '请选择归还人' }]
          }
        },
        {
          title: '备注',
          formType: 'textarea',
          key: 'remark',
          span: 3
        }
      ],
      url: {
        queryByCode: '/HfToolsProducts/queryByCode',
        saveOrUpdate: '/HfToolsProducts/saveOrUpdate'
      }
    }
  },
  methods: {
    returnDeptChange(val, options) {
      this.model.returnDept = val
      this.model.returnDeptName = options.deptName
    },
    borrowDeptChange(val, options) {
      this.model.borrowDept = val
      this.model.borrowDeptName = options.deptName
      // this.$refs.modelForm.form.setFieldsValue({ borrowDeptName: options.deptName, borrowDept: val })
    },
    managerChange(val, option) {
      this.model.borrowPerson = val
      this.model.borrowPersonName = option.idName
    },
    managerChange1(val, option) {
      this.model.returnPerson = val
      this.model.returnPersonName = option.idName
    },
    toolsCodeChange(v) {
      getAction(this.url.queryByCode, { code: v, type: this.type }).then(res => {
        if (res.code == 200) {
          this.mainModel = res.data.toolsData
          this.model = res.data.borrowData
          this.model.toolsCode = v
          this.model.toolsId = this.mainModel.id
          this.model.borrowDate = moment()
          this.model.planReturnDate = moment().add(7, 'day')
          this.model.actReturnDate = moment()
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    handleClickSubmit() {
      this.$refs.modelForm.validateForm()
    },
    submitHandle(value) {
      let params = { ...value }
      if (params.planReturnDate) {
        params.planReturnDate = moment(+params.planReturnDate).format('X') * 1000
      }
      if (params.actReturnDate) {
        params.actReturnDate = moment(+params.actReturnDate).format('X') * 1000
      }
      if (params.borrowDate) {
        params.borrowDate = moment(params.borrowDate).format('X') * 1000
      }
      postAction(this.url.saveOrUpdate, params).then(res => {
        if (res.code == 200) {
          this.handleCancel()
          this.$emit('change')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleCancel(e) {
      this.visible = false
      this.model = {}
      this.mainModel = {}
    },
    show(type) {
      this.type = type
      if ('borrow' == type) {
        this.title = '工装借用'
        this.formData = [...this.borrowFormData]
      } else {
        this.title = '工装归还'
        this.formData = [...this.returnFormData]
      }
      this.model.borrowDate = moment()
      this.model.actReturnDate = moment()
      this.model.planReturnDate = moment().add(7, 'day')
      this.visible = true
    }
  }
}
</script>

<style lang='less' scoped>
@img-height: 267px;
@img-width: 267px;
.top-card {
  height: 30%;
}

.bottom-card {
  height: 70%;

  .bottom-info {
    display: flex;

    .img {
      width: @img-width;
      height: @img-height;
      position: relative;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      text-align: center;
      line-height: @img-height;

      img {
        max-height: @img-height;
        max-width: @img-width
      }
    }

    .main-detail {
      width: calc(100% - @img-width);
    }
  }
}
</style>