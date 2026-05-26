<template>
  <div class="picture-search-form">
    <!-- 搜索表单 -->
    <a-form name="searchForm" layout="inline" :model="searchParams" @finish="doSearch">
      <a-row :gutter="[16, 16]">
        <!-- 第一行 -->
        <a-col>
          <a-form-item label="关键词" name="searchText">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="从名称和简介搜索"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item name="category" label="分类">
            <a-auto-complete
              v-model:value="searchParams.category"
              style="min-width: 150px"
              :options="categoryOptions"
            >
              <a-input placeholder="请输入分类" allow-clear />
            </a-auto-complete>
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item name="tags" label="标签">
            <a-select
              v-model:value="searchParams.tags"
              style="min-width: 150px"
              mode="tags"
              placeholder="请输入标签"
              :options="tagOptions"
              allow-clear
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="日期" name="dateRange">
            <a-range-picker
              show-time
              v-model:value="dateRange"
              :placeholder="['编辑开始时间', '编辑结束时间']"
              format="YYYY/MM/DD HH:mm:ss"
              :presets="rangePresets"
              @change="onRangeChange"
            />
          </a-form-item>
        </a-col>
        <!-- 第二行 -->
        <a-col>
          <a-form-item label="名称" name="name">
            <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="简介" name="introduction">
            <a-input v-model:value="searchParams.introduction" placeholder="请输入简介" allow-clear />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="宽度" name="picWidth">
            <a-input-number v-model:value="searchParams.picWidth" placeholder="宽" />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="高度" name="picHeight">
            <a-input-number v-model:value="searchParams.picHeight" placeholder="高" />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item label="格式" name="picFormat">
            <a-input
              v-model:value="searchParams.picFormat"
              placeholder="请输入格式"
              allow-clear
              style="min-width: 120px"
            />
          </a-form-item>
        </a-col>
        <a-col>
          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit" style="width: 80px">搜索</a-button>
              <a-button html-type="reset" @click="doClear">重置</a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- 按照颜色搜索 -->
    <div class="color-search">
      <div style="margin-top: 16px">按照颜色搜索：</div>
      <a-space :size="12" wrap style="margin-top: 8px">
        <div
          v-for="color in colorList"
          :key="color"
          class="color-block"
          :style="{ backgroundColor: '#' + color, border: searchParams.picColor === color ? '2px solid #1890ff' : '1px solid #d9d9d9' }"
          @click="doSearchByColor(color)"
        />
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})

// 颜色列表
const colorList = [
  'FF0000',
  'FF4500',
  'FF8C00',
  'FFD700',
  'ADFF2F',
  '008000',
  '00CED1',
  '1E90FF',
  '0000FF',
  '8A2BE2',
  'FF00FF',
  '000000',
  'FFFFFF',
]

// 搜索数据
const doSearch = () => {
  props.onSearch?.(searchParams)
}

// 颜色搜索
const doSearchByColor = (color: string) => {
  if (searchParams.picColor === color) {
    searchParams.picColor = undefined
  } else {
    searchParams.picColor = color
  }
  doSearch()
}

// 标签和分类选项
const categoryOptions = ref<{ value: string; label: string }[]>([])
const tagOptions = ref<{ value: string; label: string }[]>([])

/**
 * 获取标签和分类选项
 */
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
      categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
    } else {
      message.error('获取标签分类列表失败，' + res.data.message)
    }
  } catch {
    message.error('获取标签分类请求失败')
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const dateRange = ref<dayjs.Dayjs[]>([])

/**
 * 日期范围更改时触发
 */
const onRangeChange = (dates: any[]) => {
  if (dates?.length >= 2) {
    searchParams.startEditTime = dates[0].toISOString()
    searchParams.endEditTime = dates[1].toISOString()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

// 时间范围预设
const rangePresets = computed(() => [
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

// 清理
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    // @ts-expect-error 动态清空对象属性
    searchParams[key] = undefined
  })
  // 日期筛选项单独清空
  dateRange.value = []
  // 清空后重新搜索
  props.onSearch?.(searchParams)
}
</script>

<style scoped>
.picture-search-form {
  width: 100%;
}

.picture-search-form :deep(.ant-form) {
  width: 100%;
}

.picture-search-form :deep(.ant-row) {
  width: 100%;
}

.picture-search-form :deep(.ant-row > .ant-col) {
  min-width: 0;
}

.picture-search-form .ant-form-item {
  margin-right: 0;
}

.picture-search-form :deep(.ant-picker),
.picture-search-form :deep(.ant-auto-complete),
.picture-search-form :deep(.ant-select),
.picture-search-form :deep(.ant-input-number),
.picture-search-form :deep(.ant-input) {
  max-width: 100%;
}

.color-block {
  width: 24px;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.color-block:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1200px) {
  .picture-search-form :deep(.ant-row) {
    row-gap: 4px;
  }

  .picture-search-form :deep(.ant-row > .ant-col) {
    flex: 1 1 calc(50% - 8px);
    max-width: calc(50% - 8px);
  }

  .picture-search-form :deep(.ant-space) {
    flex-wrap: wrap;
  }

  .picture-search-form :deep(.ant-picker) {
    width: 100% !important;
    min-width: 0 !important;
  }
}

@media (max-width: 768px) {
  .picture-search-form :deep(.ant-form) {
    display: block;
  }

  .picture-search-form :deep(.ant-col) {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
  }

  .picture-search-form :deep(.ant-form-item) {
    width: 100%;
    margin-bottom: 12px;
  }

  .picture-search-form :deep(.ant-form-item-control),
  .picture-search-form :deep(.ant-form-item-control-input),
  .picture-search-form :deep(.ant-form-item-control-input-content) {
    width: 100%;
  }

  .picture-search-form :deep(.ant-input),
  .picture-search-form :deep(.ant-input-number),
  .picture-search-form :deep(.ant-input-number-group-wrapper),
  .picture-search-form :deep(.ant-select),
  .picture-search-form :deep(.ant-picker),
  .picture-search-form :deep(.ant-auto-complete) {
    width: 100% !important;
    min-width: 0 !important;
  }

  .picture-search-form :deep(.ant-space) {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .color-search {
    margin-top: 10px;
  }
}
</style>
