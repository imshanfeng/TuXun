<template>
  <div class="picture-upload">
    <a-upload-dragger
      name="file"
      :multiple="false"
      :customRequest="customUpload"
      :showUploadList="false"
      class="pic-uploader"
      @change="handleChange"
    >
      <template v-if="loading">
        <p class="ant-upload-drag-icon">
          <LoadingOutlined />
        </p>
        <p class="ant-upload-text">图片上传中...</p>
      </template>
      <template v-else-if="picture && picture.url">
        <img :src="picture.thumbnailUrl || picture.url" class="preview-img" alt="preview" />
      </template>
      <template v-else>
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">支持 JPG、JPEG、PNG、WEBP、GIF、BMP，单张最大 10MB</p>
      </template>
    </a-upload-dragger>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  spaceId?: string | number
  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()

const loading = ref<boolean>(false)

/**
 * 自定义上传处理
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customUpload = async (options: any) => {
  const { file, onSuccess, onError } = options

  loading.value = true
  try {
    // 调用后端接口。如果是更新，需要传递 id
    const res = await uploadPictureUsingPost(
      {
        id: props.picture?.id,
        spaceId: props.spaceId ? String(props.spaceId) : undefined,
      },
      {},
      file as File
    )
    // 提取通用响应体类型
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseData = res.data as any

    if (responseData.code === 0 && responseData.data) {
      // 成功后把最新的图片信息传回父组件
      if (onSuccess) onSuccess(responseData.data, file)
      message.success('图片上传成功！')
      // 通知父组件
      if (props.onSuccess) {
        props.onSuccess(responseData.data)
      }
    } else {
      if (onError) onError(new Error(responseData.message || '上传失败'))
      message.error('上传失败：' + responseData.message)
    }
  } catch (error) {
    console.error('Upload Error:', error)
    if (onError) onError(error as Error)
    message.error('上传图片时发生错误，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 上传状态变化处理
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleChange = (info: any) => {
  if (info.file.status !== 'uploading') {
    // console.log(info.file, info.fileList)
  }
}
</script>

<style scoped>
.picture-upload {
  width: 100%;
}

.pic-uploader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #f7f9fc;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.pic-uploader:hover {
  border-color: #1677ff;
  background-color: rgba(22, 119, 255, 0.02);
}

.preview-img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}
</style>
