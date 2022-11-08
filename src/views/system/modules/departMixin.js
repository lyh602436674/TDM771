/*
 * @Author: 陈乾龙
 * @Date: 2021-07-22 14:31:56
 * @LastEditTime: 2021-09-08 09:28:43
 * @LastEditors: 赵峰
 * @Description: 部门管理相关mixin
 * @FilePath: \hifar-platform-client\src\views\system\modules\departMixin.js
 */
import HDepartSelect from '@/components/HiFar/HDepartSelect'
export default {
  components: { HDepartSelect },
  data() {
    return {
      formData: [
        {
          title: "部门ID",
          key: "id",
          formType: 'input',
          hidden: true
        },
        {
          title: '部门名称',
          key: 'deptName',
          formType: 'input',
          placeholder: '请输入机构/部门名称',
          validate: { rules: [{ required: true, message: '请输入机构/部门名称!' }] },
        },
        {
          title: '上级部门',
          key: 'pid',
          formType: 'select',
          component: (
            <h-depart-select
              placeholder="请选择上级部门"
              v-decorator={['pid', { rules: [{ required: false, message: '请选择上级部门' }], initialValue: undefined }]}
            ></h-depart-select>
          ),
          validate: { rules: [{ required: false }] },
        },
        {
          title: '部门编码',
          key: 'deptCode',
          formType: 'input',
          placeholder: '请输入机构/部门编码',
          // hidden: true,
          // validate: { rules: [{ required: true, message: '请输入机构/部门名称!' }] },
        },
        {
          title: '电话',
          key: 'mobile',
          formType: 'input',
          placeholder: '请输入部门联系电话',
          validate: { rules: [{ validator: this.validateMobile }] },
        },
        {
          title: '传真',
          key: 'fax',
          formType: 'input',
          placeholder: '请输入传真',
        },
        {
          title: '地址',
          key: 'address',
          formType: 'input',
          placeholder: '请输入地址',
        },
        {
          title: '排序',
          key: 'rowSort',
          formType: 'input',
          component: <a-input-number placeholder="排序号" v-decorator={['rowSort']} />,
          placeholder: '请输入排序',
        },
        {
          title: '备注',
          key: 'remarks',
          component: <a-textarea placeholder="备注信息" v-decorator={['remarks']} />,
        },
      ],
      fieldKeys: ['id', 'pid', 'deptName', 'deptCode', 'departOrder', 'mobile', 'fax', 'address', 'rowSort', 'remarks'],
      url: {
        add: '/OrgDeptBusiness/add',
        edit: '/OrgDeptBusiness/modifyById',
      }
    }
  }
}