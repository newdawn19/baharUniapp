// 金额格式化：根据当前语言返回带符号的金额字符串。
// 中文：￥ + 两位小数；英文：CNY + 两位小数。
import { I18n } from '@/common/i18n'

export const formatMoney = (value, withSymbol = true) => {
  const num = Number(value)
  const v = isNaN(num) ? 0 : num
  const fixed = v.toFixed(2)
  if (!withSymbol) return fixed
  if (I18n.current() === 'en-US') {
    return 'CNY ' + fixed
  }
  return '￥' + fixed
}
