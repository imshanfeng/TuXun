<template>
  <div id="addSpacePage">
    <a-card :title="`创建${SPACE_TYPE_MAP[spaceType]}`" :bordered="false" class="page-card">
      <a-form :model="formData" layout="vertical" @finish="handleSubmit">
        <a-form-item label="空间名称" name="spaceName" :rules="[{ required: true, message: '请输入空间名称' }]">
          <a-input v-model:value="formData.spaceName" placeholder="请输入空间" size="large" />
        </a-form-item>

        <a-form-item label="空间级别" name="spaceLevel">
          <a-select
            v-model:value="formData.spaceLevel"
            placeholder="请选择空间级别"
            size="large"
            :options="spaceLevelOptions"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" block size="large" :loading="loading">
            创 建
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 空间级别介绍 -->
      <div class="level-info" v-if="spaceLevelList.length > 0">
        <h3>空间级别介绍</h3>
        <a-alert
          v-if="loginUserStore.loginUser?.userRole !== 'admin'"
          message="目前仅支持开通普通版，如需升级空间，请联系 山风"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
        <div v-for="level in spaceLevelList" :key="level.value" class="level-item">
          <span class="level-name">{{ level.text }}：</span>
          <span>大小 {{ formatSizeMB(level.maxSize) }} MB，数量 {{ level.maxCount }}</span>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { addSpaceUsingPost, listSpaceLevelUsingGet } from '@/api/spaceController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space'

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()
const loading = ref(false)

// 空间类别
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  }
  return SPACE_TYPE_ENUM.PRIVATE
})

const formData = reactive<API.SpaceAddRequest>({
  spaceName: '',
  spaceLevel: undefined,
})

const spaceLevelList = ref<API.SpaceLevel[]>([])
const spaceLevelOptions = ref<{ value: number; label: string }[]>([])

// 格式化大小为 MB
const formatSizeMB = (size?: number) => {
  if (!size) return '0.00'
  return (size / (1024 * 1024)).toFixed(2)
}

// 获取空间级别列表
const getSpaceLevels = async () => {
  try {
    const res = await listSpaceLevelUsingGet()
    if (res.data.code === 0 && res.data.data) {
      spaceLevelList.value = res.data.data
      spaceLevelOptions.value = res.data.data.map((level: API.SpaceLevel) => ({
        value: level.value as number,
        label: level.text as string,
      }))
    }
  } catch (error) {
    console.error('获取空间级别失败:', error)
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const res = await addSpaceUsingPost({
      ...formData,
      spaceType: spaceType.value,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success(`创建${SPACE_TYPE_MAP[spaceType.value]}成功`)
      router.push(`/space/${res.data.data}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Create space error:', error)
    message.error('请求失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getSpaceLevels()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 600px;
  margin: 0 auto;
}

.page-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
}

.level-info {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.level-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.level-item {
  padding: 4px 0;
  color: #595959;
  font-size: 14px;
}

.level-name {
  font-weight: 500;
}

@media (max-width: 768px) {
  #addSpacePage {
    margin: 0 16px;
  }
  .page-card :deep(.ant-card-body) {
    padding: 16px;
  }
}
</style>
