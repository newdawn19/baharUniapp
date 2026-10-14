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
import './core/ican-H5Api'

Vue.config.productionTip = false

// i18n 国际化插件（兼容 Vue.prototype.$t）
Vue.use(I18nPlugin)

// 全局页面标题动态切换（运行时覆盖 navigationBarTitleText）
import i18nTitle from '@/components/mixins/i18nTitle'
Vue.mixin(i18nTitle)

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
