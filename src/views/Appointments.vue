<template>
  <div class="appointments-page fade-in">
    <header class="page-header page-header-flex">
      <div>
        <h1 class="page-title">预约管理</h1>
        <p class="page-subtitle">管理患者的预约挂号信息</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">➕ 新增预约</button>
    </header>

    <div class="apt-layout">
      <aside class="apt-sidebar">
        <div class="card calendar-card">
          <div class="cal-header">
            <button class="cal-btn" @click="changeMonth(-1)">‹</button>
            <span class="cal-title">{{ currentYear }}年{{ currentMonth }}月</span>
            <button class="cal-btn" @click="changeMonth(1)">›</button>
          </div>
          
          <div class="cal-weekdays">
            <span v-for="d in ['一', '二', '三', '四', '五', '六', '日']" :key="d">{{ d }}</span>
          </div>
          
          <div class="cal-grid">
            <div v-for="(day, index) in calendarDays" :key="index" class="cal-day"
              :class="{ active: day.date === selectedDate, today: day.isToday, 'other-month': !day.currentMonth, 'has-apt': day.aptCount > 0 }"
              @click="day.date && selectDate(day.date)">
              <span class="cal-day-num">{{ day.day }}</span>
              <span class="cal-day-dot" v-if="day.aptCount > 0"></span>
            </div>
          </div>
          
          <div class="cal-stats">
            <div class="cal-stat-item">
              <span class="cal-stat-val">{{ dayAppointments.length }}</span>
              <span class="cal-stat-label">当日预约</span>
            </div>
            <div class="cal-stat-item success">
              <span class="cal-stat-val">{{ confirmedCount }}</span>
              <span class="cal-stat-label">已确认</span>
            </div>
            <div class="cal-stat-item warning">
              <span class="cal-stat-val">{{ pendingCount }}</span>
              <span class="cal-stat-label">待确认</span>
            </div>
          </div>
          
          <div class="cal-filters">
            <select class="filter-select" v-model="statusFilter">
              <option value="">全部状态</option>
              <option value="confirmed">已确认</option>
              <option value="pending">待确认</option>
            </select>
            <select class="filter-select" v-model="typeFilter">
              <option value="">全部类型</option>
              <option value="初诊">初诊</option>
              <option value="复诊">复诊</option>
              <option value="体检">体检</option>
              <option value="复查">复查</option>
            </select>
          </div>
        </div>
      </aside>

      <div class="apt-main">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📅 {{ selectedDate }} 预约列表</h3>
            <span class="badge badge-info">共 {{ filteredAppointments.length }} 个</span>
          </div>
          
          <table class="data-table" v-if="filteredAppointments.length">
            <thead>
              <tr>
                <th style="width: 70px;">时间</th>
                <th style="width: 100px;">患者</th>
                <th style="width: 70px;">类型</th>
                <th>科室 / 医生</th>
                <th style="width: 80px;">状态</th>
                <th style="width: 160px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in paginatedAppointments" :key="apt.id">
                <td><span class="time-cell">{{ apt.time }}</span></td>
                <td><div class="patient-name">{{ apt.patientName }}</div></td>
                <td><span class="type-tag">{{ apt.type }}</span></td>
                <td>
                  <div class="dept-cell">
                    <span>{{ apt.department }}</span>
                    <span class="doctor">{{ apt.doctor }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-tag" :class="apt.status">{{ apt.status === 'confirmed' ? '已确认' : '待确认' }}</span>
                </td>
                <td>
                  <div class="actions">
                    <button class="action-btn primary" v-if="apt.status === 'pending'" @click="confirmApt(apt)">确认</button>
                    <button class="action-btn" @click="openEditModal(apt)">编辑</button>
                    <button class="action-btn danger" @click="openDeleteModal(apt)">取消</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="empty-state" v-if="!filteredAppointments.length">
            <div class="empty-icon">📅</div>
            <h3>当日暂无预约</h3>
          </div>

          <div class="pagination" v-if="filteredAppointments.length > pageSize">
            <span class="page-info">显示 {{ startIndex + 1 }}-{{ endIndex }} 条</span>
            <div class="page-btns">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
              <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑预约' : '新增预约' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>患者姓名 <span class="required">*</span></label>
              <input type="text" v-model="form.patientName" placeholder="请输入患者姓名">
            </div>
            <div class="form-group">
              <label>预约类型 <span class="required">*</span></label>
              <select v-model="form.type">
                <option value="初诊">初诊</option>
                <option value="复诊">复诊</option>
                <option value="体检">体检</option>
                <option value="复查">复查</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>预约日期 <span class="required">*</span></label>
              <input type="date" v-model="form.date">
            </div>
            <div class="form-group">
              <label>预约时间 <span class="required">*</span></label>
              <select v-model="form.time">
                <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>科室 <span class="required">*</span></label>
              <select v-model="form.department">
                <option value="内科">内科</option>
                <option value="外科">外科</option>
                <option value="妇科">妇科</option>
                <option value="儿科">儿科</option>
                <option value="骨科">骨科</option>
                <option value="心内科">心内科</option>
                <option value="神经内科">神经内科</option>
                <option value="消化内科">消化内科</option>
                <option value="口腔科">口腔科</option>
                <option value="眼科">眼科</option>
                <option value="耳鼻喉科">耳鼻喉科</option>
                <option value="皮肤科">皮肤科</option>
                <option value="急诊科">急诊科</option>
              </select>
            </div>
            <div class="form-group">
              <label>医生 <span class="required">*</span></label>
              <input type="text" v-model="form.doctor" placeholder="请输入医生姓名">
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="pending">待确认</option>
              <option value="confirmed">已确认</option>
            </select>
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="form.notes" placeholder="请输入备注信息" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveAppointment">{{ isEdit ? '保存修改' : '确认添加' }}</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="closeDeleteModal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>取消预约</h3>
          <button class="modal-close" @click="closeDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="delete-confirm">
            <span class="delete-icon">⚠️</span>
            <p>确定要取消 <strong>{{ deleteTarget?.patientName }}</strong> 的预约吗？</p>
            <p class="delete-hint">预约时间：{{ deleteTarget?.date }} {{ deleteTarget?.time }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDeleteModal">返回</button>
          <button class="btn btn-danger" @click="confirmDelete">确认取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { appointments as initialAppointments } from '../data/mockData'

const appointmentList = ref([...initialAppointments])
const currentDate = ref(new Date('2025-12-30'))
const selectedDate = ref('2025-12-30')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = 10

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

const form = reactive({
  patientName: '', type: '初诊', date: '', time: '09:00', department: '内科', doctor: '', status: 'pending', notes: ''
})

const resetForm = () => {
  Object.assign(form, { patientName: '', type: '初诊', date: selectedDate.value, time: '09:00', department: '内科', doctor: '', status: 'pending', notes: '' })
}

const openAddModal = () => { isEdit.value = false; editingId.value = null; resetForm(); showModal.value = true }
const openEditModal = (apt) => {
  isEdit.value = true; editingId.value = apt.id
  Object.assign(form, { patientName: apt.patientName, type: apt.type, date: apt.date, time: apt.time, department: apt.department, doctor: apt.doctor, status: apt.status, notes: apt.notes || '' })
  showModal.value = true
}
const closeModal = () => { showModal.value = false }

const openDeleteModal = (apt) => { deleteTarget.value = apt; showDeleteModal.value = true }
const closeDeleteModal = () => { showDeleteModal.value = false; deleteTarget.value = null }

const saveAppointment = () => {
  if (!form.patientName || !form.date || !form.time || !form.department || !form.doctor) { alert('请填写必填项'); return }
  const aptData = { patientName: form.patientName, type: form.type, date: form.date, time: form.time, department: form.department, doctor: form.doctor, status: form.status, notes: form.notes }
  if (isEdit.value) {
    const idx = appointmentList.value.findIndex(a => a.id === editingId.value)
    if (idx !== -1) appointmentList.value[idx] = { ...appointmentList.value[idx], ...aptData }
  } else {
    aptData.id = Date.now()
    appointmentList.value.push(aptData)
  }
  closeModal()
}

const confirmDelete = () => {
  appointmentList.value = appointmentList.value.filter(a => a.id !== deleteTarget.value.id)
  closeDeleteModal()
}

const confirmApt = (apt) => { apt.status = 'confirmed' }

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear(), month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0)
  let startWeekday = firstDay.getDay(); startWeekday = startWeekday === 0 ? 6 : startWeekday - 1
  const days = [], today = new Date(), prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({ day: prevMonthLastDay - i, date: d.toISOString().split('T')[0], currentMonth: false, isToday: false, aptCount: getAptCount(d.toISOString().split('T')[0]) })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i), dateStr = d.toISOString().split('T')[0]
    days.push({ day: i, date: dateStr, currentMonth: true, isToday: d.toDateString() === today.toDateString(), aptCount: getAptCount(dateStr) })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ day: i, date: d.toISOString().split('T')[0], currentMonth: false, isToday: false, aptCount: getAptCount(d.toISOString().split('T')[0]) })
  }
  return days
})

const getAptCount = (date) => appointmentList.value.filter(a => a.date === date).length
const dayAppointments = computed(() => appointmentList.value.filter(a => a.date === selectedDate.value))
const filteredAppointments = computed(() => {
  let result = dayAppointments.value
  if (statusFilter.value) result = result.filter(a => a.status === statusFilter.value)
  if (typeFilter.value) result = result.filter(a => a.type === typeFilter.value)
  return result
})

const confirmedCount = computed(() => dayAppointments.value.filter(a => a.status === 'confirmed').length)
const pendingCount = computed(() => dayAppointments.value.filter(a => a.status === 'pending').length)
const totalPages = computed(() => Math.ceil(filteredAppointments.value.length / pageSize))
const startIndex = computed(() => (currentPage.value - 1) * pageSize)
const endIndex = computed(() => Math.min(currentPage.value * pageSize, filteredAppointments.value.length))
const paginatedAppointments = computed(() => filteredAppointments.value.slice(startIndex.value, endIndex.value))

const changeMonth = (dir) => { const d = new Date(currentDate.value); d.setMonth(d.getMonth() + dir); currentDate.value = d }
const selectDate = (date) => { selectedDate.value = date; currentPage.value = 1 }

watch([statusFilter, typeFilter], () => currentPage.value = 1)
</script>

<style scoped>
.apt-layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: stretch; }
.apt-sidebar { }
.calendar-card { height: 100%; display: flex; flex-direction: column; }

.cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.cal-btn { width: 40px; height: 40px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 10px; cursor: pointer; font-size: 20px; }
.cal-btn:hover { border-color: var(--primary); color: var(--primary); }
.cal-title { font-weight: 600; font-size: 18px; }

.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 12px; }
.cal-weekdays span { text-align: center; font-size: 13px; color: var(--text-muted); padding: 10px 0; font-weight: 600; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; flex: 1; }
.cal-day { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 10px; cursor: pointer; position: relative; transition: var(--transition); font-size: 15px; }
.cal-day:hover { background: var(--bg-primary); }
.cal-day.active { background: var(--primary); color: #fff; }
.cal-day.today { box-shadow: inset 0 0 0 2px var(--primary); }
.cal-day.active.today { box-shadow: none; }
.cal-day.other-month { color: var(--text-muted); }
.cal-day-num { font-weight: 500; }
.cal-day-dot { position: absolute; bottom: 6px; width: 6px; height: 6px; background: var(--danger); border-radius: 50%; }
.cal-day.active .cal-day-dot { background: #fff; }

.cal-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color); }
.cal-stat-item { text-align: center; padding: 18px 10px; background: var(--bg-primary); border-radius: 12px; }
.cal-stat-val { display: block; font-size: 26px; font-weight: 700; }
.cal-stat-item.success .cal-stat-val { color: var(--success); }
.cal-stat-item.warning .cal-stat-val { color: var(--warning); }
.cal-stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 6px; display: block; }

.cal-filters { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); }
.cal-filters .filter-select { width: 100%; padding: 10px 12px; }

.time-cell { font-weight: 600; color: var(--primary); }
.type-tag { display: inline-block; padding: 3px 10px; background: var(--bg-primary); border-radius: 6px; font-size: 12px; }
.dept-cell { display: flex; flex-direction: column; gap: 3px; }
.dept-cell .doctor { font-size: 12px; color: var(--text-secondary); }
.status-tag { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.status-tag.confirmed { background: rgba(34,197,94,0.1); color: var(--success); }
.status-tag.pending { background: rgba(245,158,11,0.1); color: var(--warning); }

.apt-main { }
.apt-main > .card { height: 100%; display: flex; flex-direction: column; }
.apt-main .card-header { flex-shrink: 0; }
.apt-main .data-table { flex: 1; }
.apt-main .pagination { margin-top: auto; }

.actions { display: flex; gap: 8px; }
.action-btn { padding: 5px 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 6px; font-size: 12px; cursor: pointer; transition: var(--transition); }
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.action-btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.action-btn.danger:hover { border-color: var(--danger); color: var(--danger); }

.pagination { display: flex; justify-content: space-between; align-items: center; padding: 20px 0 0; border-top: 1px solid var(--border-color); margin-top: 16px; }
.page-info { font-size: 13px; color: var(--text-secondary); }
.page-btns { display: flex; align-items: center; gap: 14px; }
.page-btn { padding: 8px 16px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; font-size: 13px; cursor: pointer; transition: var(--transition); }
.page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-num { font-size: 13px; color: var(--text-secondary); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; }

/* 弹窗样式 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { background: #fff; border-radius: 16px; width: 560px; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
.modal.modal-sm { width: 420px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { font-size: 18px; font-weight: 600; }
.modal-close { width: 32px; height: 32px; border: none; background: var(--bg-primary); border-radius: 8px; cursor: pointer; font-size: 16px; transition: var(--transition); }
.modal-close:hover { background: var(--bg-secondary); }
.modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--border-color); background: var(--bg-primary); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; }
.form-group .required { color: var(--danger); }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; transition: var(--transition); font-family: inherit; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
.form-group textarea { resize: vertical; }

.btn-secondary { padding: 10px 20px; border: 1px solid var(--border-color); background: #fff; border-radius: 8px; font-size: 14px; cursor: pointer; transition: var(--transition); }
.btn-secondary:hover { background: var(--bg-primary); }
.btn-danger { padding: 10px 20px; border: none; background: var(--danger); color: #fff; border-radius: 8px; font-size: 14px; cursor: pointer; transition: var(--transition); }
.btn-danger:hover { background: #dc2626; }

.delete-confirm { text-align: center; padding: 20px 0; }
.delete-icon { font-size: 48px; display: block; margin-bottom: 16px; }
.delete-confirm p { font-size: 15px; color: var(--text-primary); margin-bottom: 8px; }
.delete-confirm strong { color: var(--primary); }
.delete-hint { font-size: 13px; color: var(--text-muted); }
</style>
