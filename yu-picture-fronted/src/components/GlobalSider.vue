<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="loginUserStore.loginUser.id"
      width="200"
      breakpoint="lg"
      collapsed-width="0"
      class="sider"
    >
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { theme } from 'ant-design-vue'

const { useToken } = theme
const { token } = useToken()

const loginUserStore = useLoginUserStore()
const router = useRouter()
const route = useRoute()

// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  // 如果用户没有团队空间，则只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  // 如果用户有团队空间，则展示固定菜单和团队空间菜单
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

// 加载团队空间列表
// 注意：后端暂未实现 SpaceUserController，暂时禁用
const fetchTeamSpaceList = async () => {
  try {
    const res = await listMyTeamSpaceUsingPost()
    if (res.data.code === 0 && res.data.data) {
      teamSpaceList.value = res.data.data
    }
  } catch (err) {
    console.error('加载我的团队空间失败', err)
  }
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
let lastFetchedUserId: string | undefined = undefined
watchEffect(() => {
  const userId = loginUserStore.loginUser.id
  // 用户登出时重置，确保重新登录后能正确加载
  if (!userId) {
    lastFetchedUserId = undefined
    teamSpaceList.value = []
    return
  }
  // 登录才加载，且避免重复请求同一用户
  if (userId !== lastFetchedUserId) {
    lastFetchedUserId = userId
    fetchTeamSpaceList()
  }
})

// 当前要高亮的菜单项
const current = ref<string[]>([])
// 监听路由变化，更新高亮菜单项
watchEffect(() => {
  current.value = [route.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<style scoped>
#globalSider .sider {
  background: v-bind('token.colorBgContainer');
  border-right: 1px solid v-bind('token.colorBorderSecondary');
  height: calc(100dvh - 64px);
  position: sticky;
  top: 64px;
  z-index: 99;
}

#globalSider :deep(.ant-menu) {
  border-right: none !important;
  margin-top: 16px;
}

@media (max-width: 768px) {
  #globalSider :deep(.ant-layout-sider-zero-width-trigger) {
    display: none;
  }
}
</style>
