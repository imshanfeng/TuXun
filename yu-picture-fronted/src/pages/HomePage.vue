<template>
  <div id="homePage">
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">发现与分享<br/><span class="highlight">绝美图像</span></h1>
        <p class="hero-subtitle">在这里，数以万计的创意图片等你探索。高质量、免版税，激发你的无限灵感。</p>

        <div class="search-bar">
          <a-input-search
            v-model:value="searchParams.searchText"
            placeholder="搜索你感兴趣的图片..."
            enter-button="搜索"
            size="large"
            aria-label="搜索图片"
            @search="doSearch"
            class="hero-search"
          />
        </div>
      </div>
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
    </div>

    <div class="filter-section">
      <div class="category-filters" role="radiogroup" aria-label="图片分类">
        <div
          class="category-item"
          :class="{ active: searchParams.category === 'all' }"
          tabindex="0"
          role="radio"
          :aria-checked="searchParams.category === 'all'"
          @click="() => { searchParams.category = 'all'; doSearch(); }"
          @keydown.enter="() => { searchParams.category = 'all'; doSearch(); }"
        >
          全部
        </div>
        <div
          v-for="cat in categoryList"
          :key="cat"
          class="category-item"
          :class="{ active: searchParams.category === cat }"
          tabindex="0"
          role="radio"
          :aria-checked="searchParams.category === cat"
          @click="() => { searchParams.category = cat; doSearch(); }"
          @keydown.enter="() => { searchParams.category = cat; doSearch(); }"
        >
          {{ cat }}
        </div>
      </div>

      <div class="tag-filters">
        <a-space wrap size="middle">
          <a-checkable-tag
            v-for="tag in tagList"
            :key="tag"
            :checked="searchParams.tags?.includes(tag)"
            class="custom-tag"
            @change="(checked: boolean) => handleTagChange(tag, checked)"
          >
            # {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <div class="gallery-container">
      <!-- Skeleton loading -->
      <div v-if="loading && dataList.length === 0" class="skeleton-grid" aria-label="加载中">
        <div v-for="i in 12" :key="i" class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-text">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
          </div>
        </div>
      </div>

      <a-list v-else
        :grid="{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }"
        :data-source="dataList"
        :loading="loading"
        :pagination="pagination"
      >
        <template #renderItem="{ item }">
          <a-list-item style="padding: 0">
            <PictureCard :picture="item" />
          </a-list-item>
        </template>
        <template #header v-if="dataList.length === 0 && !loading">
          <a-empty description="暂无符合条件的图片">
            <a-button type="primary" @click="resetFilters">清除筛选条件</a-button>
          </a-empty>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  listPictureVoByPageUsingPost,
  listPictureTagCategoryUsingGet
} from '@/api/pictureController'
import PictureCard from '@/components/PictureCard.vue'

const loading = ref(true)
const dataList = ref<API.PictureVO[]>([])
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
  category: 'all',
  tags: []
})

const pagination = reactive({
  onChange: (page: number) => {
    searchParams.current = page
    fetchData()
  },
  current: 1,
  pageSize: 12,
  total: 0,
})

const fetchData = async () => {
  loading.value = true
  const params = { ...searchParams }
  if (params.category === 'all') {
    params.category = undefined
  }

  try {
    const requestedPage = params.current
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.code == 0 && res.data.data) {
      dataList.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
      // Only update pagination.current if user hasn't navigated to another page
      if (searchParams.current === requestedPage) {
        pagination.current = res.data.data.current || 1
      }
    } else {
      message.error('加载图片失败：' + res.data.message)
    }
  } catch (err) {
    console.error('fetchData error:', err)
    message.error('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleTagChange = (tag: string, checked: boolean) => {
  if (checked) {
    searchParams.tags = [...(searchParams.tags || []), tag]
  } else {
    searchParams.tags = searchParams.tags?.filter((t) => t !== tag)
  }
  doSearch()
}

const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code == 0 && res.data.data) {
      categoryList.value = res.data.data.categoryList || []
      tagList.value = res.data.data.tagList || []
    }
  } catch (err) {
    console.error('Fetch options error:', err)
  }
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const resetFilters = () => {
  searchParams.searchText = ''
  searchParams.category = 'all'
  searchParams.tags = []
  doSearch()
}

onMounted(() => {
  fetchData()
  getTagCategoryOptions()
})
</script>

<style scoped>
#homePage {
  --hero-title-color: #1f2937;
  --hero-subtitle-color: #64748b;
  --category-text: #64748b;
  --category-bg: rgba(255, 255, 255, 0.5);
  --category-hover-color: #1677ff;
  --category-hover-bg: rgba(22, 119, 255, 0.05);
  --category-active-text: #fff;
  --category-active-bg: #1677ff;
  --tag-bg: rgba(255, 255, 255, 0.3);
  --tag-border: rgba(255, 255, 255, 0.5);
  --tag-text: #64748b;
  --tag-item-border: rgba(0, 0, 0, 0.05);
  --tag-item-hover-border: #1677ff;
  --tag-item-hover-color: #1677ff;
  --tag-item-active-bg: rgba(22, 119, 255, 0.08);
  --tag-item-active-border: #1677ff;
  --tag-item-active-color: #1677ff;
  --search-bg: rgba(255, 255, 255, 0.95);
  --search-border: rgba(0, 0, 0, 0.1);
  --skeleton-bg: #f0f0f0;
  --skeleton-shine: #e0e0e0;

  min-height: calc(100vh - 150px);
  border-radius: 20px;
  overflow-x: hidden;
}

:global(html.dark) #homePage {
  --hero-title-color: #f1f5f9;
  --hero-subtitle-color: #94a3b8;
  --category-text: #94a3b8;
  --category-bg: rgba(255, 255, 255, 0.06);
  --category-hover-color: #60a5fa;
  --category-hover-bg: rgba(96, 165, 250, 0.1);
  --category-active-text: #fff;
  --category-active-bg: #2563eb;
  --tag-bg: rgba(255, 255, 255, 0.04);
  --tag-border: rgba(255, 255, 255, 0.08);
  --tag-text: #94a3b8;
  --tag-item-border: rgba(255, 255, 255, 0.08);
  --tag-item-hover-border: #60a5fa;
  --tag-item-hover-color: #60a5fa;
  --tag-item-active-bg: rgba(37, 99, 235, 0.15);
  --tag-item-active-border: #2563eb;
  --tag-item-active-color: #60a5fa;
  --search-bg: rgba(255, 255, 255, 0.08);
  --search-border: rgba(255, 255, 255, 0.12);
  --skeleton-bg: #1e293b;
  --skeleton-shine: #334155;
}

.hero {
  position: relative;
  width: 100%;
  text-align: center;
  padding: 80px 20px;
  background: transparent;
  overflow: hidden;
  margin-bottom: 24px;
}

.hero-content {
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--hero-title-color);
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.highlight {
  background: linear-gradient(120deg, #1677ff 0%, #eb2f96 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--hero-subtitle-color);
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.search-bar {
  max-width: 620px;
  margin: 0 auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
}

.hero-search :deep(.ant-input) {
  height: 56px;
  border-radius: 28px 0 0 28px;
  padding-left: 28px;
  font-size: 1.1rem;
  border: 1px solid var(--search-border);
  background: var(--search-bg);
  backdrop-filter: blur(10px);
}

.hero-search :deep(.ant-input-search-button) {
  height: 56px;
  border-radius: 0 28px 28px 0;
  width: 110px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: none;
}

.filter-section {
  max-width: 1440px;
  margin: 0 auto 40px;
  padding: 0 24px;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.category-item {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--category-text);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--category-bg);
  border: 1px solid transparent;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.category-item:hover {
  color: var(--category-hover-color);
  background: var(--category-hover-bg);
  transform: translateY(-2px);
}

.category-item:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.category-item.active {
  color: var(--category-active-text);
  background: var(--category-active-bg);
  box-shadow: 0 10px 15px -3px rgba(22, 119, 255, 0.3);
  transform: translateY(-2px);
}

.tag-filters {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-radius: 24px;
  background: var(--tag-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--tag-border);
}

.custom-tag {
  font-size: 0.95rem !important;
  color: var(--tag-text) !important;
  background: transparent !important;
  border: 1px solid var(--tag-item-border) !important;
  padding: 8px 16px !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.custom-tag:hover {
  border-color: var(--tag-item-hover-border) !important;
  color: var(--tag-item-hover-color) !important;
}

.custom-tag.ant-tag-checkable-checked {
  color: var(--tag-item-active-color) !important;
  background: var(--tag-item-active-bg) !important;
  border-color: var(--tag-item-active-border) !important;
  font-weight: 600;
}

.gallery-container {
  padding: 0 24px 80px;
  max-width: 1440px;
  margin: 0 auto;
}

/* Skeleton loading */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.skeleton-card {
  border-radius: 16px;
  overflow: hidden;
  background: var(--skeleton-bg);
}

.skeleton-image {
  height: 240px;
  background: linear-gradient(90deg, var(--skeleton-bg) 25%, var(--skeleton-shine) 50%, var(--skeleton-bg) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  padding: 16px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--skeleton-bg) 25%, var(--skeleton-shine) 50%, var(--skeleton-bg) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 10px;
}

.skeleton-line:last-child {
  width: 60%;
  margin-bottom: 0;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.hero-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 10s infinite ease-in-out alternate;
}

.orb-1 {
  width: 400px; height: 400px;
  background: rgba(22, 119, 255, 0.2);
  top: -100px; left: -100px;
}

.orb-2 {
  width: 500px; height: 500px;
  background: rgba(235, 47, 150, 0.15);
  bottom: -150px; right: -100px;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .orb { animation: none; }
  .hero-content { animation: none; }
  .category-item { transition: none; }
  .custom-tag { transition: none; }
  .skeleton-image,
  .skeleton-line { animation: none; }
}

@media (max-width: 768px) {
  #homePage {
    border-radius: 0;
  }

  .hero {
    margin-bottom: 18px;
    padding: 28px 14px 22px;
    border-radius: 24px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(250, 244, 247, 0.82));
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 16px 42px rgba(148, 163, 184, 0.12);
  }

  :global(html.dark) .hero {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.82));
    border-color: rgba(255, 255, 255, 0.06);
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-title {
    font-size: 2.05rem;
    margin-bottom: 14px;
    line-height: 1.15;
  }

  .hero-subtitle {
    font-size: 0.96rem;
    line-height: 1.75;
    margin: 0 auto 22px;
    max-width: 290px;
  }

  .search-bar {
    max-width: 100%;
    padding: 0 4px;
  }

  .hero-search {
    width: 100%;
  }

  .hero-search :deep(.ant-input-group-wrapper) {
    width: 100%;
  }

  .hero-search :deep(.ant-input-group) {
    display: flex !important;
    align-items: stretch;
    border-radius: 20px;
    overflow: hidden;
    background: var(--search-bg);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    flex-wrap: nowrap;
  }

  .hero-search :deep(.ant-input-wrapper) {
    flex: 1;
    min-width: 0;
    display: flex;
  }

  .hero-search :deep(.ant-input-affix-wrapper) {
    flex: 1;
    min-width: 0;
    border-radius: 0 !important;
    border-right: none;
    box-sizing: border-box;
  }

  .hero-search :deep(.ant-input-affix-wrapper),
  .hero-search :deep(.ant-input) {
    min-height: 48px;
    font-size: 0.98rem;
  }

  .hero-search :deep(.ant-input) {
    border-radius: 0 !important;
    padding-left: 18px;
  }

  .hero-search :deep(.ant-input-group-addon) {
    flex-shrink: 0;
  }

  .hero-search :deep(.ant-input-search-button) {
    flex-shrink: 0;
    width: 88px;
    min-width: 88px;
    height: 48px;
    border-radius: 0 !important;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .filter-section {
    margin: 0 auto 24px;
    padding: 0 8px;
  }

  .category-filters {
    justify-content: flex-start;
    flex-wrap: nowrap;
    gap: 10px;
    margin-bottom: 16px;
    padding: 2px 2px 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .category-filters::-webkit-scrollbar {
    display: none;
  }

  .category-item {
    flex: 0 0 auto;
    padding: 8px 18px;
    font-size: 0.92rem;
    white-space: nowrap;
  }

  .tag-filters {
    justify-content: flex-start;
    padding: 14px 12px;
    border-radius: 20px;
    overflow-x: auto;
    background: var(--tag-bg);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .tag-filters :deep(.ant-space) {
    gap: 8px !important;
  }

  .custom-tag {
    flex: 0 0 auto;
    padding: 6px 12px !important;
    border-radius: 999px !important;
    font-size: 0.86rem !important;
    white-space: nowrap;
  }

  .gallery-container {
    padding: 0 8px 20px;
  }

  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .skeleton-image {
    height: 180px;
  }

  .orb {
    filter: blur(54px);
    opacity: 0.33;
  }

  .orb-1 {
    width: 220px;
    height: 220px;
    top: -40px;
    left: -40px;
  }

  .orb-2 {
    width: 260px;
    height: 260px;
    right: -60px;
    bottom: -80px;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 24px 12px 18px;
    border-radius: 20px;
  }

  .hero-title {
    font-size: 1.86rem;
  }

  .hero-subtitle {
    max-width: 280px;
    font-size: 0.9rem;
    margin-bottom: 18px;
  }

  .hero-search :deep(.ant-input-affix-wrapper),
  .hero-search :deep(.ant-input) {
    min-height: 46px;
    font-size: 0.95rem;
  }

  .hero-search :deep(.ant-input-search-button) {
    width: 80px;
    min-width: 80px;
    height: 46px;
    font-size: 0.95rem;
  }

  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
