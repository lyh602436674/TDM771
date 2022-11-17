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

export const dragger = {
  // 只能上下移动（一般用于固定在侧边的元素）
  // 使用方法 <div v-dragger="{click:xxxx}">
  install(Vue, options) {
    Vue.directive('dragger', {
      inserted: function (el, binding) {
        const dragDom = el
        dragDom.onmousedown = (e) => {
          let time = new Date().getTime();
          e.stopPropagation();
          dragDom.style.position = "fixed";
          const disY = e.clientY - dragDom.offsetTop;
          document.onmousemove = (e) => {
            dragDom.style.cursor = 'move';
            let top = e.clientY - disY;
            if (top <= 0 || top >= el.parentNode.offsetHeight) {
              return
            }
            //移动当前元素
            dragDom.style.top = `${top}px`
          };

          document.onmouseup = (e) => {
            if (new Date().getTime() - time < 100) {
              binding.value.click()
            }
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