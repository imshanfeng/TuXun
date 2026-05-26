<template>
  <div id="spaceManagePage">
    <a-card title="空间管理" :bordered="false" class="page-card">
      <template #extra>
        <a-button type="primary" @click="router.push('/add_space')">
          <template #icon><PlusOutlined /></template>
          创建空间
        </a-button>
      </template>

      <!-- Search Form -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
        <a-form-item label="空间名称" name="spaceName">
          <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allow-clear />
        </a-form-item>
        <a-form-item label="空间类别" name="spaceType">
          <a-select
            v-model:value="searchParams.spaceType"
            :options="SPACE_TYPE_OPTIONS"
            placeholder="请输入空间类别"
            style="min-width: 150px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="空间级别" name="spaceLevel">
          <a-select
            v-model:value="searchParams.spaceLevel"
            placeholder="请选择空间级别"
            allow-clear
            style="min-width: 150px"
            :options="spaceLevelOptions"
          />
        </a-form-item>
        <a-form-item label="用户 id">
          <a-input v-model:value="searchUserId" placeholder="请输入用户 id" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
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
        size="middle"
        bordered
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'spaceType'">
            <a-tag>{{ SPACE_TYPE_MAP[record.spaceType] }}</a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'spaceLevel'">
            <a-tag :color="spaceLevelColorMap[record.spaceLevel] || 'default'">
              {{ spaceLevelTextMap[record.spaceLevel] || '未知' }}
            </a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'usageInfo'">
            <div class="metadata-list">
              <div class="metadata-item">
                <span class="label">大小:</span>
                {{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}
              </div>
              <div class="metadata-item">
                <span class="label">数量:</span>
                {{ record.totalCount || 0 }} / {{ record.maxCount || 0 }}
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
            <a-space direction="vertical">
              <a-button type="link" size="small" style="padding: 0" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除该空间吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="doDelete(record.id)"
              >
                <a-button type="link" danger size="small" style="padding: 0">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- Edit Modal -->
      <a-modal
        v-model:open="editVisible"
        title="编辑空间"
        @ok="handleEditOk"
        @cancel="handleEditCancel"
        :confirm-loading="editLoading"
      >
        <a-form :model="editForm" layout="vertical">
          <a-form-item label="空间名称" name="spaceName">
            <a-input v-model:value="editForm.spaceName" placeholder="请输入空间名称" />
          </a-form-item>
          <a-form-item label="空间级别" name="spaceLevel">
            <a-select
              v-model:value="editForm.spaceLevel"
              placeholder="请选择空间级别"
              :options="spaceLevelOptions"
            />
          </a-form-item>
          <a-form-item label="最大容量 (字节)" name="maxSize">
            <a-input-number v-model:value="editForm.maxSize" style="width: 100%" :min="0" />
          </a-form-item>
          <a-form-item label="最大数量" name="maxCount">
            <a-input-number v-model:value="editForm.maxCount" style="width: 100%" :min="0" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import type { TablePaginationConfig } from 'ant-design-vue'
import {
  listSpaceByPageUsingPost,
  deleteSpaceUsingPost,
  updateSpaceUsingPost,
  listSpaceLevelUsingGet,
} from '@/api/spaceController'
import { formatSize } from '@/utils'
import { SPACE_TYPE_MAP, SPACE_TYPE_OPTIONS } from '@/constants/space'

const router = useRouter()

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 180,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
    width: 150,
  },
  {
    title: '空间类别',
    dataIndex: 'spaceType',
    width: 100,
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
    width: 100,
  },
  {
    title: '使用情况',
    dataIndex: 'usageInfo',
    width: 180,
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 180,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 100,
  },
]

// 空间级别映射
const spaceLevelTextMap: Record<number, string> = {}
const spaceLevelColorMap: Record<number, string> = {
  0: 'green',
  1: 'blue',
  2: 'purple',
}
const spaceLevelOptions = ref<{ value: number; label: string }[]>([])

// 获取空间级别选项
const getSpaceLevelOptions = async () => {
  try {
    const res = await listSpaceLevelUsingGet()
    if (res.data.code == 0 && res.data.data) {
      spaceLevelOptions.value = res.data.data.map((level: API.SpaceLevel) => ({
        value: level.value as number,
        label: level.text as string,
      }))
      // 填充文字映射
      res.data.data.forEach((level: API.SpaceLevel) => {
        if (level.value !== undefined && level.text) {
          spaceLevelTextMap[level.value] = level.text
        }
      })
    }
  } catch (error) {
    console.error('获取空间级别失败:', error)
  }
}

// Data references
const dataList = ref<API.Space[]>([])
const loading = ref(true)
const searchUserId = ref<string>()

// Search parameters
const searchParams = reactive<API.SpaceQueryRequest>({
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
  showTotal: (total: number) => `共 ${total} 条`,
})

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    // 处理 userId 字段
    if (searchUserId.value) {
      searchParams.userId = searchUserId.value
    } else {
      searchParams.userId = undefined
    }
    const requestedPage = searchParams.current
    const res = await listSpaceByPageUsingPost(searchParams)
    if (res.data.code == 0 && res.data.data) {
      dataList.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
      if (searchParams.current === requestedPage) {
        pagination.current = res.data.data.current || 1
      }
    } else {
      message.error('获取空间列表失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Fetch spaces error:', error)
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

// Table Change (Pagination & Sorting)
const handleTableChange = (pag: TablePaginationConfig, _filters: any, sorter: any) => {
  searchParams.current = pag.current
  searchParams.pageSize = pag.pageSize
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10

  if (sorter && sorter.field) {
    searchParams.sortField = sorter.field
    searchParams.sortOrder = sorter.order === 'ascend' ? 'ascend' : 'descend'
  }

  fetchData()
}

// Edit Modal State
const editVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive<API.SpaceUpdateRequest>({
  id: undefined,
  spaceName: '',
  spaceLevel: undefined,
  maxSize: undefined,
  maxCount: undefined,
})

// Edit Space (open modal)
const handleEdit = (record: API.Space) => {
  editForm.id = record.id
  editForm.spaceName = record.spaceName || ''
  editForm.spaceLevel = record.spaceLevel
  editForm.maxSize = record.maxSize
  editForm.maxCount = record.maxCount
  editVisible.value = true
}

const handleEditCancel = () => {
  editVisible.value = false
}

const handleEditOk = async () => {
  if (!editForm.id) return
  editLoading.value = true
  try {
    const res = await updateSpaceUsingPost(editForm)
    if (res.data.code == 0) {
      message.success('编辑空间成功')
      editVisible.value = false
      fetchData()
    } else {
      message.error('编辑空间失败：' + res.data.message)
    }
  } catch {
    message.error('编辑请求失败')
  } finally {
    editLoading.value = false
  }
}

// Delete Space
const doDelete = async (id: number) => {
  try {
    const res = await deleteSpaceUsingPost({ id: String(id) })
    if (res.data.code == 0) {
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
  getSpaceLevelOptions()
  fetchData()
})
</script>

<style scoped>
#spaceManagePage {
  max-width: 1400px;
  margin: 0 auto;
}

.page-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.metadata-item .label {
  color: #8c8c8c;
  margin-right: 4px;
}

@media (max-width: 768px) {
  #spaceManagePage {
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
