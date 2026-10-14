import store from '@/store'
import storage from '@/utils/storage'
import { getPlatform } from '@/utils/app'
import { ACCESS_TOKEN, USER_ID, LOCALE } from '@/store/mutation-types'
import { I18n } from '@/common/i18n'

export default function Initializer() {
  // 当前运行的终端
  store.commit('SET_PLATFORM', getPlatform())
  // 用户认证token
  store.commit('SET_TOKEN', storage.get(ACCESS_TOKEN))
  // 当前用户ID
  store.commit('SET_USER_ID', storage.get(USER_ID))
  // 语言：从本地缓存读取（默认中文，未设置时兜底取系统语言）
  let locale = storage.get(LOCALE)
  if (!locale) {
    try {
      const sysLang = uni.getSystemInfoSync().language || ''
      locale = sysLang.toLowerCase().indexOf('zh') > -1 ? 'zh-CN' : 'en-US'
    } catch (e) {
      locale = 'zh-CN'
    }
  }
  I18n.setLocale(locale)
  store.commit('SET_LOCALE', locale)
}
