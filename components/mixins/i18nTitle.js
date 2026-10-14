// 页面标题动态切换 mixin。
// 通过 getCurrentPages 取得当前路由，查表得到中文标题，再经 I18n.t 翻译。
// 在 main.js 中以 Vue.mixin 全局注册，覆盖全部已注册页面（含分包）。
// 若某页面 data 中声明了 navTitle，则以 navTitle 为准。
import { I18n } from '@/common/i18n'

// 路由(全路径) -> 中文标题，与 pages.json 的 navigationBarTitleText 保持一致
const PAGE_TITLES = {
  'pages/index/index': '首页',
  'pages/category/index': '微店',
  'pages/cart/index': '购物车',
  'pages/user/index': '会员中心',
  'pages/user/setting': '个人信息',
  'pages/user/code': '我的会员码',
  'pages/user/card': '领取会员卡',
  'pages/user/password': '我的密码',
  'pages/user/mobile': '修改手机号',
  'pages/custom/index': '',
  'pages/search/index': '商品搜索',
  'pages/location/index': '切换店铺',
  'pages/login/index': '会员登录',
  'pages/login/auth': '授权登录',
  'pages/help/index': '帮助中心',
  'pages/confirm/doConfirm': '核销确认',
  'pages/confirm/result': '核销结果',
  'pages/goods/list': '商品列表',
  'pages/goods/detail': '商品详情',
  'pages/my-coupon/index': '我的卡券',
  'pages/address/index': '收货地址',
  'pages/address/create': '新增收货地址',
  'pages/address/update': '编辑收货地址',
  'pages/points/detail': '积分明细',
  'pages/points/gift': '积分转赠',
  'pages/give/index': '转赠记录',
  'pages/wallet/index': '我的余额',
  'pages/wallet/recharge/index': '我要充值',
  'pages/wallet/recharge/order': '充值记录',
  'pages/wallet/balance/log': '账单详情',
  'pages/settlement/index': '结算中心',
  'pages/settlement/goods': '订单确认',
  'pages/order/index': '我的订单',
  'pages/order/detail': '订单详情',
  'pages/order/result': '支付结果',
  'pages/refund/index': '退换/售后',
  'pages/refund/detail': '售后详情',
  'pages/refund/apply': '申请售后',
  'pages/pay/index': '买单支付',
  'pages/pay/result': '支付结果',
  'pages/pay/cashier': '扫码收款',
  'pages/article/index': '文章列表',
  'pages/article/detail': '文章详情',
  'pages/share/index': '邀请有礼',
  'subPages/book/index': '预约项目',
  'subPages/book/detail': '预约详情',
  'subPages/book/submit': '预约提交',
  'subPages/book/my': '我的预约',
  'subPages/book/bookDetail': '预约详情',
  'subPages/coupon/list': '领券中心',
  'subPages/coupon/detail': '优惠券详情',
  'subPages/coupon/receive': '卡券兑换',
  'subPages/timer/detail': '计次卡详情',
  'subPages/prestore/buy': '购买储值卡',
  'subPages/prestore/detail': '储值卡详情',
  'subPages/commission/statistics': '佣金统计',
  'subPages/commission/invite': '邀请明细',
  'subPages/commission/orders': '佣金订单',
  'merchantPages/index': '商家管理',
  'merchantPages/setting': '商家设置',
  'merchantPages/member/index': '会员列表',
  'merchantPages/member/detail': '会员详情',
  'merchantPages/member/add': '会员登记',
  'merchantPages/member/setting': '会员编辑',
  'merchantPages/order/index': '订单列表',
  'merchantPages/refund/index': '售后订单',
  'merchantPages/refund/update': '售后更新',
  'merchantPages/balance/recharge': '会员充值',
  'merchantPages/coupon/list': '卡券管理',
  'merchantPages/coupon/receive': '卡券发放',
  'merchantPages/coupon/edit': '卡券编辑',
  'merchantPages/book/index': '预约管理',
  'merchantPages/order/confirm': '核销订单',
  'merchantPages/staff/index': '员工管理',
  'merchantPages/staff/add': '新增员工',
  'merchantPages/staff/edit': '编辑员工',
  'merchantPages/data/index': '数据统计',
  'merchantPages/goods/list': '商品管理',
  'merchantPages/goods/add': '商品编辑',
  'merchantPages/cate/list': '商品分类',
  'merchantPages/stock/index': '库存盘点',
  'merchantPages/stock/add': '发起盘点',
  'merchantPages/stock/detail': '盘点详情'
}

export default {
  onShow() {
    const title = (this.navTitle !== undefined && this.navTitle !== null && this.navTitle !== '')
      ? this.navTitle
      : PAGE_TITLES[this._i18nRoute()]
    if (title) {
      // 延迟一帧，避免与页面自身 onShow 竞争
      uni.setNavigationBarTitle({ title: I18n.t(title) })
    }
  },
  methods: {
    _i18nRoute() {
      try {
        const pages = getCurrentPages()
        const cur = pages[pages.length - 1]
        return cur && cur.route
      } catch (e) {
        return ''
      }
    }
  }
}
