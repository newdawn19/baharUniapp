import Vue from 'vue'
import App from './App'
import store from './store'
import uView from 'uview-ui'
import bootstrap from './core/bootstrap'
import I18nPlugin from '@/common/i18n'
import {
  getPlatform,
  navTo,
  showToast,
  showSuccess,
  showError,
  getShareUrlParams
} from './utils/app'
import { formatMoney } from '@/utils/money'
import './core/ican-H5Api'

Vue.config.productionTip = false

// i18n 国际化插件（兼容 Vue.prototype.$t）
Vue.use(I18nPlugin)

// 全局页面标题动态切换（运行时覆盖 navigationBarTitleText）
import i18nTitle from '@/components/mixins/i18nTitle'
Vue.mixin(i18nTitle)

// 全局金额格式化：h5-i18n 改造时 7 个页面模板用了 {{ formatMoney(...) }}，
// 但 import 进来的函数在 Vue 2 模板里默认不可见（也不在 this 上）。
// 用 mixin 注册到所有组件的 methods，模板直接可用并消除
// "Property or method formatMoney is not defined" 警告（与 vue-i18n 注册 $t 同理）。
Vue.mixin({ methods: { formatMoney } })

App.mpType = 'app'

// 当前运行的终端
Vue.prototype.$platform = getPlatform()

// 载入uView库
Vue.use(uView)

// 挂载全局函数
Vue.prototype.$toast = showToast
Vue.prototype.$success = showSuccess
Vue.prototype.$error = showError
Vue.prototype.$navTo = navTo
Vue.prototype.$getShareUrlParams = getShareUrlParams

// 实例化应用
const app = new Vue({
  ...App,
  store,
  created: bootstrap
})
app.$mount()
