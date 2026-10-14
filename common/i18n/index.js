// 轻量自包含 i18n 内核（兼容 vue-i18n 的 Vue.use + Vue.prototype.$t 用法）。
// 设计：中文原文当 key，出口收口，miss 兜底（未翻译文案原样显示中文，不空白）。
import zhCN from './zh-CN'
import enUS from './en-US'

// 单例
export const I18n = {
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },

  // 切换语言（非法 locale 忽略）
  setLocale(locale) {
    if (this.messages[locale]) {
      this.locale = locale
    }
    return this.locale
  },

  // 当前语言
  current() {
    return this.locale
  },

  // 取文案：zh-CN 直接返回原文；其他语言命中即翻，未命中兜底返回 key 原文
  t(key, params) {
    if (key === null || key === undefined || key === '') return key
    if (this.locale === 'zh-CN') return key
    const dict = this.messages[this.locale] || {}
    let value = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key
    // 支持 {0}/{1} 简单替换（MessageFormat 风格）
    if (params != null) {
      const arr = Array.isArray(params) ? params : [params]
      arr.forEach((p, i) => {
        if (p !== null && p !== undefined) {
          value = value.replace(new RegExp('\\{' + i + '\\}', 'g'), String(p))
        }
      })
    }
    return value
  }
}

// Vue 插件
const install = (Vue) => {
  if (!Vue) return
  Vue.prototype.$t = (key, params) => I18n.t(key, params)
  Vue.prototype.$i18n = I18n
}

export default { install }
