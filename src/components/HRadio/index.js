export default {
  props: {
    size: {
      type: String,
      default: 'default',
      required: false,
    },
    radioType: {
      type: String,
      default: 'radioText', // radioButton | radioText
      required: false,
    },
    value: [String, Number],
    options: {
      type: Array,
      default: [],
    },
    defaultValue: {
      type: [String, Number]
    },
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  watch: {
    size(val) {
      if (!val || !val.length) {
        this.size = 'default'
      } else {
        this.size = val
      }
    },
    value: {
      immediate: true,
      handler(val) {
        this.valueRadio = val
      },
    },
    defaultValue: {
      immediate: true,
      handler(val) {
        // this.valueRadio = val
        // this.$emit('change', this.valueRadio)
      },
    },
    radioType: {
      immediate: true,
      handler(val) {
        this.radioType = val
      },
    },
    options: {
      immediate: true,
      handler(val) {
        this.options = val
      },
    },
  },
  data() {
    return {
      valueRadio: undefined,
    }
  },
  methods: {
    onChangeHandle(e) {
      let val = e.target.value
      let valItem = this.options.filter(function (item) {
        return item.value == val
      })
      this.valueRadio = val
      this.$emit('change', this.valueRadio, valItem)
    },
    renderComponent(h, com) {
      return this.options.map(item => {
        return h(com, {
          props: {
            value: item.value,
            dataTitle: item.title,
            key: item.key,
          }
        }, [item.title])
      })
    },
    renderRadio(h) {
      return this.renderComponent(h, 'a-radio')
    },
    renderRadioButton(h) {
      return this.renderComponent(h, 'a-radio-button')
    },
  },
  render(h) {
    return h('a-radio-group', {
      props: {
        disabled: this.disabled,
        value: this.valueRadio,
        defaultValue: this.defaultValue,
      },
      on: {
        change: this.onChangeHandle,
      }
    }, [
      this.radioType === 'radioText' ? this.renderRadio(h) : this.renderRadioButton(h)
    ])
  },
}