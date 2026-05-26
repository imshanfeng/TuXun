<template>
  <div id="addPictureBatchPage">
    <a-card title="批量创建图片" :bordered="false" class="page-card">
      <a-form :model="formData" layout="vertical" @finish="handleSubmit">
        <a-form-item label="搜索词" name="searchText" :rules="[{ required: true, message: '请输入搜索词' }]">
          <a-input v-model:value="formData.searchText" placeholder="请输入要抓取的图片关键词" size="large" />
        </a-form-item>

        <a-form-item label="抓取数量" name="count" :rules="[{ required: true, message: '请输入抓取数量' }]">
          <a-input-number
            v-model:value="formData.count"
            placeholder="请输入抓取数量"
            style="width: 100%"
            :min="1"
            :max="30"
            size="large"
          />
        </a-form-item>

        <a-form-item label="图片名称前缀" name="namePrefix">
          <a-input v-model:value="formData.namePrefix" placeholder="请输入图片名称前缀，不填默认使用搜索词" size="large" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" block size="large" :loading="loading">
            开始执行
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message, notification } from 'ant-design-vue'
import { uploadPictureByBatchUsingPost } from '@/api/pictureController'

const router = useRouter()
const loading = ref(false)

const formData = reactive<API.PictureUploadByBatchRequest>({
  searchText: '',
  count: 10,
  namePrefix: '',
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const res = await uploadPictureByBatchUsingPost(formData)
    if (res.data.code === 0 && res.data.data) {
      notification.success({
        message: '批量抓取任务完成',
        description: `成功抓取 ${res.data.data} 张图片`,
      })
      router.push('/')
    } else {
      message.error('执行失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Batch Upload Error:', error)
    message.error('请求失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
#addPictureBatchPage {
  max-width: 600px;
  margin: 0 auto;
}

.page-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
}
</style>
