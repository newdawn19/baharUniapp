/**
 * 会员端全局配置（四行业可切换）
 *
 * 会员端是 HBuilderX 版 uni-app，没有 npm/webpack 构建链，无法像收银端那样用
 * `-m shop` 在编译期注入环境，因此改为**运行时解析**行业。
 *
 * 行业解析优先级：localStorage 中的用户选择 > URL query `?m=<行业>` > 默认 `shop`
 *
 * 重要：本文件被绝大多数页面间接 import（utils/request -> @/config），
 * 因此这里任何异常都会导致全站白屏。所有取值一律 try/catch 兜底，
 * 非法值静默回退默认行业，绝不向外抛错。
 */

/**
 * 行业配置表
 * 键名口径对齐收银端 baharCashier/env/：shop=通用零售、car=汽车美容、food=餐饮、health=康养美业
 * 后端端口：零售 8081 / 汽车美容 8082 / 餐饮 8083 / 康养美业 8084
 */
const INDUSTRIES = {
  shop: { key: 'shop', name: 'bahar零售会员系统', apiUrl: 'http://127.0.0.1:8081/' },
  car: { key: 'car', name: 'bahar汽车美容会员系统', apiUrl: 'http://127.0.0.1:8082/' },
  food: { key: 'food', name: 'bahar餐饮会员系统', apiUrl: 'http://127.0.0.1:8083/' },
  health: { key: 'health', name: 'bahar康养美业会员系统', apiUrl: 'http://127.0.0.1:8084/' }
}

/** 默认行业 */
const DEFAULT_INDUSTRY = 'shop'

/**
 * 默认商户号
 * 四个行业的演示商户号都是 10001（已直连 bahar-db / bahar-car / bahar-catering /
 * bahar-health 的 mt_merchant 核实），所以商户号四行业一致，无需按行业切换。
 */
const MERCHANT_NO = '10001'

/** 用户手动选择的行业（缓存 key） */
const INDUSTRY_KEY = 'industry'
/** 上一次实际生效的行业（缓存 key，用于判断是否需要清登录态） */
const LAST_INDUSTRY_KEY = 'lastIndustry'

/**
 * 登录态缓存 key
 * 与 store/mutation-types.js 保持一致：ACCESS_TOKEN='AccessToken'、USER_ID='userId'
 * 注意：utils/storage.js 会为每个 key 额外写一个 '<key>_expiry'（postfix = '_expiry'），
 * 清理时必须一起删掉，否则过期时间戳残留。
 */
const LOGIN_KEYS = ['AccessToken', 'userId']
const STORAGE_POSTFIX = '_expiry'

/**
 * 读取缓存，任何异常都返回空串
 * @param {String} key
 * @return {String}
 */
function getStorage(key) {
  try {
    // uni.getStorageSync 在 H5 与小程序端均可用
    const value = uni.getStorageSync(key)
    return value === null || value === undefined ? '' : value
  } catch (e) {
    return ''
  }
}

/**
 * 写入缓存，静默失败
 * @param {String} key
 * @param {String} value
 */
function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {}
}

/**
 * 删除缓存，静默失败
 * @param {String} key
 */
function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
  } catch (e) {}
}

/**
 * 从 URL query 读取行业参数 ?m=<行业>
 * H5 是 hash 路由，?m= 出现在 # 之前，所以读 window.location.search。
 * 小程序端没有 window，必须用条件编译包住，否则会报错。
 * @return {String}
 */
function getQueryIndustry() {
  let industry = ''
  // #ifdef H5
  try {
    const search = window.location.search || ''
    const matched = /(?:^|[?&])m=([^&#]*)/.exec(search)
    if (matched) {
      industry = decodeURIComponent(matched[1] || '').trim()
    }
  } catch (e) {
    industry = ''
  }
  // #endif
  return industry
}

/**
 * 校验并归一化行业键名，非法值返回空串
 * @param {String} value
 * @return {String}
 */
function normalizeIndustry(value) {
  try {
    if (!value) return ''
    const key = String(value).trim().toLowerCase()
    return Object.prototype.hasOwnProperty.call(INDUSTRIES, key) ? key : ''
  } catch (e) {
    return ''
  }
}

/**
 * 清理本地登录态
 * 四个行业是不同后端 + 不同数据库 + 不同 Redis db，token 完全不通用，
 * 切换行业时必须清掉，否则登录态错乱。
 * 只清存储即可：core/bootstrap.js 会在启动时重新从 storage 回填 store，
 * 清掉后自然变成未登录。
 */
function clearLoginState() {
  try {
    for (let i = 0; i < LOGIN_KEYS.length; i++) {
      const key = LOGIN_KEYS[i]
      removeStorage(key)
      removeStorage(key + STORAGE_POSTFIX)
    }
  } catch (e) {}
}

/**
 * 解析当前行业：localStorage 用户选择 > URL query ?m= > 默认
 * 并在行业发生变化时清理登录态
 * @return {String}
 */
function resolveIndustry() {
  try {
    const fromStorage = normalizeIndustry(getStorage(INDUSTRY_KEY))
    const fromQuery = normalizeIndustry(getQueryIndustry())
    const industry = fromStorage || fromQuery || DEFAULT_INDUSTRY

    // URL 带了合法行业参数，视为用户选择，落缓存（下次进入不再依赖 URL）
    if (fromQuery && fromQuery !== fromStorage) {
      setStorage(INDUSTRY_KEY, fromQuery)
    }

    // 与上次生效的行业不一致 => 清登录态
    const lastIndustry = normalizeIndustry(getStorage(LAST_INDUSTRY_KEY))
    if (lastIndustry && lastIndustry !== industry) {
      clearLoginState()
    }
    if (lastIndustry !== industry) {
      setStorage(LAST_INDUSTRY_KEY, industry)
    }

    return industry
  } catch (e) {
    return DEFAULT_INDUSTRY
  }
}

const industry = resolveIndustry()
const current = INDUSTRIES[industry] || INDUSTRIES[DEFAULT_INDUSTRY]

module.exports = {
  // 当前行业标识：shop / car / food / health
  industry: industry,
  // 系统名称
  name: current.name,
  // 必填: 后端api地址, 斜杠/结尾
  // 演示环境指向本地后端；公网部署时改为 https://<域名>/<行业>/
  apiUrl: current.apiUrl,
  // 必填: 默认商户号，从后台商户列表获取
  merchantNo: MERCHANT_NO,
  // 四行业配置表，供切换行业的 UI 使用
  industries: INDUSTRIES,
  /**
   * 切换行业（供切换 UI 调用）
   * 写入用户选择、清理旧行业登录态。注意：apiUrl 是在本文件加载时解析的，
   * 调用后需要重新加载页面才会生效。
   * @param {String} value shop / car / food / health
   * @return {Boolean} 是否为合法行业
   */
  setIndustry: function (value) {
    const key = normalizeIndustry(value)
    if (!key) return false
    if (key !== industry) {
      clearLoginState()
    }
    setStorage(INDUSTRY_KEY, key)
    setStorage(LAST_INDUSTRY_KEY, key)
    return true
  }
}
