import {
  PLATFORM,
  LOCALE
} from '@/store/mutation-types'
import storage from '@/utils/storage'


const app = {
  state: {
    // 当前终端平台
    platform: '',
    // 当前语言
    locale: 'zh-CN'
  },

  mutations: {
    SET_PLATFORM: (state, value) => {
      state.platform = value
    },
    SET_LOCALE: (state, value) => {
      state.locale = value
    }
  },

  actions: {

  }
}

export default app
