<template>
  <div id="spaceUserManagePage">
    <a-flex justify="space-between">
      <h2>空间成员管理</h2>
      <a-space size="middle">
        <a-button type="primary" ghost @click="router.push(`/space/${id}`)">返回空间</a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />
    <a-form layout="inline" :model="formData" @finish="handleSubmit">
      <a-form-item label="用户 id" name="userId">
        <a-input v-model:value="formData.userId" placeholder="请输入用户 id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">添加用户</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px" />
    <a-table :columns="columns" :data-source="dataList" :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space>
            <a-avatar :src="record.user?.userAvatar" />
            {{ record.user?.userName }}
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value) => editSpaceRole(value, record)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
} from '@/api/spaceUserController'
import { SPACE_ROLE_OPTIONS } from '@/constants/space'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()

// 表格列
const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref([])

// 获取数据
const fetchData = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  try {
    const res = await listSpaceUserUsingPost({
      spaceId: spaceId,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败')
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 添加用户
const formData = reactive<API.SpaceUserAddRequest>({})

const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  try {
    const res = await addSpaceUserUsingPost({
      spaceId: spaceId,
      ...formData,
    })
    if (res.data.code === 0) {
      message.success('添加成功')
      // 刷新数据
      fetchData()
    } else {
      message.error('添加失败，' + res.data.message)
    }
  } catch (error) {
    message.error('添加失败')
  }
}

const editSpaceRole = async (value: string, record: API.SpaceUserVO) => {
  try {
    const res = await editSpaceUserUsingPost({
      id: record.id,
      spaceRole: value,
    })
    if (res.data.code === 0) {
      message.success('修改成功')
    } else {
      message.error('修改失败，' + res.data.message)
    }
  } catch (error) {
    message.error('修改失败')
  }
}

const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  try {
    const res = await deleteSpaceUserUsingPost({ id: id })
    if (res.data.code === 0) {
      message.success('删除成功')
      // 刷新数据
      fetchData()
    } else {
      message.error('删除失败')
    }
  } catch (error) {
    message.error('删除失败')
  }
}
</script>

<style scoped>
#spaceUserManagePage {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

:global(html.dark) #spaceUserManagePage {
  background: #1f1f1f;
}

@media (max-width: 768px) {
  #spaceUserManagePage {
    padding: 12px;
  }

  #spaceUserManagePage h2 {
    font-size: 18px;
  }

  :deep(.ant-form-inline .ant-form-item) {
    margin-bottom: 12px;
    width: 100%;
  }

  :deep(.ant-form-inline .ant-form-item-control) {
    width: 100%;
  }

  :deep(.ant-form-inline .ant-input) {
    width: 100% !important;
  }

  :deep(.ant-table) {
    font-size: 12px;
  }

  :deep(.ant-table-cell) {
    padding: 8px 4px !important;
  }
}
</style>
