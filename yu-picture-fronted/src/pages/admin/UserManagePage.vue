<template>
  <div id="userManagePage">
    <a-card title="用户管理" :bordered="false" class="page-card">
      <template #extra>
        <a-space>
          <a-button type="primary" shape="round" @click="openAddModal">
            <template #icon><PlusOutlined /></template>
            新增用户
          </a-button>
          <a-button shape="round" @click="fetchData">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <!-- Search Form -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
        <a-form-item label="账号">
          <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear />
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
        size="middle"
        bordered
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userAvatar'">
            <a-avatar
              v-if="record.userAvatar"
              :src="record.userAvatar"
              size="large"
            />
            <a-avatar v-else size="large">
              {{ record.userName ? record.userName.charAt(0).toUpperCase() : 'U' }}
            </a-avatar>
          </template>
          
          <template v-else-if="column.dataIndex === 'userRole'">
            <a-tag :color="record.userRole === 'admin' ? 'blue' : 'green'">
              {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'createTime'">
            {{ record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space :size="4">
              <a-button type="link" size="small" @click="openEditModal(record)">编辑</a-button>
              <a-popconfirm
                title="确定要删除该用户吗？删除后该用户的数据将无法恢复。"
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
    </a-card>

    <!-- 新增用户弹窗 -->
    <a-modal
      v-model:open="addModalVisible"
      title="新增用户"
      :confirm-loading="addLoading"
      @ok="handleAdd"
      @cancel="resetAddForm"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item label="账号" required>
          <a-input v-model:value="addForm.userAccount" placeholder="请输入账号" />
        </a-form-item>
        <a-form-item label="用户昵称">
          <a-input v-model:value="addForm.userName" placeholder="请输入用户昵称" />
        </a-form-item>
        <a-form-item label="头像 URL">
          <a-input v-model:value="addForm.userAvatar" placeholder="请输入头像 URL" />
        </a-form-item>
        <a-form-item label="个人简介">
          <a-textarea v-model:value="addForm.userProfile" placeholder="请输入个人简介" :rows="3" />
        </a-form-item>
        <a-form-item label="用户角色">
          <a-select v-model:value="addForm.userRole" placeholder="请选择角色">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="ban">封禁</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑用户弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑用户"
      :confirm-loading="editLoading"
      @ok="handleEdit"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="用户昵称">
          <a-input v-model:value="editForm.userName" placeholder="请输入用户昵称" />
        </a-form-item>
        <a-form-item label="头像 URL">
          <a-input v-model:value="editForm.userAvatar" placeholder="请输入头像 URL" />
        </a-form-item>
        <a-form-item label="个人简介">
          <a-textarea v-model:value="editForm.userProfile" placeholder="请输入个人简介" :rows="3" />
        </a-form-item>
        <a-form-item label="用户角色">
          <a-select v-model:value="editForm.userRole" placeholder="请选择角色">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="ban">封禁</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import {
  listUserVoByPageUsingPost,
  deleteUserUsingPost,
  addUserUsingPost,
  updateUserUsingPost,
} from '@/api/userController'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 120,
    sorter: true,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    sorter: true,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    sorter: true,
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    ellipsis: true,
  },
  {
    title: '角色',
    dataIndex: 'userRole',
    sorter: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 140,
  },
]

// Data references
const dataList = ref<API.UserVO[]>([])
const loading = ref(true)

// Search parameters
const searchParams = reactive<API.UserQueryRequest>({
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

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const requestedPage = searchParams.current
    const res = await listUserVoByPageUsingPost(searchParams)
    if (res.data.code == 0 && res.data.data) {
      dataList.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
      if (searchParams.current === requestedPage) {
        pagination.current = res.data.data.current || 1
      }
    } else {
      message.error('获取用户列表失败：' + res.data.message)
    }
  } catch (error) {
    console.error('Fetch users error:', error)
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
  searchParams.userAccount = undefined
  searchParams.userName = undefined
  searchParams.current = 1
  pagination.current = 1
  fetchData()
}

// Table Change (Pagination & Sorting)
const handleTableChange = (pag: any, filters: any, sorter: any) => {
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

// Delete User
const doDelete = async (id: number) => {
  try {
    const res = await deleteUserUsingPost({ id: String(id) })
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

// ========== 新增用户 ==========
const addModalVisible = ref(false)
const addLoading = ref(false)
const addForm = reactive<API.UserAddRequest>({
  userAccount: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: 'user',
})

const openAddModal = () => {
  resetAddForm()
  addModalVisible.value = true
}

const resetAddForm = () => {
  addForm.userAccount = ''
  addForm.userName = ''
  addForm.userAvatar = ''
  addForm.userProfile = ''
  addForm.userRole = 'user'
}

const handleAdd = async () => {
  if (!addForm.userAccount) {
    message.warning('请输入账号')
    return
  }
  addLoading.value = true
  try {
    const res = await addUserUsingPost(addForm)
    if (res.data.code == 0) {
      Modal.success({
        title: '新增用户成功',
        content: `默认密码为 12345678，请通知用户登录后及时修改密码。`,
        okText: '我知道了',
      })
      addModalVisible.value = false
      fetchData()
    } else {
      message.error('新增失败：' + res.data.message)
    }
  } catch {
    message.error('新增请求失败')
  } finally {
    addLoading.value = false
  }
}

// ========== 编辑用户 ==========
const editModalVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive<API.UserUpdateRequest>({
  id: undefined,
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: '',
})

const openEditModal = (record: API.UserVO) => {
  editForm.id = record.id
  editForm.userName = record.userName || ''
  editForm.userAvatar = record.userAvatar || ''
  editForm.userProfile = record.userProfile || ''
  editForm.userRole = record.userRole || 'user'
  editModalVisible.value = true
}

const handleEdit = async () => {
  if (!editForm.id) {
    message.error('用户 ID 不存在')
    return
  }
  editLoading.value = true
  try {
    const res = await updateUserUsingPost(editForm)
    if (res.data.code == 0) {
      message.success('编辑成功')
      editModalVisible.value = false
      fetchData()
    } else {
      message.error('编辑失败：' + res.data.message)
    }
  } catch {
    message.error('编辑请求失败')
  } finally {
    editLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#userManagePage {
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

@media (max-width: 768px) {
  #userManagePage {
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

  .search-form :deep(.ant-input) {
    width: 100% !important;
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
}
</style>
