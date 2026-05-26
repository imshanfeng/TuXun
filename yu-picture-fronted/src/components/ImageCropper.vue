<template>
  <a-modal
    :open="open"
    title="编辑图片"
    :footer="null"
    @update:open="onOpenChange"
    @cancel="handleCancel"
    :width="modalWidth"
    :maskClosable="false"
  >
    <div class="cropper-wrapper">
      <div class="cropper-container" v-if="open && internalImg">
        <vue-cropper
          ref="cropperRef"
          :img="internalImg"
          :autoCrop="true"
          :outputType="'webp'"
          :canScale="true"
          :canMove="true"
          :canMoveBox="true"
          :centerBox="true"
          :info="true"
          :full="true"
          :checkCrossOrigin="true"
          class="cropper-instance"
        />
      </div>
      <div class="cropper-toolbar">
        <a-space>
          <a-button @click="rotateLeft">向左旋转</a-button>
          <a-button @click="rotateRight">向右旋转</a-button>
          <a-button @click="changeScale(1)">放大</a-button>
          <a-button @click="changeScale(-1)">缩小</a-button>
          <a-button @click="reset">重置</a-button>
        </a-space>
        <a-button type="primary" :loading="confirmLoading" @click="handleConfirm">确认</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

interface Props {
  imageUrl?: string
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', open: boolean): void
  (e: 'confirm', blob: Blob): void
}>()

// 响应式 Modal 宽度
const windowWidth = ref(window.innerWidth)
const onResize = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const modalWidth = computed(() => {
  return windowWidth.value < 768 ? '95vw' : 800
})

const cropperRef = ref()
const confirmLoading = ref(false)
const internalImg = ref<string>('')

// 监听弹窗打开状态，关闭时清理，打开时重新加载图片
watch(
  () => props.open,
  (newVal) => {
    if (!newVal) {
      internalImg.value = ''
    } else if (props.imageUrl) {
      loadImage(props.imageUrl)
    }
  }
)

// 加载图片为 base64
const loadImage = async (url: string) => {
  try {
    const proxyUrl = url.replace('https://yu-picture-1386087361.cos.ap-guangzhou.myqcloud.com', '/cos')
    const res = await fetch(proxyUrl)
    const blob = await res.blob()
    const reader = new FileReader()
    reader.onload = (e) => {
      internalImg.value = e.target?.result as string
    }
    reader.readAsDataURL(blob)
  } catch (err) {
    console.error('Failed to fetch image for cropper:', err)
    internalImg.value = url
  }
}

// 监听图片 URL 变化
watch(
  () => props.imageUrl,
  (newUrl) => {
    if (newUrl) {
      loadImage(newUrl)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  internalImg.value = ''
})

// 旋转
const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
}
const rotateRight = () => {
  cropperRef.value?.rotateRight()
}

// 缩放
const changeScale = (num: number) => {
  cropperRef.value?.changeScale(num || 1)
}

// 重置
const reset = () => {
  cropperRef.value?.refresh()
}

const onOpenChange = (val: boolean) => {
  emit('update:open', val)
}

const handleCancel = () => {
  emit('update:open', false)
}

/**
 * 确认裁剪
 */
const handleConfirm = () => {
  if (!cropperRef.value) return
  confirmLoading.value = true
  cropperRef.value.getCropBlob((blob: Blob) => {
    confirmLoading.value = false
    emit('confirm', blob)
    emit('update:open', false)
  })
}
</script>

<style scoped>
.cropper-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cropper-container {
  width: 100%;
  height: 480px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.cropper-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

:deep(.vue-cropper) {
  background-image: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee 100%),
    linear-gradient(45deg, #eee 25%, white 25%, white 75%, #eee 75%, #eee 100%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}

@media (max-width: 768px) {
  .cropper-container {
    height: 300px;
  }

  .cropper-toolbar {
    flex-direction: column;
    gap: 8px;
  }

  .cropper-toolbar :deep(.ant-space) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
