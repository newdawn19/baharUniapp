import Enum from '../enum'

/**
 * 枚举类：订单支付方式
 * PayTypeEnum
 */
export default new Enum([
  { key: 'BALANCE', name: '余额支付', nameEn: 'Balance', value: 'BALANCE' },
  { key: 'WECHAT', name: '微信支付', nameEn: 'WeChat Pay', value: 'JSAPI' },
  { key: 'WECHAT_H5', name: '微信H5支付', nameEn: 'WeChat H5 Pay', value: 'WECHAT_H5' },
  { key: 'CASH', name: '现金支付', nameEn: 'Cash', value: 'CASH' },
  { key: 'STORE', name: '前台支付', nameEn: 'Counter', value: 'STORE' },
  { key: 'MICROPAY', name: '微信扫码支付', nameEn: 'WeChat Scan', value: 'MICROPAY' },
  { key: 'ALISCAN', name: '支付宝支付', nameEn: 'Alipay', value: 'ALISCAN' },
])
