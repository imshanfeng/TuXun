<template>
  <a-modal v-model:open="visible" :title="title" :footer="false" @cancel="closeModal">
    <a-typography-paragraph>复制链接分享</a-typography-paragraph>
    <a-input-group compact style="margin-bottom: 24px">
      <a-input v-model:value="link" style="width: calc(100% - 80px)" readonly />
      <a-button type="primary" style="width: 80px" @click="doCopy">复制</a-button>
    </a-input-group>
    <a-typography-paragraph>手机扫码查看</a-typography-paragraph>
    <div style="text-align: center">
      <a-qrcode :value="link" />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'

// 是否可见
const visible = ref(false)
// 标题
const title = ref('分享图片')
// 链接
const link = ref('')

// 打开弹窗
const openModal = (newLink: string, newTitle: string) => {
  link.value = newLink
  title.value = newTitle
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 复制链接
const doCopy = async () => {
  try {
    await navigator.clipboard.writeText(link.value)
    message.success('复制成功')
  } catch {
    // Fallback for insecure contexts (HTTP) or older browsers
    const textarea = document.createElement('textarea')
    textarea.value = link.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      message.success('复制成功')
    } catch {
      message.error('复制失败，请手动复制链接')
    }
    document.body.removeChild(textarea)
  }
}

// 暴露函数
defineExpose({
  openModal,
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
