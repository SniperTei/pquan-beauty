import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/components/layouts/Layout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/user/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/user/Register.vue')
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      // {
      //   path: 'users',
      //   name: 'Users',
      //   component: () => import('@/views/admin/Users.vue')
      // },
      // {
      //   path: 'appointments',
      //   name: 'Appointments',
      //   component: () => import('@/views/admin/Appointments.vue')
      // },
      // {
      //   path: 'services',
      //   name: 'Services',
      //   component: () => import('@/views/admin/Services.vue')
      // },
      // {
      //   path: 'reports',
      //   name: 'Reports',
      //   component: () => import('@/views/admin/Reports.vue')
      // }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // 需要登录但没有token，重定向到登录页
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router
