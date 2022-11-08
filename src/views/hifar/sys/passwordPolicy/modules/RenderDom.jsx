/*
 * @Author: 陈乾龙
 * @Date: 2021-05-31 11:36:47
 * @LastEditTime: 2021-08-31 17:01:20
 * @LastEditors: 陈乾龙
 * @Description: 用来自动生成对应密码规则form表单的组件
 * @FilePath: \hifar-platform-client\src\views\hifar\sys\passwordPolicy\modules\RenderDom.jsx
 */
import "../assets/less/renderDom.less"
import lodash from 'lodash'
export default {
  props: {
    value: {
      type: Object,
      default: () => {return {}},
      required: true
    }
  },
  data() {
    let status =this.value.status==1?true:false
    let policyValue = this.value.policyValue?this.value.policyValue:1
    return {
      status:status,
      policyValue:policyValue,
      rules:Object.assign({},this.value,{status:status?1:0,policyValue}),
    }
  },
  watch:{
    value(val){
      this.status=val.status==1?true:false
      this.policyValue = val.policyValue?this.value.policyValue:1
      this.rules=Object.assign({},val,{status:this.status?1:0,policyValue:this.policyValue})
    }
  },
  created(){
    this.handleEmit(this.rules)
  },
  methods:{
    createDom(){
      /**
       * @description: 这里注释代码不要删除，后续升级逻辑要用
       */      
      // switch(this.rules.formType){
      //   case 'input':
      //     return this.createInput()
      //   default:
      //     return <div>--</div>
      // }
      return this.createInput()
    },
    createInput(){
      let policyName = this.rules.policyName
      policyName = lodash.replace(policyName,/\$X/,`|input|`)
      policyName = policyName.split("|")
      let dom = policyName.map(item=>{
        if(item ==='input'){
          return (
            <a-input-number size="small" style="width:100px;" value={this.policyValue} formatter={this.formatterValue} parser={this.parserValue} onChange={this.handleInputChange}></a-input-number>
          )
        }else{
          return item
        }
      })
      return (
        <div class="list-item">
          <a-checkbox checked={this.status} onChange={this.handleChecked}></a-checkbox>
          {dom}
        </div>
      )
    },
    handleChecked(e){
      this.status = e.target.checked
      this.rules.status = this.status?1:0
      this.handleEmit(this.rules)
    },
    handleInputChange(v){
      this.policyValue = v
      this.rules.policyValue = this.policyValue
      this.handleEmit(this.rules)
    },
    formatterValue(value){
      if(isNaN(value) || !value){
        return 1
      }else{
        return parseInt(value)
      }
    },
    parserValue(value){
      return value
    },
    handleEmit(val){
      let value = Object.assign({},this.value,val)
      this.$emit('change',value)
      this.$emit('input',value)
    }
  },
  
  render() {
    let dom = this.createDom()
    return ( 
    <div class = "policy-rule" >
        {dom}
    </div>
    )
  }
}