/*
 * @Author: 陈乾龙
 * @Date: 2021-06-09 09:35:31
 * @LastEditTime: 2021-11-04 15:48:40
 * @LastEditors: 陈乾龙
 * @Description: 自定义组件指令和组件的入口文件
 * @FilePath: \hifar-platform-client\src\components\directive.js
 */
export const drag = {
  install(Vue, options) {
    Vue.directive('drag', {
      inserted: function (el, binding) {
        console.log("Drag directive options:", binding)
        const dragDom = el
        // dragDom.onmouseenter = (e)=>{
        //   console.log('onmouseenter')
        //   // dragDom.style.cursor = 'move';
        // }
        dragDom.onmousedown = (e) => {
          e.stopPropagation();
          // 鼠标按下，计算当前元素距离可视区的距离
          dragDom.style.position = "fixed";
          const disX = e.clientX - dragDom.offsetLeft;
          const disY = e.clientY - dragDom.offsetTop;
          document.onmousemove = (e) => {
            //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
            let left = e.clientX - disX;
            let top = e.clientY - disY;
            //移动当前元素
            dragDom.style.left = `${left}px`
            dragDom.style.top = `${top}px`
          };
          document.onmouseup = (e) => {
            dragDom.style.cursor = 'auto'
            document.onmousemove = null;
            document.onmouseup = null;
          };
        }
      }
    })
  }
};

export const resize = {
  install(Vue, options) {
    Vue.directive('resize', {
      bind(el, binding) {
        let width = null,
          height = null
        let isResize = () => {
          const style = document.defaultView.getComputedStyle(el)
          if (width !== style.width || height !== style.height) {
            width = style.width;
            height = style.height;
            binding.value(width, height);
          }

        }
        el.__vueSetInterval__ = setInterval(isResize, 100);
      },
      unbind(el) {
        clearInterval(el.__vueSetInterval__)
      }
    })
  }
}