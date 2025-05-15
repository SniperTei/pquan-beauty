<template>
  <div class="customers-container">
    <div class="page-header">
      <div class="title-section">
        <h2>客户管理</h2>
        <span class="subtitle">管理您的美容院客户信息</span>
      </div>
      
      <!-- 搜索和添加客户 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item>
            <el-input
              v-model="searchForm.name"
              placeholder="客户姓名"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="searchForm.medicalRecordNumber"
              placeholder="病历号"
              class="search-input"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增客户</el-button>
      </div>
    </div>

    <!-- 客户列表卡片 -->
    <el-card class="table-card" shadow="never">
      <el-table 
        :data="customerList" 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        border
        v-loading="loading"
        row-key="customerId"
        stripe
      >
        <el-table-column prop="name" label="姓名" min-width="120" align="center">
          <template #default="{ row }">
            <div class="customer-name">
              <el-avatar :size="32" :src="row.avatarUrl">
                {{ row.name.substring(0, 1) }}
              </el-avatar>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="medicalRecordNumber" label="病历号" min-width="120" align="center" />
        <el-table-column prop="createdAt" label="创建时间" min-width="180" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">
              {{ new Date(row.createdAt).toLocaleString() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="客户类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="row.newCustomerFlag === 'Y' ? 'success' : 'info'" 
              size="small"
            >
              {{ row.newCustomerFlag === 'Y' ? '新客户' : '老客户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定删除该客户吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
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
          background
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
        <!-- 头像 -->
        <el-form-item label="头像" prop="avatarUrl">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">请上传头像图片（必填）</div>
        </el-form-item>
        <!-- 病例号 -->
        <el-form-item label="病例号" prop="medicalRecordNumber">
          <el-input v-model="form.medicalRecordNumber" placeholder="请输入病例号" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input 
            v-model="form.remarks" 
            type="textarea" 
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        <!-- 添加新老客户选择 -->
        <el-form-item label="客户类型" prop="newCustomerFlag">
          <el-radio-group v-model="form.newCustomerFlag">
            <el-radio label="Y">新客户</el-radio>
            <el-radio label="N">老客户</el-radio>
          </el-radio-group>
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
import { Search, Plus, Edit, Delete, Refresh, User, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/apis/customer'
import { uploadImages } from '@/apis/upload'

// 表格数据
const searchForm = reactive({
  name: '',
  medicalRecordNumber: ''
})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const submitting = ref(false)
const loading = ref(false)
const customerList = ref([])
let isUpdate = ref(false)

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加客户')
const formRef = ref(null)

const form = reactive({
  id: '',
  name: '',
  phone: '',
  email: '',
  avatarUrl: '',
  medicalRecordNumber: '',
  remarks: '',
  newCustomerFlag: 'N' // 默认为老客户
})

const rules = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ],
  medicalRecordNumber: [
    { required: true, message: '请输入病历号', trigger: 'blur' }
  ],
  // 头像可选
  remarks: [
    { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
  ]
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  searchForm.medicalRecordNumber = ''
  currentPage.value = 1
  getCustomers()
}

// 获取客户列表
const getCustomers = async () => {
  loading.value = true
  try {
    const res = await fetchCustomers({
      page: currentPage.value,
      limit: pageSize.value,
      name: searchForm.name,
      medicalRecordNumber: searchForm.medicalRecordNumber
    })
    customerList.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    ElMessage.error(error.message || '获取客户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索客户
const handleSearch = () => {
  currentPage.value = 1
  getCustomers()
}

// 添加客户
const handleAdd = () => {
  dialogTitle.value = '添加客户'
  form.id = ''
  form.name = ''
  form.phone = ''
  form.email = ''
  form.avatarUrl = ''
  form.medicalRecordNumber = ''
  form.remarks = ''
  form.newCustomerFlag = 'N' // 默认为老客户
  isUpdate.value = false
  dialogVisible.value = true
}

// 编辑客户
const handleEdit = (row) => {
  dialogTitle.value = '编辑客户'
  Object.assign(form, {
    ...row,
    newCustomerFlag: row.newCustomerFlag || 'N' // 确保有默认值
  })
  isUpdate.value = true
  dialogVisible.value = true
}

// 删除客户
const handleDelete = async (row) => {
  try {
    await deleteCustomer(row.customerId)
    ElMessage.success('删除成功')
    getCustomers()
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
  }
}

// 处理头像上传
const handleAvatarChange = async (file) => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  const formData = new FormData()
  // 创建新的 File 对象，使用编码后的文件名
  const encodedName = encodeURIComponent(file.raw.name)
  const newFile = new File([file.raw], encodedName, { type: file.raw.type })
  formData.append('files', newFile)
  formData.append('type', 'avatar')

  try {
    const response = await uploadImages(formData)
    if (response.code === '000000') {
      form.avatarUrl = response.data.files[0].url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(response.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // if (!form.avatarUrl) {
      //   ElMessage.error('请上传头像')
      //   return
      // }

      submitting.value = true
      try {
        if (isUpdate.value) {
          await updateCustomer(form.customerId, form)
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
  background-color: #f5f7fa;
  min-height: 100vh;
  
  .page-header {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .title-section {
      margin-bottom: 24px;
      
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
    
    .search-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .search-form {
        flex: 1;
        margin-right: 16px;
        
        .search-input {
          width: 220px;
        }
      }
    }
  }
  
  .table-card {
    background-color: #fff;
    border-radius: 8px;
    
    .customer-name {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
  }

  .avatar {
    width: 100px;
    height: 100px;
    display: block;
    object-fit: cover;
  }
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>