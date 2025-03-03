<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeMenu = ref('')

// 菜单配置
const menus = [
  {
    title: '首页',
    icon: 'House',
    path: '/admin/dashboard'
  },
  {
    title: '用户管理',
    icon: 'User',
    path: '/admin/users'
  },
  {
    title: '预约管理',
    icon: 'Calendar',
    path: '/admin/appointments'
  },
  {
    title: '服务项目',
    icon: 'List',
    path: '/admin/services'
  },
  {
    title: '统计报表',
    icon: 'PieChart',
    path: '/admin/reports'
  }
]

const handleSelect = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="admin-sidebar">
    <div class="logo">
      <!-- <img src="@/assets/logo.png" alt="logo"> -->
    </div>
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <el-menu-item 
        v-for="menu in menus" 
        :key="menu.path"
        :index="menu.path"
        @click="handleSelect(menu.path)"
      >
        <el-icon><component :is="menu.icon" /></el-icon>
        <span>{{ menu.title }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.admin-sidebar {
  height: 100%;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b2f3a;
    
    img {
      height: 32px;
    }
  }
  
  .sidebar-menu {
    border: none;
    
    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      
      &:hover {
        background-color: #263445;
      }
      
      &.is-active {
        background-color: #1890ff;
      }
      
      .el-icon {
        margin-right: 16px;
        font-size: 18px;
      }
    }
  }
}
</style> 