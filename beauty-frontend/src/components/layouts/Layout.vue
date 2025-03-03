<script setup>
import AdminHeader from '@/components/layouts/Header.vue'
import AdminSidebar from '@/components/layouts/Sidebar.vue'
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar class="sidebar" />
    <div class="main-container">
      <AdminHeader class="header" />
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  
  .sidebar {
    width: 240px;
    height: 100%;
    background-color: #304156;
    transition: width 0.3s;
    overflow-x: hidden;
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .header {
      height: 60px;
      background-color: #fff;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
    }
    
    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: #f0f2f5;
    }
  }
}
</style> 