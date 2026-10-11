<template>
  <view class="container">
      <!-- 装饰头已移除：它叠在吸顶区之上占掉首屏 175px（约 26%），竞品没有这块。
           样式类 .bahar-gradient-header 保留在 App.vue，其它页面照用。 -->
      <empty v-if="!storeInfo" :isLoading="isLoading" tips="数据加载中..."></empty>
      <!-- 门店信息 + 搜索框作为一个整体吸顶固定 -->
      <view class="index-sticky-header" v-if="storeInfo">
        <Location inline :storeInfo="storeInfo"/>
        <Search inline tips="请输入搜索关键字..." @event="$navTo('pages/search/index')"/>
      </view>
      <block>
          <Banner v-if="storeInfo" flush :itemStyle="options.bannerStyle" :params="options.bannerParam" :dataList="banner"/>
      </block>
      <!-- 四宫格功能入口 -->
      <block v-if="storeInfo && navigation.length">
          <NavBar :itemStyle="options.navStyle" :params="{}" :dataList="navigation"/>
      </block>
      <!-- 通栏广告图 -->
      <block v-if="storeInfo && ads.length">
          <view class="bahar-card index-ad-card">
              <Images :itemStyle="options.adStyle" :dataList="ads"/>
          </view>
      </block>
      <!-- 优惠券领取区 -->
      <block v-if="storeInfo && coupons.length">
          <view class="bahar-card index-coupon-card">
            <view class="index-section-title"><text class="txt">优惠专区</text></view>
            <Coupon :itemStyle="options.couponStyle" :dataList="coupons"/>
          </view>
      </block>
      <!-- 热门商品（双列） -->
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
  import Images from '@/components/page/image'
  import Coupon from '@/components/page/coupon'
  import Goods from '@/components/page/goods'
  import Empty from '@/components/empty'
  import * as settingApi from '@/api/setting'
  import * as Api from '@/api/page'
  import * as couponApi from '@/api/coupon'
  import MescrollCompMixin from "@/components/mescroll-uni/mixins/mescroll-comp.js";
  import config from '@/config'

  const App = getApp()

  /**
   * 判断一条轮播数据是不是「通栏广告图」。
   * 后端没有给三个行业单独开放 ads 字段，约定：图片落在 uploadFiles/ads/ 目录下的
   * 就是通栏广告图（种子数据 deploy/db/19-home-diy-seed.sql 里的 ID=201）。
   * 餐饮后端本来就按 position=m_home_ads 单独返回 ads，两种写法都兼容。
   * @param {Object} item 轮播/广告数据
   */
  const isAdItem = (item) => {
    if (!item) {
      return false
    }
    const image = item.image ? String(item.image) : ''
    return image.indexOf('/uploadFiles/ads/') >= 0 || item.position === 'm_home_ads'
  }

  export default {
    mixins: [MescrollCompMixin],
    components: {
       Location,
       Search,
       Banner,
       NavBar,
       Images,
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
                // 双列网格（对齐竞品当前首页的商品区形态）
                "column": 2,
                "show": ["goodsName", "goodsPrice", "linePrice", "goodsSales"]
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
            "adStyle": {
                "background": "transparent",
                "paddingTop": 0,
                "paddingLeft": 0
            },
            "couponStyle": {
                "background": "transparent"
            }
        },
        banner: [],
        ads: [],
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
                 const data = result.data ? result.data : {};
                 const bannerList = data.banner ? data.banner : [];
                 // 轮播里剔除通栏广告图，避免同一张图出现两遍
                 app.banner = bannerList.filter(item => !isAdItem(item));
                 // 通栏广告图：餐饮端后端直出 ads；其余三端按图片目录约定从 banner 里拆
                 const adSource = (data.ads && data.ads.length) ? data.ads : bannerList.filter(isAdItem);
                 app.ads = adSource.map(item => ({ imgUrl: item.image, link: item.url, title: item.title }));
                 app.navigation = data.navigation ? data.navigation : [];
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
                 const list = page.content ? page.content : []
                 // 面额为 0 的券在上面显示不出「¥金额」，首页只挑有面额的，按面额从大到小
                 app.coupons = list
                     .filter(item => Number(item.amount) > 0)
                     .sort((a, b) => Number(b.amount) - Number(a.amount))
                     .slice(0, 6)
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

  /* 通栏广告图：卡片不留内边距，图片自己撑满 */
  .index-ad-card {
    padding: 0;
    overflow: hidden;
  }
</style>
