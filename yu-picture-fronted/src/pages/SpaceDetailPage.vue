<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between" align="center" wrap="wrap" class="space-header" :gap="16">
      <h2 class="space-title">{{ space.spaceName }}（{{ space.spaceType !== undefined ? SPACE_TYPE_MAP[space.spaceType as keyof typeof SPACE_TYPE_MAP] : '未知' }}）</h2>
      <a-space size="middle" wrap>
        <a-tooltip
          v-if="space.maxSize"
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :size="42"
            :percent="Number((((space.totalSize ?? 0) * 100) / (space.maxSize || 1)).toFixed(1))"
          />
        </a-tooltip>
        <a-button
          v-if="canUploadPicture"
          type="primary"
          :icon="h(PlusOutlined)"
          @click="router.push(`/add_picture?spaceId=${id}`)"
        >
          上传图片
        </a-button>
        <a-button
          v-if="canEditPicture"
          :icon="h(EditOutlined)"
          @click="batchEditModalVisible = true"
        >
          批量编辑
        </a-button>
        <a-button
          v-if="canManageSpaceUser"
          type="primary"
          ghost
          :icon="h(TeamOutlined)"
          :href="`/spaceUserManage/${id}`"
          target="_blank"
        >
          成员管理
        </a-button>
        <a-button
          v-if="canManageSpaceUser"
          :icon="h(BarChartOutlined)"
          @click="router.push(`/space_analyze?spaceId=${id}`)"
        >
          空间分析
        </a-button>
      </a-space>
    </a-flex>

    <div style="margin-bottom: 24px" />

    <!-- 搜索表单 -->
    <PictureSearchForm :onSearch="onSearch" />

    <BatchEditPictureModal
      v-model:open="batchEditModalVisible"
      :pictureList="dataList"
      :spaceId="id"
      :onSuccess="fetchData"
    />

    <div style="margin-bottom: 24px" />

    <!-- 图片列表 -->
    <PictureList
      :dataList="dataList"
      :loading="loading"
      :showOp="true"
      :canEdit="canEditPicture"
      :canDelete="canDeletePicture"
      :onReload="fetchData"
    />

    <!-- 分页 -->
    <a-pagination
      v-if="!searchParams.picColor"
      class="space-pagination"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
      :show-total="(total: number) => `共 ${total} 条`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons-vue'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import { SPACE_TYPE_MAP, SPACE_PERMISSION_ENUM } from '@/constants/space.ts'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { formatSize } from '@/utils'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const space = ref<API.SpaceVO>({})
const batchEditModalVisible = ref(false)

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// -------- 数据加载 --------
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch {
    message.error('获取空间详情失败')
  }
}

// 获取图片列表
const fetchData = async () => {
  loading.value = true
  // 基础搜索参数
  const params: API.PictureQueryRequest = {
    ...searchParams,
    spaceId: props.id,
  }
  try {
    let res
    if (searchParams.picColor) {
      // 颜色搜索
      res = await searchPictureByColorUsingPost({
        spaceId: props.id,
        picColor: searchParams.picColor,
      })
      if (res.data.code === 0 && res.data.data) {
        dataList.value = res.data.data ?? []
        total.value = Number(res.data.data.length) ?? 0
      } else {
        message.error('获取数据失败，' + res.data.message)
      }
    } else {
      // 普通分页搜索
      res = await listPictureVoByPageUsingPost(params)
      if (res.data.code === 0 && res.data.data) {
        dataList.value = res.data.data.records ?? []
        total.value = Number(res.data.data.total) ?? 0
      } else {
        message.error('获取数据失败，' + res.data.message)
      }
    }
  } catch {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  Object.assign(searchParams, newSearchParams)
  searchParams.current = 1
  fetchData()
}

// 分页改变
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}


onMounted(() => {
  fetchSpaceDetail()
  fetchData()
})

// 监听 ID 变化
watch(
  () => props.id,
  () => {
    fetchSpaceDetail()
    fetchData()
  }
)
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 24px;
  min-width: 0;
}

.space-title {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  word-break: break-word;
}

.space-pagination {
  margin-top: 16px;
  text-align: right;
}

@media (max-width: 768px) {
  .space-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  .space-title {
    font-size: 18px;
  }

  .space-pagination {
    text-align: center;
  }
}
</style>
