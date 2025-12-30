<template>
  <div class="patient-detail fade-in" v-if="patient">
    <header class="page-header">
      <router-link to="/patients" class="back-link">← 返回患者列表</router-link>
    </header>

    <!-- 患者头部信息 -->
    <div class="profile-bar">
      <div class="profile-left">
        <div class="profile-avatar">
          <img :src="patient.avatar" class="avatar avatar-xl">
          <span class="status-tag" :class="patient.status">{{ getStatusText(patient.status) }}</span>
        </div>
        <div class="profile-info">
          <h1>{{ patient.name }}</h1>
          <div class="profile-meta">
            <span>{{ patient.gender }}</span>
            <span>{{ patient.age }}岁</span>
            <span>{{ patient.bloodType }}</span>
            <span>📱 {{ patient.phone }}</span>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-primary" @click="showEditModal = true">编辑档案</button>
        <button class="btn btn-secondary" @click="goToAppointment">预约挂号</button>
        <button class="btn btn-secondary" @click="printProfile">打印</button>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="detail-grid">
      <!-- 左侧 -->
      <div class="detail-left">
        <!-- 健康警示 -->
        <div class="card alert-card" v-if="patient.allergies.length || patient.chronicDiseases.length">
          <div class="card-header">
            <h3 class="card-title">⚠️ 健康警示</h3>
          </div>
          <div class="alert-row">
            <div class="alert-item" v-if="patient.allergies.length">
              <h4>过敏史</h4>
              <div class="alert-tags">
                <span class="alert-tag danger" v-for="a in patient.allergies" :key="a">{{ a }}</span>
              </div>
            </div>
            <div class="alert-item" v-if="patient.chronicDiseases.length">
              <h4>慢性病史</h4>
              <div class="alert-tags">
                <span class="alert-tag warning" v-for="d in patient.chronicDiseases" :key="d">{{ d }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 就诊记录 -->
        <div class="card" :style="{ marginTop: (patient.allergies.length || patient.chronicDiseases.length) ? '16px' : '0' }">
          <div class="card-header">
            <h3 class="card-title">📋 就诊记录</h3>
            <span class="badge badge-info">{{ patientRecords.length }} 条</span>
          </div>
          <div class="records-list" v-if="paginatedRecords.length">
            <div class="record-item" v-for="r in paginatedRecords" :key="r.id">
              <div class="record-icon" :class="getTypeClass(r.type)">{{ getTypeIcon(r.type) }}</div>
              <div class="record-content">
                <div class="record-top">
                  <span class="record-type">{{ r.type }}</span>
                  <span class="record-date">{{ r.date }}</span>
                </div>
                <p class="record-summary">{{ r.summary }}</p>
                <div class="record-meta">
                  <span>🏥 {{ r.department }}</span>
                  <span>👨‍⚕️ {{ r.doctor }}</span>
                </div>
                <div class="record-vitals" v-if="r.details">
                  <span v-if="r.details.bloodPressure">血压: {{ r.details.bloodPressure }}</span>
                  <span v-if="r.details.heartRate">心率: {{ r.details.heartRate }}</span>
                  <span v-if="r.details.bloodSugar">血糖: {{ r.details.bloodSugar }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-tip" v-else>暂无就诊记录</div>
          
          <!-- 分页 -->
          <div class="pagination" v-if="patientRecords.length > pageSize">
            <span class="page-info">{{ recordCurrentPage }} / {{ recordTotalPages }} 页</span>
            <div class="page-btns">
              <button class="page-btn" :disabled="recordCurrentPage === 1" @click="recordCurrentPage--">上一页</button>
              <button class="page-btn" :disabled="recordCurrentPage === recordTotalPages" @click="recordCurrentPage++">下一页</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="detail-right">
        <!-- 体征数据 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📊 最新体征</h3>
            <span class="badge badge-info" v-if="latestRecord">{{ latestRecord.date }}</span>
          </div>
          <div class="vitals-list" v-if="latestRecord">
            <div class="vital-item">
              <span class="vital-icon">❤️</span>
              <span class="vital-label">血压</span>
              <span class="vital-value">{{ latestRecord.details?.bloodPressure || '-' }}</span>
            </div>
            <div class="vital-item">
              <span class="vital-icon">💓</span>
              <span class="vital-label">心率</span>
              <span class="vital-value">{{ latestRecord.details?.heartRate || '-' }}</span>
            </div>
            <div class="vital-item">
              <span class="vital-icon">🩸</span>
              <span class="vital-label">血糖</span>
              <span class="vital-value">{{ latestRecord.details?.bloodSugar || '-' }}</span>
            </div>
            <div class="vital-item">
              <span class="vital-icon">⚖️</span>
              <span class="vital-label">体重</span>
              <span class="vital-value">{{ latestRecord.details?.weight || '-' }}</span>
            </div>
          </div>
          <div class="empty-tip" v-else>暂无体征数据</div>
        </div>

        <!-- 预约信息 -->
        <div class="card" style="margin-top: 16px;">
          <div class="card-header">
            <h3 class="card-title">📅 近期预约</h3>
          </div>
          <div class="apt-list" v-if="patientAppointments.length">
            <div class="apt-item" v-for="apt in patientAppointments" :key="apt.id">
              <div class="apt-date">{{ apt.date }}</div>
              <div class="apt-info">
                <span class="apt-time">{{ apt.time }}</span>
                <span class="apt-dept">{{ apt.department }}</span>
              </div>
              <span class="apt-status" :class="apt.status">{{ apt.status === 'confirmed' ? '已确认' : '待确认' }}</span>
            </div>
          </div>
          <div class="empty-tip" v-else>暂无预约</div>
        </div>

        <!-- 快捷操作 -->
        <div class="card" style="margin-top: 16px;">
          <div class="card-header">
            <h3 class="card-title">⚡ 快捷操作</h3>
          </div>
          <div class="quick-list">
            <button class="quick-btn" @click="addRecord">📝 添加就诊记录</button>
            <button class="quick-btn" @click="goToAppointment">📅 预约复诊</button>
            <button class="quick-btn" @click="exportProfile">📤 导出档案</button>
            <button class="quick-btn" @click="setReminder">🔔 设置随访提醒</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 404 -->
  <div class="not-found" v-else>
    <div class="not-found-content">
      <div class="not-found-icon">😕</div>
      <h2>患者不存在</h2>
      <p>未找到该患者的档案信息</p>
      <router-link to="/patients" class="btn btn-primary">返回患者列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { patients, healthRecords, appointments } from '../data/mockData'

const route = useRoute()
const router = useRouter()
const patientId = computed(() => parseInt(route.params.id))

const patient = computed(() => patients.find(p => p.id === patientId.value))
const patientRecords = computed(() => healthRecords.filter(r => r.patientId === patientId.value).sort((a, b) => new Date(b.date) - new Date(a.date)))
const latestRecord = computed(() => patientRecords.value[0] || null)
const patientAppointments = computed(() => appointments.filter(a => a.patientId === patientId.value && new Date(a.date) >= new Date('2025-12-29')).slice(0, 3))

// 分页
const pageSize = 5
const recordCurrentPage = ref(1)
const recordTotalPages = computed(() => Math.ceil(patientRecords.value.length / pageSize))
const paginatedRecords = computed(() => {
  const start = (recordCurrentPage.value - 1) * pageSize
  return patientRecords.value.slice(start, start + pageSize)
})

const getStatusText = (s) => ({ active: '正常', followup: '随访中', critical: '重点关注' }[s] || s)
const getTypeIcon = (t) => ({ '体检报告': '📊', '门诊记录': '🩺', '住院记录': '🏥', '急诊记录': '🚑' }[t] || '📋')
const getTypeClass = (t) => ({ '体检报告': 'checkup', '门诊记录': 'outpatient', '住院记录': 'inpatient', '急诊记录': 'emergency' }[t] || '')

// 操作函数
const showEditModal = ref(false)
const goToAppointment = () => router.push('/appointments')
const printProfile = () => window.print()
const addRecord = () => alert('添加就诊记录功能（演示）')
const exportProfile = () => alert('导出档案功能（演示）')
const setReminder = () => alert('设置随访提醒功能（演示）')
</script>

<style scoped>
.back-link { color: var(--text-secondary); text-decoration: none; font-size: 14px; }
.back-link:hover { color: var(--primary); }

.profile-bar { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.profile-left { display: flex; align-items: center; gap: 20px; }
.profile-avatar { position: relative; }
.status-tag { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.status-tag.active { background: var(--success); color: #fff; }
.status-tag.followup { background: var(--warning); color: #fff; }
.status-tag.critical { background: var(--danger); color: #fff; }
.profile-info h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.profile-meta { display: flex; gap: 14px; color: var(--text-secondary); font-size: 14px; }
.profile-actions { display: flex; gap: 10px; }

.detail-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }

.alert-card { background: linear-gradient(135deg, rgba(239,68,68,0.02), rgba(245,158,11,0.02)); }
.alert-row { display: flex; gap: 32px; }
.alert-item h4 { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 10px; }
.alert-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.alert-tag { padding: 5px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; }
.alert-tag.danger { background: rgba(239,68,68,0.1); color: var(--danger); }
.alert-tag.warning { background: rgba(245,158,11,0.1); color: var(--warning); }

.records-list { display: flex; flex-direction: column; gap: 12px; }
.record-item { display: flex; gap: 14px; padding: 14px; background: var(--bg-primary); border-radius: 10px; }
.record-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.record-icon.checkup { background: rgba(14,165,233,0.1); }
.record-icon.outpatient { background: rgba(16,185,129,0.1); }
.record-icon.inpatient { background: rgba(245,158,11,0.1); }
.record-icon.emergency { background: rgba(239,68,68,0.1); }
.record-content { flex: 1; }
.record-top { display: flex; justify-content: space-between; margin-bottom: 6px; }
.record-type { font-weight: 600; color: var(--primary); font-size: 13px; }
.record-date { font-size: 12px; color: var(--text-muted); }
.record-summary { font-size: 14px; color: var(--text-primary); margin-bottom: 6px; }
.record-meta { display: flex; gap: 14px; font-size: 12px; color: var(--text-secondary); }
.record-vitals { display: flex; gap: 12px; font-size: 11px; color: var(--text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color); }

.vitals-list { display: flex; flex-direction: column; gap: 10px; }
.vital-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-primary); border-radius: 8px; }
.vital-icon { font-size: 20px; }
.vital-label { flex: 1; font-size: 14px; color: var(--text-secondary); }
.vital-value { font-size: 15px; font-weight: 600; }

.apt-list { display: flex; flex-direction: column; gap: 8px; }
.apt-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg-primary); border-radius: 8px; }
.apt-date { font-size: 12px; color: var(--text-secondary); min-width: 80px; }
.apt-info { flex: 1; display: flex; gap: 8px; font-size: 13px; }
.apt-time { font-weight: 600; color: var(--primary); }
.apt-dept { color: var(--text-secondary); }
.apt-status { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.apt-status.confirmed { background: rgba(34,197,94,0.1); color: var(--success); }
.apt-status.pending { background: rgba(245,158,11,0.1); color: var(--warning); }

.quick-list { display: flex; flex-direction: column; gap: 8px; }
.quick-btn { padding: 12px 14px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; font-size: 14px; cursor: pointer; text-align: left; transition: var(--transition); }
.quick-btn:hover { border-color: var(--primary); color: var(--primary); }

.pagination { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; border-top: 1px solid var(--border-color); margin-top: 12px; }
.page-info { font-size: 13px; color: var(--text-secondary); }
.page-btns { display: flex; gap: 8px; }
.page-btn { padding: 6px 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 6px; font-size: 13px; cursor: pointer; }
.page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-tip { text-align: center; padding: 24px; color: var(--text-muted); font-size: 14px; }

.not-found { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
.not-found-content { text-align: center; }
.not-found-icon { font-size: 64px; margin-bottom: 16px; }
.not-found-content h2 { font-size: 20px; margin-bottom: 8px; }
.not-found-content p { color: var(--text-secondary); margin-bottom: 20px; }
</style>
