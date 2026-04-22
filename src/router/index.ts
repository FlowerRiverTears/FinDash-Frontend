import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false, title: '注册' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '首页概览' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/Category.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'record',
        name: 'Record',
        component: () => import('@/views/record/Record.vue'),
        meta: { title: '账目记录' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (to.meta.title) {
    document.title = `${to.meta.title} - FinDash`
  }

  if (requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && userStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
