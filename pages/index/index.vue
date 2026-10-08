<template>
  <view class="container">
      <!-- 装饰渐变头保持普通文档流：不参与吸顶，避免吸顶锚点被它的高度变化带跑 -->
      <view class="bahar-gradient-header">
        <text style="font-size:36rpx;font-weight:600;">商城首页</text>
      </view>
      <empty v-if="!storeInfo" :isLoading="isLoading" tips="数据加载中..."></empty>
      <!-- 门店信息 + 搜索框作为一个整体吸顶固定 -->
      <view class="index-sticky-header" v-if="storeInfo">
        <Location inline :storeInfo="storeInfo"/>
        <Search inline tips="请输入搜索关键字..." @event="$navTo('pages/search/index')"/>
      </view>
      <block>
          <Banner v-if="storeInfo" flush :itemStyle="options.bannerStyle" :params="options.bannerParam" :dataList="banner"/>
      </block>
      <block v-if="storeInfo && navigation.length">
          <NavBar :itemStyle="options.navStyle" :params="{}" :dataList="navigation"/>
      </block>
      <block v-if="storeInfo && coupons.length">
          <view class="bahar-card index-coupon-card">
            <view class="index-section-title"><text class="txt">优惠专区</text></view>
            <Coupon :itemStyle="options.couponStyle" :dataList="coupons"/>
          </view>
      </block>
      <block>
          <Goods v-if="storeInfo" :itemStyle="options.goodsStyle" :isReflash="isReflash" ref="mescrollItem" :params="options.goodsParams"/>
      </block>
  </view>
</template>

<script>
  import { setCartTabBadge, showMessage } from '@/utils/app'
  import Location from '@/components/page/location'
  import Search from '@/components/search'
  import Banner from '@/components/page/banner'
  import NavBar from '@/components/page/navBar'
  import Coupon from '@/components/page/coupon'
  import Goods from '@/components/page/goods'
  import Empty from '@/components/empty'
  import * as settingApi from '@/api/setting'
  import * as Api from '@/api/page'
  import * as couponApi from '@/api/coupon'
  import MescrollCompMixin from "@/components/mescroll-uni/mixins/mescroll-comp.js";
  import config from '@/config'

  const App = getApp()

  export default {
    mixins: [MescrollCompMixin],
    components: {
       Location,
       Search,
       Banner,
       NavBar,
       Coupon,
       Goods,
       Empty
    },
    data() {
      return {
        options: {
            "goodsStyle": {
                "background": "#F6F6F6",
                "display": "list",
                // 单列左图右文（对齐竞品默认布局）
                "column": 1,
                "show": ["goodsName", "goodsPrice", "linePrice", "sellingPoint", "goodsSales"]
            },
            "goodsParams": {
                "source": "auto",
                "auto": {
                    "category": 0,
                    "goodsSort": "all",
                    "showNum": 40
                }
            },
            "bannerStyle": {
                "btnColor": "#ffffff",
                "btnShape": "round",
                "interval": 2.5,

            },
            "bannerParam": {
                "interval": 2000
            },
            "navStyle": {
                "background": "#ffffff",
                "rowsNum": "4",
            },
            "couponStyle": {
                "background": "transparent",
                "display": "list",
                "column": 1
            }
        },
        banner: [],
        navigation: [],
        coupons: [],
        storeInfo: null,
        isReflash: false,
        isLoading: false
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad({ storeId }) {
      storeId = storeId ? parseInt(storeId) : 0;
      if (storeId > 0) {
          uni.setStorageSync('storeId', storeId);
          uni.setStorageSync("reflashHomeData", true);
      } else {
          this.getPageData();
      }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      const app = this;
      showMessage();
      setCartTabBadge();
      app.onGetStoreInfo();
      uni.getLocation({
          type: 'gcj02',
          success(res){
              uni.setStorageSync('latitude', res.latitude);
              uni.setStorageSync('longitude', res.longitude);
              app.onGetStoreInfo();
          },
          fail(e) {
             // empty
          }
      })
    },

    methods: {

        /**
         * 加载页面数据
         * @param {Object} callback
         */
        getPageData(callback) {
          const app = this;
          Api.home()
            .then(result => {
                 app.banner = result.data.banner;
                 app.navigation = result.data.navigation;
                 uni.removeStorageSync("reflashHomeData");
                 app.isReflash = false;
            })
            .finally(() => callback && callback())
        },

        /**
         * 加载首页优惠券（领券中心前几条，拿不到就整块不显示）
         */
        getCouponList() {
          const app = this;
          const param = { sortType: 'all', sortPrice: 0, type: 'C', needPoint: '0', name: '', pageNumber: 1 }
          couponApi.list(param, { isPrompt: false, load: false })
            .then(result => {
                 const page = (result.data && result.data.coupon) ? result.data.coupon : {}
                 app.coupons = page.content || []
            })
            .catch(() => {
                 app.coupons = []
            })
        },

        /**
         * 下拉刷新
         */
        onPullDownRefresh() {
          // 获取数据
          this.getPageData(() => {
             uni.stopPullDownRefresh()
          })
        },

        /**
         * 获取默认店铺
         * */
         onGetStoreInfo() {
            const app = this;
            settingApi.systemConfig()
             .then(result => {
                 app.storeInfo = result.data.storeInfo;
                 if (app.storeInfo) {
                     uni.setStorageSync("storeId", app.storeInfo.id);
                     uni.setStorageSync("merchantNo", app.storeInfo.merchantNo);
                     // 判断是否需要更新页面
                     let isReflash = uni.getStorageSync("reflashHomeData");
                     app.isReflash = isReflash;
                     if (isReflash === true) {
                         app.getPageData();
                     }
                 }
                 app.getCouponList();
             })
         }
    },

    /**
     * 分享当前页面
     */
    onShareAppMessage() {
      const app = this
      return {
         title: config.name,
         path: "/pages/index/index?" + app.$getShareUrlParams()
      }
    },

    /**
     * 分享到朋友圈
     * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
     * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
     */
    onShareTimeline() {
      const app = this
      const { page } = app
      return {
        title: config.name,
        path: "/pages/index/index?" + app.$getShareUrlParams()
      }
    }

  }
</script>

<style lang="scss" scoped>
  /* 门店信息 + 搜索框整体吸顶。
     子组件内部默认 fixed（不占文档流，且未设 top 时按静态位置锚定，
     前置内容高度一变就跑位），所以首页把两者都切到 inline 模式，由本容器统一吸顶。
     top 用 --window-top 兼容 H5 自带的导航栏高度，小程序端该变量不存在时回退 0。 */
  .index-sticky-header {
    position: sticky;
    top: var(--window-top, 0);
    z-index: 100;
    /* 沿用品牌主色（与门店条同一渐变），避免吸顶后露出大白块 */
    background-image: linear-gradient(to bottom, $bahar-theme, $bahar-theme);
  }

  .index-section-title {
    font-size: 30rpx;
    font-weight: bold;
    padding: 20rpx 20rpx 12rpx;
    .txt {
      border-left: solid $bahar-theme 10rpx;
      padding-left: 10rpx;
    }
  }

  /* 优惠券区做成与四宫格/商品区一致的卡片 */
  .index-coupon-card {
    padding: 0 0 12rpx 0;
  }
</style>
