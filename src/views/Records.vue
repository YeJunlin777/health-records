<template>
  <div class="records-page fade-in">
    <header class="page-header page-header-flex">
      <div>
        <h1 class="page-title">健康记录</h1>
        <p class="page-subtitle">查看和管理所有患者的健康档案记录</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">➕ 新增记录</button>
    </header>

    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" placeholder="搜索患者姓名..." v-model="searchQuery">
        </div>
        <select class="filter-select" v-model="typeFilter">
          <option value="">全部类型</option>
          <option value="体检报告">体检报告</option>
          <option value="门诊记录">门诊记录</option>
          <option value="住院记录">住院记录</option>
          <option value="急诊记录">急诊记录</option>
        </select>
        <select class="filter-select" v-model="departmentFilter">
          <option value="">全部科室</option>
          <option value="内科">内科</option>
          <option value="外科">外科</option>
          <option value="妇科">妇科</option>
          <option value="儿科">儿科</option>
          <option value="骨科">骨科</option>
          <option value="心内科">心内科</option>
          <option value="神经内科">神经内科</option>
          <option value="消化内科">消化内科</option>
          <option value="急诊科">急诊科</option>
        </select>
      </div>
      <div class="result-count">共 {{ filteredRecords.length }} 条记录</div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 160px;">患者</th>
            <th style="width: 100px;">类型</th>
            <th>诊断摘要</th>
            <th style="width: 130px;">科室 / 医生</th>
            <th style="width: 180px;">体征数据</th>
            <th style="width: 100px;">日期</th>
            <th style="width: 120px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in paginatedRecords" :key="record.id">
            <td>
              <div class="patient-info">
                <div class="type-icon" :class="getTypeClass(record.type)">{{ getTypeIcon(record.type) }}</div>
                <div>
                  <div class="patient-name">{{ record.patientName }}</div>
                  <div class="patient-meta">ID: {{ record.patientId }}</div>
                </div>
              </div>
            </td>
            <td><span class="type-tag" :class="getTypeClass(record.type)">{{ record.type }}</span></td>
            <td class="summary-cell">{{ record.summary }}</td>
            <td>
              <div class="dept-cell">
                <span>{{ record.department }}</span>
                <span class="doctor">{{ record.doctor }}</span>
              </div>
            </td>
            <td>
              <div class="vitals-cell">
                <span v-if="record.details.bloodPressure">血压: {{ record.details.bloodPressure }}</span>
                <span v-if="record.details.heartRate">心率: {{ record.details.heartRate }}</span>
              </div>
            </td>
            <td>{{ record.date }}</td>
            <td>
              <div class="actions">
                <button class="icon-btn" @click="openViewModal(record)" title="查看">👁️</button>
                <button class="icon-btn" @click="openEditModal(record)" title="编辑">✏️</button>
                <button class="icon-btn delete" @click="openDeleteModal(record)" title="删除">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="empty-state" v-if="!filteredRecords.length">
        <div class="empty-icon">📋</div>
        <h3>暂无健康记录</h3>
      </div>

      <div class="pagination" v-if="filteredRecords.length > 0">
        <span class="page-info">显示 {{ startIndex + 1 }}-{{ endIndex }} 条，共 {{ filteredRecords.length }} 条</span>
        <div class="page-btns">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹ 上一页</button>
          <div class="page-nums">
            <button v-for="p in displayPages" :key="p" class="page-num-btn" :class="{ active: p === currentPage, dots: p === '...' }" @click="p !== '...' && (currentPage = p)" :disabled="p === '...'">{{ p }}</button>
          </div>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页 ›</button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '编辑记录' : '新增记录' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>患者姓名 <span class="required">*</span></label>
              <input type="text" v-model="form.patientName" placeholder="请输入患者姓名">
            </div>
            <div class="form-group">
              <label>患者ID</label>
              <input type="text" v-model="form.patientId" placeholder="请输入患者ID">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>记录类型 <span class="required">*</span></label>
              <select v-model="form.type">
                <option value="体检报告">体检报告</option>
                <option value="门诊记录">门诊记录</option>
                <option value="住院记录">住院记录</option>
                <option value="急诊记录">急诊记录</option>
              </select>
            </div>
            <div class="form-group">
              <label>就诊日期 <span class="required">*</span></label>
              <input type="date" v-model="form.date">
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
                <option value="急诊科">急诊科</option>
              </select>
            </div>
            <div class="form-group">
              <label>主治医生 <span class="required">*</span></label>
              <input type="text" v-model="form.doctor" placeholder="请输入医生姓名">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>血压</label>
              <input type="text" v-model="form.bloodPressure" placeholder="如：120/80">
            </div>
            <div class="form-group">
              <label>心率</label>
              <input type="text" v-model="form.heartRate" placeholder="如：72次/分">
            </div>
          </div>
          <div class="form-group">
            <label>诊断摘要 <span class="required">*</span></label>
            <textarea v-model="form.summary" placeholder="请输入诊断摘要" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveRecord">{{ isEdit ? '保存修改' : '确认添加' }}</button>
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <div class="modal-overlay" v-if="showViewModal" @click.self="closeViewModal">
      <div class="modal">
        <div class="modal-header">
          <h3>记录详情</h3>
          <button class="modal-close" @click="closeViewModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item"><label>患者姓名</label><span>{{ viewRecord?.patientName }}</span></div>
            <div class="detail-item"><label>患者ID</label><span>{{ viewRecord?.patientId }}</span></div>
            <div class="detail-item"><label>记录类型</label><span class="type-tag" :class="getTypeClass(viewRecord?.type)">{{ viewRecord?.type }}</span></div>
            <div class="detail-item"><label>就诊日期</label><span>{{ viewRecord?.date }}</span></div>
            <div class="detail-item"><label>科室</label><span>{{ viewRecord?.department }}</span></div>
            <div class="detail-item"><label>主治医生</label><span>{{ viewRecord?.doctor }}</span></div>
            <div class="detail-item"><label>血压</label><span>{{ viewRecord?.details?.bloodPressure || '-' }}</span></div>
            <div class="detail-item"><label>心率</label><span>{{ viewRecord?.details?.heartRate || '-' }}</span></div>
          </div>
          <div class="detail-full">
            <label>诊断摘要</label>
            <p>{{ viewRecord?.summary }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeViewModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="closeDeleteModal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="modal-close" @click="closeDeleteModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="delete-confirm">
            <span class="delete-icon">⚠️</span>
            <p>确定要删除 <strong>{{ deleteTarget?.patientName }}</strong> 的健康记录吗？</p>
            <p class="delete-hint">此操作不可恢复</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDeleteModal">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { healthRecords as initialRecords } from '../data/mockData'

const recordList = ref([...initialRecords])
const searchQuery = ref('')
const typeFilter = ref('')
const departmentFilter = ref('')
const currentPage = ref(1)
const pageSize = 10

const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const viewRecord = ref(null)
const deleteTarget = ref(null)

const form = reactive({
  patientName: '', patientId: '', type: '门诊记录', date: '', department: '内科',
  doctor: '', bloodPressure: '', heartRate: '', summary: ''
})

const resetForm = () => {
  Object.assign(form, { patientName: '', patientId: '', type: '门诊记录', date: new Date().toISOString().split('T')[0], department: '内科', doctor: '', bloodPressure: '', heartRate: '', summary: '' })
}

const openAddModal = () => { isEdit.value = false; editingId.value = null; resetForm(); showModal.value = true }
const openEditModal = (record) => {
  isEdit.value = true; editingId.value = record.id
  Object.assign(form, { patientName: record.patientName, patientId: record.patientId, type: record.type, date: record.date, department: record.department, doctor: record.doctor, bloodPressure: record.details?.bloodPressure || '', heartRate: record.details?.heartRate || '', summary: record.summary })
  showModal.value = true
}
const closeModal = () => { showModal.value = false }

const openViewModal = (record) => { viewRecord.value = record; showViewModal.value = true }
const closeViewModal = () => { showViewModal.value = false; viewRecord.value = null }

const openDeleteModal = (record) => { deleteTarget.value = record; showDeleteModal.value = true }
const closeDeleteModal = () => { showDeleteModal.value = false; deleteTarget.value = null }

const saveRecord = () => {
  if (!form.patientName || !form.date || !form.department || !form.doctor || !form.summary) { alert('请填写必填项'); return }
  const recordData = {
    patientName: form.patientName, patientId: form.patientId || 'P' + Date.now(), type: form.type, date: form.date,
    department: form.department, doctor: form.doctor, summary: form.summary,
    details: { bloodPressure: form.bloodPressure, heartRate: form.heartRate }
  }
  if (isEdit.value) {
    const idx = recordList.value.findIndex(r => r.id === editingId.value)
    if (idx !== -1) recordList.value[idx] = { ...recordList.value[idx], ...recordData }
  } else {
    recordData.id = Date.now()
    recordList.value.unshift(recordData)
  }
  closeModal()
}

const confirmDelete = () => {
  recordList.value = recordList.value.filter(r => r.id !== deleteTarget.value.id)
  closeDeleteModal()
}

const filteredRecords = computed(() => {
  let result = recordList.value
  if (searchQuery.value) result = result.filter(r => r.patientName.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (typeFilter.value) result = result.filter(r => r.type === typeFilter.value)
  if (departmentFilter.value) result = result.filter(r => r.department === departmentFilter.value)
  return result
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize))
const startIndex = computed(() => (currentPage.value - 1) * pageSize)
const endIndex = computed(() => Math.min(currentPage.value * pageSize, filteredRecords.value.length))
const paginatedRecords = computed(() => filteredRecords.value.slice(startIndex.value, endIndex.value))

const displayPages = computed(() => {
  const pages = [], total = totalPages.value, current = currentPage.value
  if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i) }
  else if (current <= 4) { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...', total) }
  else if (current >= total - 3) { pages.push(1, '...'); for (let i = total - 4; i <= total; i++) pages.push(i) }
  else { pages.push(1, '...', current - 1, current, current + 1, '...', total) }
  return pages
})

watch([searchQuery, typeFilter, departmentFilter], () => currentPage.value = 1)

const getTypeClass = (t) => ({ '体检报告': 'checkup', '门诊记录': 'outpatient', '住院记录': 'inpatient', '急诊记录': 'emergency' }[t] || '')
const getTypeIcon = (t) => ({ '体检报告': '📊', '门诊记录': '🩺', '住院记录': '🏥', '急诊记录': '🚑' }[t] || '📋')
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar-left { display: flex; gap: 12px; align-items: center; }
.result-count { font-size: 13px; color: var(--text-secondary); }

.type-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.type-icon.checkup { background: rgba(14,165,233,0.1); }
.type-icon.outpatient { background: rgba(16,185,129,0.1); }
.type-icon.inpatient { background: rgba(245,158,11,0.1); }
.type-icon.emergency { background: rgba(239,68,68,0.1); }

.type-tag { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.type-tag.checkup { background: rgba(14,165,233,0.1); color: var(--primary); }
.type-tag.outpatient { background: rgba(16,185,129,0.1); color: var(--accent); }
.type-tag.inpatient { background: rgba(245,158,11,0.1); color: var(--warning); }
.type-tag.emergency { background: rgba(239,68,68,0.1); color: var(--danger); }

.summary-cell { color: var(--text-secondary); font-size: 13px; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dept-cell { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
.dept-cell .doctor { color: var(--text-secondary); font-size: 12px; }
.vitals-cell { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: var(--text-secondary); }

.actions { display: flex; gap: 6px; }
.icon-btn { width: 32px; height: 32px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 6px; cursor: pointer; transition: var(--transition); font-size: 14px; }
.icon-btn:hover { border-color: var(--primary); background: rgba(14,165,233,0.05); }
.icon-btn.delete:hover { border-color: var(--danger); background: rgba(239,68,68,0.05); }

.pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px 0 0; border-top: 1px solid var(--border-color); margin-top: 16px; }
.page-info { font-size: 13px; color: var(--text-secondary); }
.page-btns { display: flex; align-items: center; gap: 8px; }
.page-btn { padding: 6px 14px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 6px; font-size: 13px; cursor: pointer; transition: var(--transition); }
.page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-nums { display: flex; gap: 4px; }
.page-num-btn { width: 32px; height: 32px; border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 6px; font-size: 13px; cursor: pointer; transition: var(--transition); }
.page-num-btn:hover:not(:disabled):not(.active) { border-color: var(--primary); color: var(--primary); }
.page-num-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.page-num-btn.dots { border: none; background: none; cursor: default; }

/* 弹窗样式 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { background: #fff; border-radius: 16px; width: 600px; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
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

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.detail-item { display: flex; flex-direction: column; gap: 6px; }
.detail-item label { font-size: 12px; color: var(--text-muted); }
.detail-item span { font-size: 14px; color: var(--text-primary); }
.detail-full { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); }
.detail-full label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
.detail-full p { font-size: 14px; color: var(--text-primary); line-height: 1.6; }

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
