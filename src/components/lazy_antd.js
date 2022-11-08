/**
 * 按需加载antd组件
 */
import Vue from 'vue'
import { isString, isObject, isFunction } from 'lodash'

// base library
import {
    Anchor,
    Calendar,
    ConfigProvider,
    Collapse,
    Layout,
    Input,
    InputNumber,
    Button,
    Switch,
    Radio,
    Checkbox,
    Select,
    Card,
    Form,
    Row,
    Col,
    Modal,
    Table,
    Tabs,
    Icon,
    Badge,
    Popover,
    Dropdown,
    List,
    Avatar,
    Breadcrumb,
    Steps,
    Spin,
    Menu,
    Drawer,
    Tooltip,
    Alert,
    Tag,
    Divider,
    DatePicker,
    TimePicker,
    Upload,
    Progress,
    Skeleton,
    Popconfirm,
    PageHeader,
    Result,
    Statistic,
    Descriptions,
    message,
    notification,
    Empty,
    Tree,
    TreeSelect,
    Carousel,
    Pagination,
    FormModel,
    Cascader,
    Slider,
    Transfer,
    Rate,
    Space,
    version,
    Timeline
} from 'ant-design-vue'
// 图片预览
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
Vue.use(Viewer)
Viewer.setDefaults({
    Options: {
        'inline': true,
        'button': true,
        'navbar': true,
        'title': true,
        'toolbar': true,
        'tooltip': true,
        'movable': true,
        'zoomable': true,
        'rotatable': true,
        'scalable': true,
        'transition': true,
        'fullscreen': true,
        'keyboard': true,
        'url': 'data-source'
    }
})

// 全局设置Modal的样式
Modal.props['dialog-style'] = {
    type: Object,
    default: () => {
        return {
            top: '20px'
        }
    }
}

Vue.use(Anchor)
Vue.use(Calendar)
Vue.use(ConfigProvider)
Vue.use(Collapse)
Vue.use(Layout)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Button)
Vue.use(Switch)
Vue.use(Radio)
Vue.use(Checkbox)
Vue.use(Select)
Vue.use(Card)
Vue.use(Form)
Vue.use(Row)
Vue.use(Col)
Vue.use(Modal)
Vue.use(Table)
Vue.use(Tabs)
Vue.use(Icon)
Vue.use(Badge)
Vue.use(Popover)
Vue.use(Dropdown)
Vue.use(List)
Vue.use(Avatar)
Vue.use(Breadcrumb)
Vue.use(Steps)
Vue.use(Spin)
Vue.use(Menu)
Vue.use(Drawer)
Vue.use(Tooltip)
Vue.use(Alert)
Vue.use(Tag)
Vue.use(Divider)
Vue.use(DatePicker)
Vue.use(TimePicker)
Vue.use(Upload)
Vue.use(Progress)
Vue.use(Skeleton)
Vue.use(Popconfirm)
Vue.use(PageHeader)
Vue.use(Result)
Vue.use(Statistic)
Vue.use(Descriptions)
Vue.use(Empty)
Vue.use(Tree)
Vue.use(TreeSelect)
Vue.use(Carousel)
Vue.use(Pagination)
Vue.use(FormModel)
Vue.use(Cascader)
Vue.use(Slider)
Vue.use(Transfer)
Vue.use(Rate)
Vue.use(Space)
Vue.use(Timeline)
Vue.prototype.$confirm = (config) => {
    let customConfig = {
        cancelButtonProps: {
            props: {
                type: 'danger',
                ghost: true,
            },
        },
        ...config
    }
    return Modal.confirm(customConfig)
}
Vue.prototype.$message = message
Vue.prototype.$notification = notification
Vue.prototype.$info = Modal.info
Vue.prototype.$success = Modal.success
Vue.prototype.$error = Modal.error
Vue.prototype.$warning = Modal.warning
// 自定义指令
import { drag, resize } from "./directive"
Vue.use(drag)
Vue.use(resize)

// 自定义组件
import { RLLayout } from '@/components/layouts'
import HIcon from './HIcon/icon.js'
import HTag from './StatusTag/StatusTag'
import HDescriptions from "./HDetail/HDescriptions.js"
import HDetail from './HDetail/HDetail'
import HInput from "./HInput"
import HSelect from './HSelect'
import HRangePicker from './HDate/HRangePicker'
import HDate from './HDate/HDate'
import HTimeSelect from './HTimeSelect'
import HCard from './HCard'
import HTable from './table'
import HModal from './HModal'
import HUpload from './HUpload'
import HDrawer from './HDrawer'
import HVexTable from './HVexTable'
import HRadio from './HRadio'
import HSwitch from './HSwitch'
import HTabs from './HTabs/HTabs'
import HEllipsis from './HEllipsis/HEllipsis'
import HFileImport from './HFileImport'
import HCollapse from './HCollapse'
import HEditor from './HEditor'
import HEditTable from './HEditTable'
import { HUploadImg, HUploadFile } from './HUpload'
// 自定义组合组件
import HSearch from './HSearch'
import HFormModal from './HFormModal'
import HForm from './HFormModal/form'
import HDesc from './HDesc'
import HDescItem from './HDesc/indexItem'

Vue.component('HTable', HTable)
Vue.component("HIcon", HIcon)
Vue.component("HTag", HTag)
Vue.component("HDescriptions", HDescriptions)
Vue.component("HDetail", HDetail)
Vue.component("HInput", HInput)
Vue.component("HSelect", HSelect)
Vue.component("HCard", HCard)
Vue.component("HRangePicker", HRangePicker)
Vue.component('HDate', HDate)
Vue.component('HTimeSelect', HTimeSelect)
Vue.component('HModal', HModal)
Vue.component('HUpload', HUpload)
Vue.component('HSearch', HSearch)
Vue.component('RLLayout', RLLayout)
Vue.component("HFormModal", HFormModal)
Vue.component("HForm", HForm)
Vue.component("HDesc", HDesc)
Vue.component("HDescItem", HDescItem)
Vue.component("HDrawer", HDrawer)
Vue.component("HVexTable", HVexTable)
Vue.component("HRadio", HRadio)
Vue.component("HSwitch", HSwitch)
Vue.component("HVexTable", HVexTable)
Vue.component("HRadio", HRadio)
Vue.component("HTabs", HTabs)
Vue.component('HEllipsis', HEllipsis)
Vue.component('HFileImport', HFileImport)
Vue.component('HCollapse', HCollapse)
Vue.component('HEditor', HEditor)
Vue.component('HEditTable', HEditTable)
Vue.component('HUploadImg', HUploadImg)
Vue.component('HUploadFile', HUploadFile)


// 自定义业务组件
import HDepartSelect from './HiFar/HDepartSelect'
import HDictSelect from './HDictSelect/HDictSelect'
import HFileSecretLevelSelect from './HDictSelect/HFileSecretLevelSelect'
import HPageViewModal from './HPageViewModal'
Vue.component("HDepartSelect", HDepartSelect)
Vue.component("HFileSecretLevelSelect", HFileSecretLevelSelect)
Vue.component("HDictSelect", HDictSelect)
Vue.component("HPageViewModal", HPageViewModal)


// 其他插件
import 'xe-utils'
import VxeTable from 'vxe-table'
import 'vxe-table/lib/index.css'
VxeTable.renderer.add('edit', {
    autoselect: true,
    renderEdit(h, renderOpts, argums) {
        let { renderEdit } = renderOpts
        if (isFunction(renderEdit)) {
            return [renderEdit(h, renderOpts, argums)]
        }
    },
    // 可编辑显示模板
    renderCell(h, renderOpts, argums) {
        let { renderCell } = renderOpts
        if (isFunction(renderCell)) {
            return [renderCell(h, renderOpts, argums)]
        }
    }
})
VxeTable.renderer.add('cell', {
    renderDefault(h, renderOpts, argums) {
        let { renderCell } = renderOpts
        if (isFunction(renderCell)) {
            return [renderCell(h, renderOpts, argums)]
        }
    }
})
Vue.use(VxeTable)


const printANSI = () => {
    // console.clear()
    console.log('[coponents lazy-load] created()', version)
    // ASCII - ANSI Shadow
    let text = `
  ██╗  ██╗ ████████╗ ██╗  ██╗ ██████╗
  ██║  ██║ ╚══██╔══╝ ██║  ██║ ██╔═══╝
  ███████║    ██║    ███████║ ██████╗
  ██╔══██║    ██║    ██╔══██║ ██╔═══╝
  ██║  ██║    ██║    ██║  ██║ ██║
  ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝ 
  `
    console.log(`%c${text}`, 'color: #fc4d50')
    console.log('%c感谢使用 华天海峰开发平台!', 'font-size: 14px;font-family: Hiragino Sans GB,Microsoft YaHei,\\\\5FAE\\8F6F\\96C5\\9ED1,Droid Sans Fallback,Source Sans,Wenquanyi Micro Hei,WenQuanYi Micro Hei Mono,WenQuanYi Zen Hei,Apple LiGothic Medium,SimHei,ST Heiti,WenQuanYi Zen Hei Sharp,sans-serif;')
}

process.env.NODE_ENV !== 'production' && printANSI()