import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import AddPicturePage from '@/pages/AddPicturePage.vue'
import AddPictureBatchPage from '@/pages/AddPictureBatchPage.vue'
import UserProfilePage from '@/pages/user/UserProfilePage.vue'
import UserSettingsPage from '@/pages/user/UserSettingsPage.vue'
import MyPicturePage from '@/pages/MyPicturePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import PictureDetailPage from '@/pages/PictureDetailPage.vue'
import SpaceManagePage from '@/pages/admin/SpaceManagePage.vue'

import SpaceDetailPage from '@/pages/SpaceDetailPage.vue'
import SearchPicturePage from '@/pages/SearchPicturePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: HomePage,
      meta: {
        order: 0,
      }
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
      meta: {
        hideInMenu: true,
      },
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
      meta: {
        hideInMenu: true,
      },
    },
    {
      path: '/my_picture',
      name: '我的图片',
      component: MyPicturePage,
      meta: {
        access: 'user',
        order: 10,
      },
    },
    {
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage,
      meta: {
        access: 'user',
        order: 20,
      },
    },
    {
      path: '/add_picture/batch',
      name: '批量创建图片',
      component: AddPictureBatchPage,
      meta: {
        access: 'admin',
        hideInMenu: true,
      },
    },
    {
      path: '/about',
      name: '关于',
      component: () => import('../views/AboutView.vue'),
      meta: {
        hideInMenu: true,
        order: 30,
      },
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
      meta: {
        access: 'admin',
        order: 100,
      },
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: PictureManagePage,
      meta: {
        access: 'admin',
        order: 110,
      },
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: SpaceManagePage,
      meta: {
        access: 'admin',
        order: 120,
      },
    },
    {
      path: '/add_space',
      name: '创建空间',
      component: () => import('../pages/AddSpacePage.vue'),
      meta: {
        access: 'user',
        hideInMenu: true,
      },
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: () => import('@/pages/MySpacePage.vue'),
      meta: {
        access: 'user',
        hideInMenu: true,
      },
    },
    {
      path: '/space_detail/:id',
      name: '空间详情（旧）',
      component: () => import('../pages/SpaceDetailPage.vue'),
      props: true,
      meta: {
        hideInMenu: true,
      },
    },
    {
      path: '/space_analyze',
      name: '空间分析',
      component: () => import('../pages/SpaceAnalyzePage.vue'),
      meta: {
        access: 'user',
        hideInMenu: true,
      },
    },
    {
      path: '/user/profile',
      name: '个人资料',
      component: UserProfilePage,
      meta: {
        access: 'user',
        hideInMenu: true,
      },
    },
    {
      path: '/user/settings',
      name: '设置',
      component: UserSettingsPage,
      meta: {
        access: 'user',
        hideInMenu: true,
      },
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true,
      meta: {
        hideInMenu: true,
      },
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: SpaceDetailPage,
      props: true,
      meta: {
        hideInMenu: true,
      },
    },
    {
      path: '/spaceUserManage/:id',
      name: '空间成员管理',
      component: () => import('../pages/SpaceUserManagePage.vue'),
      props: true,
      meta: {
        access: 'user',
        hideInMenu: true,
      },
    },
    {
      path: '/search_picture',
      name: '以图搜图',
      component: SearchPicturePage,
      meta: {
        access: 'user',
        hideInMenu: true,
      },
    },
  ],
})

export default router

