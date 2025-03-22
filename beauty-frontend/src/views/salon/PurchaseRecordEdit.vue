<template>
  <div class="purchase-record-edit">
    <div class="page-header">
      <div class="title-section">
        <h2>{{ isEdit ? '编辑消费记录' : '新增消费记录' }}</h2>
        <span class="subtitle">{{ isEdit ? '修改已有消费记录信息' : '创建新的消费记录' }}</span>
      </div>
    </div>

    <el-card class="form-card" shadow="never">
      <el-form 
        :model="form" 
        :rules="rules"
        ref="formRef"
        label-width="100px"
        status-icon
      >
        <!-- 客户选择部分 -->
        <el-form-item label="选择客户" prop="customerId" v-if="!isEdit">
          <div class="customer-select">
            <el-radio-group v-model="customerSelectType" @change="handleCustomerTypeChange">
              <el-radio label="exist">选择已有客户</el-radio>
              <el-radio label="new">新增客户</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>

        <!-- 已有客户选择 -->
        <template v-if="customerSelectType === 'exist' && !isEdit">
          <el-form-item label="选择客户">
            <el-card class="customer-select-card" shadow="never">
              <!-- 客户搜索表单 -->
              <div class="customer-search">
                <el-input
                  v-model="customerSearchForm.name"
                  placeholder="客户姓名"
                  clearable
                  @keyup.enter="handleCustomerSearch"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
                <el-input
                  v-model="customerSearchForm.medicalRecordNumber"
                  placeholder="病历号"
                  clearable
                  @keyup.enter="handleCustomerSearch"
                >
                  <template #prefix>
                    <el-icon><Document /></el-icon>
                  </template>
                </el-input>
                <el-button type="primary" :icon="Search" @click="handleCustomerSearch">搜索</el-button>
                <el-button :icon="Refresh" @click="handleCustomerSearchReset">重置</el-button>
              </div>

              <!-- 客户列表 -->
              <el-table
                :data="customerOptions"
                style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa' }"
                border
                v-loading="customerSearchLoading"
                @row-click="handleSelectCustomer"
                highlight-current-row
              >
                <el-table-column width="60" align="center">
                  <template #default="{ row }">
                    <el-radio 
                      v-model="form.customerId" 
                      :label="row.customerId"
                      @change="() => handleSelectCustomer(row)"
                    >
                      &nbsp;
                    </el-radio>
                  </template>
                </el-table-column>
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
              </el-table>

              <!-- 客户列表分页 -->
              <div class="customer-pagination">
                <el-pagination
                  v-model:current-page="customerPage"
                  v-model:page-size="customerPageSize"
                  :page-sizes="[5, 10, 20]"
                  :total="customerTotal"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handleCustomerSizeChange"
                  @current-change="handleCustomerPageChange"
                  background
                  small
                />
              </div>
            </el-card>
          </el-form-item>
        </template>

        <!-- 新增客户表单 -->
        <template v-if="customerSelectType === 'new' && !isEdit">
          <el-form-item label="客户姓名" prop="customerInfo.name">
            <el-input v-model="form.customerInfo.name" placeholder="请输入客户姓名" />
          </el-form-item>
          <el-form-item label="病历号" prop="customerInfo.medicalRecordNumber">
            <el-input v-model="form.customerInfo.medicalRecordNumber" placeholder="请输入病历号" />
          </el-form-item>
          <el-form-item label="头像" prop="customerInfo.avatarUrl">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleAvatarChange"
              accept="image/*"
            >
              <img v-if="form.customerInfo.avatarUrl" :src="form.customerInfo.avatarUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">请上传头像图片（必填）</div>
          </el-form-item>
        </template>

        <!-- 消费记录表单项 -->
        <el-form-item label="消费日期" prop="purchaseDate">
          <el-date-picker
            v-model="form.purchaseDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="消费金额" prop="purchaseAmount">
          <el-input-number 
            v-model="form.purchaseAmount"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="消费类型" prop="purchaseType">
          <el-select 
            v-model="form.purchaseType"
            placeholder="请选择消费类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in purchaseTypes"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消费项目" prop="purchaseItem">
          <el-input v-model="form.purchaseItem" placeholder="请输入消费项目" />
        </el-form-item>
        <el-form-item label="实际项目" prop="purchaseFactItem">
          <el-input v-model="form.purchaseFactItem" placeholder="请输入实际消费项目" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input 
            v-model="form.remarks"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>

        <!-- 表单操作按钮 -->
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, Refresh, User, Document } from '@element-plus/icons-vue'
import { fetchCustomers } from '@/apis/customer'
import { createPurchaseRecord, updatePurchaseRecord, fetchPurchaseRecord } from '@/apis/purchaseRecord'
import { getDictList } from '@/apis/dict'
import { uploadImages } from '@/apis/upload'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)

// 客户选择相关
const customerSelectType = ref('exist')
const customerOptions = ref([])
const customerSearchLoading = ref(false)

// 客户搜索相关
const customerSearchForm = reactive({
  name: '',
  medicalRecordNumber: ''
})
const customerPage = ref(1)
const customerPageSize = ref(5)
const customerTotal = ref(0)

// 字典数据
const purchaseTypes = ref([])

// 表单数据
const form = reactive({
  customerId: '',
  customerInfo: {
    name: '',
    medicalRecordNumber: '',
    avatarUrl: '',
    remarks: ''
  },
  purchaseDate: '',
  purchaseAmount: 0,
  purchaseType: '',
  purchaseItem: '',
  purchaseFactItem: '',
  remarks: ''
})

// 验证规则
const rules = computed(() => ({
  customerId: [
    { 
      required: customerSelectType.value === 'exist', 
      message: '请选择客户', 
      trigger: 'change' 
    }
  ],
  'customerInfo.name': [
    { 
      required: customerSelectType.value === 'new', 
      message: '请输入客户姓名', 
      trigger: 'blur' 
    }
  ],
  'customerInfo.medicalRecordNumber': [
    { 
      required: customerSelectType.value === 'new', 
      message: '请输入病历号', 
      trigger: 'blur' 
    }
  ],
  'customerInfo.avatarUrl': [
    { 
      required: customerSelectType.value === 'new', 
      message: '请上传头像', 
      trigger: 'change' 
    }
  ],
  purchaseDate: [
    { required: true, message: '请选择消费日期', trigger: 'change' }
  ],
  purchaseAmount: [
    { required: true, message: '请输入消费金额', trigger: 'blur' }
  ],
  purchaseType: [
    { required: true, message: '请选择消费类型', trigger: 'change' }
  ],
  purchaseItem: [
    { required: true, message: '请输入消费项目', trigger: 'blur' }
  ]
}))

// 获取字典数据
const loadDicts = async () => {
  try {
    const [typesRes] = await Promise.all([
      getDictList({ type: 'salon_consume' }),
    ])
    purchaseTypes.value = typesRes.data.list
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 搜索客户
const handleCustomerSearch = async () => {
  customerSearchLoading.value = true
  try {
    const res = await fetchCustomers({
      page: customerPage.value,
      limit: customerPageSize.value,
      name: customerSearchForm.name,
      medicalRecordNumber: customerSearchForm.medicalRecordNumber
    })
    customerOptions.value = res.data.list
    customerTotal.value = res.data.pagination.total
  } catch (error) {
    console.error('搜索客户失败:', error)
    ElMessage.error('搜索客户失败')
  } finally {
    customerSearchLoading.value = false
  }
}

// 重置客户搜索
const handleCustomerSearchReset = () => {
  customerSearchForm.name = ''
  customerSearchForm.medicalRecordNumber = ''
  customerPage.value = 1
  handleCustomerSearch()
}

// 选择客户
const handleSelectCustomer = (row) => {
  form.customerId = row.customerId
}

// 客户分页
const handleCustomerSizeChange = (val) => {
  customerPageSize.value = val
  handleCustomerSearch()
}

const handleCustomerPageChange = (val) => {
  customerPage.value = val
  handleCustomerSearch()
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
  formData.append('images', file.raw)

  try {
    const response = await uploadImages(formData)
    if (response.code === '000000') {
      form.customerInfo.avatarUrl = response.data.urls[0]
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(response.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }
}

// 处理客户类型切换
const handleCustomerTypeChange = (type) => {
  console.log('handleCustomerTypeChange: ', type)
  form.customerId = ''
  form.customerInfo = {
    name: '',
    medicalRecordNumber: '',
    avatarUrl: '',
    remarks: ''
  }
  customerSelectType.value = type
  
}

// 其他方法实现...
// handleCustomerSearchReset, handleSelectCustomer, handleCustomerSizeChange, 
// handleCustomerPageChange, handleAvatarChange, handleCustomerTypeChange 等方法
// 可以从 PurchaseRecords.vue 中复制过来

// 获取记录详情
const getRecordDetail = async (id) => {
  try {
    const res = await fetchPurchaseRecord(id)
    Object.assign(form, res.data)
  } catch (error) {
    ElMessage.error('获取记录详情失败')
    router.back()
  }
}

// 初始化
onMounted(async () => {
  if (isEdit.value) {
    await getRecordDetail(route.params.id)
  }
  await Promise.all([
    handleCustomerSearch(),
    loadDicts()
  ])
})
</script>

<style lang="scss" scoped>
.purchase-record-edit {
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
  }
  
  .form-card {
    background-color: #fff;
    border-radius: 8px;
  }
  
  .form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

// ... 其他样式保持不变
</style> 