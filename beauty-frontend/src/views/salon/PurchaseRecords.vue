<template>
  <div class="purchase-records-container">
    <div class="page-header">
      <div class="title-section">
        <h2>消费记录</h2>
        <span class="subtitle">管理客户的消费记录信息</span>
      </div>
      
      <!-- 搜索和添加 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item>
            <el-input
              v-model="searchForm.customerName"
              placeholder="客户姓名"
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
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :clearable="true"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-select 
              v-model="searchForm.purchaseType" 
              placeholder="消费类型"
              clearable
            >
              <el-option
                v-for="item in purchaseTypes"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="searchForm.purchaseItem" placeholder="消费项目" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="action-buttons">
          <el-upload
            class="import-upload"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleImportChange"
          >
            <el-button :icon="Upload">导入记录</el-button>
          </el-upload>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增记录</el-button>
        </div>
      </div>
    </div>

    <!-- 记录列表 -->
    <el-card class="table-card" shadow="never">
      <el-table 
        :data="recordList" 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
        border
        v-loading="loading"
        row-key="id"
        stripe
      >
        <!-- 添加客户信息列 -->
        <el-table-column label="客户信息" min-width="200" align="center">
          <template #default="{ row }">
            <div class="customer-info">
              <el-avatar :size="32" :src="row.customerInfo?.avatarUrl">
                {{ row.customerInfo?.name?.substring(0, 1) }}
              </el-avatar>
              <div class="customer-details">
                <span class="customer-name">{{ row.customerInfo?.name }}</span>
                <span class="medical-number">{{ row.customerInfo?.medicalRecordNumber }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="purchaseDate" label="消费日期" min-width="120" align="center" sortable />
        <el-table-column prop="purchaseAmount" label="消费金额" min-width="120" align="center" sortable>
          <template #default="{ row }">
            <span class="amount">¥{{ row.purchaseAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseType" label="消费类型" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag>{{ getPurchaseTypeLabel(row.purchaseType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseItem" label="消费项目" min-width="120" align="center" width="220" />
        <el-table-column prop="purchaseFactItem" label="实际项目" min-width="120" align="center" />
        <el-table-column prop="remarks" label="备注" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="280" align="center">
          <template #default="{ row }">
            <!-- 如果有治疗记录，显示下载按钮 -->
            <el-button 
              v-if="row.treatmentRecord"
              type="primary" 
              link 
              :icon="Download"
              @click="handleDownload(row.treatmentRecord)"
            >
              下载
            </el-button>
            <!-- 如果是注射类型，显示查看产品按钮 -->
            <el-button
              v-if="row.purchaseType === 'injection'"
              type="primary"
              link
              :icon="Box"
              @click="handleViewProducts(row)"
            >
              查看产品
            </el-button>
            <el-button 
              type="primary" 
              link 
              :icon="Edit" 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除该记录吗？"
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      destroy-on-close
    >
      <el-form 
        :model="form" 
        :rules="rules"
        ref="formRef"
        label-width="100px"
        status-icon
      >
        <!-- 新增时显示客户选择，编辑时隐藏 -->
        <template v-if="!form.purchaseId">
          <el-form-item label="选择客户" prop="customerId">
            <div class="customer-select">
              <el-radio-group v-model="customerSelectType" @change="handleCustomerTypeChange">
                <el-radio label="exist">选择已有客户</el-radio>
                <el-radio label="new">新增客户</el-radio>
              </el-radio-group>
            </div>
          </el-form-item>

          <!-- 已有客户选择 -->
          <template v-if="customerSelectType === 'exist'">
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
          <template v-else>
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
            </el-form-item>
          </template>
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
            @focus="handleAmountFocus"
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
        <el-form-item label="治疗记录" prop="treatmentRecord">
          <el-upload
            class="treatment-upload"
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleTreatmentFileChange"
            :on-remove="handleTreatmentFileRemove"
            accept=".doc,.docx"
            :limit="1"
            :file-list="treatmentFileList"
          >
            <el-button type="primary" :icon="Upload" :disabled="treatmentFileList.length>=1">上传治疗记录</el-button>
            <template #tip>
              <div class="upload-tip">请上传Word格式的治疗记录文档（最多1个文件）</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item 
          label="消耗产品" 
          v-if="form.purchaseType === 'injection'"
        >
          <div class="inject-products">
            <div 
              v-for="(product, index) in form.injectProducts" 
              :key="index" 
              class="product-item"
            >
              <div class="product-item">
                <el-select 
                  v-model="product.name"
                  placeholder="选择产品"
                  style="width: 200px"
                  filterable
                  :popper-options="{
                    modifiers: [
                      {
                        name: 'computeStyles',
                        options: {
                          gpuAcceleration: false,
                          adaptive: false
                        }
                      }
                    ]
                  }"
                >
                  <el-option
                    v-for="item in injectProductOptions"
                    :key="item.code"
                    :label="item.name"
                    :value="item.name"
                  >
                    <div class="product-option">
                      <span class="product-name">{{ item.name }}</span>
                      <span class="product-unit">{{ item.remarks }}</span>
                    </div>
                  </el-option>
                </el-select>
                <div class="quantity-wrapper">
                  <el-input-number
                    v-model="product.injectQuantity"
                    :min="1"
                    :max="99"
                    placeholder="数量"
                    style="width: 120px"
                  />
                  <span class="unit-text">{{ getProductUnit(product.name) }}</span>
                </div>
                <el-button 
                  type="danger" 
                  link 
                  :icon="Delete"
                  @click="removeProduct(index)"
                />
              </div>
            </div>
            <el-button 
              v-if="form.injectProducts.length < 5"
              type="primary" 
              link 
              :icon="Plus"
              @click="addProduct"
            >
              添加产品
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input 
            v-model="form.remarks"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>


    <!-- 添加导入对话框 -->
    <el-dialog
      title="导入消费记录"
      v-model="importDialogVisible"
      width="400px"
    >
      <div class="import-dialog-content">
        <div class="selected-file" v-if="selectedFile">
          <el-icon><Document /></el-icon>
          <span>{{ selectedFile.name }}</span>
        </div>
        <div class="import-tips">
          <p>支持的列：日期、姓名、病案号、项目、实际、类型、金额</p>
          <p>文件格式：.xlsx, .xls</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleImportSubmit"
            :loading="importing"
          >
            确定导入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加查看产品对话框 -->
    <el-dialog
      v-model="productDialogVisible"
      title="消耗产品列表"
      width="800px"
    >
      <el-table
        :data="productList"
        style="width: 100%"
        v-loading="productLoading"
      >
        <el-table-column prop="name" label="产品名称" min-width="150" align="center" />
        <el-table-column prop="injectQuantity" label="注射数量" min-width="100" align="center" />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Plus, Edit, Delete, Refresh, User, Document, Upload, Download, Box } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchPurchaseRecords, createPurchaseRecord, updatePurchaseRecord, deletePurchaseRecord, importPurchaseRecords } from '@/apis/purchaseRecord'
import { getDictList } from '@/apis/dict'
import { fetchCustomers } from '@/apis/customer'
import { uploadImages, uploadTreatmentRecord } from '@/apis/upload'
import { fetchInjectProducts, createInjectProducts, deleteInjectProducts } from '@/apis/injectProduct'

// const router = useRouter()

// 搜索表单
const searchForm = reactive({
  customerName: '',
  medicalRecordNumber: '',
  dateRange: [], // 日期区间
  purchaseType: '',
  purchaseItem: ''
})

// 表格数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const recordList = ref([])

// 字典数据
const purchaseTypes = ref([])

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增记录')
const formRef = ref(null)
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

// 表单数据
const form = reactive({
  purchaseId: '',  // 修改为 purchaseId
  customerId: '',
  customerInfo: {
    name: '',
    medicalRecordNumber: '',
    avatarUrl: ''
  },
  purchaseDate: '',
  purchaseAmount: 0,
  purchaseType: '',
  purchaseItem: '',
  purchaseFactItem: '',
  treatmentRecord: '',
  remarks: '',
  injectProducts: []
})

// 治疗记录文件列表
const treatmentFileList = ref([])

// 产品相关变量
const productDialogVisible = ref(false)
const productList = ref([])
const productLoading = ref(false)

// 注射产品选项
const injectProductOptions = ref([])

// 获取产品单位
const getProductUnit = (productName) => {
  const product = injectProductOptions.value.find(item => item.name === productName)
  return product?.remarks || ''
}

// 动态验证规则
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
      getDictList({ type: 'purchastType' }),
    ])
    purchaseTypes.value = typesRes.data.list
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 反显消费类型字段数据
const getPurchaseTypeLabel = (code) => {
  const type = purchaseTypes.value.find(item => item.code === code)
  return type ? type.name : ''
}

// 获取记录列表
const getRecords = async () => {
  loading.value = true
  try {
    const res = await fetchPurchaseRecords({
      page: currentPage.value,
      limit: pageSize.value,
      customerName: searchForm.customerName,
      medicalRecordNumber: searchForm.medicalRecordNumber,
      startDate: searchForm.dateRange?.[0], // 开始日期
      endDate: searchForm.dateRange?.[1],   // 结束日期
      purchaseType: searchForm.purchaseType,
      purchaseItem: searchForm.purchaseItem
    })
    recordList.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    ElMessage.error(error.message || '获取消费记录列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getRecords()
}

// 重置搜索
const handleReset = () => {
  searchForm.customerName = ''
  searchForm.medicalRecordNumber = ''
  searchForm.dateRange = [] // 重置日期区间
  searchForm.purchaseType = ''
  searchForm.purchaseItem = ''
  currentPage.value = 1
  getRecords()
}

// 新增记录
const handleAdd = () => {
  dialogTitle.value = '新增记录'
  // 重置表单
  form.purchaseId = ''
  form.customerId = ''
  form.customerInfo = {
    name: '',
    medicalRecordNumber: '',
    avatarUrl: ''
  }
  form.purchaseDate = ''
  form.purchaseAmount = 0
  form.purchaseType = ''
  form.purchaseItem = ''
  form.purchaseFactItem = ''
  form.treatmentRecord = ''
  form.remarks = ''
  
  // 清空治疗记录文件列表
  treatmentFileList.value = []
  
  customerSelectType.value = 'exist'
  dialogVisible.value = true
}

// 添加一个数组来记录要删除的产品ID
const deletedInjectIds = ref([])

// 修改移除产品的方法
const removeProduct = (index) => {
  const product = form.injectProducts[index]
  // 如果产品有ID，记录到删除列表中
  if (product.injectId) {
    deletedInjectIds.value.push(product.injectId)
  }
  form.injectProducts.splice(index, 1)
}

// 修改提交表单方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 准备提交的数据
        const submitData = {
          ...form,
          customerId: customerSelectType.value === 'exist' ? form.customerId : undefined,
          customerInfo: customerSelectType.value === 'new' ? form.customerInfo : undefined
        }
        console.log('提交数据:', submitData)
        let res
        if (form.purchaseId) {
          // 编辑模式
          res = await updatePurchaseRecord(form.purchaseId, submitData)
        } else {
          // 新增模式
          res = await createPurchaseRecord(submitData)
        }

        // 如果有要删除的产品ID，先删除它们
        if (deletedInjectIds.value.length > 0) {
          try {
            console.log('删除的产品IDs:', deletedInjectIds.value) // 添加日志
            const deleteResult = await deleteInjectProducts(deletedInjectIds.value)
            console.log('删除结果:', deleteResult) // 添加日志
          } catch (error) {
            console.error('删除注射产品记录失败:', error)
            ElMessage.error('删除注射产品记录失败')
          }
        }

        // 如果是注射类型且有产品数据，创建/更新产品记录
        if (form.purchaseType === 'injection' && form.injectProducts.length > 0) {
          try {
            await createInjectProducts({
              purchaseRecordId: res.data.purchaseId,
              products: form.injectProducts.map(product => ({
                name: product.name,
                injectQuantity: product.injectQuantity,
                injectId: product.injectId // 保留原有ID，用于更新
              }))
            })
          } catch (error) {
            console.error('创建注射产品记录失败:', error)
            ElMessage.error('创建注射产品记录失败')
          }
        }

        ElMessage.success(form.purchaseId ? '更新成功' : '创建成功')
        dialogVisible.value = false
        getRecords() // 刷新列表
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(error.message || '提交失败')
      } finally {
        submitting.value = false
        // 清空删除记录
        deletedInjectIds.value = []
      }
    }
  })
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  getRecords()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getRecords()
}

// 导入相关的状态
const importDialogVisible = ref(false)
const selectedFile = ref(null)
const importing = ref(false)

// 处理文件选择
const handleImportChange = (file) => {
  const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.raw.type === 'application/vnd.ms-excel'
  const isLt10M = file.raw.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return
  }

  selectedFile.value = file.raw
  importDialogVisible.value = true
}

// 处理导入提交
const handleImportSubmit = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const res = await importPurchaseRecords(formData)
    ElMessage.success(`导入成功：${res.data.message}`)
    importDialogVisible.value = false
    selectedFile.value = null
    // 刷新列表
    getRecords()
  } catch (error) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

// 处理文件下载
const handleDownload = (url) => {
  // 创建隐藏的 a 标签进行下载
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', '') // 强制下载而不是在新窗口打开
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 查看产品
const handleViewProducts = async (row) => {
  productDialogVisible.value = true
  productLoading.value = true
  try {
    const res = await fetchInjectProducts({
      purchaseRecordId: row.purchaseId
    })
    productList.value = res.data.list
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
  } finally {
    productLoading.value = false
  }
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

// 获取注射产品选项
const loadInjectProductOptions = async () => {
  try {
    const res = await getDictList({ type: 'salon_inject_type', limit: 100 })
    injectProductOptions.value = res.data.list
  } catch (error) {
    console.error('获取注射产品选项失败:', error)
    ElMessage.error('获取注射产品选项失败')
  }
}

// 添加产品
const addProduct = () => {
  if (form.injectProducts.length >= 12) {
    ElMessage.warning('最多添加12个产品')
    return
  }
  form.injectProducts.push({
    name: '',
    injectQuantity: 1
  })
}

// 处理客户类型切换
const handleCustomerTypeChange = () => {
  form.customerId = ''
  form.customerInfo = {
    name: '',
    medicalRecordNumber: '',
    avatarUrl: '',
    remarks: ''
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
  // 创建新的 File 对象，使用编码后的文件名
  const encodedName = encodeURIComponent(file.raw.name)
  const newFile = new File([file.raw], encodedName, { type: file.raw.type })
  formData.append('files', newFile)
  formData.append('type', 'avatar')

  try {
    const response = await uploadImages(formData)
    if (response.code === '000000') {
      // form.customerInfo.avatarUrl = response.data.urls[0]
      form.customerInfo.avatarUrl = response.data.files[0].url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(response.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  }
}

// 处理金额输入框获取焦点
const handleAmountFocus = () => {
  if (form.purchaseAmount === 0) {
    form.purchaseAmount = null
  }
}

// 处理治疗记录文件上传
const handleTreatmentFileChange = async (file, fileList) => {
  // 确保只能上传一个文件
  if (fileList.length > 1) {
    fileList.splice(0, 1) // 移除之前的文件
    ElMessage.warning('只能上传一个治疗记录文件')
  }

  const isWord = file.raw.type === 'application/msword' || 
                 file.raw.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  const isLt10M = file.raw.size / 1024 / 1024 < 10

  if (!isWord) {
    ElMessage.error('只能上传Word文档!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }

  const formData = new FormData()
  const encodedName = encodeURIComponent(file.raw.name)
  const newFile = new File([file.raw], encodedName, { type: file.raw.type })
  formData.append('files', newFile)
  formData.append('type', 'treatment')

  try {
    const response = await uploadTreatmentRecord(formData)
    if (response.code === '000000') {
      form.treatmentRecord = response.data.files[0].url
      ElMessage.success('治疗记录上传成功')
    } else {
      ElMessage.error(response.msg || '上传失败')
      return false
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
    return false
  }
}

// 处理治疗记录文件移除
const handleTreatmentFileRemove = () => {
  form.treatmentRecord = ''
  treatmentFileList.value = []
}

// 编辑记录
const handleEdit = (row) => {
  dialogTitle.value = '编辑记录'
  // 保留必要的数据
  form.purchaseId = row.purchaseId
  form.customerId = row.customerId
  form.purchaseDate = row.purchaseDate
  form.purchaseAmount = row.purchaseAmount
  form.purchaseType = row.purchaseType
  form.purchaseItem = row.purchaseItem
  form.purchaseFactItem = row.purchaseFactItem
  form.treatmentRecord = row.treatmentRecord
  form.remarks = row.remarks
  
  // 重置删除记录
  deletedInjectIds.value = []
  
  if (row.purchaseType === 'injection') {
    // 获取产品列表
    fetchInjectProducts({ purchaseRecordId: row.purchaseId })
      .then(res => {
        form.injectProducts = res.data.list.map(item => ({
          name: item.name,
          injectQuantity: item.injectQuantity,
          injectId: item.injectId
        }))
      })
      .catch(error => {
        console.error('获取产品列表失败:', error)
        ElMessage.error('获取产品列表失败')
      })
  }
  
  dialogVisible.value = true
}

// 删除记录
const handleDelete = async (row) => {
  try {
    await deletePurchaseRecord(row.purchaseId)
    ElMessage.success('删除成功')
    getRecords()
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
  }
}

// 初始化
onMounted(() => {
  handleCustomerSearch()
  loadDicts()
  getRecords()
  loadInjectProductOptions()
})
</script>

<style lang="scss" scoped>
.purchase-records-container {
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
        :deep(.el-form-item) {
          margin-bottom: 0;
          margin-right: 16px;
          
          .el-input {
            width: 180px;
          }
          
          .el-date-picker {
            width: 240px;
          }
          
          .el-select {
            width: 180px;
          }
        }
      }
    }
  }
  
  .table-card {
    background-color: #fff;
    border-radius: 8px;
    
    .amount {
      color: #f56c6c;
      font-weight: 500;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}

.customer-select {
  margin-bottom: 20px;
}

.customer-select-card {
  margin-bottom: 20px;
  
  .customer-search {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    
    .el-input {
      width: 180px;
    }
  }
  
  .customer-name {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .customer-pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

.el-table {
  :deep(.el-radio) {
    margin-right: 0;
    .el-radio__label {
      display: none;
    }
  }
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  
  .customer-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    
    .customer-name {
      font-weight: 500;
      color: #303133;
    }
    
    .medical-number {
      font-size: 12px;
      color: #909399;
    }
  }
}

.amount {
  color: #f56c6c;
  font-weight: 500;
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

.search-section {
  .action-buttons {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.import-dialog-content {
  .selected-file {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    margin-bottom: 16px;
    
    .el-icon {
      font-size: 20px;
      color: #909399;
    }
  }
  
  .import-tips {
    font-size: 14px;
    color: #909399;
    
    p {
      margin: 8px 0;
      line-height: 1.4;
    }
  }
}

.treatment-upload {
  :deep(.el-upload-list) {
    margin-top: 10px;
  }
  
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
  }
}

.inject-products {
  .product-item {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .quantity-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .unit-text {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }
}

// 添加产品选项样式
.product-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .product-name {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
  
  .product-unit {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
