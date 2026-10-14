import Enum from '../enum'

/**
 * 枚举类：订单状态
 * OrderStatusEnum
 */
export default new Enum([
  { key: 'CREATED', name: '待支付', nameEn: 'Pending Payment', value: 'A' },
  { key: 'PAID', name: '已支付', nameEn: 'Paid', value: 'B' },
  { key: 'CANCEL', name: '已取消', nameEn: 'Cancelled', value: 'C' },
  { key: 'DELIVERY', name: '待发货', nameEn: 'To Ship', value: 'D' },
  { key: 'DELIVERED', name: '已发货', nameEn: 'Shipped', value: 'E' },
  { key: 'RECEIVED', name: '已收货', nameEn: 'Received', value: 'F' },
  { key: 'DELETED', name: '已删除', nameEn: 'Deleted', value: 'G' },
  { key: 'REFUND', name: '已退款', nameEn: 'Refunded', value: 'H' },
  { key: 'COMPLETE', name: '已完成', nameEn: 'Completed', value: 'I' },
])
