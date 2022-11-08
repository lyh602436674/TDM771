<!--
 * @Author: 陈乾龙
 * @Date: 2021-08-16 14:21:21
 * @LastEditTime: 2021-11-17 15:06:00
 * @LastEditors: 马潭龙
 * @Description: 流程节点信息
 * @FilePath: \hifar-platform-client\src\views\hifar\flowProcess\components\FlowNodeInfo.vue
-->
<template>
  <div class="flow-node-info" style="width: 100%">
    <!-- 所有节点的基本信息 -->
    <h-form v-model="model" ref="baseForm" :formData="baseFormData" :column="1" @onValueChange="handleFormChange" />
    <!-- 审批方式 -->
    <h-card v-if="model.key == 'task'" class="flow-node-info-user" title="审批方式">
      <template slot="content">
        <a-checkbox v-model="needSelect" @change="needSelectChange"> 是否需要选择节点人员 </a-checkbox>
        <h-radio
          v-model="model.approveType"
          style="
            padding: 10px 0;
            margin: 10px 0;
            border-top: solid 1px #efefef;
            border-bottom: solid 1px #efefef;
            width: 100%;
          "
          :options="optionsMethods"
          @change="handleDealMethodChange"
        />
        <div v-if="model.approveType">
          <h-radio
            v-if="model.approveType == 'and'"
            v-model="model.approveParams"
            :options="optionsMethodAnd"
            @change="dealMethodParamsChange"
          />
          <h-radio
            v-else-if="model.approveType == 'or'"
            v-model="model.approveParams"
            :options="optionsMethodOr"
            @change="dealMethodParamsChange"
          />
        </div>
      </template>
    </h-card>
    <!-- 用户节点信息 -->
    <h-card v-if="model.key === 'task'" class="flow-node-info-user" title="设置审批人" style="margin-top: 10px">
      <template slot="content">
        <h-radio
          v-model="model.dealType"
          style="margin-bottom: 10px"
          :options="options"
          @change="handleDealTypeChange"
        />
        <!-- 当审核人不是发起人自己时 -->
        <template v-if="model.dealType !== 'start'">
          <!-- 指定用户 -->
          <div v-if="model.dealType && model.dealType === 'user'">
            <a-button block type="ghost-primary" icon="plus" @click="showUserSelectModal"> 选择用户 </a-button>
            <div>
              <a-tag
                v-for="item in model.dealUsers"
                style="margin-top: 10px"
                closable
                :key="item.id"
                @close="() => deleteSelectedUser(item)"
              >
                {{ item.idName }}
              </a-tag>
            </div>
          </div>
          <!-- 指定角色 -->
          <div v-if="model.dealType && model.dealType === 'role'">
            <a-button block type="ghost-primary" icon="plus" @click="showRoleSelectModal">选择角色</a-button>
            <div>
              <a-tag
                v-for="item in model.dealUsers"
                style="margin-top: 10px"
                closable
                :key="item.id"
                @close="() => deleteSelectedUser(item)"
              >
                {{ item.roleName }}
              </a-tag>
            </div>
          </div>
          <!-- 流程变量 -->
          <div v-if="model.dealType && model.dealType === 'var'" slot="content">
            <p v-if="!localFlowVariables.length">请在流程基本信息中添加流程变量</p>
            <h-radio :options="localFlowVariables" @change="handleLocalVariablesChange" />
          </div>
        </template>
        <!-- 当审核人是发起人自己时 -->
        <p v-else>发起人自己将作为审批人处理审批单</p>
      </template>
    </h-card>
    <select-user-list-modal ref="selectUserListModal" @change="handleSelectedUsers"></select-user-list-modal>
    <select-role-list-modal ref="selectRoleListModal" @change="handleSelectedUsers" />
  </div>
</template>

<script>
import { isEmpty, isObject, isArray, findIndex, find } from 'lodash'
import SelectUserListModal from '@/views/components/SysUserSelectModal.vue'
import SelectRoleListModal from '@/views/components/SysRoleSelectModal'
export default {
  inject: {
    getFlowVariables: {
      default: () => {
        return () => []
      },
    },
  },
  props: {
    node: {
      type: Object,
      default: () => {},
    },
  },
  components: { SelectUserListModal, SelectRoleListModal },
  computed: {
    localFlowVariables() {
      let variables = this.getFlowVariables()
      let variableOptions = Object.keys(variables).map((key) => {
        let variable = variables[key]
        return {
          title: variable.name,
          value: variable.id,
        }
      })
      return variableOptions
    },
  },
  watch: {
    node: {
      immediate: true,
      handler(val) {
        console.log('激活的节点', val)
        if (isObject(val) && !isEmpty(val)) {
          if (val.needSelect) {
            this.needSelect = val.needSelect == 1 ? true : false
          } else {
            this.needSelect = false
            val.needSelect = 2
          }
          if (!val.approveType) {
            val.approveType = 'or'
            val.approveParams = 'any'
          }
          this.model = Object.assign({}, val)
          this.handleFormChange()
        } else {
          this.model = {}
        }
      },
    },
  },
  data() {
    return {
      model: this.node || {},
      needSelect: true,
      baseFormData: [
        {
          key: 'id',
          formType: 'input',
          hidden: true,
        },
        {
          title: '节点名称',
          key: 'name',
          formType: 'input',
          validate: { rules: [{ required: true, message: '请输入节点名称' }] },
        },
        {
          title: '节点编码',
          key: 'code',
          formType: 'input',
        },
        {
          title: '表单路径',
          key: 'formPath',
          formType: 'input',
        },
        {
          key: 'type',
          formType: 'input',
          hidden: true,
        },
      ],
      options: [
        {
          title: '指定用户',
          value: 'user',
        },
        {
          title: '指定角色',
          value: 'role',
        },
        {
          title: '流程变量',
          value: 'var',
        },
        {
          title: '发起人',
          value: 'start',
        },
      ],
      optionsMethods: [
        {
          title: '会签',
          value: 'and',
        },
        {
          title: '或签',
          value: 'or',
        },
      ],
      optionsMethodAnd: [
        {
          title: '等待所有人审批完成（默认）',
          value: 'AllWait',
        },
        {
          title: '任意一人审核立即判断结果',
          value: 'NoWait',
        },
      ],
      optionsMethodOr: [
        {
          title: '任意一人处理（默认）',
          value: 'any',
        },
        {
          title: '指定一人处理',
          value: 'one',
        },
      ],
    }
  },
  methods: {
    handleFormChange(values = {}) {
      this.model = Object.assign({}, this.model, values)
      this.$emit('change', this.model)
    },

    handleDealTypeChange(v) {
      this.model = Object.assign({}, this.model, {
        dealType: v,
        dealUsers: [],
      })
      this.handleFormChange({})
    },
    handleUserChoose(v) {
      this.model = Object.assign({}, this.model, {
        dealParams1: v,
      })
      this.handleFormChange({})
    },
    handleUserChooseType(v) {
      this.model = Object.assign({}, this.model, {
        dealParams2: v,
        dealUsers: [],
      })
      this.handleFormChange({})
    },
    handleLocalVariablesChange(v) {
      let variables = this.getFlowVariables()
      let variable = find(variables, (obj) => {
        return obj.id == v
      })
      this.model.dealUsers = [
        {
          id: variable.code,
          name: variable.name,
        },
      ]
      this.handleFormChange({})
    },
    needSelectChange(evt) {
      let value = evt.target.checked
      this.needSelect = value
      this.model = Object.assign({}, this.model, {
        needSelect: value ? 1 : 2,
      })
      this.handleFormChange()
    },
    handleDealMethodChange(v) {
      let approveParams = null
      if (v == 'or') {
        approveParams = 'any'
      } else if (v == 'and') {
        approveParams = 'AllWait'
      }
      this.model = Object.assign({}, this.model, {
        approveType: v,
        approveParams,
      })
      this.handleFormChange({})
    },
    dealMethodParamsChange(v) {
      this.model = Object.assign({}, this.model, {
        approveParams: v,
      })
      this.handleFormChange({})
    },
    // 选择用户相关
    showUserSelectModal() {
      let selectedRowKeys = []
      if (isArray(this.model.dealUsers)) {
        selectedRowKeys = this.model.dealUsers.map((item) => {
          return item.id
        })
      }
      this.$refs.selectUserListModal.show(selectedRowKeys, this.model.dealUsers)
    },
    handleSelectedUsers(selectedRowKeys, selectedRows) {
      if (this.model.dealType === 'role') {
        selectedRows.map((item) => {
          item.name = item.roleName
        })
      }
      this.model = Object.assign({}, this.model, {
        dealUsers: selectedRows,
      })
      this.handleFormChange({})
    },
    deleteSelectedUser(user) {
      let index = findIndex(this.model.dealUsers, (obj) => {
        return obj.id == user.id
      })
      this.model.dealUsers.splice(index, 1)
      this.model = Object.assign({}, this.model)
      this.handleFormChange({})
    },
    // 选择角色相关
    showRoleSelectModal() {
      let selectedRowKeys = []
      if (isArray(this.model.dealUsers)) {
        selectedRowKeys = this.model.dealUsers.map((item) => {
          return item.id
        })
      }
      this.$refs.selectRoleListModal.show(selectedRowKeys, this.model.dealUsers)
    },
  },
}
</script>