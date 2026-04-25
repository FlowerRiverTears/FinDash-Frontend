<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { aiConfigApi } from '@/api'
import { ElMessage } from 'element-plus'
import type { AiConfigDto, AiConfigSaveDto } from '@/types'

const emit = defineEmits<{
  (e: 'configured', configured: boolean): void
}>()

const visible = ref(false)
const testing = ref(false)
const saving = ref(false)
const loading = ref(false)
const hasExistingConfig = ref(false)

const config = ref<AiConfigSaveDto>({
  apiKey: '',
  modelId: '',
  endpoint: '',
  provider: ''
})

const providerOptions = [
  { label: 'MiniMax', value: 'MiniMax' },
  { label: 'OpenAI 兼容接口（DeepSeek / 中转等）', value: 'OpenAI' },
  { label: 'Azure OpenAI', value: 'Azure' }
]

const presetModels: Record<string, string[]> = {
  MiniMax: ['MiniMax-M2.7', 'MiniMax-Text-01', 'abab6.5s-chat', 'abab6.5-chat'],
  OpenAI: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo', 'deepseek-chat', 'deepseek-reasoner'],
  Azure: ['gpt-4o-mini', 'gpt-4o', 'gpt-35-turbo']
}

const presetEndpoints: Record<string, string> = {
  MiniMax: 'https://api.minimax.chat/v1',
  OpenAI: '',
  Azure: ''
}

const onProviderChange = (provider: string) => {
  config.value.endpoint = presetEndpoints[provider] || ''
  if (presetModels[provider]?.length && !presetModels[provider].includes(config.value.modelId)) {
    config.value.modelId = ''
  }
}

const loadConfig = async () => {
  loading.value = true
  try {
    const result = await aiConfigApi.getConfig()
    if (result.success && result.data) {
      hasExistingConfig.value = true
      config.value = {
        apiKey: '',
        modelId: result.data.modelId,
        endpoint: result.data.endpoint || '',
        provider: result.data.provider || ''
      }
    } else {
      hasExistingConfig.value = false
    }
  } catch {
    hasExistingConfig.value = false
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  if (!config.value.apiKey.trim() && !hasExistingConfig.value) {
    ElMessage.warning('请输入 API 密钥')
    return
  }
  if (!config.value.modelId.trim()) {
    ElMessage.warning('请输入模型 ID')
    return
  }

  saving.value = true
  try {
    const result = await aiConfigApi.saveConfig(config.value)
    if (result.success) {
      ElMessage.success('配置已保存，后续使用无需重新配置')
      hasExistingConfig.value = true
      emit('configured', true)
      visible.value = false
    } else {
      ElMessage.error(result.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存配置失败，请检查网络连接')
  } finally {
    saving.value = false
  }
}

const testConnection = async () => {
  if ((!config.value.apiKey.trim() && !hasExistingConfig.value) || !config.value.modelId.trim()) {
    ElMessage.warning('请先填写 API 密钥和模型 ID')
    return
  }

  testing.value = true
  try {
    const result = await aiConfigApi.testConfig(config.value)
    if (result.success) {
      ElMessage.success('连接测试成功！API 配置有效')
    } else {
      ElMessage.error(result.message || '连接测试失败，请检查配置')
    }
  } catch {
    ElMessage.error('连接测试失败，请检查网络和配置')
  } finally {
    testing.value = false
  }
}

const clearConfig = async () => {
  try {
    await aiConfigApi.deleteConfig()
    config.value = { apiKey: '', modelId: '', endpoint: '', provider: '' }
    hasExistingConfig.value = false
    ElMessage.info('配置已删除')
    emit('configured', false)
  } catch {
    ElMessage.error('删除配置失败')
  }
}

const open = () => {
  loadConfig()
  visible.value = true
}

const checkConfigured = async (): Promise<boolean> => {
  try {
    const result = await aiConfigApi.getStatus()
    return result.success && !!result.data?.isConfigured
  } catch {
    return false
  }
}

onMounted(() => {
  loadConfig()
})

defineExpose({ open, checkConfigured })
</script>

<template>
  <el-dialog
    v-model="visible"
    title="AI 服务配置"
    width="520px"
    :close-on-click-modal="false"
    class="ai-config-dialog"
  >
    <el-alert
      type="success"
      :closable="false"
      show-icon
      class="privacy-notice"
    >
      <template #title>
        <span class="notice-title">安全存储说明</span>
      </template>
      您的 API 配置将安全保存在您的账户中，下次登录自动加载，无需重复配置。
      配置数据通过加密传输，仅您本人可访问。
    </el-alert>

    <el-form :model="config" label-width="100px" class="config-form" v-loading="loading">
      <el-form-item label="服务提供商">
        <el-select
          v-model="config.provider"
          placeholder="选择服务提供商"
          style="width: 100%"
          @change="onProviderChange"
        >
          <el-option
            v-for="opt in providerOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="API 密钥" required>
        <el-input
          v-model="config.apiKey"
          type="password"
          show-password
          :placeholder="hasExistingConfig ? '已保存，留空则保持不变' : '请输入 API 密钥'"
        />
      </el-form-item>

      <el-form-item label="模型 ID" required>
        <el-select
          v-model="config.modelId"
          filterable
          allow-create
          placeholder="选择或输入模型名称"
          style="width: 100%"
        >
          <el-option
            v-for="m in (presetModels[config.provider] || presetModels['OpenAI'])"
            :key="m"
            :label="m"
            :value="m"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="API 端点">
        <el-input
          v-model="config.endpoint"
          :placeholder="config.provider === 'MiniMax' ? 'https://api.minimax.chat/v1' : '留空则使用官方地址'"
        />
      </el-form-item>

      <el-form-item>
        <div class="endpoint-tips">
          <div v-if="config.provider === 'MiniMax'" class="tip-item">
            <span class="tip-label">MiniMax：</span>https://api.minimax.chat/v1
          </div>
          <div v-if="config.provider === 'OpenAI'" class="tip-item">
            <span class="tip-label">官方：</span>留空即可
          </div>
          <div v-if="config.provider === 'OpenAI'" class="tip-item">
            <span class="tip-label">中转：</span>https://api.xxx.com/v1
          </div>
          <div v-if="config.provider === 'OpenAI'" class="tip-item">
            <span class="tip-label">DeepSeek：</span>https://api.deepseek.com
          </div>
          <div v-if="config.provider === 'Azure'" class="tip-item">
            <span class="tip-label">Azure：</span>https://你的资源名.openai.azure.com/
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="clearConfig" type="danger" text :disabled="!hasExistingConfig">
          清除配置
        </el-button>
        <div class="footer-right">
          <el-button @click="testConnection" :loading="testing">
            测试连接
          </el-button>
          <el-button type="primary" @click="saveConfig" :loading="saving">
            保存配置
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.privacy-notice {
  margin-bottom: 20px;
}

.notice-title {
  font-weight: 600;
  font-size: 14px;
}

.config-form {
  padding-right: 10px;
}

.endpoint-tips {
  font-size: 12px;
  color: #909399;
  line-height: 1.8;
}

.tip-item {
  display: flex;
  gap: 4px;
}

.tip-label {
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-right {
  display: flex;
  gap: 8px;
}
</style>
