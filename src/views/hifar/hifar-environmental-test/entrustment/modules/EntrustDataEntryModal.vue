<template>
  <h-modal
    :title="title"
    :width="600"
    destroyOnClose
    centered
    inner
    :visible="visible"
    :getContainer="getContainer"
    @submit="handleClickSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading" tip="识别中..." size="large">
      <div class="entry-list">
        <div v-for="(item,index) in entryDataList" class="entry-list-item" :key="index+'-only'">
          <span :style="{backgroundColor: item.active ? '#1890ff':'',color:item.active ? 'white':'rgba(0,0,0,.65)', }">
            {{ index + 1 }}
          </span>
          <a-input v-model="item.content" v-show="false" class="entry-list-item-input"></a-input>
        </div>
      </div>
      <div class="antd-progress-wrapper">
        <div class="antd-progress-box">
          <a-progress :percent="+(percent.toFixed(2))" class="antd-progress"/>
        </div>
        <a-input
          class="antd-input1"
          v-model="progressData"
          @keydown="progressKeydown"
          ref="progressInput"
        />
        <a-input class="antd-input2" v-model="resultData"/>
      </div>
    </a-spin>
  </h-modal>
</template>

<script>
import {postAction} from "@/api/manage";

export default {
  name: "EntrustDataEntry",
  inject: {
    getContainer: {
      default: () => {
        return () => document.body;
      },
    },
  },
  data() {
    return {
      title: "扫码创建",
      percent: 0,
      visible: false,
      loading: false,
      progressData: "",
      resultData: "",
      result: {},
      entryDataList: [],
      url: {
        mesPush: "/HfEnvEntrustBusiness/mesPush",
      },
    };
  },
  watch: {
    percent: {
      immediate: true,
      handler(newVal) {
        if (newVal >= 100) {
          this.resultData = ""
          this.entryDataList.forEach(item => {
            this.resultData += item.content
          })
          try {
            this.$success({
              title: "扫描出的结果为",
              content: <div>{this.resultData}</div>,
            });
          } catch {
            this.$message.warning("请确认二维码中数据格式是否正确");
          }
        }
      },
    },
    progressData() {
      this.loading = true;
    },
  },
  methods: {
    open() {
      this.visible = true;
      this.progressData = "";
      this.resultData = "";
      this.loading = false;
      this.entryDataList = []
      this.percent = 0
      this.$nextTick(() => {
        this.$refs.progressInput.focus();
      });
    },
    handleClickSubmit() {
      if (this.percent < 100) {
        this.$message.warning("请先完成扫码");
        this.$refs.progressInput.focus();
        return
      } else {
        postAction(this.url.mesPush, JSON.parse(this.resultData)).then((res) => {
          if (res.code === 200) {
            this.$message.success("录入成功");
            this.handleCancel();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    progressKeydown(e) {
      let event = window.event || e;
      let code = event.keyCode || event.which || event.charCode;
      if (code == 13) {
        setTimeout(() => {
          this.loading = false;
        }, 100);
        try {
          let result = JSON.parse(e.target.value);
          this.result = result;
          if (result.entrustCode && result.current && result.total) {
            if (
              Object.keys(this.result).length > 0 &&
              result.entrustCode !== this.result.entrustCode
            ) {
              return this.$message.warning("当前二维码与上一次的二维码委托单号不一致!");
            }
            if (this.entryDataList.length === 0) {
              for (let i = 0; i < result.total; i++) {
                this.entryDataList.push({
                  active: +result.current === i + 1,
                  content: +result.current === i + 1 ? result.data : ''
                })
              }
            } else {
              if (this.entryDataList[result.current - 1].active) {
                this.progressData = "";
                return this.$message.warning('当前二维码已扫描!')
              }
              this.$set(this.entryDataList[result.current - 1], 'active', true)
              this.$set(this.entryDataList[result.current - 1], 'content', result.data)
            }
            this.percent += +((1 / +result.total) * 100).toFixed(2);
            this.progressData = "";
            // if (result.current != 1 && !this.resultData) {
            //   this.progressData = "";
            //   return this.$message.warning("请先扫描第一个二维码");
            // } else {
            //   if (result.current == 1 && !this.resultData) {
            //     this.result = result;
            //     this.resultData += result.data;
            //   } else {
            //     if (result.current != this.result.current + 1) {
            //       this.progressData = "";
            //       return this.$message.warning(
            //         `请扫描第${this.result.current + 1}个二维码`
            //       );
            //     } else {
            //       this.percent = +((+result.current / +result.total) * 100).toFixed(2);
            //       this.result = result;
            //       this.resultData += result.data;
            //     }
            //   }
            // }
          } else {
            this.$message.warning("请确认二维码中数据格式是否正确");
          }
        } catch {
          this.$message.warning(
            "请检查二维码中数据格式是否正确或者当前输入法是否为英文!"
          );
        }
        this.progressData = "";
        this.$nextTick(() => {
          this.$refs.progressInput.focus();
        });
      }
    },
    handleCancel() {
      this.visible = false;
      this.progressData = "";
      this.resultData = "";
      this.percent = 0;
      this.loading = false;
      this.entryDataList = []
    },
  },
};
</script>

<style scoped lang="less">
.entry-list {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;

  &-item {
    width: 60px;
    height: 60px;
    border-radius: 5px;
    border: 1px solid #e8e8e8;
    margin-right: 5px;
    margin-bottom: 5px;

    &-input {
      width: 1px;
      z-index: -1;
    }

    span {
      display: inline-block;
      width: 100%;
      text-align: center;
      font-size: 20px;
      line-height: 60px;
      border-radius: 5px;
    }
  }
}

/deep/ .antd-progress-wrapper {
  width: 100%;
  height: 120px;
  position: relative;

  .antd-progress-box {
    width: 100%;
    height: 100%;
    z-index: 100;
    background-color: white;
    position: relative;
  }

  .loading {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 200;

    .spinning {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .antd-progress {
    width: 100%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .antd-input1 {
    position: absolute;
    width: 1px;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%);
  }

  .antd-input2 {
    position: absolute;
    width: 1px;
    left: 50%;
    top: 60%;
    transform: translate(-50%, -50%);
  }
}
</style>
