<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessageBox } from 'element-plus'
import {
  TrendCharts, DataAnalysis, Menu, Wallet,
  SwitchButton, Fold, Expand, ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapsed = ref(false)

const activeMenu = computed(() => {
  if (route.path === '/' || route.path === '') return '/'
  return route.path
})

const pageTitle = computed(() => {
  return (route.meta.title as string) || 'FinDash'
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
  } catch {
    // cancelled
  }
}

const handleSelect = (index: string) => {
  router.push(index)
}

watch(() => route.path, () => {
  if (window.innerWidth < 768) {
    isCollapsed.value = true
  }
})
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="layout-aside">
      <div class="sidebar-header">
        <el-icon :size="28" color="#409eff"><TrendCharts /></el-icon>
        <transition name="fade">
          <span v-if="!isCollapsed" class="sidebar-title">FinDash</span>
        </transition>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="true"
        background-color="#001529"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#ffffff"
        class="sidebar-menu"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>首页概览</template>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Menu /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>
        <el-menu-item index="/record">
          <el-icon><Wallet /></el-icon>
          <template #title>账目记录</template>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <div v-if="!isCollapsed" class="user-section">
          <el-avatar :size="32" class="user-avatar">
            {{ userStore.userInfo?.nickName?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-detail">
            <span class="user-name">{{ userStore.userInfo?.nickName || '用户' }}</span>
          </div>
        </div>
        <el-button
          :class="['logout-btn', { 'logout-btn-collapsed': isCollapsed }]"
          text
          @click="handleLogout"
        >
          <el-icon><SwitchButton /></el-icon>
          <span v-if="!isCollapsed">退出登录</span>
        </el-button>
      </div>
    </el-aside>

    <el-container class="main-container">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            @click="isCollapsed = !isCollapsed"
          >
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <span class="header-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <div class="user-dropdown">
              <el-avatar :size="32" class="header-avatar">
                {{ userStore.userInfo?.nickName?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="header-username">{{ userStore.userInfo?.nickName || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.layout-aside {
  background: #001529;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu::-webkit-scrollbar {
  width: 0;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #409eff, #337ecc) !important;
  border-radius: 8px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.user-detail {
  overflow: hidden;
}

.user-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  color: rgba(255, 255, 255, 0.65);
  justify-content: flex-start;
  gap: 8px;
  padding: 8px 12px;
}

.logout-btn:hover {
  color: #f56c6c;
}

.logout-btn-collapsed {
  justify-content: center;
}

.main-container {
  overflow: hidden;
}

.layout-header {
  height: 64px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: #f5f7fa;
}

.header-avatar {
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: white;
  font-weight: 600;
}

.header-username {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.layout-main {
  background: #f0f2f5;
  overflow-y: auto;
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
