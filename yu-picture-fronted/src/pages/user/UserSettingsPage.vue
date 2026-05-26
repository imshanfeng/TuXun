<template>
  <div id="userSettingsPage">
    <a-card title="账号设置" :bordered="false" class="settings-card">
      <a-form
        :model="formState"
        layout="vertical"
        @finish="handleSubmit"
        class="settings-form"
      >
        <a-form-item label="用户头像">
          <a-upload
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :customRequest="customUpload"
          >
            <img v-if="formState.userAvatar" :src="formState.userAvatar" alt="avatar" class="avatar-image" />
            <div v-else>
              <LoadingOutlined v-if="uploading" />
              <PlusOutlined v-else />
              <div class="ant-upload-text">上传头像</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="用户昵称" name="userName">
          <a-input v-model:value="formState.userName" placeholder="请输入用户昵称" />
        </a-form-item>

        <a-form-item label="个人简介" name="userProfile">
          <a-textarea
            v-model:value="formState.userProfile"
            placeholder="请输入个人简介"
            :rows="4"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="submitting">保存更改</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { editMyUserUsingPost } from '@/api/userController'
import { testUploadFileUsingPost } from '@/api/fileController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()
const uploading = ref(false)
const submitting = ref(false)

const formState = reactive<API.UserEditRequest>({
  userAvatar: '',
  userName: '',
  userProfile: '',
})

onMounted(() => {
  const user = loginUserStore.loginUser
  if (user && user.id) {
    formState.userAvatar = user.userAvatar || ''
    formState.userName = user.userName || ''
    formState.userProfile = user.userProfile || ''
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customUpload = async (options: any) => {
  const { file, onSuccess, onError } = options
  uploading.value = true
  try {
    const res = await testUploadFileUsingPost({}, file as File)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseData = res.data as any
    if (responseData.code === 0 && responseData.data) {
      // 后端现在返回完整 URL
      formState.userAvatar = responseData.data
      if (onSuccess) onSuccess(responseData.data, file)
      message.success('头像上传成功')
    } else {
      if (onError) onError(new Error(responseData.message || '上传失败'))
      message.error('头像上传失败：' + responseData.message)
    }
  } catch (error) {
    if (onError) onError(error as Error)
    message.error('上传头像时发生错误')
  } finally {
    uploading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const res = await editMyUserUsingPost(formState)
    if (res.data.code == 0 && res.data.data) {
      message.success('设置保存成功')
      // 刷新用户登录状态
      await loginUserStore.fetchLoginUser()
    } else {
      message.error('保存失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Update settings failed:', error)
    message.error('保存设置时发生错误，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
#userSettingsPage {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0;
}

.settings-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.settings-form {
  max-width: 500px;
}

.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style>
