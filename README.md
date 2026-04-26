# FinDash-Frontend

<div align="center">

![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat-square&logo=vite)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.7-409EFF?style=flat-square&logo=element)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**FinDash 智能财务助手平台 - 前端**

[后端项目](https://github.com/你的用户名/FinDash) | [在线演示](#) (待部署)

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [功能模块](#功能模块)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [组件说明](#组件说明)

---

## 📝 项目简介

FinDash-Frontend 是 FinDash 智能财务助手平台的前端部分，基于 Vue 3 + TypeScript 构建，提供直观的用户界面和流畅的交互体验。

### 核心特性

- 🎨 **现代化 UI** - Element Plus 组件库，清新美观
- 📊 **数据可视化** - ECharts 图表，实时展示财务数据
- 🤖 **AI 智能助手** - 自然语言对话，智能财务问答
- 📱 **响应式设计** - 适配桌面端和移动端

---

## 📦 功能模块

### 1. 用户认证 (`/login`, `/register`)

| 功能 | 说明 |
|------|------|
| 用户注册 | 表单验证，安全密码加密传输 |
| 用户登录 | JWT Token 认证，自动续期 |
| 路由守卫 | 未登录自动跳转登录页 |

### 2. 首页概览 (`/`)

| 功能 | 说明 |
|------|------|
| 收支概览卡片 | 展示总收入、总支出、结余 |
| 消费趋势图 | 折线图展示月度趋势 |
| 分类占比图 | 饼图展示各类别占比 |
| 快捷操作 | 快速添加收支记录 |

### 3. 收支记录 (`/record`)

| 功能 | 说明 |
|------|------|
| 记录列表 | 支持按分类、日期筛选 |
| 添加记录 | 金额、分类、备注快速录入 |
| 编辑删除 | 滑动/点击操作 |
| 分类统计 | 自动汇总各分类金额 |

### 4. 分类管理 (`/category`)

| 功能 | 说明 |
|------|------|
| 分类列表 | 收入/支出分类管理 |
| 添加分类 | 自定义分类名称和图标 |
| 编辑删除 | 拖拽排序，一键操作 |

### 5. AI 智能助手 (`/ai-chat`)

| 功能 | 说明 |
|------|------|
| 对话界面 | 类 ChatGPT 风格对话 |
| 快捷问题 | 一键发送预设问题 |
| AI 配置 | 支持 OpenAI/DeepSeek/MiniMax/Azure |
| 连接测试 | 实时验证 API 配置 |

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue.js | 3.4 | 渐进式前端框架 |
| TypeScript | 5.4 | 类型安全开发 |
| Vite | 5.2 | 快速构建工具 |
| Element Plus | 2.7 | UI 组件库 |
| Pinia | 2.1 | 状态管理 |
| Vue Router | 4.3 | 路由管理 |
| Axios | 1.7 | HTTP 请求 |
| ECharts | 5.5 | 数据可视化 |
| Three.js | 0.170 | 3D 渲染 |

---

## 📁 项目结构

```
FinDash-Frontend/
│
├── 📂 src/
│   │
│   ├── 📂 api/                    # API 请求封装
│   │   ├── index.ts              # API 导出入口
│   │   ├── request.ts           # Axios 实例配置
│   │   ├── user.ts              # 用户相关 API
│   │   ├── category.ts          # 分类相关 API
│   │   └── aichat.ts           # AI 对话 API
│   │
│   ├── 📂 assets/                # 静态资源
│   │
│   ├── 📂 components/             # 公共组件
│   │
│   ├── 📂 router/                # 路由配置
│   │   └── index.ts             # 路由定义 + 守卫
│   │
│   ├── 📂 stores/                # Pinia 状态管理
│   │   ├── user.ts              # 用户状态
│   │   └── counter.ts           # 示例状态
│   │
│   ├── 📂 types/                 # TypeScript 类型定义
│   │   └── index.ts             # 全局类型声明
│   │
│   ├── 📂 views/                 # 页面组件
│   │   ├── auth/                # 认证页面
│   │   │   ├── Login.vue        # 登录页
│   │   │   └── Register.vue     # 注册页
│   │   │
│   │   ├── dashboard/           # 首页概览
│   │   │   └── Dashboard.vue    # 仪表盘
│   │   │
│   │   ├── record/              # 收支记录
│   │   │   └── Record.vue       # 记录管理
│   │   │
│   │   ├── category/            # 分类管理
│   │   │   └── Category.vue     # 分类管理
│   │   │
│   │   ├── aichat/             # AI 智能助手
│   │   │   ├── AiChat.vue       # 对话页面
│   │   │   ├── AiConfigDialog.vue # 配置弹窗
│   │   │   └── components/      # AI 相关组件
│   │   │
│   │   ├── scene3d/            # 3D 场景
│   │   │   ├── Scene3D.vue      # 3D 主容器
│   │   │   ├── SceneShopping.vue # 购物场景
│   │   │   ├── SceneHome.vue    # 报表场景
│   │   │   ├── composables/     # Three.js Hooks
│   │   │   │   ├── useThreeScene.ts
│   │   │   │   ├── useCharacter.ts
│   │   │   │   └── useSceneTransition.ts
│   │   │   ├── stores/          # 场景状态
│   │   │   │   └── sceneStore.ts
│   │   │   ├── components/      # 场景组件
│   │   │   │   └── UIPanel.vue
│   │   │   └── types.ts         # 场景类型定义
│   │   │
│   │   └── Layout.vue           # 全局布局
│   │
│   ├── App.vue                   # 根组件
│   └── main.ts                   # 入口文件
│
├── 📂 public/                    # 公共资源
│
├── vite.config.ts               # Vite 配置
├── package.json                 # 依赖管理
├── tsconfig.json                # TypeScript 配置
└── README.md                    # 项目文档
```

---

## 🚀 开发指南

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
# 访问 http://localhost:3000
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

---

## 🧩 组件说明

### API 请求封装

```typescript
// api/request.ts - Axios 实例配置
- 自动附加 JWT Token
- 统一错误处理
- 401 自动跳转登录
```

### 状态管理

```typescript
// stores/user.ts - 用户状态
- token 管理
- 用户信息
- 登录/登出方法
```

### 3D 场景系统

```typescript
// scene3d/composables/ - Three.js Hooks
useThreeScene()       // 场景初始化和渲染
useCharacter()        // 3D 人物动画控制
useSceneTransition()   // 场景切换过渡
```

---

## 🔌 API 对接

前端通过 Vite 代理连接后端 API：

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'https://localhost:7264',  // 后端地址
    changeOrigin: true
  }
}
```

### 环境变量 (可选)

创建 `.env.local`：

```env
VITE_API_BASE_URL=/api
```

---

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](../LICENSE)

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [ECharts](https://echarts.apache.org/)
- [Three.js](https://threejs.org/)
- [Pinia](https://pinia.vuejs.org/)
