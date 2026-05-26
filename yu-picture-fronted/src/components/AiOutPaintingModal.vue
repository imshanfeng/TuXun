<template>
  <a-modal
    v-model:open="visible"
    title="AI 扩图"
    :footer="null"
    @cancel="handleCancel"
    :width="modalWidth"
    :maskClosable="false"
  >
    <a-row :gutter="24">
      <!-- 左侧：原始图片 -->
      <a-col :xs="24" :md="12">
        <p>原始图片：</p>
        <img :src="picture?.url" style="width: 100%; border-radius: 8px" />
      </a-col>
      <!-- 右侧：扩图结果 -->
      <a-col :xs="24" :md="12">
        <p>扩图结果：</p>
        <div class="result-container">
          <img v-if="resultImageUrl" :src="resultImageUrl" style="width: 100%; border-radius: 8px" />
          <div v-else-if="polling" class="status-placeholder">
            <a-spin tip="AI 扩图中，请稍候..." />
          </div>
          <div v-else class="status-placeholder">
            <a-empty description="暂无结果" />
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 参数选择 -->
    <div style="margin-top: 24px">
      <a-form layout="vertical">
        <a-form-item label="扩图比例">
          <a-radio-group v-model:value="outputRatio">
            <a-radio value="1:1">1:1</a-radio>
            <a-radio value="4:3">4:3</a-radio>
            <a-radio value="3:4">3:4</a-radio>
            <a-radio value="16:9">16:9</a-radio>
            <a-radio value="9:16">9:16</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮 -->
    <div style="margin-top: 16px; text-align: right">
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button
          v-if="resultImageUrl"
          type="primary"
          @click="handleApply"
        >
          应用结果
        </a-button>
        <a-button
          v-else
          type="primary"
          :loading="submitting || polling"
          @click="handleCreateTask"
        >
          开始扩图
        </a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
} from '@/api/pictureController'

interface Props {
  open: boolean
  picture?: API.PictureVO
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', open: boolean): void
  (e: 'success', newUrl: string): void
}>()

// 响应式 Modal 宽度
const windowWidth = ref(window.innerWidth)
const onResize = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const modalWidth = computed(() => {
  return windowWidth.value < 768 ? '95vw' : 600
})

const visible = ref(false)
const submitting = ref(false)
const polling = ref(false)
const outputRatio = ref('1:1')
const resultImageUrl = ref('')
const taskId = ref('')
let timer: ReturnType<typeof setInterval> | null = null

// 同步 open 状态
watch(
  () => props.open,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      resultImageUrl.value = ''
      taskId.value = ''
    }
  }
)

watch(visible, (newVal) => {
  emit('update:open', newVal)
})

// 清理定时器
onUnmounted(() => {
  stopPolling()
})

const stopPolling = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  polling.value = false
}

/**
 * 创建扩图任务
 */
const handleCreateTask = async () => {
  if (!props.picture?.id) return
  
  submitting.value = true
  try {
    const res = await createPictureOutPaintingTaskUsingPost({
      pictureId: props.picture.id,
      parameters: {
        outputRatio: outputRatio.value,
      },
    })
    if (res.data.code === 0 && res.data.data?.output?.taskId) {
      taskId.value = res.data.data.output.taskId
      startPolling()
    } else {
      message.error('提交生成任务失败：' + res.data.message)
    }
  } catch (err) {
    console.error('Create AI Task Error:', err)
    message.error('提交任务接口请求失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 开始轮询任务状态
 */
const startPolling = () => {
  if (!taskId.value) return
  polling.value = true
  let pollCount = 0
  const maxPolls = 100 // 最多轮询 100 次（约 5 分钟）

  timer = setInterval(async () => {
    pollCount++
    if (pollCount > maxPolls) {
      message.error('扩图任务超时，请稍后重试')
      stopPolling()
      return
    }
    try {
      const res = await getPictureOutPaintingTaskUsingGet({ taskId: taskId.value })
      if (res.data.code === 0 && res.data.data?.output) {
        const taskStatus = res.data.data.output.taskStatus
        if (taskStatus === 'SUCCEEDED') {
          resultImageUrl.value = res.data.data.output.outputImageUrl || ''
          message.success('扩图任务已完成')
          stopPolling()
        } else if (taskStatus === 'FAILED') {
          message.error('扩图任务失败：' + res.data.data.output.message)
          stopPolling()
        }
      }
    } catch (err) {
      console.error('Polling AI Task Error:', err)
      // 轮询偶尔失败不即刻终止
    }
  }, 3000) // 每 3 秒轮询一次
}

/**
 * 应用结果
 */
const handleApply = () => {
  if (resultImageUrl.value) {
    emit('success', resultImageUrl.value)
    visible.value = false
  }
}

const handleCancel = () => {
  stopPolling()
  visible.value = false
}
</script>

<style scoped>
.result-container {
  width: 100%;
  min-height: 150px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-placeholder {
  padding: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  :deep(.ant-radio-wrapper) {
    margin-inline-end: 8px;
  }
}
</style>
