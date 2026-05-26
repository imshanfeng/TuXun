<template>
  <a-modal
    :open="open"
    title="批量编辑图片"
    :footer="null"
    @cancel="handleCancel"
  >
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="只对当前页面的图片生效" class="info-text" />
      
      <a-form-item label="分类">
        <a-select 
          v-model:value="formData.category" 
          placeholder="请输入分类" 
          :options="categoryOptions"
          allow-clear 
        />
      </a-form-item>

      <a-form-item label="标签">
        <a-select
          v-model:value="formData.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allow-clear
        />
      </a-form-item>

      <a-form-item label="命名规则">
        <a-input 
          v-model:value="formData.nameRule" 
          placeholder="请输入命名规则，输入 {{序号}} 可动态生成" 
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" block :loading="loading">提交</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { 
  editPictureByBatchUsingPost, 
  listPictureTagCategoryUsingGet 
} from '@/api/pictureController'

interface Props {
  open: boolean
  pictureList: API.PictureVO[]
  spaceId: string
  onSuccess?: () => void
}

const props = defineProps<Props>()
const emit = defineEmits(['update:open'])

const loading = ref(false)
const formData = reactive({
  category: '',
  tags: [] as string[],
  nameRule: '',
})

// 分类和标签选项
const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

/**
 * 获取标签和分类选项
 */
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      categoryOptions.value = (res.data.data.categoryList ?? []).map((item: string) => ({
        value: item,
        label: item,
      }))
      tagOptions.value = (res.data.data.tagList ?? []).map((item: string) => ({
        value: item,
        label: item,
      }))
    }
  } catch (error) {
    console.error('获取标签分类失败', error)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const handleCancel = () => {
  emit('update:open', false)
}

const handleSubmit = async () => {
  if (!props.pictureList || props.pictureList.length === 0) {
    message.error('当前页面没有可编辑的图片')
    return
  }
  
  loading.value = true
  try {
    const res = await editPictureByBatchUsingPost({
      pictureIdList: props.pictureList.map((p) => p.id as string),
      spaceId: props.spaceId,
      ...formData,
    })
    
    if (res.data.code === 0) {
      message.success('批量编辑成功')
      handleCancel()
      if (props.onSuccess) {
        props.onSuccess()
      }
    } else {
      message.error('批量编辑失败：' + res.data.message)
    }
  } catch {
    message.error('操作失败')
  } finally {
    loading.value = false
  }
}

// Reset form when modal opens
watch(() => props.open, (newVal) => {
  if (newVal) {
    formData.category = ''
    formData.tags = []
    formData.nameRule = ''
  }
})
</script>

<style scoped>
.info-text :deep(.ant-form-item-label) {
  color: #8c8c8c;
  font-size: 12px;
}
</style>
