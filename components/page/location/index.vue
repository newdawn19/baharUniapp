<template>
  <!-- 定位店铺 -->
  <view class="main-loc" :class="{ 'main-loc--inline': inline }">
      <view v-if="storeInfo.name" class="diy-location">
        <view class="inner" @click="onTargetLocation">
          <view class="location-input">
            <image v-if="storeInfo.logo" class="store-logo" :src="storeInfo.logo" mode="aspectFill"></image>
            <text class="store">
               <text class="name">{{ storeInfo.name }}</text>
               <text class="switch" v-if="storeInfo.single == 'N'">[切换店铺]</text>
               <text class="address"><text class="location-icon iconfont icon-dingwei"></text>{{ storeInfo.address }}</text>
            </text>
          </view>
        </view>
      </view>
  </view>
</template>

<script>
  export default {

    /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
    props: {
      itemStyle: Object,
      storeInfo: Object,
      /**
       * 是否由外层容器负责定位。
       * 默认 false：门店条自己 fixed 悬浮（不占文档流）；
       * 传 true：回到普通文档流，与搜索框一起由外层吸顶容器统一吸顶。
       */
      inline: {
        type: Boolean,
        default: false
      }
    },

    /**
     * 组件的方法列表
     * 更新属性和数据的方法与更新数据的方法类似
     */
    methods: {
      /**
       * 跳转到定位页面页面
       */
      onTargetLocation() {
        this.$navTo('pages/location/index')
      }
    }

  }
</script>

<style lang="scss" scoped>
.main-loc {
  height: 90rpx;
  /* #ifdef H5 */
  height: 100rpx;
  /* #endif */
  color: #ffffff;
  .diy-location {
    background: linear-gradient(to bottom, $bahar-theme, $bahar-theme);
    padding: 3rpx 20rpx 16rpx 20rpx;
    position: fixed;
    z-index: 99999;
    width: 100%;
  }

  .inner {
    height: 82rpx;
    overflow: hidden;
    &.radius {
      border-radius: 10rpx;
    }
    &.round {
      border-radius: 60rpx;
    }
  }

  .location-input {
    color: #484848;
    padding-left: 10rpx;
    display: flex;
    align-items: center;
  }

  /* 门店LOGO：圆形展示位（后台商户/门店可配置 mt_store.logo） */
  .store-logo {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    margin-right: 12rpx;
    flex-shrink: 0;
    background: #ffffff;
    border: 2rpx solid rgba(255, 255, 255, 0.85);
  }

  .store {
      /* 占满 LOGO 右侧剩余宽度，避免名称被挤到换行 */
      flex: 1;
      min-width: 0;
      .name {
          font-size: 32rpx;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
      }
      .switch {
          margin-left: 12rpx;
          font-size: 22rpx;
          color: #ffffff;
          white-space: nowrap;
      }
      .address {
          clear: bold;
          display: block;
          margin-top: 2rpx;
          font-size: 23rpx;
          margin-left: 0rpx;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .location-icon {
            margin-right: 4rpx;
            font-size: 24rpx;
            /* 定位钉：品牌红，与主色背景区分开 */
            color: #f03c3c;
            font-weight: bold;
          }
      }
  }
}

/* 首页方案：门店条并入 sticky 容器，由容器统一吸顶 */
.main-loc.main-loc--inline {
  height: auto;
  .diy-location {
    position: static;
    width: auto;
  }
}
</style>
