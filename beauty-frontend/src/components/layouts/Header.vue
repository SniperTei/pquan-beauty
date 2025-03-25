<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.clearUserInfo()
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
          <el-avatar :size="32" src="https://example.com/avatar.jpg">
            {{ userStore.username?.substring(0, 1) }}
          </el-avatar>
          <span class="username">{{ userStore.username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
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