<!--
 * @Author: 陈乾龙
 * @Date: 2021-09-24 14:21:03
 * @LastEditTime: 2021-12-06 14:25:01
 * @LastEditors: 赵文凯
 * @Description: 设备安排
 * @FilePath: \tdm200-client\src\views\hifar\hifar-environmental-test\task\EquipArrangement.vue
-->
<template>
  <r-l-layout :leftMinWidth="252" style="position: relative;width: 100%; height: 100%">
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
                    <!-- 图片 -->
                    <div class="ea-equip-image">
                      <img v-if="equipDetail.imgUrl" :src="equipDetail.imgUrl" alt=""/>
                      <img v-else alt="" src="@/assets/shebei.png" srcset=""/>
                    </div>
                    <h-desc :column="2" bordered class="ea-equip-desc" size="small">
                      <h-desc-item label="设备名称"> {{ equipDetail.equipName || '--' }}</h-desc-item>
                      <h-desc-item label="设备型号"> {{ equipDetail.equipModel || '--' }}</h-desc-item>
                      <h-desc-item label="检定日期">
                        {{ dateTimeFormatByStamp(equipDetail.verifyTime) }}
                      </h-desc-item>
                      <h-desc-item label="检定有效期">
                        {{ dateTimeFormatByStamp(equipDetail.checkValid) }}
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
                    <a @click="$refs.testTaskBaseInfoModal.show(record,'2','20px')">{{ text }}</a>
                  </template>
                  <template #testCode="text, record">
                    <a @click="$refs.testTaskBaseInfoModal.show(record,'3','20px')">{{ text }}</a>
                  </template>
                  <template #exceptionNum="text, record">
                    <a @click="$refs.abnormalDetailModal.show(record)">{{ text }}</a>
                  </template>
                  <template slot="status" slot-scope="text,record">
                    <template v-if="record.forceEndStatus === 10">
                      <a-badge :color="testStatusMap[text].color" :text="testStatusMap[text].text + '-终止申请中'"/>
                    </template>
                    <template v-else>
                      <a-badge :color="testStatusMap[text].color" :text="testStatusMap[text].text"/>
                    </template>
                    <a-icon v-if="record.forceEndStatus === 10 || text === 40" class="primary-text"
                            style="margin-left:5px" type="eye"
                            @click="$refs.TerminationDetailModal.show(record,record.testNames)"/>
                  </template>
                  <template #archiveRecord="text,record">
                    <a-space style="cursor: pointer">
                      <a-icon class="primary-text" title="查看" type="eye"
                              @click="handleReviewPdf('巡检记录',record.pdfPathXh)"/>
                      <a-icon v-has="'archiveTem:edit'" class="primary-text" title="在线编辑" type="edit"
                              @click="webOfficeEdit(record.docxPathXh)"></a-icon>
                      <a title="下载word" @click="handleDownloadDocx(record.docxPathXh)">
                        <a-icon class="primary-text" type="download"></a-icon>
                      </a>
                      <h-upload-file-b
                        v-has="'archiveTem:edit'"
                        v-model="swapFileList"
                        :customParams="{id:record.id}"
                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        isPublic
                        @beforeUpload="$refs.equipTaskList.localLoading = true"
                        @change="file => handleUploadCallback(file, record,'1')">
                        <a-icon class="primary-text cursor-pointer" title='替换' type='swap'/>
                      </h-upload-file-b>
                    </a-space>
                  </template>
                  <template #embodiment="text,record">
                    <a-space style="cursor: pointer">
                      <a-icon class="primary-text" title="查看" type="eye"
                              @click="handleReviewPdf('实施方案',record.pdfPathSs)"></a-icon>
                      <a-icon v-has="'embodimentTem:edit'" class="primary-text" title="在线编辑" type="edit"
                              @click="webOfficeEdit(record.docxPathSs)"></a-icon>
                      <a title="下载word" @click="handleDownloadDocx(record.docxPathSs)">
                        <a-icon class="primary-text" type="download"></a-icon>
                      </a>
                      <h-upload-file-b
                        v-has="'embodimentTem:edit'"
                        v-model="swapFileList"
                        :customParams="{id:record.id}"
                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        isPublic
                        @beforeUpload="$refs.equipTaskList.localLoading = true"
                        @change="file => handleUploadCallback(file, record,'2')">
                        <a-icon class="primary-text cursor-pointer" title='替换' type='swap'/>
                      </h-upload-file-b>
                    </a-space>
                  </template>
                  <a-space slot="actions" slot-scope="text, record">
                    <template v-if="![40,50].includes(record.status)">
                      <!-- 开始 -->
                      <a-tooltip v-if="[1, 30, 40, 45, 50, 25].includes(+record.status)" title="开始">
                        <h-icon v-has="'ArrangeMent:start'" class="h-icon-item" type="icon-jiediankaishi"
                                @click="handleStart('start', record)"/>
                      </a-tooltip>
                      <!-- 暂停 -->
                      <a-tooltip v-if="record.status === 20" title="暂停">
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
                          @click="handleFinish(record)"
                        />
                      </a-tooltip>
                      <!-- 更多 -->
                      <a-dropdown>
                        <a-tooltip title="更多">
                          <h-icon class="h-icon-item" type="icon-gengduo1"/>
                        </a-tooltip>
                        <a-menu slot="overlay">
                          <!-- 异常 -->
                          <a-menu-item v-if="[20,45].includes(record.status)" v-has="'ArrangeMent:error'">
                            <div @click="$refs.taskAbnormalModal.show('error', record)">异常</div>
                          </a-menu-item>
                          <!-- 终止 -->
                          <a-menu-item v-if="record.status !== 40 && record.status === 20"
                                       v-has="'ArrangeMent:forceEnd'">
                            <div @click="$refs.taskForceEnd.show('forceEnd', record)">终止</div>
                          </a-menu-item>
                          <!-- 撤销 -->
                          <a-menu-item v-if="record.status === 1" v-has="'ArrangeMent:recover'">
                            <div @click="() => handleActions('recover', record)">撤销</div>
                          </a-menu-item>
                        </a-menu>
                      </a-dropdown>
                    </template>
                  </a-space>
                </h-vex-table>
              </h-card>
            </div>
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
      <test-check-modal ref="testCheckModal" @change="refreshEquipTaskList"/>
      <equip-basic-vibration ref="equipBasicVibration"></equip-basic-vibration>
      <test-base-edit ref="TestBaseEdit" :records="records" :selectedTreeRows="selectedRows"
                      @change="refreshEquipTaskList"/>
      <abnormal-detail-modal ref="abnormalDetailModal" @change="refreshEquipTaskList"/>
      <test-task-base-info-modal ref="testTaskBaseInfoModal"/>
      <equip-basic-line-modal ref="EquipBasicLineModal"
                              :selectRowId="selectedRow"
                              :selectedRow="selectedRow"></equip-basic-line-modal>
      <test-entrust-review-pdf ref="reviewPdf" :title="reviewPdfTitle"/>
      <termination-detail-modal listType="testForceEndList" ref="TerminationDetailModal"/>
    </div>
  </r-l-layout>
</template>

<script>
import moment from 'moment'
import {createLink, postAction} from '@/api/manage'
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
import TestEntrustReviewPdf from "@views/hifar/hifar-environmental-test/task/modules/TestEntrustReviewPdf";
import {ACCESS_TOKEN} from "@/store/mutation-types";
import * as WebCtrl from "@/plugins/webOffice";
import TerminationDetailModal from "@views/hifar/hifar-environmental-test/task/modules/TerminationDetailModal";
import {dateTimeFormatByStamp} from "@/utils/util";
// import {isHiddenColumns} from "@/utils/hasPermission";
let baseUrl = process.env.VUE_APP_API_BASE_URL
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
    TestEntrustReviewPdf,
    TerminationDetailModal
  },
  data() {
    return {
      moment,
      dateTimeFormatByStamp,
      treeSpinning: false,
      swapFileList: [],
      selectedKeys: [],
      selectedRows: [],
      queryParams: {},
      testStatusMap: {
        1: {color: "geekblue", text: "未开始"},
        10: {color: "red", text: "已撤销"},
        20: {color: "green", text: "进行中"},
        30: {color: "volcano", text: "暂停"},
        40: {color: "red", text: "终止"},
        45: {color: "yellow", text: "异常"},
        50: {color: "grey", text: "已完成"},
      },
      selectedKey: [],
      reviewPdfTitle: '',
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
          title: '委托单号',
          key: 'entrustNo',
          formType: 'input',
        },
        {
          title: '运行单号',
          key: 'entrustCode',
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
              title: '异常',
              key: 45,
              value: 45,
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
          title: '送试单位',
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
              let row = this.selectedRow[0]
              if (row.status === 40) return this.$message.warning('试验已终止，不能再次填写')
              if (row.status === 50) return this.$message.warning('试验已完成，不能再次填写')
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
              let row = this.selectedRow[0]
              if (row.status === 1) return this.$message.warning('试验未开始')
              if (row.status === 40) return this.$message.warning('试验已终止，不能再次填写')
              if (row.status === 50) return this.$message.warning('试验已完成，不能再次填写')
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
              let row = this.selectedRow[0]
              if (row.status === 1) return this.$message.warning('试验未开始')
              if (row.status === 40) return this.$message.warning('试验已终止，不能再次填写')
              if (row.status === 50) return this.$message.warning('试验已完成，不能再次填写')
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
              let row = this.selectedRow[0]
              if (row.status === 40) return this.$message.warning('试验已终止，不能再次填写')
              if (row.status === 50) return this.$message.warning('试验已完成，不能再次填写')
              this.records = row
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
              let row = this.selectedRow[0]
              if (row.status === 40) return this.$message.warning('试验已终止，不能再次填写')
              if (row.status === 50) return this.$message.warning('试验已完成，不能再次填写')
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
              let row = this.selectedRow[0]
              if (row.status === 40) return this.$message.warning('试验已终止，不能再次填写')
              if (row.status === 50) return this.$message.warning('试验已完成，不能再次填写')
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
          minWidth: 160,
          scopedSlots: {customRender: 'entrustCodes'},
        },
        {
          title: '委托单号',
          dataIndex: 'entrustNos',
          // hidden: isHiddenColumns('ArrangeMent:suspend'),
          minWidth: 140,
          scopedSlots: {customRender: 'entrustNos'},
        },
        {
          title: '试验编号',
          dataIndex: 'testCode',
          minWidth: 140,
          scopedSlots: {customRender: 'testCode'},
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: {customRender: 'status'},
          width: 190,
        },
        {
          title: '送试单位',
          dataIndex: 'custNames',
          minWidth: 150,
        },
        {
          title: '产品名称',
          align: 'left',
          minWidth: 120,
          dataIndex: 'productNames',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: '产品代号',
          align: 'left',
          minWidth: 100,
          dataIndex: 'productAliass',
          customRender: (text, record) => {
            return text || '--'
          }
        },
        {
          title: "产品编号",
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
          title: '试验人员',
          dataIndex: 'chargeUserName',
          minWidth: 100,
        },
        {
          title: '实施过程',
          dataIndex: 'remarks',
          minWidth: 150,
        },
        {
          title: '异常数量',
          dataIndex: 'exceptionNum',
          width: 80,
          align: 'center',
          scopedSlots: {customRender: 'exceptionNum'},
        },
        {
          title: '巡检记录',
          align: 'center',
          width: 110,
          dataIndex: 'archiveRecord',
          scopedSlots: {customRender: 'archiveRecord'}
        },
        {
          title: '实施方案',
          align: 'center',
          width: 110,
          dataIndex: 'embodiment',
          scopedSlots: {customRender: 'embodiment'}
        },
        {
          title: '期望开始时间',
          dataIndex: 'predictStartTime',
          customRender: time => dateTimeFormatByStamp(time),
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
          customRender: time => dateTimeFormatByStamp(time),
        },
        {
          title: '实际开始时间',
          dataIndex: 'realStartTime',
          customRender: time => dateTimeFormatByStamp(time),
          minWidth: 150,
        },
        {
          title: '实际结束时间',
          dataIndex: 'realEndTime',
          customRender: time => dateTimeFormatByStamp(time),
          minWidth: 150,
        },
        {
          title: '实际用时(h)',
          dataIndex: 'realUseTime',
          minWidth: 100,
          customRender: text => {
            return Number(text).toFixed(2) || '--'
          }
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
        authUploads: "/HfResEquipBusiness/authUploads"
      },
    }
  },
  mounted() {
    this.loadLeftTree()
  },
  methods: {
    // 开始
    handleStart(type, record) {
      if (record.status === 45) return this.$message.warning('试验异常中，请先解决异常')
      this.$refs.taskStartModal.show(type, record)
    },
    handleFinish(record) {
      if (record.status === 1) return this.$message.warning('试验未开始，不能完成')
      if (record.status === 45) return this.$message.warning('试验异常中，请先解决异常')
      this.$refs.taskFinishedModal.show('finish', record)
    },
    /**
     * @type 1:巡检 2:实施
     * */
    handleUploadCallback(file, record, type) {
      postAction(this.url.authUploads, {id: record.id, fileId: file[0].fileId, type}).then(res => {
        if (res.code === 200) {
          this.$message.success('替换成功')
        } else {
          this.$message.error('替换失败')
        }
      }).finally(() => {
        this.refresh()
        this.swapFileList = []
      })
    },
    handleReviewPdf(title, path) {
      this.reviewPdfTitle = title
      this.$refs.reviewPdf.show(path)
    },
    webOfficeEdit(fileUrl) {
      let fileUrlAuth = fileUrl.split('?')[1]
      fileUrl = fileUrl.split('?')[0]
      let token = this.$ls.get(ACCESS_TOKEN)
      WebCtrl.ShowEditPage(fileUrl, token, baseUrl, fileUrlAuth, 'env')
    },
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
      if (res.code === 200) {
        this.loadEquip = res.data.map((item) => {
          item.scopedSlots = {
            title: 'customTitle',
          }
          // 内部名称[设备名称]
          item.title = item.innerName + "-" + item.equipName
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
    handleActions(type, record) {
      let params = {
        id: record.id,
      }
      let url = this.url[type]
      postAction(url, params).then((res) => {
        if (res.code === 200) {
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
        if (res.code === 200) {
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
    handleDownloadDocx(filePath) {
      if (!filePath) return this.$message.warning('暂无数据')
      createLink(filePath)
    },
    onSelect(selectedKeys, event) {
      //关闭弹窗
      for (let ref in this.$refs) {
        try {
          if (this.$refs[ref].visible || this.$refs[ref].visible === true) {
            this.$refs[ref].visible = false
          }
        } catch {
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
.cursor-pointer {
  cursor: pointer;
}

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
<style lang="less" scoped>
/deep/ .h-edit-tree {
  .ant-tree-node-content-wrapper {
    width: 100% !important;
  }
}

/deep/ .desc-item .desc-item-content .desc-item-value {
  display: block;
}

</style>
