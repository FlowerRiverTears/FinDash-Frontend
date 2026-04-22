<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useCategoryStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { CategoryCreateDto, CategoryUpdateDto } from '@/types'
import { Menu, Top, Bottom, Plus, Edit, Delete } from '@element-plus/icons-vue'

const categoryStore = useCategoryStore()
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editId = ref<number | null>(null)
const loading = ref(false)

const form = reactive<CategoryCreateDto>({
  name: '',
  type: 1
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 10, message: '分类名称不能超过10个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分类类型', trigger: 'change' }
  ]
})

const typeOptions = [
  { label: '支出', value: 1, tagType: 'danger' },
  { label: '收入', value: 0, tagType: 'success' }
]

const incomeCount = computed(() => categoryStore.incomeCategories().length)
const expenseCount = computed(() => categoryStore.expenseCategories().length)

const openCreate = () => {
  dialogMode.value = 'create'
  form.name = ''
  form.type = 1
  editId.value = null
  dialogVisible.value = true
}

const openEdit = (row: any) => {
  dialogMode.value = 'edit'
  form.name = row.name
  form.type = row.type
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
        result = await categoryStore.createCategory({ ...form })
      } else if (editId.value !== null) {
        result = await categoryStore.updateCategory(editId.value, { ...form } as CategoryUpdateDto)
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
      `确定要删除分类「${row.name}」吗？删除后不可恢复。`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    const result = await categoryStore.deleteCategory(row.id)
    if (result.success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch {
    // cancelled
  }
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<template>
  <div class="category-page">
    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <el-card shadow="hover" class="mini-stat">
          <div class="mini-stat-content">
            <el-icon :size="28" color="#409eff"><Menu /></el-icon>
            <div>
              <div class="mini-stat-label">总分类数</div>
              <div class="mini-stat-value">{{ categoryStore.categories.length }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="mini-stat">
          <div class="mini-stat-content">
            <el-icon :size="28" color="#67c23a"><Top /></el-icon>
            <div>
              <div class="mini-stat-label">收入分类</div>
              <div class="mini-stat-value">{{ incomeCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="mini-stat">
          <div class="mini-stat-content">
            <el-icon :size="28" color="#f56c6c"><Bottom /></el-icon>
            <div>
              <div class="mini-stat-label">支出分类</div>
              <div class="mini-stat-value">{{ expenseCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">分类列表</span>
          <el-button type="primary" @click="openCreate">
            <el-icon><Plus /></el-icon>
            新建分类
          </el-button>
        </div>
      </template>

      <el-table
        :data="categoryStore.categories"
        v-loading="categoryStore.loading"
        stripe
        style="width: 100%"
        empty-text="暂无分类数据"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="200">
          <template #default="{ row }">
            <div class="category-name-cell">
              <el-icon :size="18" :color="row.type === 0 ? '#67c23a' : '#f56c6c'">
                <component :is="row.type === 0 ? 'Top' : 'Bottom'" />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 0 ? 'success' : 'danger'"
              size="small"
              effect="light"
              round
            >
              {{ row.type === 0 ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建分类' : '编辑分类'"
      width="440px"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="large">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="10" show-word-limit clearable />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">
              <el-tag type="danger" size="small" effect="light">支出</el-tag>
            </el-radio>
            <el-radio :value="0">
              <el-tag type="success" size="small" effect="light">收入</el-tag>
            </el-radio>
          </el-radio-group>
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
.category-page {
  max-width: 1000px;
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
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}
</style>
