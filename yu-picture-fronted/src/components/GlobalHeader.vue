<template>
  <div id="globalHeader">
    <a-drawer
      v-model:open="mobileNavVisible"
      placement="left"
      :width="280"
      class="mobile-nav-drawer"
    >
      <template #title>快捷导航</template>
      <div class="mobile-nav-content">
        <div class="mobile-user-panel">
          <template v-if="loginUserStore.loginUser.id">
            <div class="mobile-user-summary">
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="44">
                {{ loginUserStore.loginUser.userName?.slice(0, 1) ?? '用' }}
              </a-avatar>
              <div class="mobile-user-meta">
                <div class="mobile-user-name">
                  {{ loginUserStore.loginUser.userName ?? '未命名用户' }}
                </div>
                <div class="mobile-user-role">
                  {{ loginUserStore.loginUser.userRole === 'admin' ? '管理员' : '普通用户' }}
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="mobile-user-summary guest">
              <div class="mobile-user-name">当前未登录</div>
              <div class="mobile-user-role">登录后可管理个人空间和图片</div>
            </div>
            <div class="mobile-user-actions">
              <a-button type="primary" block @click="goToLogin">登录</a-button>
              <a-button block @click="goToRegister">注册</a-button>
            </div>
          </template>
        </div>
        <a-menu
          v-model:selectedKeys="current"
          mode="inline"
          :items="mobileMenuItems"
          @click="handleMobileMenuClick"
        />
      </div>
    </a-drawer>
    <a-row :wrap="false">
      <a-col flex="56px" class="mobile-nav-col">
        <a-button type="text" class="mobile-nav-button" aria-label="打开导航菜单" @click="mobileNavVisible = true">
          <MenuOutlined />
        </a-button>
      </a-col>
      <a-col flex="200px" class="brand-col">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.webp" alt="logo" />
            <div class="title">图寻</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto" class="desktop-menu-col">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col flex="120px" class="user-col">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="loginUserStore.loginUser.userAvatar">
                  {{ loginUserStore.loginUser.userName ?? '无名' }}
                </a-avatar>
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="router.push('/user/profile')">
                    <UserOutlined />
                    个人资料
                  </a-menu-item>
                  <a-menu-item @click="router.push('/user/settings')">
                    <SettingOutlined />
                    设置
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" @click="router.push('/user/login')">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined, LogoutOutlined, UserOutlined, PictureOutlined, InfoCircleOutlined, SettingOutlined, TeamOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'

const loginUserStore = useLoginUserStore()
const router = useRouter()
const route = useRoute()
const mobileNavVisible = ref(false)

const items = computed<MenuProps['items']>(() => {
  const currentRole = loginUserStore.loginUser?.userRole || 'guest'
  const allRoutes = router.getRoutes()

  const menuItems = allRoutes
    .map((route) => {
      if (route.meta?.hideInMenu) return null

      const needAccess = (route.meta?.access as string) ?? 'guest'
      if (needAccess !== 'guest') {
        if (currentRole === 'guest') {
          return null
        }
        if (needAccess === 'admin' && currentRole !== 'admin') {
          return null
        }
      }

      const label = (route.name as string) || route.path

      let icon = undefined
      if (route.path === '/') {
        icon = () => h(HomeOutlined)
      } else if (route.path.startsWith('/admin/userManage')) {
        icon = () => h(TeamOutlined)
      } else if (route.path.startsWith('/admin/pictureManage')) {
        icon = () => h(PictureOutlined)
      } else if (route.path.startsWith('/my_picture')) {
        icon = () => h(PictureOutlined)
      } else if (route.path.startsWith('/add_picture')) {
        icon = () => h(PictureOutlined)
      } else if (route.path.startsWith('/about')) {
        icon = () => h(InfoCircleOutlined)
      }

      return {
        key: route.path,
        icon,
        label: label,
        title: label,
        order: (route.meta?.order as number) ?? 1000,
      }
    })
    .filter((item): item is { key: string; icon?: (() => ReturnType<typeof h>) | undefined; label: string; title: string; order: number } => item !== null)

  menuItems.push({
    key: '/others',
    label: h('a', { href: 'https://www.vcg.com/', target: '_blank', rel: 'noopener noreferrer' }, '视觉中国'),
    title: '视觉中国',
    order: 9999,
  })

  menuItems.sort((a, b) => a.order - b.order)

  return menuItems as MenuProps['items']
})

const current = ref<string[]>([])
watchEffect(() => {
  current.value = [route.path]
})

const removeAfterEach = router.afterEach(() => {
  mobileNavVisible.value = false
})
onUnmounted(() => {
  removeAfterEach()
})

const doMenuClick = ({ key }: { key: string }) => {
  if (key && !key.startsWith('http')) {
    router.push({
      path: key,
    })
  }
}

const mobileMenuItems = computed<MenuProps['items']>(() => {
  const menuList: NonNullable<MenuProps['items']> = [
    {
      key: '/',
      icon: () => h(HomeOutlined),
      label: '首页',
    },
  ]

  if (loginUserStore.loginUser.id) {
    menuList.push(
      {
        key: '/my_space',
        icon: () => h(UserOutlined),
        label: '我的空间',
      },
      {
        key: '/my_picture',
        icon: () => h(PictureOutlined),
        label: '我的图片',
      },
      {
        key: '/add_picture',
        icon: () => h(PlusOutlined),
        label: '创建图片',
      },

      {
        key: '/user/profile',
        icon: () => h(UserOutlined),
        label: '个人资料',
      },
      {
        key: '/user/settings',
        icon: () => h(SettingOutlined),
        label: '设置',
      },
      {
        key: '/logout',
        icon: () => h(LogoutOutlined),
        label: '退出登录',
      }
    )
  } else {
    menuList.push(
      {
        key: '/user/login',
        icon: () => h(UserOutlined),
        label: '登录',
      },
      {
        key: '/user/register',
        icon: () => h(PlusOutlined),
        label: '注册',
      }
    )
  }

  return menuList
})

const handleMobileMenuClick = ({ key }: { key: string }) => {
  if (key === '/logout') {
    doLogout()
    return
  }
  doMenuClick({ key })
}

const goToLogin = () => {
  mobileNavVisible.value = false
  router.push('/user/login')
}

const goToRegister = () => {
  mobileNavVisible.value = false
  router.push('/user/register')
}

const doLogout = async () => {
  try {
    const res = await userLogoutUsingPost()
    if (res.data.code === 0) {
      mobileNavVisible.value = false
      loginUserStore.setLoginUser({
        userName: '未登录',
      })
      message.success("退出登录成功");
      router.push('/user/login')
    } else {
      message.error('退出登录失败'+res.data.message)
    }
  } catch {
    message.error('退出登录请求失败，请检查网络')
  }
}
</script>

<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
  transition: transform 0.3s;
  min-width: 0;
}

#globalHeader .title-bar:hover {
  transform: scale(1.02);
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 12px;
  background: linear-gradient(90deg, #1677ff, #52c41a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  user-select: none;
}

.logo {
  height: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-nav-col,
.mobile-nav-button {
  display: none;
}

.mobile-nav-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-user-panel {
  display: none;
}

:deep(.ant-menu-horizontal) {
  border-bottom: none !important;
  background: transparent !important;
}

.user-login-status .ant-btn {
  border-radius: 20px;
  padding: 0 24px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(22, 119, 255, 0.2);
  transition: all 0.3s;
}

.user-login-status .ant-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(22, 119, 255, 0.3);
}

@media (max-width: 768px) {
  .mobile-nav-col,
  .mobile-nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-user-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 4px 2px 8px;
  }

  .mobile-user-summary {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(22, 119, 255, 0.1), rgba(82, 196, 26, 0.08));
  }

  .mobile-user-summary.guest {
    display: block;
  }

  .mobile-user-meta {
    min-width: 0;
  }

  .mobile-user-name {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    word-break: break-all;
  }

  :global(html.dark) .mobile-user-name {
    color: #e2e8f0;
  }

  .mobile-user-role {
    margin-top: 4px;
    font-size: 12px;
    color: #64748b;
  }

  :global(html.dark) .mobile-user-role {
    color: #94a3b8;
  }

  .mobile-user-actions {
    display: grid;
    gap: 10px;
  }

  .mobile-user-actions :deep(.ant-btn) {
    height: 42px;
    border-radius: 14px;
    font-weight: 600;
  }

  .desktop-menu-col {
    display: none;
  }

  .brand-col {
    flex: 1 1 auto !important;
    min-width: 0;
    order: 1;
  }

  .mobile-nav-col {
    order: 3;
    margin-left: auto;
  }

  .user-col {
    display: none;
  }

  .mobile-nav-button {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    color: #1e293b;
    background: rgba(248, 250, 252, 0.95);
    box-shadow: 0 6px 16px rgba(148, 163, 184, 0.16);
    font-size: 18px;
  }

  :global(html.dark) .mobile-nav-button {
    color: #e2e8f0;
    background: rgba(30, 41, 59, 0.95);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  #globalHeader :deep(.ant-row) {
    align-items: center;
    gap: 10px;
  }

  .title {
    margin-left: 8px;
    font-size: 18px;
  }

  .logo {
    height: 34px;
  }

  .mobile-nav-content :deep(.ant-menu) {
    border-inline-end: none !important;
  }
}
</style>
