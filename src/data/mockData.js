// 姓氏和名字库
const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '郑', '梁', '谢', '宋', '唐', '许', '邓', '冯', '韩', '曹', '曾']
const maleNames = ['伟', '强', '磊', '军', '勇', '杰', '涛', '明', '超', '华', '建国', '建军', '志强', '文博', '天宇', '浩然', '子轩', '宇航', '俊杰', '晨阳']
const femaleNames = ['芳', '娜', '敏', '静', '丽', '艳', '霞', '秀英', '桂英', '玉兰', '婷婷', '雪梅', '晓红', '美玲', '雅琴', '思琪', '欣怡', '梦瑶', '诗涵', '雨萱']

// 生成随机手机号
const randomPhone = () => {
  const prefixes = ['138', '139', '136', '137', '135', '158', '159', '188', '189', '186']
  return prefixes[Math.floor(Math.random() * prefixes.length)] + '****' + Math.floor(1000 + Math.random() * 9000)
}

// 生成随机日期
const randomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

// 慢性病列表
const chronicDiseasesList = ['高血压', '糖尿病', '冠心病', '高血脂', '慢性胃炎', '关节炎', '哮喘', '甲状腺功能减退', '痛风', '慢性支气管炎']

// 过敏原列表
const allergiesList = ['青霉素', '磺胺类药物', '阿司匹林', '头孢类', '花粉', '海鲜', '牛奶', '鸡蛋', '花生', '尘螨']

// 科室列表
const departments = ['内科', '外科', '妇科', '儿科', '骨科', '心内科', '神经内科', '消化内科', '呼吸内科', '内分泌科', '皮肤科', '眼科', '耳鼻喉科', '口腔科', '急诊科']

// 医生姓名
const doctors = ['李医生', '王医生', '张医生', '刘医生', '陈医生', '杨医生', '赵医生', '黄医生', '周医生', '吴医生', '徐医生', '孙医生', '马医生', '朱医生', '胡医生']

// 生成患者数据
export const patients = []
for (let i = 1; i <= 55; i++) {
  const gender = Math.random() > 0.5 ? '男' : '女'
  const surname = surnames[Math.floor(Math.random() * surnames.length)]
  const nameList = gender === '男' ? maleNames : femaleNames
  const name = surname + nameList[Math.floor(Math.random() * nameList.length)]
  const age = Math.floor(18 + Math.random() * 70)
  
  // 根据年龄决定慢性病概率
  const hasChronicDisease = age > 45 ? Math.random() > 0.3 : Math.random() > 0.8
  const chronicDiseases = []
  if (hasChronicDisease) {
    const count = Math.floor(1 + Math.random() * 2)
    const shuffled = [...chronicDiseasesList].sort(() => 0.5 - Math.random())
    chronicDiseases.push(...shuffled.slice(0, count))
  }
  
  // 过敏史
  const hasAllergy = Math.random() > 0.7
  const allergies = []
  if (hasAllergy) {
    const count = Math.floor(1 + Math.random() * 2)
    const shuffled = [...allergiesList].sort(() => 0.5 - Math.random())
    allergies.push(...shuffled.slice(0, count))
  }
  
  // 状态
  let status = 'active'
  if (chronicDiseases.length > 1 || age > 65) {
    status = Math.random() > 0.5 ? 'followup' : (Math.random() > 0.7 ? 'critical' : 'active')
  }
  
  patients.push({
    id: i,
    name,
    gender,
    age,
    phone: randomPhone(),
    bloodType: ['A型', 'B型', 'O型', 'AB型'][Math.floor(Math.random() * 4)],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=patient${i}`,
    allergies,
    chronicDiseases,
    lastVisit: randomDate(new Date('2025-11-01'), new Date('2025-12-28')),
    status
  })
}

// 记录类型
const recordTypes = ['体检报告', '门诊记录', '住院记录', '急诊记录']

// 诊断摘要模板
const summaryTemplates = {
  '体检报告': [
    '各项指标正常，建议保持良好生活习惯',
    '血压偏高，建议低盐饮食，定期复查',
    '血糖略高，建议控制饮食，增加运动',
    '血脂偏高，建议清淡饮食，适量运动',
    '肝功能轻度异常，建议戒酒，定期复查',
    '心电图显示窦性心律，属正常范围',
    '胸片未见明显异常',
    'B超显示轻度脂肪肝，建议控制体重',
    '甲状腺功能正常',
    '肾功能各项指标正常'
  ],
  '门诊记录': [
    '上呼吸道感染，已开具抗生素治疗',
    '慢性胃炎急性发作，建议规律饮食',
    '腰椎间盘突出，建议卧床休息，理疗',
    '过敏性鼻炎，已开具抗过敏药物',
    '偏头痛，建议注意休息，避免劳累',
    '高血压复诊，血压控制良好，继续用药',
    '糖尿病复诊，血糖控制稳定',
    '皮肤湿疹，已开具外用药膏',
    '结膜炎，已开具眼药水',
    '咽喉炎，建议多喝水，清淡饮食'
  ],
  '住院记录': [
    '肺炎住院治疗，病情稳定，已出院',
    '胆囊结石手术，术后恢复良好',
    '阑尾炎手术，术后恢复顺利',
    '心绞痛发作，已稳定出院',
    '脑梗塞住院治疗，康复中',
    '骨折手术，术后恢复良好',
    '胃溃疡出血，保守治疗后出院',
    '糖尿病酮症酸中毒，已控制出院',
    '高血压危象，已稳定出院',
    '支气管哮喘急性发作，已控制'
  ],
  '急诊记录': [
    '急性肠胃炎，输液治疗后好转',
    '外伤缝合处理，建议定期换药',
    '急性过敏反应，已对症处理',
    '心悸胸闷，检查后排除心梗',
    '高热惊厥，已退热处理',
    '急性腹痛，排除急腹症',
    '低血糖昏迷，已纠正',
    '哮喘急性发作，已缓解',
    '血压急剧升高，已控制稳定',
    '食物中毒，洗胃后好转'
  ]
}

// 生成健康记录
export const healthRecords = []
let recordId = 1
for (const patient of patients) {
  // 每个患者1-4条记录
  const recordCount = Math.floor(1 + Math.random() * 4)
  for (let j = 0; j < recordCount; j++) {
    const type = recordTypes[Math.floor(Math.random() * recordTypes.length)]
    const dept = departments[Math.floor(Math.random() * departments.length)]
    const summaries = summaryTemplates[type]
    
    // 生成体征数据
    const systolic = Math.floor(100 + Math.random() * 60) // 收缩压 100-160
    const diastolic = Math.floor(60 + Math.random() * 40) // 舒张压 60-100
    const heartRate = Math.floor(60 + Math.random() * 40) // 心率 60-100
    const bloodSugar = (4 + Math.random() * 4).toFixed(1) // 血糖 4-8
    const weight = Math.floor(45 + Math.random() * 50) // 体重 45-95
    
    healthRecords.push({
      id: recordId++,
      patientId: patient.id,
      patientName: patient.name,
      type,
      date: randomDate(new Date('2025-10-01'), new Date('2025-12-28')),
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      department: dept,
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      details: {
        bloodPressure: `${systolic}/${diastolic} mmHg`,
        heartRate: `${heartRate} 次/分`,
        bloodSugar: Math.random() > 0.3 ? `${bloodSugar} mmol/L` : null,
        weight: `${weight} kg`
      }
    })
  }
}

// 按日期排序
healthRecords.sort((a, b) => new Date(b.date) - new Date(a.date))

// 预约类型
const appointmentTypes = ['初诊', '复诊', '体检', '复查', '换药', '拆线', '咨询']

// 生成预约数据
export const appointments = []
let aptId = 1
const timeSlots = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

// 生成未来7天的预约
for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
  const date = new Date('2025-12-29')
  date.setDate(date.getDate() + dayOffset)
  const dateStr = date.toISOString().split('T')[0]
  
  // 每天8-15个预约
  const dailyCount = Math.floor(8 + Math.random() * 8)
  const usedSlots = new Set()
  
  for (let i = 0; i < dailyCount; i++) {
    // 随机选择一个患者
    const patient = patients[Math.floor(Math.random() * patients.length)]
    
    // 随机选择时间段（避免重复）
    let timeSlot
    do {
      timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
    } while (usedSlots.has(timeSlot) && usedSlots.size < timeSlots.length)
    usedSlots.add(timeSlot)
    
    appointments.push({
      id: aptId++,
      patientId: patient.id,
      patientName: patient.name,
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      date: dateStr,
      time: timeSlot,
      status: Math.random() > 0.3 ? 'confirmed' : 'pending',
      type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)]
    })
  }
}

// 按日期和时间排序
appointments.sort((a, b) => {
  if (a.date !== b.date) return a.date.localeCompare(b.date)
  return a.time.localeCompare(b.time)
})

// 统计数据
export const statistics = {
  totalPatients: patients.length * 23 + Math.floor(Math.random() * 100), // 模拟更大的数据
  todayAppointments: appointments.filter(a => a.date === '2025-12-30').length,
  pendingReports: Math.floor(5 + Math.random() * 10),
  monthlyVisits: Math.floor(300 + Math.random() * 100)
}

// 健康趋势数据（用于图表）
export const healthTrends = {
  labels: ['7月', '8月', '9月', '10月', '11月', '12月'],
  visits: [286, 312, 298, 345, 378, 356],
  newPatients: [42, 58, 45, 63, 71, 52]
}
