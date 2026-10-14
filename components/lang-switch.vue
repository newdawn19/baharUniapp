<template>
  <view class="lang-switch" @click="toggle">
    <text :class="['lang-item', current === 'zh-CN' ? 'active' : '']">中</text>
    <text class="lang-sep">/</text>
    <text :class="['lang-item', current === 'en-US' ? 'active' : '']">EN</text>
  </view>
</template>

<script>
  import { I18n } from '@/common/i18n'
  import storage from '@/utils/storage'
  import store from '@/store'
  import { LOCALE } from '@/store/mutation-types'

  export default {
    name: 'LangSwitch',
    data() {
      return {
        current: I18n.current()
      }
    },
    methods: {
      toggle() {
        const next = this.current === 'zh-CN' ? 'en-US' : 'zh-CN'
        this.current = next
        // 内核切换
        I18n.setLocale(next)
        // 持久化（不过期）
        storage.set(LOCALE, next)
        // 同步到 vuex
        store.commit('SET_LOCALE', next)
        // 通知父组件刷新界面（如 reLaunch 当前页，使导航标题/静态文案刷新）
        this.$emit('change', next)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .lang-switch {
    display: inline-flex;
    align-items: center;
    padding: 6rpx 18rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.7);
    border-radius: 30rpx;
    background: rgba(0, 0, 0, 0.15);
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    user-select: none;

    .lang-item {
      padding: 0 4rpx;
      line-height: 1;
    }

    .lang-item.active {
      color: #fff;
      font-weight: bold;
    }

    .lang-sep {
      margin: 0 4rpx;
      opacity: 0.6;
    }
  }
</style>
