<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-24 14:21:03
 * @LastEditTime: 2021-12-06 14:25:01
 * @LastEditors: 赵文凯
 * @Description: 设备安排
 * @FilePath: \tdm200-client\src\views\hifar\hifar-environmental-test\task\EquipArrangement.vue
-->
<template>
  <r-l-layout :leftMinWidth="252" style="width: 100%; height: 100%">
    <h-card slot="left" :bordered="false" style="height: 100%">
      <a-spin :spinning="treeSpinning" style="height: 100%">
        <h-edit-tree
          ref="physicoChemicalTree"
          :replaceFields="replaceFields"
          :selectedKeys="selectedKeys"
          :tree="loadEquip"
          fileIcon=""
          menuIcon="icon"
          title="设备列表"
          @onSelect="onSelect"
        >
          <template slot="extra">
            <span class="tree-extra-tip">总数-未开始</span>
          </template>
          <a-input-search
            slot="search-form"
            v-model="equipQuery.keyWord"
            allowClear
            enter-button="搜索"
            placeholder="请输入设备名称或委托单号"
            size="small"
            @search="loadLeftTree"
            @keyup.enter.native="loadLeftTree"
          />
          <div slot="title" slot-scope="record">
          <span>
            <h-icon v-if="record.validFlag == 0" style="font-size: 20px" type="icon-jingbaobaojing"></h-icon>
            <h-icon v-if="record.validFlag == 1" style="font-size: 20px" type="icon-jingbaobaojing1"></h-icon>
            <h-icon v-if="record.validFlag == 2" style="font-size: 20px" type="icon-jingbaobaojing2"></h-icon>
            {{ record.title }}
          </span>
          </div>
          <div slot="addonAfter" slot-scope="record">
            <template v-if="+record.count + +record.unStart > 0">
              <a-badge :count="record.count + '-' + record.unStart" :number-style="{ backgroundColor: '#409eff' }"
                       :offset="[0, -4]"></a-badge>
            </template>
          </div>
        </h-edit-tree>
      </a-spin>
      <div slot="card-footer">
        <h-icon style="font-size: 20px" type="icon-jingbaobaojing2"></h-icon>
        <span>超期</span>
        <h-icon class="h-icon-tree" type="icon-jingbaobaojing1"></h-icon>
        <span>正常</span>
        <h-icon class="h-icon-tree" type="icon-jingbaobaojing"></h-icon>
        <span>未知</span>
      </div>
    </h-card>
    <div slot="right" style="height: 100%">
      <h-card fixed style="height: 100%">
        <div ref="epContent" slot="content" class="ep-content">
          <div class="ea-equip-info-wrapper">
              <div class="ea-equip-info" v-if="selectedKeys.length">
                <h-card fixed style="width: 100%">
                  <a-tabs v-model="basickey" style="height: 100%;">
                    <a-tab-pane :key="1" style="display: flex" tab="基本信息">
                      <!-- 基本信息 -->
                      <!-- 图片 -->
                      <div class="ea-equip-image">
                        <img v-if="equipDetail.imgUrl" :src="equipDetail.imgUrl" alt=""/>
                        <img v-else alt="" src="@/assets/shebei.png" srcset=""/>
                      </div>
                      <h-desc :column="2" bordered class="ea-equip-desc" size="small">
                        <h-desc-item label="设备名称"> {{ equipDetail.equipName || '--' }}</h-desc-item>
                        <h-desc-item label="设备型号"> {{ equipDetail.equipModel || '--' }}</h-desc-item>
                        <h-desc-item label="检定日期">
                          {{
                            equipDetail.checkTime && equipDetail.checkTime != 0
                              ? moment(parseFloat(equipDetail.checkTime)).format('YYYY-MM-DD HH:mm:ss')
                              : '--'
                          }}
                        </h-desc-item>
                        <h-desc-item label="检定有效期">
                          {{
                            equipDetail.checkValid && equipDetail.checkValid != 0
                              ? moment(parseFloat(equipDetail.checkValid)).format('YYYY-MM-DD HH:mm:ss')
                              : '--'
                          }}
                        </h-desc-item>
                      </h-desc>
                    </a-tab-pane>
                    <!-- 曲线 -->
                    <a-tab-pane :key="2" :forceRender="true" style="display: flex;height: 100%;" tab="曲线">
                      <div class="h-echarts-line">
                        <equip-basic-line ref="equipBasicLine"
                                          :equipCode="equipDetail.equipCode"
                                          :selectedRow="selectedRow"
                                          :selectedTreeRows="selectedRows"
                                          @open="handleEnlargement"/>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                </h-card>
              </div>
              <div style="width: 100%">
                <h-search
                  slot="search-form"
                  v-model="queryParams"
                  :data="searchForm"
                  style="margin-top: 10px"
                  @change="refresh"
                />
              </div>
              <div class="task-list">
                <h-card :bordered="false" fixed title="试验列表">
                  <!-- 按钮 -->
                  <a-space slot="extra">
                    <a-button
                      v-for="(item, index) in buttons"
                      :key="item.key"
                      :size="item.size"
                      :type="item.type"
                      :v-has="item.has"
                      @click="() => item.click(item, index)"
                    >
                      <a-icon v-if="item.icon.indexOf('icon-') === -1" :type="item.icon"></a-icon>
                      <h-icon v-else :type="item.icon"/>
                      {{ item.title }}
                    </a-button>
                  </a-space>
                  <h-vex-table
                    ref="equipTaskList"
                    slot="content"
                    :columns="taskColumns"
                    :data="loadData"
                    :rowSelection="{
                      type: 'radio',
                      onSelect: Select,
                      visible: false,
                    }"
                    style="width: 100%"
                  >
                    <template #entrustNos="text, record">
                      <a @click="$refs.testTaskBaseInfoModal.show(record,'1','20px')">{{ text }}</a>
                    </template>
                    <template #entrustCodes="text, record">
                      <a @click="$refs.testTaskBaseInfoModal.show(record,null,'20px')">{{ text }}</a>
                    </template>
                    <template #exceptionNum="text, record">
                      <a @click="$refs.abnormalDetailModal.show(record)">{{ text }}</a>
                    </template>
                    <template slot="status" slot-scope="text,record">
                      <div v-if="record.forceEndStatus==10">
                        <a-badge v-if="text == 1" color="geekblue" text="未开始-终止申请中"/>
                        <a-badge v-else-if="text == 10" color="red" text="已撤销-终止申请中"/>
                        <a-badge v-else-if="text == 20" color="green" text="进行中-终止申请中"/>
                        <a-badge v-else-if="text == 30" color="volcano" text="暂停-终止申请中"/>
                        <a-badge v-else-if="text == 40" color="red" text="终止-终止申请中"/>
                        <a-badge v-else-if="text == 50" color="grey" text="已完成-终止申请中"/>
                      </div>
                      <div v-else>
                        <a-badge v-if="text == 1" color="geekblue" text="未开始"/>
                        <a-badge v-else-if="text == 10" color="red" text="已撤销"/>
                        <a-badge v-else-if="text == 20" color="green" text="进行中"/>
                        <a-badge v-else-if="text == 30" color="volcano" text="暂停"/>
                        <a-badge v-else-if="text == 40" color="red" text="终止"/>
                        <a-badge v-else-if="text == 50" color="grey" text="已完成"/>
                      </div>
                    </template>
                    <a-space slot="actions" slot-scope="text, record">
                      <!-- 开始 -->
                      <a-tooltip v-if="[1, 30, 40, 50, 25].includes(+record.status)" title="开始">
                        <h-icon v-has="'ArrangeMent:start'" class="h-icon-item" type="icon-jiediankaishi"
                                @click="handleStart('start', record)"/>
                      </a-tooltip>
                      <!-- 暂停 -->
                      <a-tooltip v-if="record.status == 20" title="暂停">
                        <h-icon
                          v-has="'ArrangeMent:suspend'"
                          class="h-icon-item"
                          type="icon-stop"
                          @click="$refs.taskSuspendModal.show('suspend', record)"
                        />
                      </a-tooltip>
                      <!-- 完成 -->
                      <a-tooltip title="完成">
                        <h-icon
                          v-has="'ArrangeMent:finish'"
                          class="h-icon-item"
                          type="icon-wancheng1"
                          @click="$refs.taskFinishedModal.show('finish', record)"
                        />
                      </a-tooltip>
                      <!-- 更多 -->
                      <a-dropdown>
                        <a-tooltip title="更多">
                          <h-icon class="h-icon-item" type="icon-gengduo1"/>
                        </a-tooltip>
                        <a-menu slot="overlay">
                          <!-- 异常 -->
                          <a-menu-item v-has="'ArrangeMent:error'">
                            <div @click="$refs.taskAbnormalModal.show('error', record)">异常</div>
                          </a-menu-item>
                          <!-- 终止 -->
                          <a-menu-item v-has="'ArrangeMent:forceEnd'">
                            <div @click="$refs.taskForceEnd.show('forceEnd', record)">终止</div>
                          </a-menu-item>
                          <!-- 撤销 -->
                          <a-menu-item v-has="'ArrangeMent:recover'">
                            <div @click="() => handleActions('recover', record)">撤销</div>
                          </a-menu-item>
                        </a-menu>
                      </a-dropdown>
                    </a-space>
                  </h-vex-table>
                </h-card>
              </div>
            <!--            <a-empty v-else description="请在左侧选择设备"/>-->
          </div>
        </div>
      </h-card>
      <task-start-modal ref="taskStartModal" @change="refreshEquipTaskList"/>
      <task-suspend-modal ref="taskSuspendModal" @change="refreshEquipTaskList"/>
      <task-force-end-modal ref="taskForceEnd" :forceEndUrl="url.forceEnd" :testDetailUrl="url.testDetail"
                            @change="refreshEquipTaskList"/>
      <task-finished-modal ref="taskFinishedModal" @change="refreshEquipTaskList"/>
      <task-abnormal-modal ref="taskAbnormalModal" @change="refreshEquipTaskList"></task-abnormal-modal>
      <test-data-add-modal ref="testDataAddModal" @change="refreshEquipTaskList"></test-data-add-modal>
      <test-check-modal ref="testCheckModal"/>
      <equip-basic-vibration ref="equipBasicVibration"></equip-basic-vibration>
      <test-base-edit ref="TestBaseEdit" :records="records" :selectedTreeRows="selectedRows"
                      @change="refreshEquipTaskList"/>
      <abnormal-detail-modal ref="abnormalDetailModal" @change="refreshEquipTaskList"/>
      <test-task-base-info-modal ref="testTaskBaseInfoModal"/>
      <equip-basic-line-modal ref="EquipBasicLineModal"
                              :selectRowId="selectedRow"
                              :selectedRow="selectedRow"></equip-basic-line-modal>
    </div>
  </r-l-layout>
</template>

<script>
import moment from 'moment'
import {postAction} from '@/api/manage'
import TaskStartModal from './modules/TaskStartModal.vue'
import TaskSuspendModal from './modules/TaskSuspendModal.vue'
import TaskForceEndModal from './modules/TaskForceEndModal.vue'
import TaskFinishedModal from './modules/TaskFinishedModal.vue'
import TaskAbnormalModal from './checkModal/TaskAbnormalModal.vue'
import AbnormalDetailModal from './modules/AbnormalDetailModal'
import testDataAddModal from './modules/TestDataAddModal'
import HEditTree from '@/views/components/HEditTree.js'
import TestCheckModal from './checkModal/TestCheckModal'
import TestBaseEdit from './checkModal/TestBaseEdit'
import TestTaskBaseInfoModal from './TestTaskBaseInfoModal'
import mixin from '@/views/hifar/mixin.js'
import EquipBasicBar from './modules/components/equipBasicEcharts/EquipBasicBar.vue'
import EquipBasicLine from './modules/components/equipBasicEcharts/EquipBasicLine.vue'
import equipBasicVibration from './modules/EquipBasicVibration.vue'
import EquipBasicLineModal from "@views/hifar/hifar-environmental-test/task/modules/EquipBasicLineModal";
// import {isHiddenColumns} from "@/utils/hasPermission";

export default {
  mixins: [mixin],
  provide() {
    return {
      getContainer: () => this.$refs.epContent,
      selectedKeys: () => this.selectedKeys,
      selectedRows: () => this.selectedRows,
    }
  },
  components: {
    EquipBasicLineModal,
    TaskStartModal,
    TaskSuspendModal,
    TaskForceEndModal,
    TaskFinishedModal,
    HEditTree,
    TaskAbnormalModal,
    TestCheckModal,
    AbnormalDetailModal,
    testDataAddModal,
    TestTaskBaseInfoModal,
    TestBaseEdit,
    EquipBasicBar,
    EquipBasicLine,
    equipBasicVibration,
  },
  data() {
    return {
      cuttonKey: '',
      moment,
      treeSpinning: false,
      selectedKeys: [],
      selectedRows: [],
      queryParams: {},
      selectedKey: [],
      validFlag: '',
      selectedRow: [],
      equipQuery: {
        c_status_99: ['2', '4']
      },
      basickey: 1,
      testId: '',
      records: {},
      menuIcon: '',
      selectedRowKeys: [],
      searchForm: [
        {
          title: '运行单号',
          key: 'entrustCode',
          formType: 'input',
        },
        {
          title: '委托单号',
          key: 'entrustNo',
          formType: 'input',
        },
        {
          title: '试验编号',
          key: 'c_testCode_7',
          formType: 'input',
        },
        {
          title: '试验状态',
          key: 'c_status_1',
          formType: 'select',
          options: [
            {
              title: '未开始',
              key: 1,
              value: 1,
            },
            {
              title: '已撤销',
              key: 10,
              value: 10,
            },
            {
              title: '进行中',
              key: 20,
              value: 20,
            },
            {
              title: '暂停',
              key: 30,
              value: 30,
            },
            {
              title: '终止',
              key: 40,
              value: 40,
            },
            {
              title: '已完成',
              key: 50,
              value: 50,
            },
          ],
        },
        {
          title: '任务编号',
          key: 'taskCode',
          formType: 'input',
        },
        {
          title: '委托单位',
          key: 'custName',
          formType: 'input',
        },

        {
          title: '试验项目',
          key: 'unitName',
          formType: 'input',
        },
      ],
      replaceFields: {
        children: 'children',
        title: 'equipName',
        key: 'id',
      },
      buttons: [
        {
          title: '试前检查',
          key: '0',
          size: 'small',
          type: 'default',
          has: 'ArrangeMent:boforTest',
          icon: 'icon-jianchaqianzhunbei',
          click: (item, index) => {
            if (!this.selectedRow.length) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testCheckModal.show(this.selectedRow[0], '试前', 'before')
            }
          },
        },
        {
          title: '试中检查',
          key: '1',
          size: 'small',
          type: 'default',
          has: 'ArrangeMent:intest',
          icon: 'icon-jianchazhong',
          click: (item, index) => {
            if (!this.selectedRow.length) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testCheckModal.show(this.selectedRow[0], '试中', 'testMiddle')
            }
          },
        },
        {
          title: '试后检查',
          key: '2',
          size: 'small',
          type: 'default',
          has: 'ArrangeMent:afterTest',
          icon: 'icon-shiyanhouguanli',
          click: (item, index) => {
            if (!this.selectedRow.length) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testCheckModal.show(this.selectedRow[0], '试后', 'after')
            }
          },
        },
        {
          title: '试验结果',
          key: '3',
          size: 'small',
          has: 'ArrangeMent:edit',
          icon: 'icon-tianxie',
          type: 'default',
          click: (item, index) => {
            if (this.selectedRow.length === 0) {
              this.$message.error('请至少选择一项')
            } else {
              this.records = this.selectedRow[0]
              this.$refs.TestBaseEdit.show(this.selectedRow[0])
            }
          },
        },
        {
          title: '试验数据',
          key: '4',
          size: 'small',
          has: 'ArrangeMent:dataTest',
          icon: 'icon-shiyanshuju',
          type: 'default',
          click: (item, index) => {
            if (!this.selectedRow.length) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.testDataAddModal.show(this.selectedRow[0])
            }
          },
        },
        {
          title: '异常记录',
          key: '5',
          size: 'small',
          has: 'ArrangeMent:errRecord',
          icon: 'icon-gantanhao',
          type: 'default',
          click: (item, index) => {
            if (!this.selectedRow.length) {
              this.$message.error('请至少选择一项')
            } else {
              this.$refs.taskAbnormalModal.show('error', this.selectedRow[0])
            }
          },
        },
      ],
      loadEquip: [],
      extendEquipData: [],
      equipDetail: {},
      taskColumns: [
        {
          title: '运行单号',
          dataIndex: 'entrustCodes',
          minWidth: 150,
          scopedSlots: {customRender: 'entrustCodes'},
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNos',
          // hidden: isHiddenColumns('ArrangeMent:suspend'),
          minWidth: 120,
          scopedSlots: {customRender: 'entrustNos'},
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 140,
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'},
          minWidth: 140,
        },
        {
          title: '委托单位',
          dataIndex: 'custNames',
          minWidth: 100,
        },
        {
          title: '样品名称',
          align: 'left',
          minWidth: 120,
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: "型号/规格",
          align: "left",
          dataIndex: "productModel",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '图号',
          align: 'left',
          minWidth: 100,
          dataIndex: 'productAliass',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: "样品编号",
          align: "left",
          dataIndex: "pieceNos",
          minWidth: 100,
          customRender: (text, record) => {
            return text || "--";
          },
        },
        {
          title: '试验项目',
          dataIndex: 'unitNames',
          minWidth: 100,
        },
        {
          title: '异常数量',
          dataIndex: 'exceptionNum',
          minWidth: '100',
          align: 'center',
          scopedSlots: {customRender: 'exceptionNum'},
        },
        {
          title: '期望开始时间',
          dataIndex: 'predictStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150,
        },
        {
          title: '预计用时(h)',
          dataIndex: 'predictUseTime',
          minWidth: 100,
        },
        {
          title: '预计结束时间',
          dataIndex: 'taskEndTime',
          minWidth: 150,
          customRender: (text, record) => {
            return text && text != 0 ? moment(parseInt(text)).format('YYYY-MM-DD HH:mm:ss') : '--'
          }
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: (time) => {
            return time && time != 0 ? moment(parseFloat(time)).format('YYYY-MM-DD HH:mm:ss') : '--'
          },
          minWidth: 150,
        },
        {
          title: '实际用时(h)',
          dataIndex: 'realUseTime',
          minWidth: 100,
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'right',
          fixed: 'left',
          width: 110,
          scopedSlots: {
            customRender: 'actions',
          },
        },
      ],
      loadData: (params) => {
        let data = {
          ...params,
          ...this.queryParams,
          equipId: this.selectedKeys.join(),
        }
        return postAction(this.url.taskList, data).then((res) => {
          if (res.code === 200) {
            return res.data
          }
        })
      },
      url: {
        equipList: '/HfResEquipBusiness/listFindEquip',
        equipDetail: '/HfResEquipBusiness/queryById',
        taskList: '/HfEnvTaskTestBusiness/listPageForEquip',
        recover: '/HfEnvTaskTestBusiness/recover',
        forceEnd: '/HfEnvTestForceEndBusiness/forceEnd',
        testDetail: '/HfEnvTaskTestBusiness/queryById',
      },
    }
  },
  mounted() {
    this.loadLeftTree()
  },
  methods: {
    handleEnlargement(record, extendRecord) {
      this.$refs.EquipBasicLineModal.open(record, extendRecord)
    },
    Select(selectedKey, selectedRow) {
      this.selectedKey = selectedKey
      this.selectedRow = selectedRow
      this.buttons.map((item, index) => {
        item.type = 'primary'
      })
      // this.selectedKeys = [selectedRow[0].equipId]
      // this.getEquipDetail()
    },
    loadLeftTreeBySearch(e) {
      let value = isObject(e) ? e.target.value : e
      if (!value) {
        return this.loadLeftTree()
      }
      this.loadEquip = this.extendEquipData.filter(item => item.title.includes(value))
    },
    async loadLeftTree() {
      this.treeSpinning = true
      let params = {
        ...this.equipQuery,
      }
      let res = await postAction(this.url.equipList, params)
      if (res.code == 200) {
        this.loadEquip = res.data.map((item) => {
          item.scopedSlots = {
            title: 'customTitle',
          }
          item.title = item.equipName + "-" + item.equipModel
          // 这一步是证明当前数据为目录，当没有children时，则判断为文件
          item.children = []
          return item
        })
        this.treeSpinning = false
      }
    },
    // 刷新
    refresh(bool = false) {
      this.$refs.equipTaskList.refresh(bool)
      // 取消选中,按钮回复初始化状态
      this.selectedRow = []
      this.buttons.map((item) => {
        item.type = 'default'
      })
    },
    // 开始
    handleStart(type, record) {
      this.$refs.taskStartModal.show(type, record)
    },

    handleActions(type, record) {
      let params = {
        id: record.id,
      }
      let url = this.url[type]
      postAction(url, params).then((res) => {
        if (res.code == 200) {
          this.$message.success('操作成功')
          this.refreshEquipTaskList()
        }
      })
    },
    getEquipDetail() {
      let params = {
        id: this.selectedKeys.join(''),
      }
      postAction(this.url.equipDetail, params).then((res) => {
        if (res.code == 200) {
          this.equipDetail = res.data
        } else {
          this.equipDetail = {}
        }
      })
    },
    refreshEquipTaskList(bool = true) {
      if (this.$refs.equipTaskList) {
        this.$refs.equipTaskList.refresh(bool)
        this.loadLeftTree();
      }
    },
    onSelect(selectedKeys, event) {
      //关闭弹窗
      for (let ref in this.$refs) {
        if (this.$refs[ref].visible === true) {
          this.$refs[ref].visible = false
        }
      }
      // 切换设备列表,按钮恢复默认
      this.selectedRow = []
      this.buttons.map((item) => {
        item.type = 'default'
      })
      let selectedRows = []
      event.selectedNodes.map((item) => {
        selectedRows.push(item.data.props)
      })
      this.selectedKeys = selectedKeys
      this.selectedRows = selectedRows
      this.$nextTick(() => {
        this.getEquipDetail()
        this.refreshEquipTaskList()
      })
    },
  },
}
</script>
<style lang="less" scoped>
.tree-extra-tip {
  background-color: #409eff;
  color: #fff;
  display: inline-block;
  padding: 0 10px;
  line-height: 20px;
  border-radius: 10px
}

/deep/ .ant-tabs-content {
  height: 80%;
}
</style>

<style lang="less">
.ep-content {
  height: 100%;
  width: 100%;
  position: relative;

  .ant-tabs {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: #fff;
  }

  .ant-empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin: 0;
  }
}


.ea-equip-info-wrapper {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;

  .ea-equip-info {
    width: 100%;
    min-height: 40%;
    overflow: hidden;
    display: flex;

    .ea-equip-image {
      align-self: stretch;
      margin-right: 10px;
      width: 20%;
      border: solid 1px @border-color-base;
      border-radius: @border-radius-base;
    }

    .ea-equip-desc {
      width: 80%;
      height: 100%;
    }

    .h-echarts-bar {
      width: 50%;
      height: 100%;
      // background: chocolate;
    }

    img {
      width: 100%;
      height: 100%;
    }
  }

  .task-list {
    width: 100%;
    overflow: hidden;
    flex: 1;
    margin-top: 10px;
  }

  .h-card-wrapper {
    padding: 0;

    .ant-card-body {
      padding: 0;
    }
  }
}

.h-icon-item {
  color: #fff;
  cursor: pointer;
  width: 21px;
  height: 21px;
  border-radius: 3px;
  background-color: #409eff;
  text-align: center;
  line-height: 21px;
}


.h-echarts-line {
  width: 100%;
  height: 100%;
}
</style>
<style lang="less" scoped>
/deep/ .ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop {
  display: none;
}

.h-icon-stop {
  color: #fff;
  cursor: pointer;
  width: 21px;
  height: 21px;
  border-radius: 3px;
  background-color: #ff6600;
  text-align: center;
  line-height: 21px;
}

.h-finsh {
  background-color: rgb(116, 223, 63);
}

.h-icon-tree {
  margin-left: 20px;
  font-size: 20px;
}
</style>
<style scoped>

>>> .h-vex-table-wrapper_wrapper ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
</style>
