<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/apis/user'

const router = useRouter()

const handleLogout = () => {
  logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <div class="admin-header">
    <div class="left">
      <h2>美容后台管理系统</h2>
    </div>
    <div class="right">
      <el-dropdown @command="handleLogout">
        <span class="user-info">
          <el-avatar :size="32" icon="UserFilled" />
          <span class="username">管理员</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><Switch /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .left {
    h2 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  
  .right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .username {
        margin-left: 8px;
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style> 