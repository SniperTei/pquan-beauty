<template>
  <div class="customers-container">
    <div class="page-header">
      <div class="title-section">
        <h2>客户管理</h2>
        <span class="subtitle">管理您的美容院客户信息</span>
      </div>
      
      <!-- 搜索和添加客户 -->
      <div class="actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索客户姓名/电话"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
        <el-button type="primary" :icon="Plus" @click="handleAdd">添加客户</el-button>
      </div>
    </div>

    <!-- 客户列表卡片 -->
    <el-card class="table-card">
      <el-table 
        :data="customers" 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        border
      >
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <div class="customer-name">
              <el-avatar :size="32" :icon="UserFilled" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" min-width="180">
          <template #default="{ row }">
            <el-tag size="small" type="info">
              {{ row.createTime }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定删除该客户吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
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

    <!-- 添加/编辑客户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-form 
        :model="form" 
        :rules="rules"
        ref="formRef"
        label-width="80px"
        status-icon
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Edit, Delete, UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/apis/customer'

// 表格数据
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const submitting = ref(false)
const customers = ref([])

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加客户')
const formRef = ref(null)

const form = reactive({
  id: '',
  name: '',
  phone: '',
  email: '',
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 获取客户列表
const getCustomers = async () => {
  try {
    const res = await fetchCustomers({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value
    })
    customers.value = res.data
    total.value = res.total
  } catch (error) {
    ElMessage.error(error.message || '获取客户列表失败')
  }
}

// 搜索客户
const handleSearch = () => {
  getCustomers()
}

// 添加客户
const handleAdd = () => {
  dialogTitle.value = '添加客户'
  form.id = ''
  form.name = ''
  form.phone = ''
  form.email = ''
  form.remark = ''
  dialogVisible.value = true
}

// 编辑客户
const handleEdit = (row) => {
  dialogTitle.value = '编辑客户'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除客户
const handleDelete = async (row) => {
  try {
    await deleteCustomer(row.id)
    ElMessage.success('删除成功')
    getCustomers()
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (form.id) {
          await updateCustomer(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await createCustomer(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        getCustomers()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  getCustomers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getCustomers()
}

// 初始化加载客户列表
onMounted(() => {
  getCustomers()
})
</script>

<style lang="scss" scoped>
.customers-container {
  padding: 20px;
  
  .page-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title-section {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #1f2f3d;
      }
      
      .subtitle {
        font-size: 14px;
        color: #909399;
        margin-top: 8px;
        display: block;
      }
    }
    
    .actions {
      display: flex;
      gap: 12px;
      
      .search-input {
        width: 300px;
      }
    }
  }
  
  .table-card {
    margin-bottom: 20px;
    
    .customer-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  :deep(.el-dialog__body) {
    padding-top: 20px;
  }
}
</style>