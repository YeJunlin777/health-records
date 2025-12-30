<template>
  <div id="app" :class="{ 'no-sidebar': isLoginPage }">
    <aside class="sidebar" v-if="!isLoginPage">
      <div class="logo">
        <div class="logo-icon">🏥</div>
        <div class="logo-text">
          <h1>HealthCare</h1>
          <span>医疗档案管理系统</span>
        </div>
      </div>
      
      <ul class="nav-menu">
        <li class="nav-item">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            <span class="nav-icon">📊</span>
            <span class="nav-text">数据概览</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/patients" class="nav-link" :class="{ active: $route.path.startsWith('/patients') }">
            <span class="nav-icon">👥</span>
            <span class="nav-text">患者档案</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/records" class="nav-link" :class="{ active: $route.path === '/records' }">
            <span class="nav-icon">📋</span>
            <span class="nav-text">健康记录</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/appointments" class="nav-link" :class="{ active: $route.path === '/appointments' }">
            <span class="nav-icon">📅</span>
            <span class="nav-text">预约管理</span>
          </router-link>
        </li>
      </ul>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" class="avatar">
          <div class="user-details">
            <div class="user-name">{{ username }}</div>
            <div class="user-email">admin@health.com</div>
          </div>
          <button class="logout-btn" @click="handleLogout" title="退出登录">🚪</button>
        </div>
      </div>
    </aside>
    
    <main class="main-content" :class="{ 'full-width': isLoginPage }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isLoginPage = computed(() => route.path === '/login')
const username = computed(() => localStorage.getItem('username') || '管理员')

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped>
.sidebar-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 12px;
  flex: 1;
}

.user-name {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.user-email {
  color: var(--text-muted);
  font-size: 12px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.8);
}

.main-content.full-width {
  margin-left: 0;
  width: 100%;
}

#app.no-sidebar {
  display: block;
}
</style>
