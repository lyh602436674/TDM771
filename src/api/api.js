/*
 * @Author: 赵峰
 * @Date: 2021-08-23 18:34:08
 * @LastEditTime: 2021-08-31 14:25:54
 * @LastEditors: 陈乾龙
 * @Descripttion: 
 * @FilePath: \hifar-platform-client\src\api\api.js
 */
import { getAction, deleteAction, putAction, postAction, httpAction } from '@/api/manage'
import Vue from 'vue'
import { UI_CACHE_DB_DICT_DATA } from '@/store/mutation-types'
import { rebuildRouter } from "@/utils/hasPermission"

//hifar add  begin
// 重复校验（多字段联合校验）
const duplicateMultiCheck = (params) => getAction("/sys/duplicate/multiCheck", params);
//hfiar add end

/**
 * @Date: 2021-07-17 15:49:32
 * @Author: 陈乾龙
 * @description: 角色管理
 */
const addRole = (params) => postAction('/OrgRoleBusiness/add', params);
const editRole = (params) => postAction('/OrgRoleBusiness/modifyById', params);
const checkRoleCode = (params) => getAction('/sys/role/checkRoleCode', params);
const queryall = (params) => getAction('/OrgRoleBusiness/listAll', params);

/**
 * @Date: 2021-07-17 17:28:41
 * @Author: 陈乾龙
 * @description: 系统用户管理相关
 */
const addUser = (params) => postAction('/OrgUserBusiness/add', params);
const editUser = (params) => postAction('/OrgUserBusiness/modifyById', params);
const queryUserRole = (params) => getAction('/OrgRoleUserBusiness/listRoleByNotUserId', params);
const getUserList = (params) => getAction('/OrgUserBusiness/listPage', params);
// 批量冻结
const frozenBatch = (params) => postAction('/OrgUserBusiness/setStatus', params);
// 验证用户是否存在
const checkOnlyUser = (params) => getAction('/sys/user/checkOnlyUser', params);
// 改变密码
const changePassword = (params) => putAction('/sys/user/changePassword', params);

/**
 * @Date: 2021-07-16 16:10:38
 * @Author: 陈乾龙
 * @description:菜单和权限管理
 */
const addPermission = (params) => postAction('/OrgMenuBusiness/add', params);
const editPermission = (params) => postAction('/OrgMenuBusiness/modifyById', params);
const getPermissionList = (params) => getAction('/sys/permission/list', params);
/* update_begin author:wuxianquan date:20190908 for:添加查询一级菜单和子菜单查询api */
const getSystemMenuList = (params) => getAction('/OrgMenuBusiness/listAll', params);
const getSystemSubmenu = (params) => getAction('/sys/permission/getSystemSubmenu', params);
const getSystemSubmenuBatch = (params) => getAction('/sys/permission/getSystemSubmenuBatch', params)
/* update_end author:wuxianquan date:20190908 for:添加查询一级菜单和子菜单查询api */

// 查询所有权限
export const queryTreeListToTree = (params, hasKey = false) => {
    return getAction('/OrgMenuBusiness/listAll', params).then(res => {
        if (res.code == 200) {
            let roleTree = rebuildRouter(res.data)
            if (hasKey) {
                let allKeys = []
                res.data.map(item => {
                    allKeys.push(item.id)
                    item.scopedSlots = {
                        title: 'customTitle'
                    }
                })
                return {
                    treeData: roleTree,
                    allKeys: allKeys
                }
            }
            return {
                treeData: roleTree
            }
        } else {
            throw new Error({ msg: res.msg })
        }
    })
};
const queryListAsync = (params) => getAction('/sys/permission/queryListAsync', params);
// 查询对应角色的权限
const queryRolePermission = (params) => getAction('/OrgMenuRightsBusiness/listMenuIdByRoleId', params);
const saveRolePermission = (params) => postAction('/OrgMenuRightsBusiness/saveRoleMenuData', params);
/**
 * @Date: 2021-07-15 16:09:47
 * @Author: 陈乾龙
 * @description: 通过TOKEN获取用户权限和设置好的菜单
 */
const queryPermissionsByUser = () => getAction('/BaseUserBusiness/queryMenuAndBtns');
const loadAllRoleIds = (params) => getAction('/sys/permission/loadAllRoleIds', params);
const getPermissionRuleList = (params) => getAction('/sys/permission/getPermRuleListByPermId', params);
const queryPermissionRule = (params) => getAction('/sys/permission/queryPermissionRule', params);

/**
 * @Date: 2021-07-21 09:57:18
 * @Author: 陈乾龙
 * @description: 部门管理相关接口
 */
export const queryDepartListAll = (params) => getAction('/OrgDeptBusiness/listAll', params);
const queryDepartTreeList = (params) => getAction('/OrgDeptBusiness/listTree', params);
const queryIdTree = (params) => getAction('/sys/sysDepart/queryIdTree', params);
const queryParentName = (params) => getAction('/sys/sysDepart/queryParentName', params);
const searchByKeywords = (params) => getAction('/sys/sysDepart/searchBy', params);
const deleteByDepartId = (params) => postAction('/OrgDeptBusiness/logicRemoveById', params);
const addDepart = (params) => postAction('/OrgDeptBusiness/add', params)
const editDepart = (params) => postAction('/OrgDeptBusiness/modifyById', params)
// 通过部门ID 获取对应部门下的用户
export const getUserByDeptId = (params) => getAction('/OrgDeptUserBusiness/listPageUserByDeptId', params)

/**
 * @Date: 2021-07-27 11:25:50
 * @Author: 陈乾龙
 * @description: 检测分类
 */
// 检查分类书-类别和项目 groupCode 不同检测项目的类型
export const chemicalTree = (parmas) => getAction('/HfPrjUnitClassifyBusiness/listTreeClassifyAndProject', parmas)
export const chemicalList = (groupCode) => getAction('/HfPrjUnitClassifyBusiness/listClassifyAndProject', { groupCode })
// 列表

// 二级部门管理
const queryDepartPermission = (params) => getAction('/sys/permission/queryDepartPermission', params);
const saveDepartPermission = (params) => postAction('/sys/permission/saveDepartPermission', params);
const queryTreeListForDeptRole = (params) => getAction('/sys/sysDepartPermission/queryTreeListForDeptRole', params);
const queryDeptRolePermission = (params) => getAction('/sys/sysDepartPermission/queryDeptRolePermission', params);
const saveDeptRolePermission = (params) => postAction('/sys/sysDepartPermission/saveDeptRolePermission', params);
const queryMyDepartTreeList = (params) => getAction('/sys/sysDepart/queryMyDeptTreeList', params);

// 日志管理
// const getLogList = (params)=>getAction("/sys/log/list",params);
const deleteLog = (params) => deleteAction('/sys/log/delete', params);
const deleteLogList = (params) => deleteAction('/sys/log/deleteBatch', params);

/**
 * @Date: 2021-07-26 10:12:10
 * @Author: 陈乾龙
 * @description: 数据字典相关
 */
// 添加数据字典
const addDict = (params) => postAction('/SysDictClassifyBusiness/add', params);
// 编辑数据字典
const editDict = (params) => postAction('/SysDictClassifyBusiness/modifyById', params);
// 查询所有数据字典
export const getDictAll = (params) => getAction("/SysDictClassifyBusiness/listAll", params);
export const getDictTree = (params) => getAction('/sys/dict/treeList', params);
const addDictItem = (params) => postAction('/SysDictItemBusiness/add', params);
const editDictItem = (params) => postAction('/SysDictItemBusiness/modifyById', params);

// 字典项-列表通过字典编号
export const listByDictCode = (code, params) => {
    let data = {
        ...params,
        dictCode: code
    }
    return getAction(`/SysDictItemBusiness/listByDictCode/`, data)
};
/**
 * @name: 赵峰
 * @test: 
 * @msg: 从localStorage缓存中获取字典配置
 * @param {*} dictCode
 * @return {*}
 */
function getDictItemsFromCache(dictCode) {
    if (Vue.ls.get(UI_CACHE_DB_DICT_DATA) && Vue.ls.get(UI_CACHE_DB_DICT_DATA)[dictCode]) {
        let dictItems = Vue.ls.get(UI_CACHE_DB_DICT_DATA)[dictCode];
        return dictItems;
    }
}

// 系统通告
const doReleaseData = (params) => getAction('/sys/annountCement/doReleaseData', params);
const doReovkeData = (params) => getAction('/sys/annountCement/doReovkeData', params);
// 获取系统访问量
const getLoginfo = (params) => getAction('/sys/loginfo', params);
const getVisitInfo = (params) => getAction('/sys/visitInfo', params);
// 数据日志访问
// const getDataLogList = (params)=>getAction("/sys/dataLog/list",params);

// 根据部门主键查询用户信息
const queryUserByDepId = (params) => getAction('/sys/user/queryUserByDepId', params);

// 查询用户角色表里的所有信息
// const queryUserRoleMap = (params)=>getAction("/sys/user/queryUserRoleMap",params);

// 重复校验
const duplicateCheck = (params) => getAction('/SysCheckBusiness/check', params);
// 加载分类字典
const loadCategoryData = (params) => getAction('/sys/category/loadAllData', params);
const checkRuleByCode = (params) => getAction('/sys/checkRule/checkByCode', params)
// 加载站点信息
const getSiteInfo = (params) => getAction('/eoa/cms/eoaCmsSite/getSiteInfo', params);
// 加载我的计划信息
const getPlanInfo = (params) => getAction('/eoa/plan/queryMyCreationByDate', params);
// 加载我的通告信息
const getUserNoticeInfo = (params) => getAction('/sys/sysAnnouncementSend/getMyAnnouncementSend', params);
// 查询图表数据
const getChartData = (params) => getAction('/joa/dataStatistics/getChartDate', params);
const getPieData = (params) => getAction('/joa/dataStatistics/getPieDate', params);
const getTransitURL = url => `/sys/common/transitRESTful?url=${encodeURIComponent(url)}`
// 中转HTTP请求
export const transitRESTful = {
    get: (url, parameter) => getAction(getTransitURL(url), parameter),
    post: (url, parameter) => postAction(getTransitURL(url), parameter),
    put: (url, parameter) => putAction(getTransitURL(url), parameter),
    http: (url, parameter) => httpAction(getTransitURL(url), parameter)
}
// 查询会议室
const getMettingRoomList = (params) => getAction('/eoa/metting/eoaMettingRoom/list', params);

export {
    // imgView,
    // doMian,
    duplicateMultiCheck,
    addRole,
    editRole,
    checkRoleCode,
    addUser,
    editUser,
    queryUserRole,
    getUserList,
    queryall,
    frozenBatch,
    checkOnlyUser,
    changePassword,
    getPermissionList,
    addPermission,
    editPermission,
    queryListAsync,
    queryRolePermission,
    saveRolePermission,
    queryPermissionsByUser,
    loadAllRoleIds,
    getPermissionRuleList,
    queryPermissionRule,
    queryDepartTreeList,
    queryIdTree,
    queryParentName,
    searchByKeywords,
    deleteByDepartId,
    addDepart,
    editDepart,
    deleteLog,
    deleteLogList,
    addDict,
    editDict,
    addDictItem,
    editDictItem,
    doReleaseData,
    doReovkeData,
    getLoginfo,
    getVisitInfo,
    queryUserByDepId,
    duplicateCheck,
    getSystemMenuList,
    getSystemSubmenu,
    getSystemSubmenuBatch,
    loadCategoryData,
    checkRuleByCode,
    queryDepartPermission,
    saveDepartPermission,
    queryTreeListForDeptRole,
    queryDeptRolePermission,
    saveDeptRolePermission,
    queryMyDepartTreeList,
    getSiteInfo,
    getUserNoticeInfo,
    getPlanInfo,
    getChartData,
    getPieData,
    getMettingRoomList,
    getDictItemsFromCache
}