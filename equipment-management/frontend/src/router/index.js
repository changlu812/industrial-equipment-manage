import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@stores/auth'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@views/Layout.vue'),
    redirect: '/equipment',
    children: [
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@views/equipment/index.vue'),
        meta: { title: '设备管理' },
      },
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: () => import('@views/maintenance/index.vue'),
        meta: { title: '维修管理' },
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@views/statistics/index.vue'),
        meta: { title: '统计分析' },
      },
      {
        path: 'workshop',
        name: 'Workshop',
        component: () => import('@views/workshop/index.vue'),
        meta: { title: '车间管理' },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@views/login/index.vue'),
    meta: { public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && !to.meta.public) {
    next('/login')
  } else if (authStore.isAuthenticated && to.path === '/login') {
    next('/')
  } else {
    next()
  }
})

export default router
