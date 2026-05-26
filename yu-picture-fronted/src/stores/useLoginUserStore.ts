import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController'

/**
 * 存储登录用户信息的状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  /**
   * 远程获取登录用户信息
   */
  async function fetchLoginUser() {
    try {
      const res = await getLoginUserUsingGet()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      } else {
        // 请求返回失败状态码时，重置为未登录
        loginUser.value = { userName: '未登录' }
      }
    } catch (error) {
      console.error('Fetch login user error:', error)
      // 请求异常时，重置为未登录
      loginUser.value = { userName: '未登录' }
    }
  }

  /**
   * 设置登录用户
   * @param newLoginUser
   */
  function setLoginUser(newLoginUser: API.LoginUserVO) {
    loginUser.value = newLoginUser
  }

  // 返回
  return { loginUser, fetchLoginUser, setLoginUser }
})
