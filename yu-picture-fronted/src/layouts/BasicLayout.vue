<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100dvh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <GlobalSider />
        <a-layout-content class="content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"> 基于 Vue3 的云端图库图片管理系统 </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
import { theme } from 'ant-design-vue'

const { useToken } = theme
const { token } = useToken()
</script>

<style scoped>
#basicLayout .header {
  padding-inline: 20px;
  padding-top: env(safe-area-inset-top);
  background: v-bind('token.colorBgContainer');
  color: unset;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: none;
}

#basicLayout .content {
  min-width: 0;
  width: 100%;
  padding: 24px;
  background: v-bind('token.colorBgLayout');
  margin-bottom: 60px; /* leave space for footer */
  min-height: calc(100dvh - 64px - 60px);
  overflow-x: clip;
}

@media screen and (max-width: 768px) {
  #basicLayout .header {
    padding-inline: 10px;
  }

  #basicLayout .content {
    padding: 10px;
    margin-bottom: 0;
    min-height: calc(100dvh - 64px);
  }

  #basicLayout .footer {
    display: none;
  }
}

#basicLayout .footer {
  background: v-bind('token.colorBgContainer');
  text-align: center;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  border-top: none;
  z-index: 99;
}

#basicLayout .footer a {
  color: v-bind('token.colorTextSecondary');
  font-weight: 500;
  transition: color 0.2s;
}

#basicLayout .footer a:hover {
  color: v-bind('token.colorPrimary');
}

#basicLayout :deep(.ant-layout),
#basicLayout :deep(.ant-layout-content) {
  min-width: 0;
}

/* Route transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    transform: none;
  }
}
</style>
