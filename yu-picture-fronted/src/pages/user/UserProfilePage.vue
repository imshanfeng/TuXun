<template>
  <div id="userProfilePage">
    <a-card title="个人资料" :bordered="false" class="profile-card">
      <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }">
        <a-descriptions-item label="头像">
          <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="64">
            {{ loginUserStore.loginUser.userName ?? '无名' }}
          </a-avatar>
        </a-descriptions-item>
        <a-descriptions-item label="用户昵称">
          {{ loginUserStore.loginUser.userName ?? '未填写' }}
        </a-descriptions-item>
        <a-descriptions-item label="账号">
          {{ loginUserStore.loginUser.userAccount }}
        </a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-tag :color="loginUserStore.loginUser.userRole === 'admin' ? 'purple' : 'blue'">
            {{ loginUserStore.loginUser.userRole === 'admin' ? '管理员' : '普通用户' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="个人简介">
          {{ loginUserStore.loginUser.userProfile || '这个人很懒，什么都没写~' }}
        </a-descriptions-item>
        <a-descriptions-item label="注册时间">
          {{ formatDateTime(loginUserStore.loginUser.createTime) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import dayjs from 'dayjs'

const loginUserStore = useLoginUserStore()

const formatDateTime = (time: string | undefined | null) => {
  if (!time) return '未知'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
#userProfilePage {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
