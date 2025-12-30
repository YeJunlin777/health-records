import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Patients from '../views/Patients.vue'
import PatientDetail from '../views/PatientDetail.vue'
import Records from '../views/Records.vue'
import Appointments from '../views/Appointments.vue'
import Login from '../views/Login.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/patients', name: 'Patients', component: Patients, meta: { requiresAuth: true } },
  { path: '/patients/:id', name: 'PatientDetail', component: PatientDetail, meta: { requiresAuth: true } },
  { path: '/records', name: 'Records', component: Records, meta: { requiresAuth: true } },
  { path: '/appointments', name: 'Appointments', component: Appointments, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.guest && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
