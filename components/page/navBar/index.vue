<template>
  <!-- 导航组 -->
  <view class="diy-navBar bahar-anim" :style="{ background: itemStyle.background, color: itemStyle.textColor }">
    <view class="data-list" :class="[`avg-sm-${itemStyle.rowsNum || 4}`]">
      <view class="item-nav" v-for="(dataItem, index) in dataList" :key="index">
        <view class="nav-to bahar-press" :class="'nav-' + index" @click="onLink(dataItem.url)">
          <view class="item-image">
            <image class="image" mode="aspectFit" :src="dataItem.iconUrl"></image>
          </view>
          <view class="item-text onelist-hidden">
             <view class="text">{{ dataItem.name }}</view>
             <view class="tip">{{ dataItem.tips ? dataItem.tips : '' }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import mixin from '../mixin'

  export default {
    name: "NavBar",
    /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
    props: {
      itemIndex: String,
      itemStyle: Object,
      params: Object,
      dataList: Array
    },

    mixins: [mixin],

    /**
     * 组件的方法列表
     * 更新属性和数据的方法与更新数据类似
     */
    methods: {
        onLink(linkObj) {
            this.$navTo(linkObj)
        }
    }

  }
</script>

<style lang="scss" scoped>
  /* 卡片容器：取代旧的 float 分列写法 */
  .diy-navBar {
    margin: 20rpx;
    padding: 6rpx;
    border-radius: 20rpx;
    border: 1rpx solid #e6e6e6;
    box-sizing: border-box;
  }

  .diy-navBar .data-list {
    display: flex;
    flex-wrap: wrap;
  }

  .item-nav {
    box-sizing: border-box;
    padding: 2rpx;
    text-align: center;
    .nav-to {
        margin: 0;
        padding: 16rpx 8rpx 12rpx 8rpx;
        border-radius: 12rpx;
        min-height: 120rpx;
        box-sizing: border-box;
        background: linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%);
        border: 1rpx solid #e5e5e5;
        transition: transform 0.15s ease, background 0.15s ease;
    }
    .nav-to:active {
        transform: scale(0.96);
        background: #f0f5f5;
    }
    .item-text {
      padding: 0 4rpx;
      .text {
          font-size: 24rpx;
          color: #333;
          font-weight: 600;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
      }
      .tip {
          font-size: 20rpx;
          margin-top: 4rpx;
          color: #333;
          opacity: 0.8;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
      }
    }

    .item-image {
      margin: 0 auto;
      font-size: 0;
      width: 72rpx;
      height: 72rpx;
      box-sizing: border-box;
    }

    .item-image .image {
      width: 72rpx;
      height: 72rpx;
      border-radius: 16rpx;
    }

  }

  /* 分列布局（flex 等分，默认 4 列） */
  .diy-navBar .avg-sm-3>.item-nav {
    flex: 0 0 33.33333333%;
  }

  .diy-navBar .avg-sm-4>.item-nav {
    flex: 0 0 25%;
  }

  .diy-navBar .avg-sm-2>.item-nav {
    flex: 0 0 50%;
  }
</style>
