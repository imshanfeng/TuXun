<template>
  <div id="mySpacePage">
    <p>正在跳转，请稍后...</p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

/**
 * 检查用户是否有个人空间，并跳转
 */
const checkUserSpace = async () => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  }

  try {
    const res = await listSpaceVoByPageUsingPost({
      userId: loginUser.id,
      current: 1,
      pageSize: 1,
      spaceType: SPACE_TYPE_ENUM.PRIVATE,
    })

    if (res.data.code === 0 && res.data.data) {
      const records = res.data.data.records ?? []
      if (records.length > 0) {
        const space = records[0]
        router.replace(`/space/${space.id}`)
      } else {
        message.warn('请先创建空间')
        router.replace('/add_space')
      }
    } else {
      message.error('获取我的空间失败：' + res.data.message)
    }
  } catch (error) {
    console.error('获取空间异常', error)
    message.error('网络异常，获取空间失败')
  }
}

onMounted(() => {
  checkUserSpace()
})
</script>
