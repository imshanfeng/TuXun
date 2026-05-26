<template>
  <div class="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px">
      <a-input
        v-model:value="fileUrl"
        placeholder="请输入图片 URL（支持 JPG、PNG、WEBP、GIF、BMP，最大 10MB）"
        style="width: calc(100% - 80px)"
        :disabled="loading"
        @pressEnter="handleUpload"
      />
      <a-button type="primary" :loading="loading" style="width: 80px" @click="handleUpload">
        上传
      </a-button>
    </a-input-group>
    <div class="img-wrapper">
      <template v-if="loading">
        <div class="loading-container">
          <LoadingOutlined />
          <p>正在抓取图片...</p>
        </div>
      </template>
      <img v-else-if="picture?.url" :src="picture.thumbnailUrl || picture.url" class="preview-img" alt="preview" />
      <div v-else class="empty-preview">
        <GlobalOutlined />
        <p>输入 URL 后预览</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { LoadingOutlined, GlobalOutlined } from '@ant-design/icons-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  spaceId?: string | number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const fileUrl = ref<string>('')
const loading = ref<boolean>(false)

/**
 * 上传图片
 */
const handleUpload = async () => {
  if (!fileUrl.value) {
    message.warning('请输入图片 URL')
    return
  }
  loading.value = true
  try {
    const res = await uploadPictureByUrlUsingPost({
      fileUrl: fileUrl.value,
      id: props.picture?.id,
      spaceId: props.spaceId ? String(props.spaceId) : undefined,
    })
    if (res.data.code === 0 && res.data.data) {
      fileUrl.value = '' // 清空输入
      message.success('图片上传成功')
      if (props.onSuccess) {
        props.onSuccess(res.data.data)
      }
    } else {
      message.error('上传失败：' + res.data.message)
    }
  } catch (error) {
    console.error('URL Upload Error:', error)
    message.error('上传图片失败，请检查 URL 是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.url-picture-upload {
  width: 100%;
}

.img-wrapper {
  min-height: 400px;
  background-color: #f7f9fc;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.preview-img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.loading-container,
.empty-preview {
  text-align: center;
  color: #8c8c8c;
}

.loading-container .anticon,
.empty-preview .anticon {
  font-size: 32px;
  margin-bottom: 12px;
}
</style>
