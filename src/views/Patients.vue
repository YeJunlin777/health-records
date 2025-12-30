<template>
  <div class="patients-page fade-in">
    <header class="page-header page-header-flex">
      <div>
        <h1 class="page-title">患者档案</h1>
        <p class="page-subtitle">管理所有患者的健康档案信息</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">➕ 新增患者</button>
    </header>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" placeholder="搜索患者姓名、电话..." v-model="searchQuery">
        </div>
        <div class="filter-group">
          <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="setFilter('all')">全部</button>
          <button class="filter-btn" :class="{ active: activeFilter === 'active' }" @click="setFilter('active')">正常</button>
          <button class="filter-btn" :class="{ active: activeFilter === 'followup' }" @click="setFilter('followup')">随访中</button>
          <button class="filter-btn" :class="{ active: activeFilter === 'critical' }" @click="setFilter('critical')">重点关注</button>
        </div>
      </div>
      <div class="result-count">共 {{ filteredPatients.length }} 条记录</div>
    </div>

    <!-- 患者表格 -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">患者信息</th>
            <th style="width: 80px;">血型</th>
            <th>慢性病史</th>
            <th>过敏史</th>
            <th style="width: 110px;">最近就诊</th>
            <th style="width: 90px;">状态</th>
            <th style="width: 120px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in paginatedPatients" :key="patient.id">
            <td>
              <div class="patient-info">
                <div class="avatar-wrap">
                  <img :src="patient.avatar" class="avatar">
                  <span class="status-dot" :class="patient.status"></span>
                </div>
                <div>
                  <div class="patient-name">{{ patient.name }}</div>
                  <div class="patient-meta">{{ patient.gender }} · {{ patient.age }}岁 · {{ patient.phone }}</div>
                </div>
              </div>
            </td>
            <td><span class="blood-tag">{{ patient.bloodType }}</span></td>
            <td>
              <div class="tag-wrap">
                <span class="tag" v-for="d in patient.chronicDiseases.slice(0, 2)" :key="d">{{ d }}</span>
                <span class="tag more" v-if="patient.chronicDiseases.length > 2">+{{ patient.chronicDiseases.length - 2 }}</span>
                <span v-if="!patient.chronicDiseases.length" class="text-muted">-</span>
              </div>
            </td>
            <td>
              <div class="tag-wrap">
                <span class="tag danger" v-for="a in patient.allergies.slice(0, 2)" :key="a">{{ a }}</span>
                <span class="tag danger more" v-if="patient.allergies.length > 2">+{{ patient.allergies.length - 2 }}</span>
                <span v-if="!patient.allergies.length" class="text-muted">-</span>
              </div>
            </td>
            <td>{{ patient.lastVisit }}</td>
            <td><span class="badge" :class="getStatusClass(patient.status)">{{ getStatusText(patient.status) }}</span></td>
            <td>
              <div class="actions">
                <button class="icon-btn view" @click="$router.push(`/patients/${patient.id}`)" title="查看">👁️</button>
                <button class="icon-btn edit" @click="openEditModal(patient)" title="编辑">✏️</button>
                <button class="icon-btn delete" @click="openDeleteModal(patient)" title="删除">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="empty-state" v-if="!filteredPatients.length">
        <div class="empty-icon">📭</div>
        <h3>未找到匹配的患者</h3>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="filteredPatients.length > 0">
        <span class="page-info">显示 {{ startIndex + 1 }}-{{ endIndex }} 条，共 {{ filteredPatients.length }} 条</span>
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
          <h3>{{ isEdit ? '编辑患者' : '新增患者' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>姓名 <span class="required">*</span></label>
              <input type="text" v-model="form.name" placeholder="请输入姓名">
            </div>
            <div class="form-group">
              <label>性别 <span class="required">*</span></label>
              <select v-model="form.gender">
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>年龄 <span class="required">*</span></label>
              <input type="number" v-model="form.age" placeholder="请输入年龄">
            </div>
            <div class="form-group">
              <label>血型</label>
              <select v-model="form.bloodType">
                <option value="A型">A型</option>
                <option value="B型">B型</option>
                <option value="AB型">AB型</option>
                <option value="O型">O型</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>电话 <span class="required">*</span></label>
              <input type="text" v-model="form.phone" placeholder="请输入电话号码">
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="form.status">
                <option value="active">正常</option>
                <option value="followup">随访中</option>
                <option value="critical">重点关注</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>身份证号</label>
            <input type="text" v-model="form.idCard" placeholder="请输入身份证号">
          </div>
          <div class="form-group">
            <label>家庭住址</label>
            <input type="text" v-model="form.address" placeholder="请输入家庭住址">
          </div>
          <div class="form-group">
            <label>慢性病史</label>
            <input type="text" v-model="form.chronicDiseasesStr" placeholder="多个用逗号分隔，如：高血压,糖尿病">
          </div>
          <div class="form-group">
            <label>过敏史</label>
            <input type="text" v-model="form.allergiesStr" placeholder="多个用逗号分隔，如：青霉素,花粉">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="savePatient">{{ isEdit ? '保存修改' : '确认添加' }}</button>
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
            <p>确定要删除患者 <strong>{{ deleteTarget?.name }}</strong> 的档案吗？</p>
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
import { patients as initialPatients } from '../data/mockData'

const patientList = ref([...initialPatients])
const searchQuery = ref('')
const activeFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10

// 弹窗状态
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const form = reactive({
  name: '', gender: '男', age: '', bloodType: 'A型', phone: '',
  status: 'active', idCard: '', address: '', chronicDiseasesStr: '', allergiesStr: ''
})

const resetForm = () => {
  Object.assign(form, {
    name: '', gender: '男', age: '', bloodType: 'A型', phone: '',
    status: 'active', idCard: '', address: '', chronicDiseasesStr: '', allergiesStr: ''
  })
}

const openAddModal = () => {
  isEdit.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (patient) => {
  isEdit.value = true
  editingId.value = patient.id
  Object.assign(form, {
    name: patient.name, gender: patient.gender, age: patient.age,
    bloodType: patient.bloodType, phone: patient.phone, status: patient.status,
    idCard: patient.idCard || '', address: patient.address || '',
    chronicDiseasesStr: patient.chronicDiseases.join(','),
    allergiesStr: patient.allergies.join(',')
  })
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const savePatient = () => {
  if (!form.name || !form.phone || !form.age) {
    alert('请填写必填项')
    return
  }
  const patientData = {
    name: form.name, gender: form.gender, age: Number(form.age),
    bloodType: form.bloodType, phone: form.phone, status: form.status,
    idCard: form.idCard, address: form.address,
    chronicDiseases: form.chronicDiseasesStr ? form.chronicDiseasesStr.split(',').map(s => s.trim()).filter(Boolean) : [],
    allergies: form.allergiesStr ? form.allergiesStr.split(',').map(s => s.trim()).filter(Boolean) : [],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`,
    lastVisit: new Date().toISOString().split('T')[0]
  }
  if (isEdit.value) {
    const idx = patientList.value.findIndex(p => p.id === editingId.value)
    if (idx !== -1) patientList.value[idx] = { ...patientList.value[idx], ...patientData }
  } else {
    patientData.id = Date.now()
    patientList.value.unshift(patientData)
  }
  closeModal()
}

const openDeleteModal = (patient) => { deleteTarget.value = patient; showDeleteModal.value = true }
const closeDeleteModal = () => { showDeleteModal.value = false; deleteTarget.value = null }
const confirmDelete = () => {
  patientList.value = patientList.value.filter(p => p.id !== deleteTarget.value.id)
  closeDeleteModal()
}

const filteredPatients = computed(() => {
  let result = patientList.value
  if (activeFilter.value !== 'all') result = result.filter(p => p.status === activeFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q))
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredPatients.value.length / pageSize))
const startIndex = computed(() => (currentPage.value - 1) * pageSize)
const endIndex = computed(() => Math.min(currentPage.value * pageSize, filteredPatients.value.length))
const paginatedPatients = computed(() => filteredPatients.value.slice(startIndex.value, endIndex.value))

const displayPages = computed(() => {
  const pages = [], total = totalPages.value, current = currentPage.value
  if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i) }
  else if (current <= 4) { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...', total) }
  else if (current >= total - 3) { pages.push(1, '...'); for (let i = total - 4; i <= total; i++) pages.push(i) }
  else { pages.push(1, '...', current - 1, current, current + 1, '...', total) }
  return pages
})

const setFilter = (f) => { activeFilter.value = f; currentPage.value = 1 }
watch(searchQuery, () => currentPage.value = 1)

const getStatusClass = (s) => ({ active: 'badge-success', followup: 'badge-warning', critical: 'badge-danger' }[s] || 'badge-info')
const getStatusText = (s) => ({ active: '正常', followup: '随访中', critical: '重点关注' }[s] || s)
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar-left { display: flex; gap: 16px; align-items: center; }
.filter-group { display: flex; gap: 6px; }
.result-count { font-size: 13px; color: var(--text-secondary); }

.avatar-wrap { position: relative; }
.status-dot { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; }
.status-dot.active { background: var(--success); }
.status-dot.followup { background: var(--warning); }
.status-dot.critical { background: var(--danger); }

.blood-tag { display: inline-block; padding: 2px 8px; background: rgba(14,165,233,0.1); color: var(--primary); border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
.tag { display: inline-block; padding: 2px 8px; background: rgba(14,165,233,0.08); color: var(--primary); border-radius: 4px; font-size: 12px; }
.tag.danger { background: rgba(239,68,68,0.08); color: var(--danger); }
.tag.more { background: var(--bg-primary); color: var(--text-muted); }
.text-muted { color: var(--text-muted); }

.actions { display: flex; gap: 8px; }
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
.form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; transition: var(--transition); }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }

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
