<!--
 * @Author: 赵峰
 * @Date: 2021-11-11 14:55:32
 * @LastEditTime: 2021-11-11 16:27:19
 * @LastEditors: 赵峰
 * @Descripttion: 试前、试中、试后检查弹窗modal
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\task\checkModal\TestCheckModal.vue
-->
<template>
  <h-modal
    :getContainer='getContainer'
    :title="title + '检查'"
    :visible='visible'
    destroyOnClose
    fullScreen
    inner
    width='90%'
    @cancel='handleCancel'
  >
    <template slot='footer'>
      <a-button type='ghost-danger' @click='handleCancel'> 关闭</a-button>
    </template>
    <a-spin :spinning="spinLoading">
      <h-card v-if="type === 'before'" :showCollapse='false' style='min-height: 600px'>
        <div slot='table-operator'>
          <a-button size='small' type='ghost-primary' @click="handleCopy('beforeCheckInfo')"> 复制</a-button>
          <a-button size='small' type='ghost-primary' @click="handleAdd('beforeCheckInfo')"> 新增</a-button>
          <a-button size='small' type='ghost-primary' @click="handleFillAll('beforeCheckInfo')"> 一键审核</a-button>
          <a-button size='small' type='ghost-primary' @click="handleCheckAll('beforeCheckInfo')"> 一键复核</a-button>
        </div>
        <div slot='content' class='check-list'>
          <a-empty v-if='beforeCheckInfo && beforeCheckInfo.length <= 0'/>
          <template v-else>
            <div class='check-list-item check-list-item-center'>
              <div class='check-checkbox'>
                <a-checkbox :checked="checkAll" :indeterminate="indeterminate"
                            @change="e=>checkChangeAll(e,'beforeCheckInfo')"/>
              </div>
              <div class='check-name'>检查项名称</div>
              <div class='check-content'>检查项内容</div>
              <div class='check-require'>检查项要求</div>
              <div class='check-res'>检查结果</div>
              <div class='check-res-person'>试验员</div>
              <div class='check-flag-person'>检验员</div>
              <div class='check-operate'>操作</div>
            </div>
            <div v-for='(item, index) in beforeCheckInfo' :key='index' class='check-list-item'>
              <div class='check-checkbox check-list-item-center'>
                <a-checkbox :checked="item.checked" @change="e=>checkItemChange(e,item, 'beforeCheckInfo')"/>
              </div>
              <div class='check-name check-list-item-center'>
                <span v-if="!item.isEdit">{{ item.itemName }}</span>
                <a-textarea v-else v-model="item.itemName" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-content'>
                <span v-if="!item.isEdit">{{ item.itemContent }}</span>
                <a-textarea v-else v-model="item.itemContent" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-require'>
                <span v-if="!item.isEdit">{{ item.itemRequire }}</span>
                <a-textarea v-else v-model="item.itemRequire" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-res check-list-item-center'>
                <div v-if="!item.isEdit || item.isCheckRes"
                     @click="() => handleCheckRes(item, index, 'beforeCheckInfo')">
                  <div v-if="item.itemRes == '1'" class='check-box'></div>
                  <h-icon v-else-if="item.itemRes == '2'" class='success-text' type='icon-wancheng1'/>
                  <h-icon v-else-if="item.itemRes == '3'" class='danger-text' type='icon-chacha'/>
                  <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="item.itemRes"></span>
                </div>
                <a-textarea v-else v-model="item.itemRes" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-res-person' @click='() => handleFillCheck(item, index)'>
                {{ item.fillUserName || '--' }}
              </div>
              <div class='check-flag-person' @click='() => handleFlagCheck(item, index)'>
                {{ item.checkUserName || '--' }}
              </div>
              <a-popconfirm class='check-operate' title='确定删除吗?' @confirm='handleDelete(item,index,"beforeCheckInfo")'>
                <a style='color: #ff4d4f'>删除</a>
              </a-popconfirm>
            </div>
          </template>
        </div>
      </h-card>
      <h-card v-if="type === 'testMiddle'" style='min-height: 600px'>
        <div slot='table-operator'>
          <a-button size='small' type='ghost-primary' @click="handleCopy('inCheckInfo')"> 复制</a-button>
          <a-button size='small' type='ghost-primary' @click="handleAdd('inCheckInfo')"> 新增</a-button>
          <a-button size='small' type='ghost-primary' @click="handleFillAll('inCheckInfo')"> 一键审核</a-button>
          <a-button size='small' type='ghost-primary' @click="handleCheckAll('inCheckInfo')"> 一键复核</a-button>
        </div>
        <div slot='content' class='check-list'>
          <a-empty v-if='inCheckInfo && inCheckInfo.length <= 0'/>
          <template v-else>
            <div class='check-list-item check-list-item-center'>
              <div class='check-checkbox'>
                <a-checkbox :checked="checkAll" :indeterminate="indeterminate"
                            @change="e=>checkChangeAll(e,'inCheckInfo')"/>
              </div>
              <div class='check-name'>检查项名称</div>
              <div class='check-content'>检查项内容</div>
              <div class='check-require'>检查项要求</div>
              <div class='check-res'>检查结果</div>
              <div class='check-res-person'>试验员</div>
              <div class='check-flag-person'>检验员</div>
              <div class='check-operate'>操作</div>
            </div>
            <div v-for='(item, index) in inCheckInfo' :key='index' class='check-list-item'>
              <div class='check-checkbox check-list-item-center'>
                <a-checkbox :checked="item.checked" @change="e=>checkItemChange(e,item, 'inCheckInfo')"/>
              </div>
              <div class='check-name check-list-item-center'>
                <span v-if="!item.isEdit">{{ item.itemName }}</span>
                <a-textarea v-else v-model="item.itemName" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-content'>
                <span v-if="!item.isEdit">{{ item.itemContent }}</span>
                <a-textarea v-else v-model="item.itemContent" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-require'>
                <span v-if="!item.isEdit">{{ item.itemRequire }}</span>
                <a-textarea v-else v-model="item.itemRequire" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-res check-list-item-center'>
                <div v-if="!item.isEdit || item.isCheckRes" @click="() => handleCheckRes(item, index, 'inCheckInfo')">
                  <div v-if="item.itemRes == '1'" class='check-box'></div>
                  <h-icon v-else-if="item.itemRes == '2'" class='success-text' type='icon-wancheng1'/>
                  <h-icon v-else-if="item.itemRes == '3'" class='danger-text' type='icon-chacha'/>
                  <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="item.itemRes"></span>
                </div>
                <a-textarea v-else v-model="item.itemRes" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-res-person' @click='() => handleFillCheck(item, index)'>
                {{ item.fillUserName || '--' }}
              </div>
              <div class='check-flag-person' @click='() => handleFlagCheck(item, index)'>
                {{ item.checkUserName || '--' }}
              </div>
              <a-popconfirm class='check-operate' title='确定删除吗?' @confirm='handleDelete(item,index,"inCheckInfo")'>
                <a style='color: #ff4d4f'>删除</a>
              </a-popconfirm>
            </div>
          </template>
        </div>
      </h-card>
      <h-card v-if="type === 'after'" style='min-height: 600px'>
        <div slot='table-operator'>
          <a-button size='small' type='ghost-primary' @click="handleCopy('afterCheckInfo')"> 复制</a-button>
          <a-button size='small' type='ghost-primary' @click="handleAdd('afterCheckInfo')"> 新增</a-button>
          <a-button size='small' type='ghost-primary' @click="handleFillAll('afterCheckInfo')"> 一键审核</a-button>
          <a-button size='small' type='ghost-primary' @click="handleCheckAll('afterCheckInfo')"> 一键复核</a-button>
        </div>
        <div slot='content' class='check-list'>
          <a-empty v-if='afterCheckInfo && afterCheckInfo.length <= 0'/>
          <template v-else>
            <div class='check-list-item check-list-item-center'>
              <div class='check-checkbox'>
                <a-checkbox :checked="checkAll" :indeterminate="indeterminate"
                            @change="e=>checkChangeAll(e,'afterCheckInfo')"/>
              </div>
              <div class='check-name'>检查项名称</div>
              <div class='check-content'>检查项内容</div>
              <div class='check-require'>检查项要求</div>
              <div class='check-res'>检查结果</div>
              <div class='check-res-person'>试验员</div>
              <div class='check-flag-person'>检验员</div>
              <div class='check-operate'>操作</div>
            </div>
            <div v-for='(item, index) in afterCheckInfo' :key='index' class='check-list-item'>
              <div class='check-checkbox check-list-item-center'>
                <a-checkbox :checked="item.checked" @change="e=>checkItemChange(e,item, 'afterCheckInfo')"/>
              </div>
              <div class='check-name check-list-item-center'>
                <span v-if="!item.isEdit">{{ item.itemName }}</span>
                <a-textarea v-else v-model="item.itemName" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-content'>
                <span v-if="!item.isEdit">{{ item.itemContent }}</span>
                <a-textarea v-else v-model="item.itemContent" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-require'>
                <span v-if="!item.isEdit">{{ item.itemRequire }}</span>
                <a-textarea v-else v-model="item.itemRequire" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-res check-list-item-center'>
                <div v-if="!item.isEdit || item.isCheckRes"
                     @click="() => handleCheckRes(item, index, 'afterCheckInfo')">
                  <div v-if="item.itemRes == '1'" class='check-box'></div>
                  <h-icon v-else-if="item.itemRes == '2'" class='success-text' type='icon-wancheng1'/>
                  <h-icon v-else-if="item.itemRes == '3'" class='danger-text' type='icon-chacha'/>
                  <span v-else style="display:inline-block;width:100%;text-align: left;" v-text="item.itemRes"></span>
                </div>
                <a-textarea v-else v-model="item.itemRes" :auto-size="{minRows:2}"
                            @blur="handleBlurSave(item)"></a-textarea>
              </div>
              <div class='check-res-person' @click='() => handleFillCheck(item, index)'>
                {{ item.fillUserName || '--' }}
              </div>
              <div class='check-flag-person' @click='() => handleFlagCheck(item, index)'>
                {{ item.checkUserName || '--' }}
              </div>
              <a-popconfirm class='check-operate' title='确定删除吗?' @confirm='handleDelete(item,index,"afterCheckInfo")'>
                <a style='color: #ff4d4f'>删除</a>
              </a-popconfirm>
            </div>
          </template>
        </div>
      </h-card>
    </a-spin>
  </h-modal>
</template>

<script>
import {postAction} from '@/api/manage'
import {cloneDeep, isArray, isObject} from 'lodash'
import {randomUUID} from "@/utils/util";

export default {
  inject: {
    getContainer: {
      default: () => document.body
    }
  },
  data() {
    return {
      visible: false,
      submitShow: false,
      type: '',
      title: '',
      beforeCheckInfo: [],
      inCheckInfo: [],
      afterCheckInfo: [],
      checkDetail: {},
      indeterminate: false,
      checkAll: false,
      spinLoading: false,
      url: {
        detail: '/HfEnvTaskTestBusiness/queryTestCheckItem',
        fill: '/HfEnvTaskTestBusiness/saveTestCheckItem',
        check: '/HfEnvTaskTestBusiness/checkTestCheckItem',
        deleteCheckDoItem: '/HfEnvTaskTestBusiness/deleteCheckDoItem',
        updateCheckItem: "/HfEnvTaskTestBusiness/updateCheckItem"
      }
    }
  },
  methods: {
    filterCheckedList(type) {
      return this[type].filter(item => item.checked === true)
    },
    checkChangeAll(e, type) {
      this.checkAll = !this.checkAll
      this.indeterminate = false
      this[type].forEach(item => {
        item.checked = e.target.checked
      })
    },
    checkItemChange(e, item, type) {
      item.checked = e.target.checked
      this.$forceUpdate()
      let checkedList = this.filterCheckedList(type)
      this.checkAll = checkedList.length === this[type].length;
      this.indeterminate = !!checkedList.length && checkedList.length < this[type].length;
    },
    handleBlurSave(item) {
      if (item.itemContent || item.itemName || item.itemRequire) {
        postAction(this.url.updateCheckItem, item).then(res => {
          if (res.code === 200) {
            this.$message.success('保存成功')
            item.isSave = true
          }
        })
      }
    },
    async handleCopy(type) {
      let checkedList = this.filterCheckedList(type)
      if (!checkedList.length) return this.$message.warning('请选择需要复制的项')
      this.spinLoading = true
      let extendCheckedList = cloneDeep(checkedList).map(item => {
        return {
          ...item,
          isEdit: true,
          isCheckRes: true,
          checked: false,
          id: randomUUID(),
          fillUserName: "",
          fillUserId: "",
          fillTime: "0",
          checkUserName: "",
          checkUserId: "",
          checkTime: "0"
        }
      })
      // 复制后自动把复制的数据保存了
      for (let i = 0; i < extendCheckedList.length; i++) {
        await postAction(this.url.updateCheckItem, extendCheckedList[i])
      }
      this[type] = this[type].concat(extendCheckedList).map(item1 => {
        return {...item1, checked: false,}
      })
      this.checkAll = false
      this.indeterminate = false
      this.spinLoading = false
    },
    handleAdd(type) {
      let params = this[type].length > 0 ? cloneDeep(this[type][this[type].length - 1]) : Object.assign({}, this.checkDetail, {testId: this.testId})
      let records = {}
      records.pid = params.pid ? params.pid : (type === 'beforeCheckInfo' ? params.beforeCheckId : type === 'inCheckInfo' ? params.inCheckId : type === 'afterCheckInfo' ? params.afterCheckId : '')
      records.tenantId = params.tenantId
      records.id = randomUUID()
      records.testId = params.testId
      records.itemName = ''
      records.itemContent = ''
      records.itemRequire = ''
      records.isEdit = true
      records.itemRes = ''
      this[type].push(records)
    },
    show(record, title, type) {
      this.visible = true
      this.indeterminate = false
      this.checkAll = false
      this.title = title
      this.type = type
      this.testId = record.id
      if (record.id) {
        this.getCheckDetail()
      }
    },
    handleCancel() {
      this.visible = false
      this.spinLoading = false
      this.beforeCheckInfo = []
      this.inCheckInfo = []
      this.afterCheckInfo = []
    },
    getCheckDetail() {
      postAction(this.url.detail, {id: this.testId}).then((res) => {
        if (res.code === 200) {
          this.checkDetail = res.data
          let {beforeCheckInfo, inCheckInfo, afterCheckInfo} = res.data
          this.beforeCheckInfo = isArray(beforeCheckInfo) && beforeCheckInfo.length ? beforeCheckInfo : []
          this.inCheckInfo = isArray(inCheckInfo) && inCheckInfo.length ? inCheckInfo : []
          this.afterCheckInfo = isArray(afterCheckInfo) && afterCheckInfo.length ? afterCheckInfo : []
        }
      })
    },
    handleCheckRes(item, index, type) {
      let itemRes = item.itemRes
      if (itemRes == 1) {
        itemRes = 2
      } else if (itemRes == 2) {
        itemRes = 3
      } else if (itemRes == 3) {
        itemRes = 2
      }
      this.$set(this[type][index], 'itemRes', itemRes)
    },
    handleFillCheck(item) {
      let record = {
        checkItemInfo: []
      }
      if (isArray(item)) {
        record.checkItemInfo = item
      } else if (isObject(item)) {
        record.checkItemInfo.push({
          id: item.id,
          itemRes: item.itemRes
        })
      }
      this.handleFillSubmit(record)
    },
    handleDelete(item, index, type) {
      //  如果时手动新增的，那就前台删除
      if (item.isEdit && !item.isSave) {
        this[type].splice(index, 1)
      } else if (item.isEdit && item.isSave) {
        deleteItem.call(this)
      } else {
        deleteItem.call(this)
      }

      function deleteItem() {
        postAction(this.url.deleteCheckDoItem, {id: item.id}).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getCheckDetail();
          } else {
            this.$message.error('删除失败')
          }
        })
      }
    },
    handleFlagCheck(item) {
      let record = {
        checkItemInfo: []
      }
      if (isArray(item)) {
        record.checkItemInfo = item
      } else if (isObject(item)) {
        record.checkItemInfo.push({
          id: item.id
        })
      }
      this.handleCheckSubmit(record)
    },
    handleFillSubmit(record) {
      postAction(this.url.fill, {...record}).then((res) => {
        if (res.code === 200) {
          this.$message.success('检查审核成功')
          this.getCheckDetail()
          this.resetCheckedState()
        }
      })
    },
    checkItem() {
      let items = [], arr = cloneDeep(arguments[0])
      for (let i = 0; i < arr.length; i++) {
        let {itemContent, itemName, itemRequire} = arr[i]
        if (itemContent || itemName || itemRequire) {
          let obj = {}
          arguments[1].forEach(item => {
            if (typeof item === 'string') {
              obj[item] = arr[i][item] || ''
            }
          })
          items.push(obj)
        } else {
          arr.splice(i, 1)
          i--
        }
      }
      return items
    },
    handleFillAll(type) {
      if (this[type].length === 0) {
        return this.$message.warning('请先新增检查项')
      }
      let checkedList = this.filterCheckedList(type)
      if (checkedList.length) {
        let items = this.checkItem(checkedList, ['id', 'itemRes'])
        if (items.length > 0) {
          this.handleFillCheck(items)
        } else {
          return this.$message.warning('请填写检查项')
        }
      } else {
        this.$confirm({
          title: '提示',
          content: '确认全部一键审核吗？',
          onOk: () => {
            let items = this.checkItem(this[type], ['id', 'itemRes'])
            if (items.length > 0) {
              this.handleFillCheck(items)
            } else {
              return this.$message.warning('请填写检查项')
            }
          },
        })
      }
    },
    handleCheckAll(type) {
      if (this[type].length === 0) {
        return this.$message.warning('请先新增检查项')
      }
      let checkedList = this.filterCheckedList(type)
      if (checkedList.length) {
        let items = this.checkItem(checkedList, ['id'])
        if (items.length > 0) {
          this.handleFlagCheck(items)
        } else {
          return this.$message.warning('请填写检查项')
        }
      } else {
        this.$confirm({
          title: '提示',
          content: '确认全部一键复核吗？',
          onOk: () => {
            let items = this.checkItem(this[type], ['id'])
            if (items.length > 0) {
              this.handleFlagCheck(items)
            } else {
              return this.$message.warning('请填写检查项')
            }
          },
        })
      }
    },
    handleCheckSubmit(record) {
      postAction(this.url.check, {...record}).then((res) => {
        if (res.code === 200) {
          this.$message.success('检查复核成功')
          this.getCheckDetail()
          this.resetCheckedState()
        }
      })
    },
    resetCheckedState() {
      this.indeterminate = false
      this.checkAll = false
      let typeObj = {
        before: "beforeCheckInfo",
        testMiddle: "inCheckInfo",
        after: "afterCheckInfo",
      }
      this[typeObj[this.type]].forEach(item => item.checked = false)
    }
  }
}
</script>
<style lang='less' scoped>
.check-list {
  height: 100%;
  overflow: auto;
}

.check-list-item-center {
  text-align: center;
}

.check-list-item {
  display: flex;
  align-items: center;
  border: solid 1px @border-color-base;
  border-bottom: none;

  &:last-child {
    border-bottom: solid 1px @border-color-base;
    border-bottom-left-radius: @border-radius-base;
    border-bottom-right-radius: @border-radius-base;
  }

  &:first-child {
    border-top-left-radius: @border-radius-base;
    border-top-right-radius: @border-radius-base;
  }

  > div {
    border-right: solid 1px @border-color-base;
    min-height: 30px;
    padding: 5px;
    overflow: hidden;
    align-self: stretch;

    &:last-child {
      border-right: none;
    }
  }

  .check-checkbox {
    width: 3%
  }

  .check-name {
    width: 9%;
  }

  .check-content {
    width: 24%;
  }

  .check-require {
    //flex: 1;
    width: 24%;
  }

  .check-res {
    //width: 70px;
    width: 19%;
    cursor: pointer;
  }

  .check-res-person {
    .check-list-item-center;
    //width: 120px;
    width: 8%;
    cursor: pointer;
  }

  .check-flag-person {
    .check-list-item-center;
    //width: 120px;
    width: 8%;
    cursor: pointer;
  }

  .check-operate {
    .check-list-item-center;
    //width: 100px;
    width: 4%;
    cursor: pointer;
  }

  .check-box {
    width: 18px;
    height: 18px;
    border: solid 1px @border-color-base;
    border-radius: @border-radius-base;
    margin: 0 auto;
  }
}
</style>