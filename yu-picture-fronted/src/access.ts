import router from '@/router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'

/**
 * 全局权限校验
 */
router.beforeEach(async (to, _from, next) => {
  const loginUserStore = useLoginUserStore()

  // ensure we have user info, or try fetching it once if not loaded
  let loginUser = loginUserStore.loginUser

  if (!loginUser || !loginUser.id) {
    try {
      // Attempt auto-login/fetch
      await loginUserStore.fetchLoginUser()
    } catch (e) {
      // fetch failed, continue as guest
      console.error('fetchLoginUser failed:', e)
    }
    loginUser = loginUserStore.loginUser
  }

  const userRole = loginUser?.userRole || 'guest'
  const needAccess = (to.meta?.access as string) ?? 'guest'

  // Requires login
  if (needAccess !== 'guest') {
    if (!loginUser || !loginUser.id) {
      message.warning('请先登录！')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }

    // Requires admin
    if (needAccess === 'admin' && userRole !== 'admin') {
      message.error('权限不足，当前页面只有管理员可访问。')
      next('/')
      return
    }
  }

  next()
})
