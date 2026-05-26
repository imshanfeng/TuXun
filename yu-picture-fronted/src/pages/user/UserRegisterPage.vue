<template>
  <div id="userRegisterPage">
    <div class="register-container">
      <div class="register-header">
        <h2 class="title">图寻 - 用户注册</h2>
        <div class="desc">企业级智能协同云图库</div>
      </div>
      
      <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit" class="register-form">
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" />
        </a-form-item>

        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于8位' },
          ]"
        >
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
        </a-form-item>

        <a-form-item
          name="checkPassword"
          :rules="[
            { required: true, message: '请输入确认密码' },
            { min: 8, message: '确认密码长度不能小于8位' },
            { validator: (_rule: any, value: string) => value !== formState.userPassword ? Promise.reject('两次输入的密码不一致') : Promise.resolve() },
          ]"
        >
          <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" size="large" />
        </a-form-item>
        
        <div class="tips">
          已有账号？
          <RouterLink to="/user/login">去登录</RouterLink>
        </div>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" class="submit-btn" block :loading="submitting">注册</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { userRegisterUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})
const submitting = ref(false)

const handleSubmit = async (values: API.UserRegisterRequest) => {
  submitting.value = true
  try {
    const res = await userRegisterUsingPost(values)
    if (res.data.code == 0 && res.data.data) {
      message.success('注册成功')
      router.push({
        path: '/user/login',
        replace: true,
      })
    } else {
      message.error('注册失败，' + res.data.message)
    }
  } catch (e) {
    message.error('注册失败，网络异常，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
#userRegisterPage {
  min-height: calc(100dvh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 50%, rgba(22, 119, 255, 0.05) 0%, transparent 60%);
  padding: 24px 0;
}

.register-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  animation: fadeUp 0.6s ease-out forwards;
}

.register-header {
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
  color: #6c757d;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.register-form .ant-input,
.register-form .ant-input-password {
  border-radius: 12px;
}

.register-form :deep(.ant-form-item-control-input),
.register-form :deep(.ant-form-item-control-input-content),
.register-form :deep(.ant-input),
.register-form :deep(.ant-input-password),
.register-form :deep(.ant-input-affix-wrapper) {
  width: 100%;
}

.register-form :deep(.ant-input),
.register-form :deep(.ant-input-password),
.register-form :deep(.ant-input-affix-wrapper) {
  min-height: 48px;
  height: 48px;
  border-radius: 12px;
  box-sizing: border-box;
}

.register-form :deep(.ant-input) {
  padding: 0 12px;
}

.register-form :deep(.ant-input-affix-wrapper) {
  padding: 0 12px;
  display: flex;
  align-items: center;
}

.register-form :deep(.ant-input-affix-wrapper > input.ant-input) {
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

.tips {
  display: flex;
  justify-content: flex-end;
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 24px;
  margin-top: -8px;
}

.tips a {
  color: #1677ff;
  margin-left: 4px;
  transition: color 0.3s;
}

.tips a:hover {
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
  #userRegisterPage {
    align-items: flex-start;
    padding: 20px 0 28px;
    min-height: calc(100dvh - 84px);
  }

  .register-container {
    max-width: none;
    margin: 0 6px;
    padding: 28px 18px 22px;
    border-radius: 18px;
  }

  .register-header {
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
  #userRegisterPage {
    padding: 14px 0 20px;
  }

  .register-container {
    margin: 0;
    padding: 24px 16px 18px;
    border-radius: 16px;
  }

  .register-header {
    margin-bottom: 20px;
  }

  .title {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .desc {
    font-size: 12px;
  }

  .register-form :deep(.ant-form-item) {
    margin-bottom: 14px;
  }

  .register-form :deep(.ant-input),
  .register-form :deep(.ant-input-password),
  .register-form :deep(.ant-input-affix-wrapper),
  .submit-btn {
    min-height: 44px;
    height: 44px;
  }
}
</style>
