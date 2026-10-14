import Enum from '../enum'

/**
 * 枚举类：卡券类型
 * CouponTypeEnum
 */
export default new Enum([
  { key: 'C', name: '优惠券', nameEn: 'Coupon', value: 1000 },
  { key: 'P', name: '储值卡', nameEn: 'Stored-value Card', value: 2000 },
  { key: 'T', name: '计次卡', nameEn: 'Prepaid Card', value: 3000 }
])
