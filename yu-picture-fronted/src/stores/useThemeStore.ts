import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 默认使用自动
  const themePreference = ref<'light' | 'dark' | 'auto'>(
    (localStorage.getItem('theme-preference') as 'light' | 'dark' | 'auto') || 'auto'
  )

  // 系统是否为深色模式
  const systemIsDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

  // 监听系统设置
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemThemeChange = (e: MediaQueryListEvent) => {
    systemIsDark.value = e.matches
  }
  query.addEventListener('change', onSystemThemeChange)

  // 最终计算出的主题状态
  const isDark = computed(() => {
    if (themePreference.value === 'auto') {
      return systemIsDark.value
    }
    return themePreference.value === 'dark'
  })

  // 设置主题
  function setTheme(theme: 'light' | 'dark' | 'auto') {
    themePreference.value = theme
    localStorage.setItem('theme-preference', theme)
  }

  return {
    themePreference,
    isDark,
    setTheme
  }
})
