<template>
  <div class="picture-card">
    <a-card hoverable class="card-outer" @click="handleCardClick">
      <template #cover>
        <div class="image-wrapper">
          <img :alt="picture.name || '未命名图片'" :src="picture.thumbnailUrl || picture.url" class="card-image" loading="lazy" width="400" height="240" />
          <div class="image-overlay">
            <div class="view-btn">查看详情</div>
          </div>
        </div>
      </template>
      <a-card-meta :title="picture.name" class="card-meta">
        <template #description>
          <div class="card-description">
            <a-tag color="blue" class="category-tag">{{ picture.category || '默认' }}</a-tag>
            <div class="card-tags">
              <a-tag v-for="tag in currentTags" :key="tag" size="small">{{ tag }}</a-tag>
            </div>
          </div>
        </template>
      </a-card-meta>
      <template #actions>
        <a-tooltip title="分享">
          <span class="action-icon-wrapper" role="button" tabindex="0" aria-label="分享图片" @click="doShare" @keydown.enter="doShare">
            <ShareAltOutlined />
          </span>
        </a-tooltip>
        <a-tooltip title="以图搜图">
          <span class="action-icon-wrapper" role="button" tabindex="0" aria-label="以图搜图" @click="doSearch" @keydown.enter="doSearch">
            <SearchOutlined />
          </span>
        </a-tooltip>
      </template>
    </a-card>
    <ShareModal ref="shareModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import ShareModal from '@/components/ShareModal.vue'

const props = defineProps<{
  picture: API.PictureVO
}>()

const router = useRouter()

const currentTags = computed(() => {
  const t = props.picture.tags
  if (Array.isArray(t)) return t
  if (typeof t === 'string') {
    try { return JSON.parse(t) } catch { return [] }
  }
  return []
})

const handleCardClick = () => {
  router.push(`/picture/${props.picture.id}`)
}

// 分享
const shareModalRef = ref()
const doShare = (e: Event) => {
  e.stopPropagation()
  const shareLink = `${window.location.origin}/picture/${props.picture.id}`
  shareModalRef.value.openModal(shareLink, '分享图片')
}

// 搜索
const doSearch = (e: Event) => {
  e.stopPropagation()
  router.push({
    path: '/search_picture',
    query: {
      id: props.picture.id,
    },
  })
}
</script>

<style scoped>
.picture-card {
  margin-bottom: 24px;
  transition: transform 0.3s ease;
}

.picture-card:hover {
  transform: translateY(-8px);
}

.card-outer {
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

:global(html.dark) .card-outer {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: rgba(30, 30, 30, 0.8);
}

.action-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.action-icon-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

:global(html.dark) .action-icon-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.action-icon-wrapper:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.image-wrapper {
  position: relative;
  height: 240px;
  overflow: hidden;
  background: #f0f2f5;
}

:global(html.dark) .image-wrapper {
  background: #1e293b;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.picture-card:hover .card-image {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.picture-card:hover .image-overlay {
  opacity: 1;
}

.view-btn {
  color: white;
  border: 1px solid white;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.1);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.card-meta {
  padding: 16px;
}

:deep(.ant-card-meta-title) {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(html.dark) :deep(.ant-card-meta-title) {
  color: #e2e8f0;
}

.card-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* 固定描述区域高度，确保对齐 */
  height: 64px;
}

.category-tag {
  align-self: flex-start;
  margin: 0;
  border-radius: 4px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  /* 限制标签区域高度，防止撑开卡片 */
  height: 24px;
  overflow: hidden;
}

:deep(.ant-tag-small) {
  font-size: 12px;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .picture-card {
    transition: none;
  }

  .picture-card:hover {
    transform: none;
  }

  .card-image {
    transition: none;
  }

  .picture-card:hover .card-image {
    transform: none;
  }

  .image-overlay {
    transition: none;
  }
}

@media (hover: none) {
  .picture-card:hover {
    transform: none;
  }

  .picture-card:hover .card-image {
    transform: none;
  }

  .image-overlay {
    opacity: 1;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.04));
    align-items: flex-end;
    justify-content: flex-start;
    padding: 14px;
  }

  .view-btn {
    padding: 8px 16px;
    font-size: 13px;
    min-height: 44px;
  }
}

@media (max-width: 768px) {
  .picture-card {
    margin-bottom: 16px;
  }

  .card-outer {
    border-radius: 14px;
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
  }

  .image-wrapper {
    height: 220px;
  }

  .card-meta {
    padding: 12px;
  }

  :deep(.ant-card-actions > li) {
    margin: 8px 0;
  }
}

@media (max-width: 480px) {
  .image-wrapper {
    height: 200px;
  }

  .card-meta {
    padding: 10px;
  }

  :deep(.ant-card-meta-title) {
    font-size: 15px;
  }

  .card-description {
    height: auto;
    min-height: 52px;
  }

  .card-tags {
    height: auto;
    max-height: 44px;
  }
}
</style>
