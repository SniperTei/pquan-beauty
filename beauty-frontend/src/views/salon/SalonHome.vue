<script setup>
import { ref, onMounted } from 'vue'
import { User, Calendar, Money, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchCustomerStatistics } from '@/apis/customer'
import { fetchPurchaseRecordStatistics } from '@/apis/purchaseRecord'
// 添加组件名称
defineOptions({
  name: 'SalonHome'
});
// 获取总客户数
const totalCustomers = ref(0)
// 获取今日新增客户数
const todayCustomers = ref(0)
// 获取本月营收
const monthlyRevenue = ref(0)
// 获取今日营收
const todayRevenue = ref(0)

// 获取总客户数
const getTotalCustomers = async () => {
  try {
    const res = await fetchCustomerStatistics({})
    totalCustomers.value = res.data.total
  } catch (error) {
    console.error('获取总客户数失败:', error)
    ElMessage.error('获取总客户数失败')
  }
}

// 获取今日新增客户数
const getTodayCustomers = async () => {
  try {
    const today = new Date().toISOString().split('T')[0] // 获取今天的日期，格式：YYYY-MM-DD
    const res = await fetchCustomerStatistics({ date: today })
    todayCustomers.value = res.data.total
  } catch (error) {
    console.error('获取今日新增客户数失败:', error)
    ElMessage.error('获取今日新增客户数失败')
  }
}

// 获取本月营收
const getMonthlyRevenue = async () => {
  try {
    const res = await fetchPurchaseRecordStatistics({})
    monthlyRevenue.value = res.data.total
  } catch (error) {
    console.error('获取本月营收失败:', error)
    ElMessage.error('获取本月营收失败')
  }
}

// 获取今日营收
const getTodayRevenue = async () => {
  try {
    const today = new Date().toISOString().split('T')[0] // 获取今天的日期，格式：YYYY-MM-DD
    const res = await fetchPurchaseRecordStatistics({ date: today })
    todayRevenue.value = res.data.total
  } catch (error) {
    console.error('获取今日营收失败:', error)
    ElMessage.error('获取今日营收失败')
  }
}

// 初始化数据
onMounted(async () => {
  await Promise.all([
    getTotalCustomers(),
    getTodayCustomers(),
    getMonthlyRevenue(),
    getTodayRevenue()
  ])
})

</script>

<template>
  <div class="salonHome">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总客户数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="totalCustomers">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日新增客户</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="todayCustomers">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月营收</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="monthlyRevenue">
              <template #prefix>
                <el-icon><Money /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日营收</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="todayRevenue">
              <template #prefix>
                <el-icon><List /></el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.salonHome {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-content {
    text-align: center;
    
    .el-icon {
      margin-right: 8px;
      font-size: 20px;
    }
  }
}
</style> 