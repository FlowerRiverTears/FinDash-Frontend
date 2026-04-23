<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { aiChatApi } from '@/api'
import { Promotion, Delete, ChatDotRound } from '@element-plus/icons-vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  loading?: boolean
}

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const chatContainerRef = ref<HTMLElement | null>(null)
const conversationId = ref<string | undefined>(undefined)

const quickQuestions = [
  '我近3个月的花销是多少？',
  '今年各分类的消费占比如何？',
  '帮我分析一下消费趋势',
  '如何减少开支？给我一些建议',
  '我今年的总收入和总支出是多少？'
]

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const sendMessage = async (content?: string) => {
  const messageText = content || inputMessage.value.trim()
  if (!messageText || isLoading.value) return

  messages.value.push({
    role: 'user',
    content: messageText,
    timestamp: new Date()
  })

  inputMessage.value = ''
  isLoading.value = true

  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    loading: true
  }
  messages.value.push(assistantMessage)
  await scrollToBottom()

  try {
    const history = messages.value
      .filter(m => !m.loading && m.content)
      .map(m => ({ role: m.role, content: m.content }))

    const result = await aiChatApi.sendMessage({
      message: messageText,
      conversationId: conversationId.value,
      history
    })

    if (result.success && result.data) {
      assistantMessage.content = result.data.reply
      conversationId.value = result.data.conversationId
    } else {
      assistantMessage.content = result.message || '抱歉，处理您的问题时出现错误。'
    }
  } catch {
    assistantMessage.content = '网络错误，请检查连接后重试。'
  } finally {
    assistantMessage.loading = false
    isLoading.value = false
    await scrollToBottom()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const clearChat = () => {
  messages.value = []
  conversationId.value = undefined
}

const formatMessage = (content: string) => {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
    .replace(/¥([\d,.]+)/g, '<span class="amount">¥$1</span>')
    .replace(/⚠️/g, '<span class="warning">⚠️</span>')
    .replace(/✅/g, '<span class="success">✅</span>')
    .replace(/💡/g, '<span class="tip">💡</span>')
}

onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好！我是 FinDash 智能财务助手 💰\n\n我可以帮你：\n• 查询月度/年度花销数据\n• 分析各分类消费占比\n• 对比不同时间段的消费趋势\n• 提供节支建议和优化方案\n\n请问有什么可以帮你的？',
    timestamp: new Date()
  })
})
</script>

<template>
  <div class="ai-chat">
    <div class="chat-header">
      <div class="chat-header-left">
        <el-icon :size="22" color="#409eff"><ChatDotRound /></el-icon>
        <span class="chat-title">智能财务助手</span>
        <el-tag size="small" type="success" effect="light">AI</el-tag>
      </div>
      <el-button text type="danger" @click="clearChat" :disabled="messages.length <= 1">
        <el-icon><Delete /></el-icon>
        清空对话
      </el-button>
    </div>

    <div class="chat-body" ref="chatContainerRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['chat-message', `chat-message-${msg.role}`]"
      >
        <div class="message-avatar">
          <el-avatar
            v-if="msg.role === 'assistant'"
            :size="36"
            class="avatar-ai"
          >
            AI
          </el-avatar>
          <el-avatar
            v-else
            :size="36"
            class="avatar-user"
          >
            我
          </el-avatar>
        </div>
        <div class="message-content">
          <div class="message-bubble" :class="{ 'message-loading': msg.loading }">
            <template v-if="msg.loading">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </template>
            <template v-else>
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
            </template>
          </div>
          <div class="message-time">
            {{ msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>
      </div>
    </div>

    <div class="chat-quick-questions" v-if="messages.length <= 1">
      <div class="quick-label">快速提问：</div>
      <div class="quick-list">
        <el-button
          v-for="(q, i) in quickQuestions"
          :key="i"
          size="small"
          round
          @click="sendMessage(q)"
        >
          {{ q }}
        </el-button>
      </div>
    </div>

    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="2"
        placeholder="输入你的问题，例如：我近3个月的花销是多少？"
        resize="none"
        :disabled="isLoading"
        @keydown="handleKeyDown"
      />
      <el-button
        type="primary"
        :icon="Promotion"
        circle
        class="send-btn"
        :disabled="!inputMessage.trim() || isLoading"
        @click="sendMessage()"
      />
    </div>
  </div>
</template>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px);
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
}

.chat-header :deep(.el-button) {
  color: rgba(255, 255, 255, 0.85);
}

.chat-header :deep(.el-button:hover) {
  color: white;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f9fafb;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.chat-message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-ai {
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.avatar-user {
  background: linear-gradient(135deg, #67c23a, #529b2e);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 14px;
  word-break: break-word;
}

.chat-message-assistant .message-bubble {
  background: white;
  color: #303133;
  border: 1px solid #ebeef5;
  border-top-left-radius: 4px;
}

.chat-message-user .message-bubble {
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: white;
  border-top-right-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  padding: 0 4px;
}

.chat-message-user .message-time {
  text-align: right;
}

.message-loading {
  padding: 16px 20px;
}

.loading-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-quick-questions {
  padding: 12px 24px;
  border-top: 1px solid #ebeef5;
  background: white;
}

.quick-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-list .el-button {
  font-size: 12px;
}

.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background: white;
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border-color: #dcdfe6;
  font-size: 14px;
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
}

.send-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.message-text :deep(.amount) {
  color: #f56c6c;
  font-weight: 600;
}

.message-text :deep(.warning) {
  font-size: 16px;
}

.message-text :deep(.success) {
  font-size: 16px;
}

.message-text :deep(.tip) {
  font-size: 16px;
}
</style>
