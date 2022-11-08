<!--
 * @Author: 陈乾龙
 * @Date: 2021-07-28 14:44:11
 * @LastEditTime: 2021-07-28 16:37:13
 * @LastEditors: 陈乾龙
 * @Description: 理化检测 分类的基本信息
 * @FilePath: \hifar-platform-client\src\views\hifar\project\modules\PhysicoChemicalClassifyInfo.vue
-->
<template>
  <h-card :title="title">
    <a-descriptions size="small" :bordered="true" :column="1">
      <a-descriptions-item label="分类名称">{{ classifyInfo.classifyName || '--' }}</a-descriptions-item>
      <a-descriptions-item label="工作中心">
        <template v-if="classifyInfo.workCenterList && classifyInfo.workCenterList.length > 0">
          <a-tag v-for="(item, index) in classifyInfo.workCenterList" :key="index">
            {{ item.workName || '--' }}
          </a-tag>
        </template>
      </a-descriptions-item>
      <a-descriptions-item label="备注信息">{{ classifyInfo.remarks || '--' }}</a-descriptions-item>
    </a-descriptions>
  </h-card>
</template>

<script>
import { getAction } from '@/api/manage'
export default {
  components: {},
  data() {
    return {
      title: null,
      id: null,
      url: {
        detail: '/HfPrjUnitClassifyBusiness/queryBaseAndCenterById',
      },
      classifyInfo: {},
    }
  },
  methods: {
    async getDetail(id) {
      this.id = id
      let res = await getAction(this.url.detail, { id: this.id })
      if (res.code == 200) {
        this.classifyInfo = res.data
        this.title = this.classifyInfo.classifyName
      }
    },
  },
}
</script>

<style lang='less' scoped>
.pc-classify {
  width: 100%;
  height: 100%;
}
</style>