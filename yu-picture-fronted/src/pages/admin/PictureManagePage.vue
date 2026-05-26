<template>
  <div id="pictureManagePage">
    <a-card title="图片管理" :bordered="false" class="page-card">
      <template #extra>
        <a-button type="primary" shape="round" @click="fetchData">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </template>

      <!-- Search Form -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
        <a-form-item label="关键词">
          <a-input v-model:value="searchParams.name" placeholder="从名称和简介搜索" allow-clear />
        </a-form-item>
        <a-form-item label="类型">
          <a-select
            v-model:value="searchParams.category"
            placeholder="请选择类型"
            allow-clear
            style="min-width: 120px"
            :options="categoryOptions"
          />
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            v-model:value="searchParams.tags"
            mode="tags"
            placeholder="请输入标签"
            allow-clear
            style="min-width: 150px"
            :options="tagOptions"
            :show-arrow="true"
          />
        </a-form-item>
        <a-form-item label="审核状态">
          <a-select v-model:value="searchParams.reviewStatus" placeholder="请选择审核状态" allow-clear style="width: 150px">
            <a-select-option :value="0">待审核</a-select-option>
            <a-select-option :value="1">通过</a-select-option>
            <a-select-option :value="2">拒绝</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="resetSearch">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- Data Table -->
      <a-table
        :columns="columns"
        :data-source="dataList"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
        size="small"
        bordered
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'url'">
            <a-image
              v-if="record.url"
              :alt="record.name || '图片'"
              :src="record.thumbnailUrl || record.url"
              :width="80"
              :height="80"
              style="object-fit: cover; border-radius: 4px;"
            />
          </template>

          <template v-else-if="column.dataIndex === 'tags'">
            <a-tag v-for="tag in getTags(record.tags)" :key="tag" color="blue" style="margin-bottom: 4px;">
              {{ tag }}
            </a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'picInfo'">
            <div class="metadata-list">
              <div class="metadata-item"><span class="label">格式:</span> {{ record.picFormat }}</div>
              <div class="metadata-item"><span class="label">宽度:</span> {{ record.picWidth }}</div>
              <div class="metadata-item"><span class="label">高度:</span> {{ record.picHeight }}</div>
              <div class="metadata-item"><span class="label">宽高比:</span> {{ formatScale(record.picWidth, record.picHeight) }}</div>
              <div class="metadata-item"><span class="label">大小:</span> {{ formatSize(record.picSize) }}</div>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'reviewInfo'">
            <div class="metadata-list">
              <div class="metadata-item">
                <span class="label">审核状态:</span>
                <span :class="`status-text-${record.reviewStatus}`">
                  {{ PIC_REVIEW_STATUS_MAP[Number(record.reviewStatus)] || '未知' }}
                </span>
              </div>
              <div class="metadata-item"><span class="label">审核信息:</span> {{ record.reviewMessage || '-' }}</div>
              <div v-if="record.reviewerId" class="metadata-item"><span class="label">审核人:</span> {{ record.reviewerId }}</div>
              <div v-if="record.reviewTime" class="metadata-item">
                <div class="label">审核时间:</div>
                <div>{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'createTime'">
            {{ record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>

          <template v-else-if="column.dataIndex === 'editTime'">
            {{ record.editTime ? dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space :size="4">
              <a-button
                type="link"
                size="small"
                @click="handleReview(record)"
              >
                审核
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="router.push(`/add_picture?id=${record.id}`)"
              >
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除该图片吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="doDelete(record.id)"
              >
                <a-button type="link" danger size="small">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- Review Modal -->
      <a-modal
        v-model:open="reviewVisible"
        title="图片审核"
        @ok="handleReviewOk"
        @cancel="handleReviewCancel"
        :confirm-loading="reviewLoading"
      >
        <a-form :model="reviewForm" layout="vertical">
          <a-form-item label="审核状态" name="reviewStatus">
            <a-radio-group v-model:value="reviewForm.reviewStatus">
              <a-radio :value="1">通过</a-radio>
              <a-radio :value="2">拒绝</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="审核信息" name="reviewMessage">
            <a-textarea
              v-model:value="reviewForm.reviewMessage"
              placeholder="请输入审核信息"
              :rows="4"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import type { TablePaginationConfig } from 'ant-design-vue'
import {
  listPictureByPageUsingPost,
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { formatSize, formatScale } from '@/utils'
import { PIC_REVIEW_STATUS_MAP } from '@/constants/picture'

const router = useRouter()

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 110,
    sorter: true,
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 100,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 100,
    ellipsis: true,
    sorter: true,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: 120,
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'category',
    width: 80,
    sorter: true,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 100,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 110,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewInfo',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 140,
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 120,
  },
]


// Data references
const dataList = ref<API.Picture[]>([])
const loading = ref(true)

// 标签/分类可选项
const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

// 获取标签/分类选项
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      categoryOptions.value = (res.data.data.categoryList || []).map((category: string) => ({
        value: category,
        label: category,
      }))
      tagOptions.value = (res.data.data.tagList || []).map((tag: string) => ({
        value: tag,
        label: tag,
      }))
    }
  } catch {
    message.error('获取标签分类请求失败')
  }
}

// Search parameters
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
})

// 解析标签
const getTags = (tags: any): string[] => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const requestedPage = searchParams.current
    const res = await listPictureByPageUsingPost(searchParams)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
      if (searchParams.current === requestedPage) {
        pagination.current = res.data.data.current || 1
      }
    } else {
      message.error('获取图片列表失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Fetch pictures error:', error)
    message.error('请求失败了，请稍后重试')
  } finally {
    loading.value = false
  }
}

// Search
const doSearch = () => {
  searchParams.current = 1
  pagination.current = 1
  fetchData()
}

// Reset Search
const resetSearch = () => {
  searchParams.name = undefined
  searchParams.category = undefined
  searchParams.reviewStatus = undefined
  searchParams.tags = undefined
  searchParams.current = 1
  pagination.current = 1
  fetchData()
}

// Table Change (Pagination & Sorting)
const handleTableChange = (pag: TablePaginationConfig, _filters: any, sorter: any) => {
  searchParams.current = pag.current
  searchParams.pageSize = pag.pageSize
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  
  if (sorter && sorter.field) {
    searchParams.sortField = sorter.field
    searchParams.sortOrder = (sorter.order as string) === 'ascend' ? 'ascend' : 'descend'
  }
  
  fetchData()
}

// Review Modal State
const reviewVisible = ref(false)
const reviewLoading = ref(false)
const reviewForm = reactive<API.PictureReviewRequest>({
  id: undefined,
  reviewStatus: 1,
  reviewMessage: '',
})

// Review Picture (open modal)
const handleReview = (record: API.Picture) => {
  reviewForm.id = record.id
  reviewForm.reviewStatus = record.reviewStatus === 0 ? 1 : record.reviewStatus
  reviewForm.reviewMessage = record.reviewMessage || ''
  reviewVisible.value = true
}

const handleReviewCancel = () => {
  reviewVisible.value = false
}

const handleReviewOk = async () => {
  if (!reviewForm.id) return
  reviewLoading.value = true
  try {
    const res = await doPictureReviewUsingPost(reviewForm)
    if (res.data.code === 0) {
      message.success('审核操作成功')
      reviewVisible.value = false
      fetchData()
    } else {
      message.error('审核操作失败：' + res.data.message)
    }
  } catch {
    message.error('审核请求失败')
  } finally {
    reviewLoading.value = false
  }
}

// Delete Picture
const doDelete = async (id: number) => {
  try {
    const res = await deletePictureUsingPost({ id: String(id) })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch {
    message.error('删除请求失败')
  }
}

onMounted(() => {
  fetchData()
  getTagCategoryOptions()
})
</script>

<style scoped>
#pictureManagePage {
  max-width: 1200px;
  margin: 0 auto;
}

.page-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:global(html.dark) .page-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.search-form {
  margin-bottom: 24px;
}

.metadata-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.metadata-item {
  line-height: 1.4;
  color: #595959;
}

:global(html.dark) .metadata-item {
  color: #b0b0b0;
}

.metadata-item .label {
  color: #8c8c8c;
  margin-right: 4px;
}

:global(html.dark) .metadata-item .label {
  color: #7a7a7a;
}

.status-text-0 {
  color: #faad14;
}

.status-text-1 {
  color: #52c41a;
}

:global(html.dark) .status-text-1 {
  color: #73d13d;
}

.status-text-2 {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  #pictureManagePage {
    max-width: 100%;
  }

  .search-form {
    margin-bottom: 16px;
  }

  .search-form :deep(.ant-form-item) {
    margin-bottom: 12px;
    width: 100%;
  }

  .search-form :deep(.ant-form-item-control) {
    width: 100%;
  }

  .search-form :deep(.ant-input),
  .search-form :deep(.ant-select) {
    width: 100% !important;
    min-width: unset !important;
  }

  .search-form :deep(.ant-form-item-label) {
    text-align: left;
    padding-bottom: 4px;
  }

  :deep(.ant-table) {
    font-size: 12px;
  }

  :deep(.ant-table-cell) {
    padding: 8px 4px !important;
  }

  .metadata-list {
    font-size: 11px;
  }
}
</style>
