<template>
  <div class="dashboard fade-in">
    <header class="page-header">
      <h1 class="page-title">数据概览</h1>
      <p class="page-subtitle">欢迎回来，这是今日的健康数据摘要</p>
    </header>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.totalPatients.toLocaleString() }}</div>
          <div class="stat-label">总患者数</div>
        </div>
      </div>
      <div class="stat-card accent">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.todayAppointments }}</div>
          <div class="stat-label">今日预约</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.pendingReports }}</div>
          <div class="stat-label">待处理报告</div>
        </div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.monthlyVisits }}</div>
          <div class="stat-label">本月就诊</div>
        </div>
      </div>
    </div>

    <!-- 中间区域 -->
    <div class="middle-section">
      <!-- 图表 -->
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">📊 就诊趋势</h3>
          <span class="badge badge-info">近6个月</span>
        </div>
        <div class="chart-wrap">
          <canvas ref="chartRef"></canvas>
        </div>
      </div>

      <!-- 健康指标 -->
      <div class="card metrics-card">
        <div class="card-header">
          <h3 class="card-title">📈 系统指标</h3>
        </div>
        <div class="metrics-list">
          <div class="metric-item">
            <div class="progress-ring">
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle class="progress-ring-bg" cx="35" cy="35" r="28"></circle>
                <circle class="progress-ring-fill" cx="35" cy="35" r="28" 
                  :stroke-dasharray="176" :stroke-dashoffset="176 - 176 * 0.92"></circle>
              </svg>
              <div class="progress-ring-text">
                <div class="progress-value">92%</div>
              </div>
            </div>
            <div class="metric-text">
              <strong>档案完整率</strong>
              <span>1184 / 1286 份</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="progress-ring">
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle class="progress-ring-bg" cx="35" cy="35" r="28"></circle>
                <circle class="progress-ring-fill accent" cx="35" cy="35" r="28"
                  :stroke-dasharray="176" :stroke-dashoffset="176 - 176 * 0.85"></circle>
              </svg>
              <div class="progress-ring-text">
                <div class="progress-value">85%</div>
              </div>
            </div>
            <div class="metric-text">
              <strong>预约完成率</strong>
              <span>本月 291 次</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="progress-ring">
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle class="progress-ring-bg" cx="35" cy="35" r="28"></circle>
                <circle class="progress-ring-fill warning" cx="35" cy="35" r="28"
                  :stroke-dasharray="176" :stroke-dashoffset="176 - 176 * 0.78"></circle>
              </svg>
              <div class="progress-ring-text">
                <div class="progress-value">78%</div>
              </div>
            </div>
            <div class="metric-text">
              <strong>随访完成率</strong>
              <span>待随访 45 人</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日预约（只显示前5条） -->
      <div class="card appointments-card">
        <div class="card-header">
          <h3 class="card-title">📅 今日预约</h3>
          <router-link to="/appointments" class="view-all">查看全部 ({{ todayAppointments.length }}) →</router-link>
        </div>
        <div class="apt-list">
          <div class="apt-item" v-for="apt in todayAppointments.slice(0, 5)" :key="apt.id">
            <div class="apt-time">{{ apt.time }}</div>
            <div class="apt-info">
              <div class="apt-name">{{ apt.patientName }}</div>
              <div class="apt-dept">{{ apt.department }}</div>
            </div>
            <span class="apt-status" :class="apt.status">
              {{ apt.status === 'confirmed' ? '已确认' : '待确认' }}
            </span>
          </div>
        </div>
        <div class="more-tip" v-if="todayAppointments.length > 5">
          还有 {{ todayAppointments.length - 5 }} 个预约...
        </div>
      </div>
    </div>

    <!-- 患者列表（分页） -->
    <div class="card" style="margin-top: 20px;">
      <div class="card-header">
        <h3 class="card-title">👥 最近就诊患者</h3>
        <router-link to="/patients" class="view-all">查看全部 →</router-link>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">患者信息</th>
            <th style="width: 80px;">血型</th>
            <th>慢性病</th>
            <th>过敏史</th>
            <th style="width: 120px;">最近就诊</th>
            <th style="width: 90px;">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in paginatedPatients" :key="patient.id">
            <td>
              <div class="patient-info">
                <img :src="patient.avatar" class="avatar">
                <div>
                  <div class="patient-name">{{ patient.name }}</div>
                  <div class="patient-meta">{{ patient.gender }} · {{ patient.age }}岁</div>
                </div>
              </div>
            </td>
            <td><span class="blood-tag">{{ patient.bloodType }}</span></td>
            <td>
              <span class="tag" v-for="d in patient.chronicDiseases" :key="d">{{ d }}</span>
              <span v-if="!patient.chronicDiseases.length" class="text-muted">-</span>
            </td>
            <td>
              <span class="tag danger" v-for="a in patient.allergies" :key="a">{{ a }}</span>
              <span v-if="!patient.allergies.length" class="text-muted">-</span>
            </td>
            <td>{{ patient.lastVisit }}</td>
            <td>
              <span class="badge" :class="getStatusClass(patient.status)">{{ getStatusText(patient.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 分页 -->
      <div class="pagination">
        <span class="page-info">显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, patients.length) }} 条，共 {{ patients.length }} 条</span>
        <div class="page-btns">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
          <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { statistics, healthTrends, patients, appointments } from '../data/mockData'

Chart.register(...registerables)

const chartRef = ref(null)
const currentPage = ref(1)
const pageSize = 8

const todayAppointments = computed(() => appointments.filter(a => a.date === '2025-12-30'))
const totalPages = computed(() => Math.ceil(patients.length / pageSize))
const paginatedPatients = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return patients.slice(start, start + pageSize)
})

const getStatusClass = (s) => ({ active: 'badge-success', followup: 'badge-warning', critical: 'badge-danger' }[s] || 'badge-info')
const getStatusText = (s) => ({ active: '正常', followup: '随访中', critical: '重点关注' }[s] || s)

onMounted(() => {
  if (chartRef.value) {
    new Chart(chartRef.value, {
      type: 'line',
      data: {
        labels: healthTrends.labels,
        datasets: [
          { label: '就诊人次', data: healthTrends.visits, borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 },
          { label: '新增患者', data: healthTrends.newPatients, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } }
      }
    })
  }
})
</script>

<style scoped>
.middle-section {
  display: grid;
  grid-template-columns: 1fr 300px 300px;
  gap: 20px;
}

.chart-card { min-width: 0; }
.chart-wrap { height: 260px; }
.metrics-card { min-width: 0; }
.appointments-card { min-width: 0; }

.metrics-list { display: flex; flex-direction: column; gap: 12px; }
.metric-item { display: flex; align-items: center; gap: 14px; padding: 10px; background: var(--bg-primary); border-radius: 10px; }
.progress-ring { position: relative; width: 70px; height: 70px; flex-shrink: 0; }
.progress-ring svg { transform: rotate(-90deg); }
.progress-ring-bg { fill: none; stroke: var(--border-color); stroke-width: 5; }
.progress-ring-fill { fill: none; stroke: var(--primary); stroke-width: 5; stroke-linecap: round; }
.progress-ring-fill.accent { stroke: var(--accent); }
.progress-ring-fill.warning { stroke: var(--warning); }
.progress-ring-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.progress-value { font-size: 14px; font-weight: 700; }
.metric-text { display: flex; flex-direction: column; gap: 2px; }
.metric-text strong { font-size: 13px; }
.metric-text span { font-size: 12px; color: var(--text-secondary); }

.view-all { font-size: 13px; color: var(--primary); text-decoration: none; }
.view-all:hover { text-decoration: underline; }

.apt-list { display: flex; flex-direction: column; gap: 8px; }
.apt-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-primary); border-radius: 8px; }
.apt-time { font-weight: 600; color: var(--primary); font-size: 13px; min-width: 45px; }
.apt-info { flex: 1; min-width: 0; }
.apt-name { font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apt-dept { font-size: 11px; color: var(--text-secondary); }
.apt-status { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.apt-status.confirmed { background: rgba(34,197,94,0.1); color: var(--success); }
.apt-status.pending { background: rgba(245,158,11,0.1); color: var(--warning); }
.more-tip { text-align: center; padding: 10px; color: var(--text-muted); font-size: 12px; border-top: 1px dashed var(--border-color); margin-top: 8px; }

.blood-tag { display: inline-block; padding: 2px 8px; background: rgba(14,165,233,0.1); color: var(--primary); border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag { display: inline-block; padding: 2px 8px; background: rgba(14,165,233,0.08); color: var(--primary); border-radius: 4px; font-size: 12px; margin-right: 4px; }
.tag.danger { background: rgba(239,68,68,0.08); color: var(--danger); }
.text-muted { color: var(--text-muted); }

.pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px 0 0; border-top: 1px solid var(--border-color); margin-top: 16px; }
.page-info { font-size: 13px; color: var(--text-secondary); }
.page-btns { display: flex; align-items: center; gap: 12px; }
.page-btn { padding: 6px 14px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 6px; font-size: 13px; cursor: pointer; transition: var(--transition); }
.page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-num { font-size: 13px; color: var(--text-secondary); }
</style>
