<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import { useUserStore } from '@/stores/user'
import { House, User, Calendar, List, PieChart } from '@element-plus/icons-vue'
import { APP_VERSION } from '@/config/version'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

// const userStore = useUserStore()

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

// 菜单配置
const menus = [
  {
    title: '首页',
    icon: House,
    path: '/salon/salonHome'
  },
  {
    title: '客户管理',
    icon: Calendar,
    path: '/salon/customers'
  },
  {
    title: '消费记录',
    icon: List,
    path: '/salon/purchaseRecords'
  },
  {
    title: '统计报表',
    icon: PieChart,
    path: '/salon/salonStatistics'
  },
  {
    title: '字典维护',
    icon: List,
    path: '/salon/dictionaryMaintenance'
  }
]

const handleSelect = (path) => {
  router.push(path)
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 将版本号添加到模板中使用
const version = APP_VERSION
</script>

<template>
  <div class="admin-sidebar" :class="{ 'is-collapse': isCollapse }">
    <div class="sidebar-header">
      <div class="logo">
        <!-- <img src="@/assets/logo.png" alt="Logo" class="logo-image" /> -->
        <h1 v-show="!isCollapse">美容管理</h1>
      </div>
      <el-icon 
        class="collapse-icon"
        @click="toggleCollapse"
      >
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>

    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item 
          v-for="menu in menus" 
          :key="menu.path"
          :index="menu.path"
          @click="handleSelect(menu.path)"
        >
          <el-icon><component :is="menu.icon" /></el-icon>
          <template #title>
            <span>{{ menu.title }}</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <!-- <div class="sidebar-footer" v-show="!isCollapse">
      <div class="user-info">
        <el-avatar :size="32" src="https://example.com/avatar.jpg">
          用户
        </el-avatar>
        <span class="username">{{ userStore.userInfo.username }}</span>
      </div>
    </div> -->

    <!-- 添加版本号 -->
    <div class="sidebar-footer" :class="{ 'collapsed': isCollapse }">
      <span class="version">{{ version }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-sidebar {
  height: 100vh;
  width: 240px;
  background-color: #001529;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &.is-collapse {
    width: 64px;
    
    .logo {
      padding: 16px 0;
      justify-content: center;
      
      .logo-image {
        margin: 0;
      }
    }
  }
  
  .sidebar-header {
    padding: 0 16px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .logo {
      display: flex;
      align-items: center;
      height: 100%;
      overflow: hidden;
      
      .logo-image {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
      
      h1 {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        white-space: nowrap;
      }
    }
    
    .collapse-icon {
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
  
  .sidebar-menu {
    border: none;
    
    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      &.is-active {
        background-color: #2c3e50;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: #409EFF;
        }
      }
      
      .el-icon {
        font-size: 18px;
      }
    }
  }
  
  .sidebar-footer {
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    
    &.collapsed {
      padding: 16px 0;
    }
    
    .version {
      color: rgba(255, 255, 255, 0.45);
      font-size: 12px;
    }
  }
}

:deep(.el-menu--collapse) {
  width: 64px;
}
</style> 