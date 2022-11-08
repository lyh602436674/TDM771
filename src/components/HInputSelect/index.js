import './index.less'

export default {
  name: "HInputSelect",
  data() {
    return {
      localValue: ""
    }
  },
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.localValue = val
      },
    },
  },
  methods: {
    renderInput(h) {
      return h('h-input', {
        ref: "hInputSelect",
        class: {
          'h-input-select': true
        },
        attrs: {
          value: this.localValue
        },
        props: {
          disabled: this.disabled,
        },
        on: {
          click: (e) => this.handleClick(e),
          blur: (e) => {
            this.$emit('blur', e)
            setTimeout(() => {
              this.$refs.hInputSelectOption.style.display = 'none'
            }, 100)
          },
          change: (e) => {
            this.$emit('change', e)
          }
        }
      }, [])
    },
    handleClick(e) {
      this.$refs.hInputSelectOption.style.display = 'block'
      this.$emit('click', e)
    },
    optionItemClick(e, item) {
      this.$emit('optionChange', item)
    },
    renderSelectOptionItem(h) {
      return this.options.map(item => {
        return (
          <div class={'h-input-select-option-item'}>{item.title}</div>
        )
      })
    },
    renderSelectOption(h) {
      return h('div', {
        ref: "hInputSelectOption",
        class: {
          'h-input-select-option': true
        },
        on: {
          click: (e) => {
            console.log(e, 'eeee')
            e.stopPropagation()
            this.optionItemClick(e, e.target.innerText)
          }
        }
      }, [
        this.renderSelectOptionItem(h)
      ])
    },
  },
  render(h) {
    return h('div', {
      class: {
        'h-input-select-wrapper': true
      }
    }, [
      this.renderInput(h),
      this.renderSelectOption(h)
    ])
  }
}