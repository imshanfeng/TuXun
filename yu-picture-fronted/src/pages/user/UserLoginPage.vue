<template>
  <main id="userLoginPage">
    <div class="login-container">
      <div class="login-header">
        <h2 class="title">图寻 - 用户登录</h2>
        <div class="desc">企业级智能协同云图库</div>
      </div>

      <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit" class="login-form">
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]" :required="true">
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" autocomplete="username" aria-label="账号" />
        </a-form-item>

        <a-form-item
          name="userPassword"
          :required="true"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于8位' },
          ]"
        >
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" autocomplete="current-password" aria-label="密码" />
        </a-form-item>

        <div class="tips">
          没有账号？
          <RouterLink to="/user/register" class="tips-link">去注册</RouterLink>
        </div>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" class="submit-btn" block :loading="submitting">登录</a-button>
        </a-form-item>
      </a-form>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
const loginUserStore = useLoginUserStore()
const submitting = ref(false)

const handleSubmit = async (values: API.UserLoginRequest) => {
  submitting.value = true
  try {
    const res = await userLoginUsingPost(values)
    if (res.data.code === 0 && res.data.data) {
      await loginUserStore.fetchLoginUser()
      message.success('登录成功')
      router.push({
        path: '/',
        replace: true,
      })
    } else {
      message.error('登录失败，' + (res.data.message || '请稍后重试'))
    }
  } catch (e) {
    message.error('登录失败，网络异常，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
#userLoginPage {
  min-height: calc(100dvh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 50%, rgba(22, 119, 255, 0.05) 0%, transparent 60%);
  padding: 24px;
  padding-top: calc(24px + env(safe-area-inset-top));
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  animation: fadeUp 0.6s ease-out forwards;
}

:global(html.dark) .login-container {
  background: rgba(30, 30, 30, 0.85);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .login-container {
    animation: none;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #1677ff, #52c41a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.desc {
  color: #4b5563;
  font-size: 14px;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

:global(html.dark) .desc {
  color: #9ca3af;
}

.login-form .ant-input,
.login-form .ant-input-password {
  border-radius: 12px;
}

.login-form :deep(.ant-form-item-control-input),
.login-form :deep(.ant-form-item-control-input-content),
.login-form :deep(.ant-input),
.login-form :deep(.ant-input-password),
.login-form :deep(.ant-input-affix-wrapper) {
  width: 100%;
}

.login-form :deep(.ant-input),
.login-form :deep(.ant-input-password),
.login-form :deep(.ant-input-affix-wrapper) {
  min-height: 48px;
  height: 48px;
  border-radius: 12px;
  box-sizing: border-box;
}

.login-form :deep(.ant-input) {
  padding: 0 12px;
}

.login-form :deep(.ant-input-affix-wrapper) {
  padding: 0 12px;
  display: flex;
  align-items: center;
}

.login-form :deep(.ant-input-affix-wrapper > input.ant-input) {
  height: 100%;
  min-height: 100%;
  padding: 0;
}

.submit-btn {
  min-height: 48px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(22, 119, 255, 0.3);
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(22, 119, 255, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .submit-btn:hover {
    transform: none;
  }
}

.tips {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: #595959;
  font-size: 13px;
  margin-bottom: 24px;
  margin-top: -8px;
  line-height: 1.5;
}

:global(html.dark) .tips {
  color: #9ca3af;
}

.tips-link {
  color: #1677ff;
  margin-left: 4px;
  padding: 8px 4px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s;
}

.tips-link:hover {
  color: #4096ff;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  #userLoginPage {
    align-items: flex-start;
    padding: 20px 0 28px;
    min-height: calc(100dvh - 84px);
  }

  .login-container {
    max-width: none;
    margin: 0 6px;
    padding: 28px 18px 22px;
    border-radius: 18px;
  }

  .login-header {
    margin-bottom: 24px;
  }

  .title {
    font-size: 20px;
    line-height: 1.3;
  }

  .desc {
    font-size: 13px;
  }

  .tips {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  #userLoginPage {
    padding: 14px 0 20px;
  }

  .login-container {
    margin: 0;
    padding: 24px 16px 18px;
    border-radius: 16px;
  }

  .login-header {
    margin-bottom: 20px;
  }

  .title {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .desc {
    font-size: 12px;
  }

  .login-form :deep(.ant-form-item) {
    margin-bottom: 14px;
  }

  .login-form :deep(.ant-input),
  .login-form :deep(.ant-input-password),
  .login-form :deep(.ant-input-affix-wrapper),
  .submit-btn {
    min-height: 44px;
    height: 44px;
  }
}
</style>
