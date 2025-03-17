<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { House, User, Calendar, List, PieChart } from '@element-plus/icons-vue'

const router = useRouter()
const activeMenu = ref('')

// 菜单配置
const menus = [
  {
    title: '首页',
    icon: House,
    path: '/admin/dashboard'
  },
  {
    title: '用户管理',
    icon: User,
    path: '/admin/users'
  },
  {
    title: '美容院',
    icon: Calendar,
    path: '/salon/customers'
  },
  {
    title: '服务项目',
    icon: List,
    path: '/admin/services'
  },
  {
    title: '统计报表',
    icon: PieChart,
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
      <h1>美容管理</h1>
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
  width: 240px;
  background-color: #2b2f3a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  
  .logo {
    margin-bottom: 20px;
    h1 {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
    }
  }
  
  .sidebar-menu {
    width: 100%;
    border: none;
    
    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      
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