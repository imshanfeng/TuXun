<template>
  <div id="myPicturePage">
    <a-flex justify="space-between" align="center" class="page-header">
      <h2 class="page-title">我的图片</h2>
      <a-space size="middle">
        <a-button type="primary" :icon="h(PlusOutlined)" @click="goAddPicture">创建图片</a-button>
      </a-space>
    </a-flex>

    <!-- 搜索栏 -->
    <div class="search-section">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="搜索我的图片..."
        enter-button="搜索"
        size="large"
        @search="doSearch"
        class="search-input"
      />
    </div>

    <!-- 图片展示 -->
    <div class="gallery-section">
      <a-list
        :grid="{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }"
        :data-source="dataList"
        :loading="loading"
        :pagination="pagination"
      >
        <template #renderItem="{ item }">
          <a-list-item style="padding: 0">
            <div class="picture-wrapper">
              <!-- 状态标签 -->
              <div class="status-tag">
                <a-tag :color="getReviewStatusColor(item.reviewStatus)">
                  {{ getReviewStatusText(item.reviewStatus) }}
                </a-tag>
              </div>

              <PictureCard :picture="item" />

              <!-- 操作栏 -->
              <div class="card-actions">
                <a-button type="link" :icon="h(EditOutlined)" @click.stop="doEdit(item)">编辑</a-button>
                <a-popconfirm
                  title="确定要删除这张图片吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="doDelete(item)"
                >
                  <a-button type="link" danger :icon="h(DeleteOutlined)">删除</a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-list-item>
        </template>
        <template #header v-if="dataList.length === 0 && !loading">
          <div class="empty-state">
            <a-empty description="您还没有上传过图片哦~" />
            <a-button type="primary" @click="goAddPicture">立即上传</a-button>
          </div>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import {
  listPictureVoByPageUsingPost,
  deletePictureUsingPost
} from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import PictureCard from '@/components/PictureCard.vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const loading = ref(true)
const dataList = ref<API.PictureVO[]>([])

// 搜索参数
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
  userId: undefined // 稍后在 onMounted 或 fetchData 中设置
})

// 分页配置
const pagination = reactive({
  onChange: (page: number) => {
    searchParams.current = page
    fetchData()
  },
  current: 1,
  pageSize: 12,
  total: 0,
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  const loginUser = loginUserStore.loginUser
  if (!loginUser || !loginUser.id) {
    loading.value = false
    return
  }

  searchParams.userId = loginUser.id

  try {
    const requestedPage = searchParams.current
    const res = await listPictureVoByPageUsingPost(searchParams)
    if (res.data.code == 0 && res.data.data) {
      dataList.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
      if (searchParams.current === requestedPage) {
        pagination.current = res.data.data.current || 1
      }
    } else {
      message.error('加载图片失败：' + res.data.message)
    }
  } catch (err) {
    message.error('网络异常，加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 跳转上传
const goAddPicture = () => {
  router.push('/add_picture')
}

// 编辑
const doEdit = (picture: API.PictureVO) => {
  router.push(`/add_picture?id=${picture.id}`)
}

// 删除
const doDelete = async (picture: API.PictureVO) => {
  try {
    const res = await deletePictureUsingPost({ id: picture.id })
    if (res.data.code == 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (err) {
    message.error('删除操作失败')
  }
}

// 审核状态映射
const getReviewStatusText = (status: number | undefined) => {
  switch (status) {
    case 0: return '待审核'
    case 1: return '已通过'
    case 2: return '已拒绝'
    default: return '未知'
  }
}

const getReviewStatusColor = (status: number | undefined) => {
  switch (status) {
    case 0: return 'orange'
    case 1: return 'green'
    case 2: return 'red'
    default: return 'default'
  }
}

onMounted(() => {
  fetchData()
})
</script>

<script lang="ts">
export default {
  name: 'MyPicturePage'
}
</script>

<style scoped>
#myPicturePage {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.search-section {
  margin-bottom: 32px;
  max-width: 600px;
}

.search-input :deep(.ant-input) {
  height: 48px;
  border-radius: 24px 0 0 24px;
  padding-left: 20px;
}

.search-input :deep(.ant-input-search-button) {
  height: 48px;
  border-radius: 0 24px 24px 0;
  width: 100px;
}

.gallery-section {
  min-height: 500px;
}

.picture-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.picture-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.card-actions {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 4px 8px;
  padding: 8px 12px 16px;
  background: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 16px;
}

@media (max-width: 768px) {
  #myPicturePage {
    padding: 8px 0 16px;
  }

  .page-header {
    align-items: flex-start !important;
    gap: 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .search-section {
    max-width: 100%;
    margin-bottom: 24px;
  }

  .search-input :deep(.ant-input),
  .search-input :deep(.ant-input-search-button) {
    height: 44px;
  }
}
</style>
