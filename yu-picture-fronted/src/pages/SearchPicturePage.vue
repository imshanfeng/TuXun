<template>
  <div id="searchPicturePage">
    <h2 class="page-title">以图搜图</h2>
    <a-flex gap="md" class="search-layout">
      <!-- 源图片展示 -->
      <a-card title="原图" class="source-card">
        <template #cover>
          <img
            v-if="picture.url"
            :alt="picture.name"
            :src="picture.url"
            class="source-image"
          />
        </template>
      </a-card>
      <!-- 搜索结果 -->
      <a-card title="搜索结果" class="result-card">
        <a-list
          :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
          :data-source="dataList"
          :loading="loading"
        >
          <template #renderItem="{ item }">
            <a-list-item style="padding: 0">
              <a :href="item.fromUrl" target="_blank">
                <a-card hoverable>
                  <template #cover>
                    <img
                      :src="item.thumbUrl"
                      class="result-image"
                    />
                  </template>
                  <a-card-meta :title="item.title">
                    <template #description>
                      <a-tag color="blue">{{ item.source || '未知来源' }}</a-tag>
                    </template>
                  </a-card-meta>
                </a-card>
              </a>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </a-flex>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPictureVoByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'

const route = useRoute()
const pictureId = ref<string | undefined>(undefined)

const picture = ref<API.PictureVO>({})
const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref(true)

// 获取源图片详情
const getOldPicture = async () => {
  if (!pictureId.value) return
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    }
  } catch (error) {
    message.error('获取图片详情失败')
  }
}

// 获取搜索结果
const fetchData = async () => {
  if (!pictureId.value) {
    message.warning('请提供要搜索的图片 ID')
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await searchPictureByPictureUsingPost({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data
    } else {
      message.error('获取搜索结果失败：' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败了，请稍后重试')
  } finally {
    loading.value = false
  }
}

const loadData = () => {
  pictureId.value = route.query.id as string | undefined
  getOldPicture()
  fetchData()
}

onMounted(loadData)

// 监听路由 query 变化，重新加载数据
watch(() => route.query.id, () => {
  loadData()
})
</script>

<style scoped>
#searchPicturePage {
  margin-bottom: 28px;
}

.page-title {
  margin-bottom: 24px;
}

.search-layout {
  align-items: flex-start;
}

.source-card {
  width: min(280px, 100%);
  flex-shrink: 0;
}

.result-card {
  flex: 1;
  min-width: 0;
}

.source-card :deep(.ant-card-body),
.result-card :deep(.ant-card-body) {
  min-width: 0;
}

.source-image,
.result-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .page-title {
    margin-bottom: 16px;
  }

  .search-layout {
    flex-direction: column;
  }

  .source-card,
  .result-card {
    width: 100%;
  }

  .source-image {
    height: 220px;
  }

  .result-image {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .source-image,
  .result-image {
    height: 180px;
  }
}
</style>
