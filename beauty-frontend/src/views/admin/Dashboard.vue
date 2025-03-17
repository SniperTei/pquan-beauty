<script setup>
// 添加组件名称
defineOptions({
  name: 'AdminDashboard'
});
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="1234">
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
              <span>今日预约</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="56">
              <template #prefix>
                <el-icon><Calendar /></el-icon>
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
            <el-statistic :value="98765">
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
              <span>服务项目</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="42">
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
.dashboard {
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