<template>
  <div class="dictionary-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-section">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="字典类型">
            <el-input v-model="searchForm.type" placeholder="请输入字典类型" clearable />
          </el-form-item>
          <el-form-item label="字典代码">
            <el-input v-model="searchForm.code" placeholder="请输入字典代码" clearable />
          </el-form-item>
          <el-form-item label="字典名称">
            <el-input v-model="searchForm.name" placeholder="请输入字典名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div class="action-buttons">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增字典</el-button>
        </div>
      </div>
    </el-card>

    <!-- 字典列表 -->
    <el-card class="table-card" shadow="never">
      <el-table 
        :data="dictList" 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        border
        v-loading="loading"
        row-key="id"
      >
        <el-table-column prop="type" label="字典类型" min-width="120" align="center" />
        <el-table-column prop="code" label="字典代码" min-width="120" align="center" />
        <el-table-column prop="name" label="字典名称" min-width="120" align="center" />
        <el-table-column prop="sort" label="排序号" min-width="80" align="center" />
        <el-table-column prop="remarks" label="备注" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增字典对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="'新增字典'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="字典类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="字典代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入字典代码" />
        </el-form-item>
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input 
            v-model="form.remarks" 
            type="textarea" 
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'
import { getDictList, createDict } from '@/apis/dict'

// 搜索表单
const searchForm = reactive({
  type: '',
  code: '',
  name: ''
})

// 字典列表数据
const dictList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 新增表单
const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  type: '',
  code: '',
  name: '',
  sort: 0,
  remarks: ''
})

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请输入字典类型', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入字典代码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' }
  ]
}

// 获取字典列表
const getDicts = async () => {
  loading.value = true
  try {
    const res = await getDictList({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm
    })
    dictList.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取字典列表失败:', error)
    ElMessage.error('获取字典列表失败')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  getDicts()
}

// 处理重置
const handleReset = () => {
  searchForm.type = ''
  searchForm.code = ''
  searchForm.name = ''
  currentPage.value = 1
  getDicts()
}

// 处理新增
const handleAdd = () => {
  form.type = ''
  form.code = ''
  form.name = ''
  form.sort = 0
  form.remarks = ''
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await createDict(form)
        ElMessage.success('字典创建成功')
        dialogVisible.value = false
        getDicts()
      } catch (error) {
        ElMessage.error(error.message || '创建失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getDicts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getDicts()
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

onMounted(() => {
  getDicts()
})
</script>

<style lang="scss" scoped>
.dictionary-container {
  padding: 20px;
  
  .search-card {
    margin-bottom: 20px;
  }
  
  .search-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
