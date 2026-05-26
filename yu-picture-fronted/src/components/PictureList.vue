<template>
  <div class="picture-list">
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable class="picture-card" @click="doClickPicture(picture)">
            <template #cover>
              <a-image
                :alt="picture.name || '未命名图片'"
                :src="picture.thumbnailUrl ?? picture.url"
                style="height: 180px; object-fit: cover"
                loading="lazy"
                :preview="{
                  src: picture.url,
                }"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex wrap="wrap" gap="4">
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in (picture.tags ?? [])" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
              <a-tooltip title="分享">
                <span class="action-icon-wrapper" role="button" tabindex="0" aria-label="分享" @click="(e: any) => doShare(picture, e)" @keydown.enter="(e: any) => doShare(picture, e)">
                  <ShareAltOutlined />
                </span>
              </a-tooltip>
              <a-tooltip title="放大">
                <span class="action-icon-wrapper" role="button" tabindex="0" aria-label="以图搜图" @click="(e: any) => doSearch(picture, e)" @keydown.enter="(e: any) => doSearch(picture, e)">
                  <SearchOutlined />
                </span>
              </a-tooltip>
              <a-tooltip v-if="canEdit" title="编辑">
                <span class="action-icon-wrapper" role="button" tabindex="0" aria-label="编辑" @click="(e: any) => doEdit(picture, e)" @keydown.enter="(e: any) => doEdit(picture, e)">
                  <EditOutlined />
                </span>
              </a-tooltip>
              <a-tooltip v-if="canDelete" title="删除">
                <span class="action-icon-wrapper" role="button" tabindex="0" aria-label="删除" @click="(e: any) => doDelete(picture, e)" @keydown.enter="(e: any) => doDelete(picture, e)">
                  <DeleteOutlined />
                </span>
              </a-tooltip>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DeleteOutlined, EditOutlined, SearchOutlined, ShareAltOutlined } from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message, Modal } from 'ant-design-vue'
import ShareModal from '@/components/ShareModal.vue'
import { ref } from 'vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  canEdit?: boolean
  canDelete?: boolean
  onReload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
})

const router = useRouter()

// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 搜索
const doSearch = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  router.push({
    path: '/search_picture',
    query: {
      id: picture.id,
    },
  })
}

// 编辑
const doEdit = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除数据
const doDelete = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  const id = picture.id
  if (!id) return
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除图片「${picture.name || '未命名'}」吗？此操作不可恢复。`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await deletePictureUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          props.onReload?.()
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch {
        message.error('删除请求失败')
      }
    },
  })
}

// 分享弹窗引用
const shareModalRef = ref()

// 分享
const doShare = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  const shareLink = `${window.location.origin}/picture/${picture.id}`
  shareModalRef.value.openModal(shareLink, '分享图片')
}
</script>

<style scoped>
.picture-list {
  width: 100%;
}

.picture-card {
  overflow: hidden;
  border-radius: 14px;
}

.picture-card :deep(.ant-card-body) {
  padding: 12px;
}

.picture-card :deep(.ant-card-meta-title) {
  margin-bottom: 8px !important;
  font-size: 14px;
}

.picture-card :deep(.ant-card-actions) {
  border-top: 1px solid #f0f0f0;
}

:global(html.dark) .picture-card :deep(.ant-card-actions) {
  border-top-color: rgba(255, 255, 255, 0.08);
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

@media (max-width: 768px) {
  .picture-card :deep(.ant-image-img) {
    height: 200px !important;
  }

  .picture-card :deep(.ant-card-body) {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .picture-card :deep(.ant-image-img) {
    height: 180px !important;
  }

  .picture-card :deep(.ant-card-meta-title) {
    font-size: 15px;
  }
}
</style>
