<template>
  <div id="pictureDetailPage">
    <a-card :bordered="false" class="detail-card">
      <a-row :gutter="[32, 32]">
        <!-- Image Preview -->
        <a-col :xs="24" :md="16">
          <div class="image-section">
            <a-image :src="picture.url" class="main-image" />
          </div>
        </a-col>

        <!-- Metadata Section -->
        <a-col :xs="24" :md="8">
          <div class="info-section">
            <h1 class="picture-name">{{ picture.name }}</h1>
            
            <div class="meta-item">
              <span class="label">分类：</span>
              <a-tag color="blue">{{ picture.category || '默认' }}</a-tag>
            </div>

            <div class="meta-item">
              <span class="label">标签：</span>
              <div class="tags-list">
                <a-tag v-for="tag in pictureTags" :key="tag">{{ tag }}</a-tag>
              </div>
            </div>

            <div v-if="canEdit" class="audit-section">
              <div :class="['audit-banner', `status-${picture.reviewStatus}`]">
                <div class="status-top">
                  <a-space size="small">
                    <template v-if="picture.reviewStatus === 0">
                      <ClockCircleOutlined class="status-icon" />
                      <span class="status-text">待审核</span>
                    </template>
                    <template v-else-if="picture.reviewStatus === 1">
                      <CheckCircleOutlined class="status-icon" />
                      <span class="status-text">审核通过</span>
                    </template>
                    <template v-else-if="picture.reviewStatus === 2">
                      <CloseCircleOutlined class="status-icon" />
                      <span class="status-text">审核拒绝</span>
                    </template>
                  </a-space>
                </div>
                
                <div v-if="picture.reviewStatus !== 1" class="audit-metadata">
                  <div class="metadata-list">
                    <div class="metadata-item">
                      <span class="label">审核状态：</span>
                      <span :class="`status-text-${picture.reviewStatus}`">
                        {{ PIC_REVIEW_STATUS_MAP[Number(picture.reviewStatus)] || '未知' }}
                      </span>
                    </div>
                    <div v-if="picture.reviewMessage" class="metadata-item">
                      <span class="label">审核信息：</span>
                      <span class="value">{{ picture.reviewMessage }}</span>
                    </div>
                    <div v-if="picture.reviewerId" class="metadata-item">
                      <span class="label">审核人：</span>
                      <span class="value">{{ picture.reviewerId }}</span>
                    </div>
                    <div v-if="picture.reviewTime" class="metadata-item">
                      <span class="label">审核时间：</span>
                      <span class="value">{{ dayjs(picture.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a-divider />

            <div class="technical-info">
              <div class="info-row">
                <span class="label">格式：</span>
                <span class="value">{{ picture.picFormat }}</span>
              </div>
              <div class="info-row">
                <span class="label">大小：</span>
                <span class="value">{{ formatSize(picture.picSize) }}</span>
              </div>
              <div class="info-row">
                <span class="label">分辨率：</span>
                <span class="value">{{ picture.picWidth }} x {{ picture.picHeight }}</span>
              </div>
              <div class="info-row">
                <span class="label">宽高比：</span>
                <span class="value">{{ formatScale(picture.picWidth, picture.picHeight) }}</span>
              </div>
              <div class="info-row">
                <span class="label">上传者：</span>
                <a-space size="small" v-if="picture.user">
                  <a-avatar :src="picture.user.userAvatar" size="small" />
                  <span class="username">{{ picture.user.userName }}</span>
                </a-space>
              </div>
            </div>

            <div class="actions-section">
              <a-space wrap style="width: 100%">
                <a-button type="primary" style="flex: 1" @click="doDownload">下载原图</a-button>
                <a-button style="flex: 1" @click="doShare">分享</a-button>
                <a-button style="flex: 1" @click="doSearch">以图搜图</a-button>
                <a-button
                  v-if="(picture.picWidth ?? 0) >= 512 && (picture.picHeight ?? 0) >= 512"
                  type="primary"
                  ghost
                  style="flex: 1"
                  @click="aiOutPaintingVisible = true"
                >
                  AI 扩图
                </a-button>
                <a-button
                  v-if="canEdit && picture.spaceId"
                  type="primary"
                  ghost
                  @click="collabEditVisible = true"
                >
                  协同编辑
                </a-button>
                <a-button v-if="canEdit" @click="doEdit">编辑</a-button>
                <a-button v-if="canDelete" danger @click="doDelete">删除</a-button>
              </a-space>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
    <ShareModal ref="shareModalRef" />
    <AiOutPaintingModal
      :picture="picture"
      v-model:open="aiOutPaintingVisible"
      @success="handleAiOutPaintingSuccess"
    />
    <PictureEditWebSocket
      v-model:open="collabEditVisible"
      :picture="picture"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import { getPictureVoByIdUsingGet, deletePictureUsingPost } from '@/api/pictureController'
import { formatSize, formatScale } from '@/utils'
import { PIC_REVIEW_STATUS_MAP } from '@/constants/picture'
import { SPACE_PERMISSION_ENUM } from '@/constants/space'
import ShareModal from '@/components/ShareModal.vue'
import AiOutPaintingModal from '@/components/AiOutPaintingModal.vue'
import PictureEditWebSocket from '@/components/PictureEditWebSocket.vue'

const route = useRoute()
const router = useRouter()
const id = ref(route.params.id as string)
const picture = ref<API.PictureVO>({} as API.PictureVO)

// 路由参数变化时重新加载
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      id.value = newId as string
      fetchPictureDetail()
    }
  }
)

// 解析标签（后端可能返回字符串或数组）
const pictureTags = computed(() => {
  const t = picture.value.tags
  if (Array.isArray(t)) return t
  if (typeof t === 'string') {
    try { return JSON.parse(t) } catch { return [] }
  }
  return []
})
const aiOutPaintingVisible = ref(false)
const collabEditVisible = ref(false)

// 权限判断
// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

const fetchPictureDetail = async () => {
  if (!id.value) return
  try {
    const res = await getPictureVoByIdUsingGet({ id: id.value })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取详情失败：' + res.data.message)
    }
  } catch {
    message.error('请求失败')
  }
}

const doDownload = () => {
  if (picture.value.url) {
    window.open(picture.value.url)
  }
}

const doEdit = () => {
  router.push(`/add_picture?id=${id.value}`)
}

const doSearch = () => {
  router.push({
    path: '/search_picture',
    query: {
      id: picture.value.id,
    },
  })
}

const doDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除图片「${picture.value.name || '未命名'}」吗？此操作不可恢复。`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await deletePictureUsingPost({ id: id.value })
        if (res.data.code === 0) {
          message.success('删除成功')
          router.push('/')
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch {
        message.error('删除请求失败')
      }
    },
  })
}

// 分享
const shareModalRef = ref()
const doShare = () => {
  const shareLink = window.location.href
  shareModalRef.value.openModal(shareLink, '分享图片')
}

/**
 * AI 扩图成功后的处理
 */
const handleAiOutPaintingSuccess = () => {
  fetchPictureDetail()
}

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
#pictureDetailPage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.detail-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.image-section {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.main-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.picture-name {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 24px;
}

.meta-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.label {
  color: #6b7280;
  min-width: 80px;
  font-weight: 600;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.technical-info {
  margin-bottom: 32px;
}

.info-row {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
}

.value {
  color: #374151;
  font-weight: 500;
  word-break: break-word;
}

.username {
  font-weight: 600;
  color: #1f2937;
}

.audit-section {
  margin: 16px 0 24px;
}

.audit-banner {
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #d1d5db;
  background: #f3f4f6;
}

.audit-banner.status-0 {
  background: #fffbe6;
  border-left-color: #ffe58f;
  color: #856404;
}

.audit-banner.status-1 {
  background: #f6ffed;
  border-left-color: #b7eb8f;
  color: #389e0d;
}

.audit-banner.status-2 {
  background: #fff1f0;
  border-left-color: #ffa39e;
  color: #cf1322;
}

.status-top {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.status-text {
  font-weight: 700;
  font-size: 16px;
}

.status-icon {
  font-size: 18px;
}

.audit-metadata {
  margin-top: 12px;
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
  width: 80px;
  flex-shrink: 0;
}

.metadata-item .value {
  color: #111827;
}

.status-text-0 { color: #d97706; }
.status-text-1 { color: #059669; }
.status-text-2 { color: #dc2626; }

.actions-section {
  margin-top: 40px;
}

.actions-section :deep(.ant-space) {
  display: flex;
  width: 100%;
}

.actions-section :deep(.ant-space-item) {
  flex: 1 1 160px;
}

.actions-section :deep(.ant-btn) {
  width: 100%;
}

@media (max-width: 768px) {
  #pictureDetailPage {
    padding: 8px 0 16px;
  }

  .detail-card {
    border-radius: 12px;
  }

  .image-section {
    min-height: 250px;
  }

  .picture-name {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }

  .technical-info {
    margin-bottom: 24px;
  }

  .actions-section {
    margin-top: 24px;
  }

  .label,
  .metadata-item .label {
    min-width: 64px;
    width: auto;
  }

  .metadata-item {
    flex-wrap: wrap;
    gap: 4px 8px;
  }
}
</style>
