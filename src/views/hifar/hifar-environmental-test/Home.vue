<!--
 * @Author: 赵峰
 * @Date: 2021-10-13 10:50:23
 * @LastEditTime: 2021-11-19 15:18:03
 * @LastEditors: 赵峰
 * @Descripttion: 首页
 * @FilePath: \hifar-platform-client\src\views\hifar\hifar-environmental-test\Home.vue
-->
<template>
  <div class="home-containter">
    <div class="main-content-page-wrapper">
      <div class="business-workbench">
        <h-card style="margin-bottom: 10px">
          <div class="bw-user-info">
            <div class="bw-welcome">
              <a-avatar
                :size="54"
                :icon="getAvatar() ? '' : 'user'"
                :src="getAvatar() ? getAvatar() : logo"
                alt="用户头像"
              />
              <div class="bw-welcome-wrapper">
                <!-- <div style="font-size: 16px; font-weight: bold">{{ loginWelcome }}</div> -->
                <div style="font-size: 16px; font-weight: bold">祝你开心每一天</div>
                <div>{{ timeFix }}，{{ nickname() }}</div>
              </div>
            </div>
          </div>
        </h-card>
        <div class="menuListBox">
          <template v-for="(item, index) in taskList">
            <h-card
              :title="item.menuName"
              :bordered="false"
              style="margin-bottom: 5px"
              class="menuListBox-card"
              v-if="item.isHidden !== 1"
            >
              <div slot="content" class="task-card-content">
                <template v-for="(child, childIndex) in item.children">
                  <div :key="index + childIndex" class="menu-list"
                       v-if="child.menuType === 'menu' && child.isHidden !== 1"
                       @click="jumpLink(child)">
                    <a-badge :count="child.count < 0 ? 0 : child.count">
                      <div class="menu-item" :style="{backgroundColor:child.color}">
                        <span style="font-size: 14px" v-if="!child.menuIcon">{{ child.menuName.substring(0, 2) }}</span>
                        <h-icon class="menu-item-icon" v-else-if="child.menuIcon.includes('icon-')"
                                :type="child.menuIcon"
                                style="font-size: 16px"/>
                        <a-icon class="menu-item-icon" v-else :type="child.menuIcon" style="font-size: 16px"/>
                      </div>
                      <h-ellipsis class="menu-item-menuName" :value="child.menuName" :length="4"/>
                    </a-badge>
                  </div>
                  <div :key="index + childIndex" class="menu-list" v-else-if="child.isHidden !== 1"
                       @click="jumpLink(item)">
                    <a-badge :count="item.count < 0 ? 0 : item.count">
                      <div class="menu-item" :style="{backgroundColor:item.color}">
                        <h-icon class="menu-item-icon" v-if="item.menuIcon.includes('icon-')" :type="item.menuIcon"
                                style="font-size: 16px"/>
                        <a-icon class="menu-item-icon" v-else :type="item.menuIcon" style="font-size: 16px"/>
                      </div>
                      <h-ellipsis class="menu-item-menuName" :value="item.menuName" :length="4"/>
                    </a-badge>
                  </div>
                </template>
              </div>
            </h-card>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import {getFileAccessHttpUrl,postAction} from '@/api/manage'
import {timeFix, welcome} from '@/utils/util'

export default {
  components: {},

  data() {
    return {
      loading: false,
      timeFix: timeFix(),
      welcome: welcome(),
      url: {
        statics: '/BaseIndexBusiness/indexTaskList',
      },
      activities: [],
      taskList: [],
      logo: require('@/assets/logo.png'),
    }
  },

  computed: {
    ...mapState({
      loginWelcome: (state) => {
        return state.app.loginWelcome
      },
    }),
  },
  created() {
    this.loadStaticData()
  },
  methods: {
    ...mapGetters(['nickname', 'avatar']),
    jumpLink(item) {
      this.$router.push({path: item.menuPath})
    },
    getAvatar() {
      return getFileAccessHttpUrl(this.avatar())
    },
    loadStaticData() {
      postAction(this.url.statics, {}).then((res) => {
        if (res.code === 200) {
          this.taskList = res.data
        }
      })
    },
  },
}
</script>
<style lang='less' scoped>

.home-containter {
  align-self: stretch;
  flex: 1;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  background: #f0f2f5;

  .main-content-page-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    box-sizing: border-box;

    .business-workbench {
      .bw-user-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .bw-welcome {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-left: 20px;

          .bw-welcome-wrapper {
            margin-left: 20px;
          }
        }

        .bw-right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          color: #111111;
          margin-right: 20px;

          .wait_num {
            font-weight: 400;
            color: #0084ff;
          }

          .ant-divider-vertical {
            margin: 0 20px;
          }
        }
      }
    }

    .menuListBox {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      &-card {
        width: 50%;

        .task-card-content {
          display: flex;

          .menu-list {
            margin: 0 15px;

            .menu-item {
              border-radius: 5px;
              margin-bottom: 10px;
              width: 60px;
              height: 60px;
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              color: #fff;
              background: @primary-color;
            }

            .menu-item:hover {

              .menu-item-icon,span {
                transition: all 0.3s;
                transform: scale(1.5);
              }
            }

            .menu-item-menuName {
              display: inline-block;
              width: 100%;
              text-align: center;
            }
          }
        }
      }
    }


  }
}
</style>