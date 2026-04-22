<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, TrendCharts } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  userName: '',
  password: '',
  confirmPassword: '',
  nickName: '',
  email: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 10, message: '用户名需要5-10个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 10, message: '密码需要5-10个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '昵称需要2-10个字符', trigger: 'blur' }
  ]
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const result = await userStore.register({
        userName: form.userName,
        password: form.password,
        nickName: form.nickName,
        email: form.email || undefined
      })
      if (result.success) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } else {
        ElMessage.error(result.message)
      }
    } catch {
      ElMessage.error('注册失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="page-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">
          <el-icon :size="40" color="#409eff"><TrendCharts /></el-icon>
        </div>
        <h1 class="auth-title">创建账号</h1>
        <p class="auth-subtitle">开始您的财务管理之旅</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="form.userName"
            placeholder="5-10个字符"
            :prefix-icon="User"
            maxlength="10"
            clearable
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="5-10个字符"
                :prefix-icon="Lock"
                maxlength="10"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="再次输入密码"
                :prefix-icon="Lock"
                maxlength="10"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickName">
              <el-input
                v-model="form.nickName"
                placeholder="2-10个字符"
                maxlength="10"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱（可选）">
              <el-input
                v-model="form.email"
                placeholder="选填"
                type="email"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleSubmit"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="auth-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.page-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-card {
  width: 480px;
  padding: 48px 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #ecf5ff, #d9ecff);
  border-radius: 20px;
  margin-bottom: 16px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: #909399;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  color: #909399;
  font-size: 14px;
}

.link {
  color: #409eff;
  margin-left: 4px;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
