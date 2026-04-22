<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRecordStore, useCategoryStore, useUserStore } from '@/stores'
import * as echarts from 'echarts'
import {
  Plus, Top, Bottom, Wallet, Histogram,
  PieChart, TrendCharts, List, ArrowRight
} from '@element-plus/icons-vue'

const recordStore = useRecordStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()

const barChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
let barChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value)
}

const recentRecords = computed(() => recordStore.records.slice(0, 8))

const initBarChart = () => {
  if (!barChartRef.value) return
  if (barChart) barChart.dispose()
  barChart = echarts.init(barChartRef.value)

  const categoryStats = recordStore.getCategoryStats()
  const categories = Object.keys(categoryStats)
  const values = Object.values(categoryStats)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        return `${params[0].name}<br/>支出: ${formatCurrency(params[0].value)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories.length > 0 ? categories : ['暂无数据'],
      axisLabel: {
        rotate: categories.length > 5 ? 30 : 0,
        fontSize: 12,
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => value >= 10000 ? `${(value / 10000).toFixed(1)}万` : String(value),
        fontSize: 12,
        color: '#909399'
      },
      splitLine: {
        lineStyle: { type: 'dashed', color: '#ebeef5' }
      }
    },
    series: [{
      type: 'bar',
      data: values.length > 0 ? values : [0],
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#79bbff' }
        ])
      },
      barMaxWidth: 40,
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#337ecc' },
            { offset: 1, color: '#409eff' }
          ])
        }
      }
    }]
  }

  barChart.setOption(option)
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  if (pieChart) pieChart.dispose()
  pieChart = echarts.init(pieChartRef.value)

  const income = recordStore.totalIncome
  const expense = recordStore.totalExpense

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: '#606266', fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        fontSize: 12,
        color: '#606266'
      },
      labelLine: {
        length: 15,
        length2: 10
      },
      data: [
        {
          value: income || 0,
          name: '总收入',
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#95d475' }
          ])}
        },
        {
          value: expense || 0,
          name: '总支出',
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#f56c6c' },
            { offset: 1, color: '#fab6b6' }
          ])}
        }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.15)'
        }
      }
    }]
  }

  pieChart.setOption(option)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  if (trendChart) trendChart.dispose()
  trendChart = echarts.init(trendChartRef.value)

  const categoryStoreLocal = useCategoryStore()
  const monthData: Record<string, { income: number; expense: number }> = {}

  recordStore.records.forEach(r => {
    const date = new Date()
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthData[monthKey]) {
      monthData[monthKey] = { income: 0, expense: 0 }
    }
    const catType = categoryStoreLocal.getCategoryType(r.categoryId)
    if (catType === 0) {
      monthData[monthKey].income += Number(r.price)
    } else {
      monthData[monthKey].expense += Number(r.price)
    }
  })

  const months = Object.keys(monthData).sort()
  const incomeData = months.map(m => monthData[m].income)
  const expenseData = months.map(m => monthData[m].expense)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '支出'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months.length > 0 ? months : ['当前月'],
      axisLabel: { fontSize: 11, color: '#606266' }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => value >= 10000 ? `${(value / 10000).toFixed(1)}万` : String(value),
        fontSize: 11,
        color: '#909399'
      },
      splitLine: { lineStyle: { type: 'dashed', color: '#ebeef5' } }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: incomeData.length > 0 ? incomeData : [recordStore.totalIncome],
        lineStyle: { width: 3, color: '#67c23a' },
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,194,58,0.25)' },
            { offset: 1, color: 'rgba(103,194,58,0.02)' }
          ])
        }
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: expenseData.length > 0 ? expenseData : [recordStore.totalExpense],
        lineStyle: { width: 3, color: '#f56c6c' },
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,108,108,0.25)' },
            { offset: 1, color: 'rgba(245,108,108,0.02)' }
          ])
        }
      }
    ]
  }

  trendChart.setOption(option)
}

const handleResize = () => {
  barChart?.resize()
  pieChart?.resize()
  trendChart?.resize()
}

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    recordStore.fetchRecords()
  ])
  setTimeout(() => {
    initBarChart()
    initPieChart()
    initTrendChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

watch(() => recordStore.records.length, () => {
  setTimeout(() => {
    initBarChart()
    initPieChart()
    initTrendChart()
  }, 100)
})
</script>

<template>
  <div class="dashboard">
    <div class="welcome-section">
      <div class="welcome-text">
        <h2 class="welcome-title">欢迎回来，{{ userStore.userInfo?.nickName || '用户' }} 👋</h2>
        <p class="welcome-desc">这是您的财务概览，轻松掌控每一笔收支</p>
      </div>
      <el-button type="primary" @click="$router.push('/record')">
        <el-icon><Plus /></el-icon>
        记一笔
      </el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="8">
        <div class="stat-card stat-income">
          <div class="stat-icon">
            <el-icon :size="26"><Top /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">总收入</span>
            <span class="stat-value">{{ formatCurrency(recordStore.totalIncome) }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="stat-card stat-expense">
          <div class="stat-icon">
            <el-icon :size="26"><Bottom /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">总支出</span>
            <span class="stat-value">{{ formatCurrency(recordStore.totalExpense) }}</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="stat-card stat-balance">
          <div class="stat-icon">
            <el-icon :size="26"><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">结余</span>
            <span class="stat-value" :class="{ 'balance-negative': recordStore.netBalance < 0 }">
              {{ formatCurrency(recordStore.netBalance) }}
            </span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title"><el-icon><Histogram /></el-icon> 分类支出统计</span>
              <el-tag size="small" type="info">本月</el-tag>
            </div>
          </template>
          <div ref="barChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title"><el-icon><PieChart /></el-icon> 收支占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title"><el-icon><TrendCharts /></el-icon> 收支趋势</span>
              <el-tag size="small" type="success">月度视图</el-tag>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container chart-tall"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title"><el-icon><List /></el-icon> 最近账目记录</span>
          <el-button type="primary" text @click="$router.push('/record')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>

      <el-table
        v-if="recentRecords.length > 0"
        :data="recentRecords"
        stripe
        style="width: 100%"
        empty-text="暂无账目记录"
      >
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column label="分类" min-width="120">
          <template #default="{ row }">
            <el-tag
              :type="categoryStore.getCategoryType(row.categoryId) === 0 ? 'success' : 'danger'"
              size="small"
              effect="light"
            >
              {{ row.categoryName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" min-width="130" align="right">
          <template #default="{ row }">
            <span
              class="amount-text"
              :class="{
                'amount-income': categoryStore.getCategoryType(row.categoryId) === 0,
                'amount-expense': categoryStore.getCategoryType(row.categoryId) === 1
              }"
            >
              {{ categoryStore.getCategoryType(row.categoryId) === 0 ? '+' : '-' }}
              {{ formatCurrency(row.price) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="暂无账目记录，快去记第一笔吧！" />
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-desc {
  font-size: 14px;
  opacity: 0.85;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px !important;
  margin-bottom: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.balance-negative {
  color: var(--danger-color) !important;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.chart-tall {
  height: 360px;
}

.table-card {
  margin-top: 4px;
}

.amount-text {
  font-weight: 600;
  font-size: 14px;
}

.amount-income {
  color: var(--success-color);
}

.amount-expense {
  color: var(--danger-color);
}
</style>
