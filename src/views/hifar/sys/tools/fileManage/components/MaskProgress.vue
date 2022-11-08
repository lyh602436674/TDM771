<!--
 * @Author: 陈乾龙
 * @Date: 2021-06-02 16:27:57
 * @LastEditTime: 2021-06-04 14:19:46
 * @LastEditors: 陈乾龙
 * @Description: 进度条遮罩层
 * @FilePath: \hifar-vue\ant-design-jeecg-vue\src\views\hifar\sys\tools\fileManage\components\maskProgress.vue
-->
<template>
  <div class="mask-progress-wrapper" @click="maskClick">
    <a-progress class="progress" type="circle" :status="status" :percent="percent" :width="60" :strokeWidth="7"/>
  </div>
</template>

<script>
export default {
  props:{
    percent:{
      type:Number,
      default:0
    },
    status:{
      type:String,
      default:'normal'
    }
  },
  methods:{
    maskClick(){
      this.$emit('maskClick',true)
    }
  }
}
</script>

<style lang="less" scoped>
.mask-progress-wrapper{
  position: absolute;
  top:0;
  left:0;
  height:100%;
  width:100%;
  background-color:rgba(#000,0.8);
  z-index:5;
  .progress{
    position: absolute;
    top:50%;
    left:50%;
    transform: translate(-50%,-50%);
  }
  /deep/ .ant-progress-text{
    color:#fff;
  }
}
</style>