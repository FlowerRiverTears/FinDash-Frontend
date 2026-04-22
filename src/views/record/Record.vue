<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRecordStore, useCategoryStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { CreateRecordDto, RecordUpdateDto } from '@/types'
import {
  Top, Bottom, Wallet, Plus, Edit, Delete, Search
} from '@element-plus/icons-vue'

const recordStore = useRecordStore()
const categoryStore = useCategoryStore()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editId = ref<number | null>(null)
const loading = ref(false)
const filterType = ref<number | null>(null)
const searchKeyword = ref('')

const form = reactive<CreateRecordDto>({
  name: '',
  description: '',
  price: 0,
  categoryId: 0
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入账目名称', trigger: 'blur' },
    { max: 10, message: '名称不能超过10个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value)
}

const filteredRecords = computed(() => {
  let result = recordStore.records
  if (filterType.value !== null) {
    result = result.filter(r => categoryStore.getCategoryType(r.categoryId) === filterType.value)
  }
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(r =>
      r.name.toLowerCase().includes(keyword) ||
      r.categoryName.toLowerCase().includes(keyword) ||
      (r.description && r.description.toLowerCase().includes(keyword))
    )
  }
  return result
})

const openCreate = () => {
  dialogMode.value = 'create'
  form.name = ''
  form.description = ''
  form.price = 0
  form.categoryId = categoryStore.categories[0]?.id || 0
  editId.value = null
  dialogVisible.value = true
}

const openEdit = (row: any) => {
  dialogMode.value = 'edit'
  form.name = row.name
  form.description = row.description || ''
  form.price = row.price
  form.categoryId = row.categoryId
  editId.value = row.id
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      let result
      if (dialogMode.value === 'create') {
        result = await recordStore.createRecord({ ...form })
      } else if (editId.value !== null) {
        result = await recordStore.updateRecord(editId.value, { ...form } as RecordUpdateDto)
      }
      if (result?.success) {
        ElMessage.success(dialogMode.value === 'create' ? '创建成功' : '更新成功')
        closeDialog()
      } else {
        ElMessage.error(result?.message || '操作失败')
      }
    } finally {
      loading.value = false
    }
  })
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除账目「${row.name}」吗？删除后不可恢复。`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    const result = await recordStore.deleteRecord(row.id)
    if (result.success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch {
    // cancelled
  }
}

const clearFilter = () => {
  filterType.value = null
  searchKeyword.value = ''
}

onMounted(async () => {
  await Promise.all([
    recordStore.fetchRecords(),
    categoryStore.fetchCategories()
  ])
})
</script>

<template>
  <div class="record-page">
    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <el-card shadow="hover" class="mini-stat">
          <div class="mini-stat-content">
            <el-icon :size="28" color="#67c23a"><Top /></el-icon>
            <div>
              <div class="mini-stat-label">总收入</div>
              <div class="mini-stat-value income">{{ formatCurrency(recordStore.totalIncome) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="mini-stat">
          <div class="mini-stat-content">
            <el-icon :size="28" color="#f56c6c"><Bottom /></el-icon>
            <div>
              <div class="mini-stat-label">总支出</div>
              <div class="mini-stat-value expense">{{ formatCurrency(recordStore.totalExpense) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="mini-stat">
          <div class="mini-stat-content">
            <el-icon :size="28" color="#409eff"><Wallet /></el-icon>
            <div>
              <div class="mini-stat-label">结余</div>
              <div class="mini-stat-value" :class="recordStore.netBalance >= 0 ? 'income' : 'expense'">
                {{ formatCurrency(recordStore.netBalance) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="card-title">账目记录</span>
            <el-radio-group v-model="filterType" size="small">
              <el-radio-button :value="null">全部</el-radio-button>
              <el-radio-button :value="0">收入</el-radio-button>
              <el-radio-button :value="1">支出</el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-right">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索账目..."
              :prefix-icon="Search"
              size="small"
              clearable
              style="width: 200px; margin-right: 12px;"
            />
            <el-button type="primary" @click="openCreate">
              <el-icon><Plus /></el-icon>
              新建账目
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredRecords"
        v-loading="recordStore.loading"
        stripe
        style="width: 100%"
        empty-text="暂无账目记录"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" label="名称" min-width="120">
          <template #default="{ row }">
            <span class="record-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="categoryStore.getCategoryType(row.categoryId) === 0 ? 'success' : 'danger'"
              size="small"
              effect="light"
              round
            >
              {{ row.categoryName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" min-width="140" align="right">
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
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredRecords.length === 0 && !recordStore.loading" class="empty-actions">
        <el-button type="primary" text @click="clearFilter">清除筛选条件</el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建账目' : '编辑账目'"
      width="500px"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="large">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入账目名称" maxlength="10" show-word-limit clearable />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option-group label="收入">
              <el-option
                v-for="cat in categoryStore.incomeCategories()"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-option-group>
            <el-option-group label="支出">
              <el-option
                v-for="cat in categoryStore.expenseCategories()"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item label="金额" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0.01"
            :precision="2"
            :step="10"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="选填，最多100个字符"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ dialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.record-page {
  max-width: 1200px;
}

.stat-row {
  margin-bottom: 20px;
}

.mini-stat {
  border-radius: 12px;
}

.mini-stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mini-stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 2px;
}

.mini-stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.mini-stat-value.income {
  color: #67c23a;
}

.mini-stat-value.expense {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.record-name {
  font-weight: 500;
  color: #303133;
}

.amount-text {
  font-weight: 600;
  font-size: 14px;
}

.amount-income {
  color: #67c23a;
}

.amount-expense {
  color: #f56c6c;
}

.empty-actions {
  text-align: center;
  padding: 16px 0;
}
</style>
