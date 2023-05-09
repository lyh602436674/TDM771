/**
 * @Description 全局常量定义文件
 * @Date 2023-4-11
 * @Author 雷宇航
 * */

// 项目分类常量
export const SYSTEM_CONSTANTS_PROJECT_CLASSIFY = [
  {
    title: '气候试验',
    key: 1,
    value: 1,
  },
  {
    title: '力学试验',
    key: 2,
    value: 2,
  },
  {
    title: '环境试验',
    key: 3,
    value: 3,
  },
]

// 项目管理页面中添加的试验条件，会在填写委托单的时候，选择了项目信息会自动带入项目所关联的试验条件
// 这个常量用来控制，自动带入的条件是否可以删除
// false 不可以删除， true 可以删除
export const PROJECT_RELEVANCY_TEST_CONDITION = true

// 报告驳回类型

export const REPORT_REJECT_TYPE = [
  {title: "报告生成", key: "1", value: "1"},
  {title: "报告审核", key: "2", value: "2"},
  {title: "报告批准", key: "3", value: "3"},
  {title: "修改审批", key: "4", value: "4"},
]
/**
 * 客户管理-客户类型
 * */
export const CUST_TYPE_OPTIONS = [
  { title: '内部', value: 'inside', key: 'inside' },
  { title: '外部', value: 'outside', key: 'outside' },
]