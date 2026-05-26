<template>
  <div id="app">
    <a-config-provider
      :locale="zhCN"
      :theme="{
        algorithm: themeStore.isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }"
    >
      <BasicLayout />
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { theme } from 'ant-design-vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useThemeStore } from '@/stores/useThemeStore'

const loginUserStore = useLoginUserStore()
const themeStore = useThemeStore()

loginUserStore.fetchLoginUser()

// 主题切换效果
watchEffect(() => {
  if (themeStore.isDark) {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }
})
</script>



<style>
html {
  height: 100%;
}

body,
#app {
  min-height: 100%;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: v-bind('themeStore.isDark ? "#141414" : "#f5f2f0"');
  overflow-x: hidden;
}

#app {
  overflow-x: clip;
}

img,
svg,
video,
canvas {
  max-width: 100%;
}
</style>
