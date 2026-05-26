<template>
  <div id="addPicturePage">
    <a-card :title="isUpdate ? '更新图片' : '创建图片'" :bordered="false" class="page-card">
      <a-row :gutter="24">
        <!-- 上传区域 -->
        <a-col :xs="24" :md="12">
          <div class="upload-container">
            <a-tabs default-active-key="file">
              <a-tab-pane key="file" tab="文件上传">
                <PictureUpload :picture="pictureVO" :spaceId="spaceId" :onSuccess="onUploadSuccess" />
              </a-tab-pane>
              <a-tab-pane key="url" tab="URL 上传">
                <UrlPictureUpload :picture="pictureVO" :spaceId="spaceId" :onSuccess="onUploadSuccess" />
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-col>

        <!-- 信息区域 -->
        <a-col :xs="24" :md="12">
          <div class="info-container" v-if="pictureVO">
            <a-form :model="pictureVO" layout="vertical">
              <a-form-item label="图片名称">
                <a-input v-model:value="pictureVO.name" placeholder="请输入图片名称" />
              </a-form-item>
              
              <a-form-item label="图片分类">
                <a-select
                  v-model:value="pictureVO.category"
                  :options="categoryOptions"
                  placeholder="请选择分类"
                  :allow-clear="true"
                />
              </a-form-item>
              
              <a-form-item label="标签">
                <a-select
                  v-model:value="pictureVO.tags"
                  mode="tags"
                  style="width: 100%"
                  placeholder="请输入或选择标签，按回车确认"
                  :options="tagOptions"
                  :allow-clear="true"
                  :show-arrow="true"
                />
              </a-form-item>

              <a-form-item label="简介">
                <a-textarea v-model:value="pictureVO.introduction" :rows="4" />
              </a-form-item>

              <template v-if="pictureVO.picWidth">
                <a-form-item label="图片信息">
                  <div class="metadata-list">
                    <div class="metadata-item"><span class="label">大小:</span> {{ formatSize(pictureVO.picSize) }}</div>
                    <div class="metadata-item"><span class="label">分辨率:</span> {{ pictureVO.picWidth }}x{{ pictureVO.picHeight }}</div>
                    <div class="metadata-item"><span class="label">宽高比:</span> {{ formatScale(pictureVO.picWidth, pictureVO.picHeight) }}</div>
                    <div class="metadata-item"><span class="label">格式:</span> {{ pictureVO.picFormat }}</div>
                  </div>
                </a-form-item>
              </template>

              <template v-if="isUpdate">
                <a-form-item label="审核信息">
                  <a-alert
                    :type="pictureVO.reviewStatus == 1 ? 'success' : pictureVO.reviewStatus == 2 ? 'error' : 'warning'"
                    show-icon
                    class="audit-alert"
                  >
                    <template #message>
                      <span class="audit-title">
                        {{ PIC_REVIEW_STATUS_MAP[Number(pictureVO.reviewStatus)] || '未知' }}
                      </span>
                    </template>
                    <template #description>
                      <div class="audit-desc-list">
                        <div v-if="pictureVO.reviewMessage" class="audit-desc-item">
                          <span class="label">审核信息:</span>
                          <span class="value">{{ pictureVO.reviewMessage }}</span>
                        </div>
                        <div v-if="pictureVO.reviewerId" class="audit-desc-item">
                          <span class="label">审核人:</span>
                          <span class="value">{{ pictureVO.reviewerId }}</span>
                        </div>
                        <div v-if="pictureVO.reviewTime" class="audit-desc-item">
                          <span class="label">审核时间:</span>
                          <span class="value">{{ dayjs(pictureVO.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                        </div>
                      </div>
                    </template>
                  </a-alert>
                </a-form-item>
              </template>

              <a-form-item>
                <a-space direction="vertical" style="width: 100%">
                  <a-button type="primary" block size="large" @click="handleUpdatePicture">
                    {{ isUpdate ? '更新信息' : '创建图片' }}
                  </a-button>
                  <a-button v-if="pictureVO.id" block size="large" @click="cropperVisible = true">
                    编辑图片
                  </a-button>
                  <a-button
                    v-if="pictureVO.id && (pictureVO.picWidth ?? 0) >= 512 && (pictureVO.picHeight ?? 0) >= 512"
                    type="primary"
                    ghost
                    block
                    size="large"
                    @click="aiOutPaintingVisible = true"
                  >
                    AI 扩图
                  </a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </div>
          <div v-else class="empty-info">
            <a-empty description="请先上传图片获取信息" />
          </div>
        </a-col>
      </a-row>
      <!-- 批量上传入口（仅管理员可见） -->
      <div class="batch-upload-entry" v-if="loginUserStore.loginUser?.userRole === 'admin'">
        <a-button type="link" @click="() => router.push('/add_picture/batch')">
          批量抓取图片 >
        </a-button>
      </div>
    </a-card>
    <ImageCropper
      v-if="pictureVO"
      v-model:open="cropperVisible"
      :imageUrl="pictureVO.url"
      @confirm="handleCropConfirm"
    />
    <AiOutPaintingModal
      v-if="pictureVO"
      v-model:open="aiOutPaintingVisible"
      :picture="pictureVO"
      @success="handleAiOutPaintingSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { editPictureUsingPost, listPictureTagCategoryUsingGet, getPictureVoByIdUsingGet, uploadPictureUsingPost } from '@/api/pictureController'
import PictureUpload from '@/components/PictureUpload.vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import AiOutPaintingModal from '@/components/AiOutPaintingModal.vue'
import { formatSize, formatScale } from '@/utils'
import { PIC_REVIEW_STATUS_MAP } from '@/constants/picture'

const router = useRouter()
const route = useRoute()

import { useLoginUserStore } from '@/stores/useLoginUserStore'
const loginUserStore = useLoginUserStore()

const pictureVO = ref<API.PictureVO | undefined>(undefined)
const cropperVisible = ref(false)
const aiOutPaintingVisible = ref(false)

const isUpdate = computed(() => !!route.query.id || !!pictureVO.value?.id)
const spaceId = computed(() => {
  return route.query.spaceId as string | undefined
})

const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code == 0 && res.data.data) {
      categoryOptions.value = (res.data.data.categoryList ?? []).map((item: string) => ({
        value: item,
        label: item,
      }))
      tagOptions.value = (res.data.data.tagList ?? []).map((item: string) => ({
        value: item,
        label: item,
      }))
    } else {
      message.error('获取标签分类失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Fetch TagCategory Error:', error)
    message.error('获取标签分类请求失败')
  }
}

onMounted(() => {
  getTagCategoryOptions()
  getOldPicture()
})

const getOldPicture = async () => {
  // 获取要修改的图片 id
  const id = route.query.id
  if (id) {
    try {
      // 避免 js number 精度丢失
      const res = await getPictureVoByIdUsingGet({ id: id as string })
      if (res.data.code == 0 && res.data.data) {
        // 让 pictureVO 的 tags 转为数组（防止后端返回字符串）
        const data = res.data.data
        if (data.tags && typeof data.tags === 'string') {
          try {
            data.tags = JSON.parse(data.tags)
          } catch {
            data.tags = []
          }
        }
        pictureVO.value = data
      }
    } catch (error) {
      console.error('Fetch old picture error:', error)
      message.error('获取图片信息失败，请刷新重试')
    }
  }
}

/**
 * 接受组件上传成功的回调
 */
const onUploadSuccess = (newPicture: API.PictureVO) => {
  pictureVO.value = newPicture
}

/**
 * 提交/更新图片信息
 */
const handleUpdatePicture = async () => {
  if (!pictureVO.value) {
    message.warning('请先成功上传一份图片或等待数据加载！')
    return
  }

  try {
    const editReq: API.PictureEditRequest = {
      id: pictureVO.value.id,
      name: pictureVO.value.name,
      category: pictureVO.value.category,
      tags: pictureVO.value.tags,
      introduction: pictureVO.value.introduction,
    }
    
    const res = await editPictureUsingPost(editReq)
    if (res.data.code == 0) {
      message.success('图片信息保存成功！')
      if (spaceId.value) {
        router.push({
          path: `/space/${spaceId.value}`,
        })
      } else {
        router.push({
          path: '/',
        })
      }
    } else {
      message.error('信息保存失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Update Form Error:', error)
    message.error('请求失败了，请稍后重试')
  }
}

/**
 * 编辑图片成功后的处理
 */
const handleCropConfirm = async (blob: Blob) => {
  if (!pictureVO.value?.id) {
    message.error('无法编辑：图片 ID 不存在')
    return
  }
  try {
    const fileName = (pictureVO.value.name || 'image') + '.webp'
    const file = new File([blob], fileName, { type: 'image/webp' })
    const res = (await uploadPictureUsingPost(
      {
        id: pictureVO.value.id,
        spaceId: spaceId.value,
      },
      {},
      file
    )) as unknown as { data: API.BaseResponsePictureVO_ }
    if (res.data.code === 0 && res.data.data) {
      pictureVO.value = res.data.data
      message.success('图片编辑成功！')
    } else {
      message.error('图片编辑失败：' + res.data.message)
    }
  } catch (err) {
    console.error('Crop Confirm Error:', err)
    message.error('上传编辑后的图片失败')
  }
}

/**
 * AI 扩图成功后的处理
 */
const handleAiOutPaintingSuccess = (newUrl: string) => {
  if (!pictureVO.value) return
  pictureVO.value.url = newUrl
  message.success('AI 扩图成功，请记得保存信息！')
}
</script>

<style scoped>
#addPicturePage {
  max-width: 1200px;
  margin: 0 auto;
}

.page-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}

.upload-container {
  height: 100%;
}

.audit-alert {
  border-radius: 8px;
}

.audit-title {
  font-weight: 600;
}

.audit-desc-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audit-desc-item {
  font-size: 13px;
  line-height: 1.4;
  display: flex;
}

.audit-desc-item .label {
  width: 70px;
  flex-shrink: 0;
  opacity: 0.7;
}

.audit-desc-item .value {
  color: rgba(0, 0, 0, 0.85);
}

.metadata-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metadata-item {
  font-size: 14px;
  line-height: 1.4;
  display: flex;
}

.metadata-item .label {
  color: #6b7280;
  width: 70px;
  flex-shrink: 0;
}

.metadata-item .value {
  color: #111827;
}

.batch-upload-entry {
  margin-top: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .page-card :deep(.ant-card-body) {
    padding: 16px;
  }
}
</style>
