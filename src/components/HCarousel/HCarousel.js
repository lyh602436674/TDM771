import C from 'ant-design-vue/es/carousel/index'

export default {
  name: "HCarousel",
  extends: C,
  watch: {
    autoplay: {
      handler(val) {
        if (val) {
          // 解决antd 修改autoplay状态后不会自动轮播的问题
          this.innerSlider = this.$refs.slick && this.$refs.slick.innerSlider;
          this.$refs.slick.slickPlay()
        }
      }
    }
  },
}