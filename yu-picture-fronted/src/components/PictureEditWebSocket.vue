<template>
  <a-modal
    :open="open"
    :footer="null"
    :width="modalWidth"
    :bodyStyle="{ padding: '16px' }"
    title="协同编辑"
    @cancel="handleClose"
    :destroyOnClose="true"
    :maskClosable="false"
  >
    <div class="collab-edit-container">
      <!-- 左侧：图片预览 + 工具栏 -->
      <div class="edit-area">
        <div class="image-preview-wrapper">
          <img
            v-if="picture?.url"
            :src="picture.url"
            :style="imageTransformStyle"
            class="preview-image"
            alt="编辑预览"
          />
          <a-empty v-else description="暂无图片" />
        </div>

        <!-- 编辑工具栏 -->
        <div class="toolbar">
          <a-space>
            <a-button
              v-if="!isCurrentUserEditing"
              type="primary"
              :disabled="!!editingUser || !wsConnected"
              @click="sendEnterEdit"
            >
              <template #icon><EditOutlined /></template>
              {{ editingUser ? `${editingUser.userName} 正在编辑` : '进入编辑' }}
            </a-button>
            <a-button
              v-if="isCurrentUserEditing"
              danger
              @click="sendExitEdit"
            >
              <template #icon><LogoutOutlined /></template>
              退出编辑
            </a-button>
          </a-space>

          <a-divider type="vertical" style="height: 32px" />

          <a-space>
            <a-tooltip title="放大">
              <a-button
                shape="circle"
                :disabled="!isCurrentUserEditing"
                @click="sendEditAction('ZOOM_IN')"
              >
                <template #icon><ZoomInOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="缩小">
              <a-button
                shape="circle"
                :disabled="!isCurrentUserEditing"
                @click="sendEditAction('ZOOM_OUT')"
              >
                <template #icon><ZoomOutOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="左旋 90°">
              <a-button
                shape="circle"
                :disabled="!isCurrentUserEditing"
                @click="sendEditAction('ROTATE_LEFT')"
              >
                <template #icon><UndoOutlined /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="右旋 90°">
              <a-button
                shape="circle"
                :disabled="!isCurrentUserEditing"
                @click="sendEditAction('ROTATE_RIGHT')"
              >
                <template #icon><RedoOutlined /></template>
              </a-button>
            </a-tooltip>
          </a-space>

          <div class="toolbar-info">
            <a-tag :color="wsConnected ? 'green' : 'red'">
              {{ wsConnected ? '已连接' : '未连接' }}
            </a-tag>
            <span class="transform-info">
              缩放: {{ (scale * 100).toFixed(0) }}% | 旋转: {{ rotation }}°
            </span>
          </div>
        </div>
      </div>

      <!-- 右侧：信息面板 -->
      <div class="info-panel">
        <!-- 当前编辑者 -->
        <div class="panel-section">
          <div class="section-title">
            <EditOutlined /> 当前编辑者
          </div>
          <div v-if="editingUser" class="editing-user">
            <a-avatar :src="editingUser.userAvatar" size="small">
              {{ editingUser.userName?.charAt(0) }}
            </a-avatar>
            <span class="user-name editing">{{ editingUser.userName }}</span>
          </div>
          <div v-else class="no-editor">暂无人编辑</div>
        </div>

        <a-divider style="margin: 12px 0" />

        <!-- 操作日志 -->
        <div class="panel-section log-section">
          <div class="section-title">
            <FileTextOutlined /> 操作日志
          </div>
          <div class="log-list" ref="logListRef">
            <div
              v-for="(log, index) in actionLogs"
              :key="index"
              :class="['log-item', `log-${log.type}`]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <a-empty
              v-if="actionLogs.length === 0"
              :image="simpleImage"
              description="暂无操作日志"
              style="margin-top: 40px"
            />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { Empty } from 'ant-design-vue'
import {
  EditOutlined,
  LogoutOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  RedoOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE

interface Props {
  open: boolean
  picture: API.PictureVO
}

const props = defineProps<Props>()
const emit = defineEmits(['update:open'])

const loginUserStore = useLoginUserStore()

// 响应式 Modal 宽度
const windowWidth = ref(window.innerWidth)
const onResize = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
const modalWidth = computed(() => {
  return windowWidth.value < 768 ? '95vw' : 1100
})

// WebSocket 相关
let ws: WebSocket | null = null
const wsConnected = ref(false)

// 编辑状态
const editingUser = ref<API.UserVO | null>(null)
const scale = ref(1)
const rotation = ref(0)

// 操作日志
interface ActionLog {
  time: string
  message: string
  type: 'info' | 'action' | 'enter' | 'exit' | 'error'
}
const actionLogs = ref<ActionLog[]>([])
const logListRef = ref<HTMLElement | null>(null)

// 判断当前用户是否是编辑者
const isCurrentUserEditing = computed(() => {
  const currentUserId = loginUserStore.loginUser?.id
  return editingUser.value?.id != null && editingUser.value.id === currentUserId
})

// 图片变换样式
const imageTransformStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotation.value}deg)`,
  transition: 'transform 0.3s ease',
}))

// 获取当前时间字符串
function getTimeStr() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

// 添加日志
function addLog(msg: string, type: ActionLog['type'] = 'info') {
  actionLogs.value.push({ time: getTimeStr(), message: msg, type })
  // 限制最多 100 条
  if (actionLogs.value.length > 100) {
    actionLogs.value.shift()
  }
  // 滚动到底部
  nextTick(() => {
    if (logListRef.value) {
      logListRef.value.scrollTop = logListRef.value.scrollHeight
    }
  })
}

// 连接 WebSocket
function connectWebSocket() {
  if (!props.picture?.id) return

  // 判断当前是否是本地开发环境
  const isDev = import.meta.env.DEV
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsBaseUrl = isDev ? 'ws://localhost:8888' : `${protocol}//${window.location.host}`
  const wsUrl = `${wsBaseUrl}/ws/picture/edit?pictureId=${props.picture.id}`

  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    wsConnected.value = true
    addLog('已连接到协同编辑服务器', 'info')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      handleServerMessage(data)
    } catch (e) {
      console.error('解析消息失败', e)
    }
  }

  ws.onclose = () => {
    wsConnected.value = false
    editingUser.value = null
    addLog('与服务器断开连接', 'error')
  }

  ws.onerror = () => {
    message.error('WebSocket 连接异常')
  }
}

// 断开 WebSocket
function disconnectWebSocket() {
  if (ws) {
    ws.close()
    ws = null
  }
  wsConnected.value = false
  editingUser.value = null
}

// 处理服务器消息
function handleServerMessage(data: {
  type: string
  message: string
  editAction?: string
  user?: API.UserVO
}) {
  switch (data.type) {
    case 'INFO':
      addLog(data.message, 'info')
      break

    case 'ERROR':
      addLog(data.message, 'error')
      message.error(data.message)
      break

    case 'ENTER_EDIT':
      editingUser.value = data.user || null
      addLog(data.message, 'enter')
      break

    case 'EXIT_EDIT':
      editingUser.value = null
      addLog(data.message, 'exit')
      break

    case 'EDIT_ACTION':
      // 收到其他用户的编辑操作，应用到本地预览
      applyEditAction(data.editAction || '')
      addLog(data.message, 'action')
      break

    default:
      console.warn('未知消息类型', data.type)
  }
}

// 应用编辑操作到图片预览
function applyEditAction(action: string) {
  switch (action) {
    case 'ZOOM_IN':
      scale.value = Math.min(scale.value + 0.1, 3)
      break
    case 'ZOOM_OUT':
      scale.value = Math.max(scale.value - 0.1, 0.1)
      break
    case 'ROTATE_LEFT':
      rotation.value -= 90
      break
    case 'ROTATE_RIGHT':
      rotation.value += 90
      break
  }
}

// 发送消息
function sendMessage(msg: object) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  } else {
    message.warning('WebSocket 未连接')
  }
}

// 进入编辑
function sendEnterEdit() {
  sendMessage({ type: 'ENTER_EDIT' })
}

// 退出编辑
function sendExitEdit() {
  sendMessage({ type: 'EXIT_EDIT' })
}

// 发送编辑操作
function sendEditAction(action: string) {
  sendMessage({ type: 'EDIT_ACTION', editAction: action })
  // 本地也立即应用
  applyEditAction(action)
}

// 关闭弹窗
function handleClose() {
  disconnectWebSocket()
  // 重置状态
  scale.value = 1
  rotation.value = 0
  actionLogs.value = []
  editingUser.value = null
  emit('update:open', false)
}

// 监听 open 变化，打开时连接 WebSocket
watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      connectWebSocket()
    } else {
      disconnectWebSocket()
    }
  },
)

// 组件销毁时断开
onBeforeUnmount(() => {
  disconnectWebSocket()
})
</script>

<style scoped>
.collab-edit-container {
  display: flex;
  gap: 16px;
  min-height: 520px;
}

.edit-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.image-preview-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%);
  border-radius: 12px;
  overflow: hidden;
  min-height: 380px;
  position: relative;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transform-origin: center center;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.toolbar-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.transform-info {
  font-size: 12px;
  color: #8c8c8c;
  white-space: nowrap;
}

/* 右侧信息面板 */
.info-panel {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 6px;
}

.editing-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-radius: 8px;
  border: 1px solid #91d5ff;
}

.user-name {
  font-size: 13px;
  color: #374151;
}

.user-name.editing {
  color: #1890ff;
  font-weight: 600;
}

.no-editor {
  font-size: 13px;
  color: #9ca3af;
  padding: 8px 0;
}

/* 操作日志 */
.log-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  max-height: 340px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-item {
  font-size: 12px;
  line-height: 1.6;
  padding: 4px 8px;
  border-radius: 6px;
  background: #fff;
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.log-time {
  color: #9ca3af;
  font-family: 'SF Mono', 'Menlo', monospace;
  flex-shrink: 0;
  font-size: 11px;
}

.log-message {
  color: #4b5563;
  word-break: break-word;
}

.log-item.log-info {
  border-left: 3px solid #91d5ff;
}

.log-item.log-action {
  border-left: 3px solid #b7eb8f;
}

.log-item.log-enter {
  border-left: 3px solid #87e8de;
  background: #f0fffe;
}

.log-item.log-exit {
  border-left: 3px solid #ffd591;
  background: #fffbe6;
}

.log-item.log-error {
  border-left: 3px solid #ffa39e;
  background: #fff1f0;
}

/* 日志列表滚动条 */
.log-list::-webkit-scrollbar {
  width: 4px;
}

.log-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 4px;
}

.log-list::-webkit-scrollbar-track {
  background: transparent;
}

/* 响应式 */
@media (max-width: 768px) {
  .collab-edit-container {
    flex-direction: column;
  }

  .info-panel {
    width: 100%;
  }

  .image-preview-wrapper {
    min-height: 260px;
  }

  .log-list {
    max-height: 200px;
  }

  .toolbar {
    justify-content: center;
  }

  .toolbar-info {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
</style>
