(function () {
  const STORAGE_KEY = 'auditory-mind-space/contest-local-v3'
  const ADMIN_STORAGE_KEY = 'wisdombridge-admin-data'
  const SCREENS = ['home', 'training', 'assessment', 'healing', 'admin']
  const SCREEN_TITLES = { home: '首页', training: '认知训练', assessment: '注意力检测', healing: '声景疗愈', admin: '后台管理' }
  const COLORS = { warm_wood: '温暖木质', soft_sun: '柔亮日光', silver_bell: '清亮铃声', deep_night: '低频夜色' }
  const INTRO ='您现在在首页，这里有三个功能可以选。按键盘 F 键，进入认知训练，听声音粗细来训练大脑的反应力。按键盘 J 键，进入注意力检测，考验一下抗干扰能力。按键盘 空格键，进入声景疗愈，用自然的声音放松心情。请根据您的需要进行选择。'

  const BODY_SCAN = '请放松肩膀，把注意力放在呼吸上，从额头到肩颈，再到双手。'
  const $ = (id) => document.getElementById(id)
  const $$ = (s) => Array.from(document.querySelectorAll(s))
  
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  }
  
const BUTTON_INTROS = {
  home1: '首页包含您的个人信息和最近成绩，可以记录节奏签名作为匿名识别方式。',
  training1: '这里是认知训练，通过听声音粗细的小游戏，帮您锻炼大脑的反应力。操作说明： 请您戴上耳机，一会您会听到一个声音。觉得声音比较粗，就按键盘的上方向键；觉得声音比较细，就按键盘的下方向键。咱们先尝试四次练习（按g键开始练习）。按enter开始正式训练，按k开始游戏训练。祝您训练愉快！',
  assessment1: '这里会测试您的注意力，检测您能否不被词语意思分心。请您注意，这个游戏只认声音的高和低。不管耳机里说的是“大象”还是“小鸟”，也不管说的是“高音”还是“低音”，这些词的意思都别管。规则是这样的：如果您听到的声音 音调高（像小鸟叫那种尖尖的声音），就按键盘的 下方向键。如果您听到的声音 音调低（像大象走路那种闷闷的声音），就按键盘的 上方向键。记住，只认声音高还是低，不用管词语的意思。准备好了就开始。咱们先尝试四次练习（按h键开始练习）。按enter开始正式训练，按k开始游戏训练。祝您训练愉快！检测页面进行注意力检测，完成后会生成个人报告和建议。',
  healing1: '疗愈页面提供多种声景疗愈方案，帮助您放松身心。a键30分钟，w键60分钟，d键5分钟。escape键可以停止疗愈。祝您疗愈愉快！',
  starttestStandard: '练习模式',
  startAssessmentTestStandard: '练习模式',
  startTrainingStandard: '标准训练模式',
  startTrainingGame: '游戏训练模式',
  startAssessmentStandard: '正式测评模式',
  startAssessmentGame: '游戏化测评模式',
  speakReport: '播报当前检测报告，包括等级、得分和建议。',
  startHealing30: '开始30分钟的声景疗愈，帮助您放松身心。',
  startHealing60: '开始60分钟的声景疗愈，深度放松身心。',
  startHealing5: '开始5分钟的声景疗愈演示，体验放松效果。',
  stopHealing: '停止当前的声景疗愈。',
 
  overlayStop: '停止当前的声景疗愈。',
  overlayBack: '停止声景疗愈并返回检测页面。',
  startBtn: '音频13'//'您现在在首页，这里有三个功能可以选。按键盘 F 键，进入认知训练，听声音粗细来训练大脑的反应力。按键盘 J 键，进入注意力检测，考验一下抗干扰能力。按键盘 空格键，进入声景疗愈，用自然的声音放松心情。全局暂停键请用escape键，请根据您的需要进行选择。'
};
 const BUTTON_KEYS = {
    'f': 'training1',
    'j': 'assessment1',
    ' ': 'healing1',
    'h': 'home1'
  };
  const app = {
    state: loadState(),
    screen: 'home',
    reportLayerIndex: 0,
    selectedSessionId: null,
    selectedPlanKind: 'stream',
    tapStore: [],
    tapVerify: [],
    run: { kind: 'assessment', status: 'idle', mode: 'standard', stimuli: [], currentIndex: -1, responseStartAt: null, results: [] },
    timers: { cue: null, response: null, healing: null },
    overlaySeconds: 0,
    speechVersion: 0,
    speechPaused: false,
    speechPausedAt: 0,
    speechPausedDuration: 0,
    audioContext: null,
    soundscapeStop: null,
    soundscapeIntervals: [],
    currentUser: null,
    isAdmin: false
  }
  const el = {
    notice: $('notice'), screenTitle: $('screenTitle'), deviceId: $('deviceId'), nicknameInput: $('nicknameInput'),
    tapSignatureLabel: $('tapSignatureLabel'), tapNotice: $('tapNotice'), latestGrade: $('latestGrade'),
    anxietyRange: $('anxietyRange'), sleepRange: $('sleepRange'),  colorPreference: $('colorPreference'),
    anxietyValue: $('anxietyValue'), sleepValue: $('sleepValue'), colorValue: $('colorValue'),
    trainingGuideText: $('trainingGuideText'), trainingStatus: $('trainingStatus'), trainingProgress: $('trainingProgress'),
    trainingAnswerALabel: $('trainingAnswerALabel'), trainingAnswerBLabel: $('trainingAnswerBLabel'), trainingMetrics: $('trainingMetrics'),
    assessmentGuideText: $('assessmentGuideText'), assessmentStatus: $('assessmentStatus'), assessmentProgress: $('assessmentProgress'),
    reportHeadline: $('reportHeadline'), reportLayer: $('reportLayer'), historyList: $('historyList'), trendLine: $('trendLine'),
    planList: $('planList'), healingOverlay: $('healingOverlay'), overlayTitle: $('overlayTitle'),
    overlaySubtitle: $('overlaySubtitle'), overlayCountdown: $('overlayCountdown'),
    trainingA: $('answerThickTraining'), trainingB: $('answerThinTraining'), assessmentA: $('answerThickAssessment'), assessmentB: $('answerThinAssessment'),
    nameModal: $('nameModal'),
    nameInput: $('nameInput'),
    startBtn: $('startBtn')
  }

  init()

  function init() {
    Object.keys(COLORS).forEach((k) => {
      const o = document.createElement('option')
      o.value = k
      o.textContent = COLORS[k]
      el.colorPreference.appendChild(o)
    })
    bindLoginEvents()
    bindNameModalEvents()
    bind()
    
    const savedUser = localStorage.getItem('currentUser')
    const savedRole = localStorage.getItem('userRole')
    
    if (savedUser && savedRole) {
      app.currentUser = JSON.parse(savedUser)
      app.isAdmin = savedRole === 'admin'
      if (app.isAdmin) {
        loadAdminData()
      }
      $('loginModal').classList.add('hidden')
      document.querySelector('.app').classList.remove('hidden')
      renderAll()
      speak('欢迎回来，' + (app.isAdmin ? '管理员' : app.currentUser.nickname))
    } else {
      document.querySelector('.app').classList.add('hidden')
    }
    
    if (el.nameInput) {
      el.nameInput.focus();
    }
    
    function playWelcomeMessage() {
      speak('欢迎使用智听心桥。请先登录。');
      document.removeEventListener('click', playWelcomeMessage);
    }
    
    document.addEventListener('click', playWelcomeMessage);
  
  }
  
  function bindLoginEvents() {
    $('userLoginBtn')?.addEventListener('click', () => {
      $('userLoginBtn').classList.add('active')
      $('adminLoginBtn').classList.remove('active')
      app.isAdmin = false
    })
    
    $('adminLoginBtn')?.addEventListener('click', () => {
      $('adminLoginBtn').classList.add('active')
      $('userLoginBtn').classList.remove('active')
      app.isAdmin = true
    })
    
    $('nextToStep2')?.addEventListener('click', () => {
      if (app.isAdmin) {
        showLoginStep(3)
      } else {
        showLoginStep(2)
      }
    })
    
    $('backToStep1')?.addEventListener('click', () => showLoginStep(1))
    $('backToStep1FromAdmin')?.addEventListener('click', () => showLoginStep(1))
    
    $('sendCodeBtn')?.addEventListener('click', sendVerificationCode)
    $('voiceInputBtn')?.addEventListener('click', toggleVoiceInput)
    $('submitLogin')?.addEventListener('click', handleUserLogin)
    $('submitAdminLogin')?.addEventListener('click', handleAdminLogin)
    $('privacyLink')?.addEventListener('click', (e) => {
      e.preventDefault()
      $('privacyModal').classList.remove('hidden')
    })
    $('closePrivacyModal')?.addEventListener('click', () => {
      $('privacyModal').classList.add('hidden')
    })
    
    $('logoutBtn')?.addEventListener('click', handleLogout)
  }
  
  function showLoginStep(step) {
    $$('.login-step').forEach(s => s.classList.remove('active'))
    $(`loginStep${step}`)?.classList.add('active')
  }
  
  function sendVerificationCode() {
    const phone = $('phoneInput').value
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入有效的手机号')
      return
    }
    
    const btn = $('sendCodeBtn')
    btn.disabled = true
    btn.textContent = '60秒后重发'
    let count = 60
    const timer = setInterval(() => {
      count--
      btn.textContent = count + '秒后重发'
      if (count <= 0) {
        clearInterval(timer)
        btn.disabled = false
        btn.textContent = '获取验证码'
      }
    }, 1000)
    
    alert('验证码已发送到您的手机（模拟）')
  }
  
  let voiceRecognition = null
  
  function toggleVoiceInput() {
    const btn = $('voiceInputBtn')
    
    if (voiceRecognition && voiceRecognition.state === 'listening') {
      voiceRecognition.stop()
      btn.classList.remove('recording')
      return
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别')
      return
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    voiceRecognition = new SpeechRecognition()
    voiceRecognition.lang = 'zh-CN'
    voiceRecognition.interimResults = false
    voiceRecognition.maxAlternatives = 1
    
    voiceRecognition.onstart = () => {
      btn.classList.add('recording')
      alert('请开始说话，正在识别...')
    }
    
    voiceRecognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      $('phoneInput').value = result.replace(/\D/g, '').substring(0, 11)
      btn.classList.remove('recording')
    }
    
    voiceRecognition.onerror = () => {
      btn.classList.remove('recording')
      alert('语音识别失败，请重试')
    }
    
    voiceRecognition.onend = () => {
      btn.classList.remove('recording')
    }
    
    voiceRecognition.start()
  }
  
  function handleUserLogin() {
    const phone = $('phoneInput').value
    const code = $('codeInput').value
    const privacyAgree = $('privacyAgree').checked
    const researchAgree = $('researchAgree').checked
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入有效的手机号')
      return
    }
    
    if (!/^\d{6}$/.test(code)) {
      alert('请输入6位验证码')
      return
    }
    
    if (!privacyAgree) {
      alert('请先同意隐私协议')
      return
    }
    
    const userData = {
      phone: phone,
      nickname: phone.substring(0, 3) + '****' + phone.substring(7),
      agreedPrivacy: true,
      agreedResearch: researchAgree,
      createdAt: new Date().toISOString()
    }
    
    app.currentUser = userData
    app.isAdmin = false
    localStorage.setItem('currentUser', JSON.stringify(userData))
    localStorage.setItem('userRole', 'user')
    
    saveUserDataToAdmin(userData)
    
    $('loginModal').classList.add('hidden')
    document.querySelector('.app').classList.remove('hidden')
    app.state.profile.nickname = userData.nickname
    saveState()
    renderAll()
    speak('登录成功，欢迎使用智听心桥')
  }
  
  function handleAdminLogin() {
    const username = $('adminUsername').value
    const password = $('adminPassword').value
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      app.currentUser = { username: '管理员' }
      app.isAdmin = true
      localStorage.setItem('currentUser', JSON.stringify(app.currentUser))
      localStorage.setItem('userRole', 'admin')
      loadAdminData()
      
      $('loginModal').classList.add('hidden')
      document.querySelector('.app').classList.remove('hidden')
      renderAll()
      speak('管理员登录成功')
    } else {
      alert('账号或密码错误')
    }
  }
  
  function handleLogout() {
    app.currentUser = null
    app.isAdmin = false
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userRole')
    
    document.querySelector('.app').classList.add('hidden')
    $('loginModal').classList.remove('hidden')
    showLoginStep(1)
    
    $('phoneInput').value = ''
    $('codeInput').value = ''
    $('privacyAgree').checked = false
    $('researchAgree').checked = false
    $('adminUsername').value = ''
    $('adminPassword').value = ''
    
    speak('已退出登录')
  }
  
  function saveUserDataToAdmin(userData) {
    const adminData = loadAdminData()
    const existingUser = adminData.users.find(u => u.phone === userData.phone)
    
    if (existingUser) {
      existingUser.agreedResearch = userData.agreedResearch
      existingUser.lastLogin = new Date().toISOString()
    } else {
      adminData.users.push({
        ...userData,
        userId: 'user-' + Date.now(),
        lastLogin: new Date().toISOString(),
        sessionCount: 0
      })
    }
    
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData))
  }
  
  function loadAdminData() {
    try {
      const data = localStorage.getItem(ADMIN_STORAGE_KEY)
      return data ? JSON.parse(data) : {
        users: [],
        totalSessions: 0,
        totalUsers: 0,
        weeklyData: [],
        systemStats: {
          totalTests: 0,
          avgScore: 0,
          activeUsers: 0
        }
      }
    } catch {
      return {
        users: [],
        totalSessions: 0,
        totalUsers: 0,
        weeklyData: [],
        systemStats: {
          totalTests: 0,
          avgScore: 0,
          activeUsers: 0
        }
      }
    }
  }

  function bindNameModalEvents() {
    if (!el.nameModal || !el.startBtn || !el.nameInput) return
    
    el.startBtn.addEventListener('click', handleNameModalSubmit)
    el.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleNameModalSubmit()
      }
    })
  }

  function handleNameModalSubmit() {
    const name = el.nameInput.value.trim();
    if (!name) {
      alert('请输入您的姓名！');
      return;
    }

    
    app.state.profile.nickname = name.charAt(0) + '同学'
    saveState()
    renderProfile()
    el.nameModal.classList.add('hidden')
  }

  

  function bind() {
    $('playIntro').addEventListener('click', () => speak(INTRO))
    $('starttestStandard').addEventListener('click', startPracticeTrial)
    $('startAssessment-testStandard').addEventListener('click', startAssessmentPractice)
    // 为导航按钮绑定点击事件
$$('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const screen = btn.dataset.screen;
    
  });
});
    $$('[data-screen]').forEach((b) => b.addEventListener('click', () => switchScreen(b.dataset.screen)))
    $('prevScreen').addEventListener('click', () => moveScreen(-1))
    $('nextScreen').addEventListener('click', () => moveScreen(1))
    $('storeTap').addEventListener('click', () => recordTap('store'))
    $('verifyTap').addEventListener('click', () => recordTap('verify'))
    el.nicknameInput.addEventListener('input', (e) => { app.state.profile.nickname = e.target.value ? e.target.value.charAt(0) + '同学' : '访客'; saveState(); renderProfile() })
    el.anxietyRange.addEventListener('input', (e) => { app.state.questionnaire.anxietyLevel = Number(e.target.value); saveState(); renderQuestionnaire() })
    el.sleepRange.addEventListener('input', (e) => { app.state.questionnaire.sleepDifficulty = Number(e.target.value); saveState(); renderQuestionnaire() })
    el.colorPreference.addEventListener('change', (e) => { app.state.questionnaire.colorPreference = e.target.value; saveState(); renderQuestionnaire(); renderHealing() })
    $('startTrainingStandard').addEventListener('click', () => startRun('training', 'standard'))
    $('startTrainingGame').addEventListener('click', () => startRun('training', 'game'))
    $('startAssessmentStandard').addEventListener('click', () => startRun('assessment', 'standard'))
    $('startAssessmentGame').addEventListener('click', () => startRun('assessment', 'game'))
    el.trainingA.addEventListener('click', () => handleAnswer('thick'))
    el.trainingB.addEventListener('click', () => handleAnswer('thin'))
    el.assessmentA.addEventListener('click', () => handleAnswer('thick'))
    el.assessmentB.addEventListener('click', () => handleAnswer('thin'))
    $('prevLayer').addEventListener('click', () => { const r = getActiveReport(); if (!r) return; app.reportLayerIndex = Math.max(0, app.reportLayerIndex - 1); renderReport() })
    $('nextLayer').addEventListener('click', () => { const r = getActiveReport(); if (!r) return; app.reportLayerIndex = Math.min(r.layers.length - 1, app.reportLayerIndex + 1); renderReport() })
    $('speakReport').addEventListener('click', speakReport)
    $('startHealing30').addEventListener('click', () => startHealing(30))
    $('startHealing60').addEventListener('click', () => startHealing(60))
    $('startHealing5').addEventListener('click', () => startHealing(5))
    $('stopHealing').addEventListener('click', stopHealing)
    $('overlayStop').addEventListener('click', stopHealing)
    $('overlayBack').addEventListener('click', () => { stopHealing(); switchScreen('assessment') })


    window.addEventListener('keydown', (e) => {
  // 防止在输入框、下拉框中触发快捷键
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

  const key = e.key.toLowerCase();

  // 方向键通用功能
  if (e.key === 'ArrowLeft') { e.preventDefault(); moveScreen(-1) }
  if (e.key === 'ArrowRight') { e.preventDefault(); moveScreen(1) }
  if (e.key === 'ArrowUp') { e.preventDefault(); handleAnswer('thick') }
  if (e.key === 'ArrowDown') { e.preventDefault(); handleAnswer('thin') }

  // 导航快捷键
  if (key === 'z') { e.preventDefault(); switchScreen('home') }
  if (key === 'f') { e.preventDefault(); switchScreen('training') }
  if (key === 'j') { e.preventDefault(); switchScreen('assessment') }
  if (key === ' ') { e.preventDefault(); switchScreen('healing') }



    // ====================== 疗愈悬浮窗（overlay）快捷键 ======================
  if (!el.healingOverlay.classList.contains('hidden')) {
    // ESC = 暂停并进入后评估
    if (e.key === 'Escape') {
      e.preventDefault();
      // 不调用 overlayStop，而是调用疗愈暂停并进入后评估
      if (typeof pauseHealingAndAssess === 'function') {
        pauseHealingAndAssess();
      } else {
        $('overlayStop')?.click(); // 降级方案
      }
    }
    // Z = 返回检测页（完全退出）
    if (key === 'z') {
      e.preventDefault();
      $('overlayBack')?.click();
    }
    return;
}


  // Escape 暂停语音
  if (e.key === 'Escape') {
    e.preventDefault();
    app.speechPaused = !app.speechPaused;
    if (app.speechPaused) {
      app.speechPausedAt = Date.now();
      window.speechSynthesis.pause();
      notice("语音已暂停");
    } else {
      if (app.speechPausedAt > 0) {
        app.speechPausedDuration += Date.now() - app.speechPausedAt;
        app.speechPausedAt = 0;
      }
      window.speechSynthesis.resume();
      notice("语音已恢复");
    }
  }

  // ====================== 训练页面快捷键 ======================
  if (app.screen === 'training') {
    switch (key) {
      case 'g':
        e.preventDefault();
        $('starttestStandard')?.click();
        break;
      case 'enter':
        e.preventDefault();
        $('startTrainingStandard')?.click();
        break;
      case 'k':
        e.preventDefault();
        $('startTrainingGame')?.click();
        break;
    }
  }

  // ====================== 测评页面快捷键 ======================
  if (app.screen === 'assessment') {
    switch (key) {
      case 'h':
        e.preventDefault();
        $('startAssessment-testStandard')?.click();
        break;
      case 'enter':
        e.preventDefault();
        $('startAssessmentStandard')?.click();
        break;
      case 'k':
        e.preventDefault();
        $('startAssessmentGame')?.click();
        break;
    }
  }


  // ====================== 声景疗愈快捷键 ======================
  if (app.screen === 'healing') {
    if (e.key === 'a') {
      e.preventDefault();
      $('startHealing30')?.click();
    }
    if (e.key === 'w') {
      e.preventDefault();
      $('startHealing60')?.click();
    }
    if (e.key === 'd') {
      e.preventDefault();
      $('startHealing5')?.click();
    }
  }
})
    //为了让每个section能分别使用快捷键（165-254)


const BUTTON_KEYS = {
  'z': 'home1',
  'f': 'training1',
  'j': 'assessment1',
  ' ': 'healing1',
};
    Object.keys(BUTTON_INTROS).forEach(buttonId => {
    const button = $(buttonId);
    if (button) {
      button.addEventListener('click', () => {
        speak(BUTTON_INTROS[buttonId]);
      });
    }
  });
  }
 // --- 快捷键触发首页按钮播报 ---
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const buttonId = BUTTON_KEYS[key];
    if (buttonId) {
      const button = $(buttonId);
      if (button) {
        speak(BUTTON_INTROS[buttonId]);
        button.focus();
        navigateToScreen(button.dataset.screen || buttonId.replace(/\d+$/, ''));
      }
    }
  });
  document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase(); // 支持大小写
  const buttonId = BUTTON_KEYS[key];
  if (buttonId) {
    const button = $(buttonId);
    if (button) {
      speak(BUTTON_INTROS[buttonId]); // 同点击效果
      button.focus(); // 可选，让按钮获得焦点
    }
  }
});

  function loadState() {
    const base = {
      profile: { deviceId: randomId(), nickname: '访客', tapSignature: [] },
      questionnaire: { anxietyLevel: 2, sleepDifficulty: 2,  colorPreference: 'warm_wood' },
      sessions: [],
      hasPlayedWelcome: false
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (!parsed) return base
      return {
        profile: Object.assign({}, base.profile, parsed.profile || {}),
        questionnaire: Object.assign({}, base.questionnaire, parsed.questionnaire || {}),
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        hasPlayedWelcome: parsed.hasPlayedWelcome || false
      }
    } catch { return base }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profile: app.state.profile,
      questionnaire: app.state.questionnaire,
      sessions: app.state.sessions,
      hasPlayedWelcome: app.state.hasPlayedWelcome
    }))
  }

  function randomId() { return 'APS-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase() }
  function clone(v) { return JSON.parse(JSON.stringify(v)) }
  function notice(text) { el.notice.textContent = text }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
  function average(list) { return list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0 }
  function formatDate(iso) { return new Date(iso).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

  function switchScreen(screen) {
  if (!SCREENS.includes(screen)) return
  app.screen = screen
  renderScreenState()


 
}

  function moveScreen(delta) {
    const i = SCREENS.indexOf(app.screen)
    switchScreen(SCREENS[clamp(i + delta, 0, SCREENS.length - 1)])
  }

  function renderAll() {
    renderScreenState()
    renderProfile()
    renderQuestionnaire()
    renderTraining()
    renderReport()
    renderHistory()
    renderHealing()
    renderAdmin()
  }

  function renderScreenState() {
    SCREENS.forEach((screen) => { 
      const node = $('screen-' + screen); 
      if (node) {
        const isAdminScreen = screen === 'admin'
        const canAccess = isAdminScreen ? app.isAdmin : true
        node.classList.toggle('active', screen === app.screen && canAccess)
      }
    })
    $$('.nav [data-screen]').forEach((b) => {
      const isAdminBtn = b.dataset.screen === 'admin'
      if (isAdminBtn) {
        b.classList.toggle('active', b.dataset.screen === app.screen && app.isAdmin)
      } else {
        b.classList.toggle('active', b.dataset.screen === app.screen)
      }
    })
    el.screenTitle.textContent = SCREEN_TITLES[app.screen]
  }

  function renderProfile() {
    const latest = app.state.sessions[0]
    el.deviceId.textContent = app.state.profile.deviceId
    el.nicknameInput.value = app.state.profile.nickname
    el.tapSignatureLabel.textContent = app.state.profile.tapSignature.length ? app.state.profile.tapSignature.join(' / ') + ' ms' : '未记录'
    el.latestGrade.textContent = latest ? latest.report.grade + ' / ' + latest.stroop.attentionScore + ' 分' : '暂无'
  }

  function renderQuestionnaire() {
    const q = app.state.questionnaire
    el.anxietyRange.value = q.anxietyLevel
    el.sleepRange.value = q.sleepDifficulty
    //el.attentionRange.value = q.attentionSwitching
    el.colorPreference.value = q.colorPreference
    el.anxietyValue.textContent = q.anxietyLevel + ' / 5'
    el.sleepValue.textContent = q.sleepDifficulty + ' / 5'
    //el.attentionValue.textContent = q.attentionSwitching + ' / 5'
    el.colorValue.textContent = COLORS[q.colorPreference]
  }

  function renderTraining() {
    const run = app.run.kind === 'training' ? app.run : null
    const statusMap = { idle: '待开始', priming: '准备中', awaiting: '等待作答', finished: '已完成' }
    el.trainingGuideText.textContent = run && run.mode === 'game' ? '听到“滴”声后作答。大象代表粗声，小鸟代表细声。' : '听到“滴”声后作答。只判断粗声或细声。'
    el.trainingStatus.textContent = run ? statusMap[run.status] : '待开始'
    el.trainingProgress.textContent = (run ? run.results.length : 0) + ' / 8'
    el.trainingAnswerALabel.textContent = run && run.mode === 'game' ? '大象' : '粗声'
    el.trainingAnswerBLabel.textContent = run && run.mode === 'game' ? '小鸟' : '细声'
    toggleAnswerActive([el.trainingA, el.trainingB], Boolean(run && run.status === 'awaiting'))
    el.trainingMetrics.innerHTML = ''
    if (!run || !run.results.length) return
    const s = summarizeRun(run.results, run.mode)
    ;[['正确率', s.accuracy + '%'], ['反应时', s.averageReactionTime + ' ms'], ['干扰', s.interferenceIndex + ' ms'], ['得分', s.attentionScore]].forEach((item) => {
      const card = document.createElement('article')
      card.className = 'card'
      card.innerHTML = '<span>' + item[0] + '</span><strong>' + item[1] + '</strong>'
      el.trainingMetrics.appendChild(card)
    })
  }

  function renderAssessment() {
    const run = app.run.kind === 'assessment' ? app.run : null
    const statusMap = { idle: '待开始', priming: '准备中', awaiting: '请作答', finished: '已完成' }
    el.assessmentGuideText.textContent = '请听到“滴”声后开始作答。忽略词语意义，只判断音色是粗还是细。支持键盘上下键和触摸双键。'
    el.assessmentStatus.textContent = run ? statusMap[run.status] : '待开始'
    el.assessmentProgress.textContent = (run ? run.results.length : 0) + ' / 12'
    toggleAnswerActive([el.assessmentA, el.assessmentB], Boolean(run && run.status === 'awaiting'))
  }

  function renderReport() {
    renderAssessment()
    const report = getActiveReport()
    if (!report) {
      el.reportHeadline.textContent = '暂无'
      el.reportLayer.textContent = '完成检测后生成'
      return
    }
    el.reportHeadline.textContent = '等级 ' + report.grade + ' / 韧性 ' + report.resilienceIndex
    el.reportLayer.textContent = report.layers[app.reportLayerIndex] || report.layers[0]
  }

  function renderHistory() {
    const sessions = app.state.sessions
    const activeId = app.selectedSessionId || (sessions[0] && sessions[0].id)
    el.historyList.innerHTML = ''
    sessions.slice(0, 6).forEach((session) => {
      const button = document.createElement('button')
      button.className = session.id === activeId ? 'active-item' : ''
      button.innerHTML = '<strong>' + formatDate(session.createdAt) + '</strong><small>' + session.report.grade + ' / ' + session.stroop.attentionScore + ' 分</small>'
      button.addEventListener('click', () => { app.selectedSessionId = session.id; app.reportLayerIndex = 0; app.selectedPlanKind = session.report.primaryPlan.kind; renderReport(); renderHistory(); renderHealing() })
      el.historyList.appendChild(button)
    })
    el.trendLine.setAttribute('points', trendPoints(sessions))
  }

  function renderHealing() {
    const plans = getAvailablePlans()
    el.planList.innerHTML = ''
    plans.forEach((plan) => {
      const item = document.createElement('button')
      item.className = 'card plan-item' + (app.selectedPlanKind === plan.kind ? ' active-item' : '')
      item.innerHTML = '<span>' + plan.title + '</span><strong>' + plan.subtitle + '</strong><small>' + plan.rationale + '</small>'
      item.addEventListener('click', () => { app.selectedPlanKind = plan.kind; renderHealing() })
      el.planList.appendChild(item)
    })
  }
  
  function renderAdmin() {
    const adminData = loadAdminData()
    const adminNav = $('admin1')
    
    if (app.isAdmin) {
      adminNav.style.display = 'inline-flex'
    } else {
      adminNav.style.display = 'none'
      switchScreen('home')
      return
    }
    
    $('adminTotalUsers').textContent = adminData.totalUsers || 0
    $('adminActiveUsers').textContent = adminData.systemStats.activeUsers || 0
    $('adminTotalTests').textContent = adminData.systemStats.totalTests || 0
    $('adminAvgScore').textContent = adminData.systemStats.avgScore || 0
    
    renderAdminUserList(adminData.users)
  }
  
  function renderAdminUserList(users) {
    const list = $('adminUserList')
    
    if (!users || users.length === 0) {
      list.innerHTML = '<p class="empty-text">暂无用户数据</p>'
      return
    }
    
    list.innerHTML = ''
    users.forEach((user, index) => {
      const item = document.createElement('button')
      item.className = 'user-item'
      item.innerHTML = `
        <span class="user-index">#${index + 1}</span>
        <div class="user-info">
          <strong>${user.nickname}</strong>
          <small>测试次数: ${user.sessionCount || 0} | 科研同意: ${user.agreedResearch ? '是' : '否'}</small>
        </div>
      `
      item.addEventListener('click', () => renderAdminUserDetail(user))
      list.appendChild(item)
    })
  }
  
  function renderAdminUserDetail(user) {
    const detail = $('adminUserDetail')
    
    if (!user.testHistory || user.testHistory.length === 0) {
      detail.innerHTML = `
        <div class="user-header">
          <h4>${user.nickname}</h4>
          <p class="empty-text">该用户暂无测试记录</p>
        </div>
      `
      return
    }
    
    let historyHtml = '<div class="user-header"><h4>' + user.nickname + '</h4><small>共 ' + user.testHistory.length + ' 次测试</small></div>'
    historyHtml += '<div class="history-list">'
    
    user.testHistory.slice().reverse().forEach((test, index) => {
      historyHtml += `
        <div class="history-item">
          <span class="history-date">${formatDate(test.createdAt)}</span>
          <div class="history-score">
            <strong>等级 ${test.grade}</strong>
            <span>${test.score} 分</span>
          </div>
          <div class="history-details">
            <small>注意力得分: ${test.attentionScore}</small>
            <small>正确率: ${test.accuracy}%</small>
            <small>反应时间: ${test.avgReactionTime}ms</small>
          </div>
          <div class="history-suggestion">
            <small>建议: ${test.suggestion || '无'}</small>
          </div>
        </div>
      `
    })
    
    historyHtml += '</div>'
    detail.innerHTML = historyHtml
  }

  function toggleAnswerActive(nodes, active) { nodes.forEach((node) => node.classList.toggle('active', active)) }

  function recordTap(mode) {
    const now = performance.now()
    if (mode === 'store') {
      app.tapStore.push(now)
      if (app.tapStore.length === 3) {
        app.state.profile.tapSignature = [Math.round(app.tapStore[1] - app.tapStore[0]), Math.round(app.tapStore[2] - app.tapStore[1])]
        app.tapStore = []
        el.tapNotice.textContent = '已记录'
        saveState()
        renderProfile()
      }
      return
    }
    app.tapVerify.push(now)
    if (app.tapVerify.length === 3) {
      const sign = [Math.round(app.tapVerify[1] - app.tapVerify[0]), Math.round(app.tapVerify[2] - app.tapVerify[1])]
      const stored = app.state.profile.tapSignature
      const ok = stored.length === 2 && Math.abs(sign[0] - stored[0]) < 180 && Math.abs(sign[1] - stored[1]) < 180
      app.tapVerify = []
      el.tapNotice.textContent = ok ? '校验通过' : '未匹配'
    }
  }

  function startRun(kind, mode) {
    clearRunTimers()
    cancelSpeech()
    app.run = { kind: kind, status: 'priming', mode: mode, stimuli: createStimuli(kind === 'training' ? 8 : 12), currentIndex: -1, responseStartAt: null, results: [] }
    switchScreen(kind)
    notice(kind === 'training' ? '训练开始' : '检测开始')
    // 延迟3秒后播放语音提示
    setTimeout(() => {
      speak('请听到滴声后作答。粗声按上，细声按下。')
    }, 3000)
   setTimeout(() => {
    renderTraining()
    renderAssessment()
    scheduleNextTrial(0) // 立即开始第一个试次
  },15000)
  }
// 练习模式：逐题手动触发，4种固定声音循环
function startPracticeTrial() {
  clearRunTimers();
  cancelSpeech();

  // 固定4种题库：高音大象、高音小鸟、低音大象、低音小鸟
  const practiceStimuli = [
    { id: "p1", spokenWord: "高", targetTimbre: "thick", congruent: false },
    { id: "p2", spokenWord: "高", targetTimbre: "thin", congruent: true },
    { id: "p3", spokenWord: "低", targetTimbre: "thick", congruent: true },
    { id: "p4", spokenWord: "低", targetTimbre: "thin", congruent: false },
  ];

  // 循环轮流出题
  window.practiceIndex = window.practiceIndex ?? 0;
  const current = practiceStimuli[window.practiceIndex];
  window.practiceIndex = (window.practiceIndex + 1) % 4;

  // 完全克隆标准训练的运行结构，但只跑 1 题
  app.run = {
    kind: "training",
    status: "priming",
    mode: "standard",
    stimuli: [current], // 只一题
    currentIndex: -1,
    responseStartAt: null,
    results: [],
  };

  switchScreen("training");
  notice("练习开始");

  
  setTimeout(() => {
    speak("粗音按上，细音按下");
  }, 1000);

  setTimeout(() => {
    speak("请听声音，判断粗声或细声。");
  }, 2000);

  setTimeout(() => {
    renderTraining();
    renderAssessment();
    scheduleNextTrial(0);
  }, 10000);
}    // 练习模式：逐题手动触发，4种固定声音循环



// 测评页面 - 练习按钮（逐题模式）
function startAssessmentPractice() {
  clearRunTimers();
  cancelSpeech();

  // 固定4种题库：高音大象、高音小鸟、低音大象、低音小鸟
  const practiceStimuli = [
    { id: "a1", spokenWord: "高", targetTimbre: "thick", congruent: false },
    { id: "a2", spokenWord: "高", targetTimbre: "thin", congruent: true },
    { id: "a3", spokenWord: "低", targetTimbre: "thick", congruent: true },
    { id: "a4", spokenWord: "低", targetTimbre: "thin", congruent: false },
  ];

  // 循环轮流出题
  window.assessmentPracticeIndex = window.assessmentPracticeIndex ?? 0;
  const current = practiceStimuli[window.assessmentPracticeIndex];
  window.assessmentPracticeIndex = (window.assessmentPracticeIndex + 1) % 4;

  // 克隆正式测评结构，只跑1题
  app.run = {
    kind: "assessment",
    status: "priming",
    mode: "standard",
    stimuli: [current], // 只1题
    currentIndex: -1,
    responseStartAt: null,
    results: [],
  };

  switchScreen("assessment");
  notice("练习开始");

  setTimeout(() => {
    speak("请听声音，判断粗声还是细声。");
  }, 2000);

  setTimeout(() => {
    renderAssessment();
    scheduleNextTrial(0);
  }, 10000);
}
//stroop的练习模式：逐题手动触发



  function clearRunTimers() {
    if (app.timers.cue) clearTimeout(app.timers.cue)
    if (app.timers.response) clearTimeout(app.timers.response)
    app.timers.cue = null
    app.timers.response = null
  }

  function scheduleNextTrial(delay) {
    clearRunTimers()
    const nextIndex = app.run.currentIndex + 1
    if (nextIndex >= app.run.stimuli.length) return finishRun()
    app.timers.cue = setTimeout(() => {
      playCueTone()
      app.run.status = 'priming'
      app.run.currentIndex = nextIndex
      renderTraining()
      renderAssessment()
      app.timers.cue = setTimeout(() => {
        app.run.status = 'awaiting'
        app.run.responseStartAt = performance.now()
        renderTraining()
        renderAssessment()
        playStroopStimulus(app.run.stimuli[nextIndex], app.run.mode)
        app.timers.response = setTimeout(() => {
          const s = app.run.stimuli[app.run.currentIndex]
          app.run.results.push({ id: s.id, spokenWord: s.spokenWord, targetTimbre: s.targetTimbre, congruent: s.congruent, response: 'miss', correct: false, reactionTime: null })
          app.run.status = 'priming'
          notice('超时')
          playFeedbackTone(false)
          renderTraining()
          renderAssessment()
          scheduleNextTrial(620)
        }, 3500)
      }, 260)
    }, delay)
  }

  function handleAnswer(answer) {
    if (app.run.status !== 'awaiting') return
    clearRunTimers()
    const s = app.run.stimuli[app.run.currentIndex]
    const correct = answer === s.targetTimbre
    app.run.results.push({ id: s.id, spokenWord: s.spokenWord, targetTimbre: s.targetTimbre, congruent: s.congruent, response: answer, correct: correct, reactionTime: Math.max(0, Math.round(performance.now() - app.run.responseStartAt)) })
    app.run.status = 'priming'
    notice(correct ? '正确' : '错误')
    playFeedbackTone(correct)
    renderTraining()
    renderAssessment()
    scheduleNextTrial(app.run.mode === 'game' ? 500 : 680)
  }

  function finishRun() {
    clearRunTimers()
    const summary = summarizeRun(app.run.results, app.run.mode)
    if (app.run.kind === 'training') {
      app.run.status = 'finished'
      renderTraining()
      notice('训练完成')
      return speak('训练完成。正确率 ' + summary.accuracy + '。')
    }
    const report = buildReport(summary, app.state.questionnaire)
    const session = { 
      id: 'session-' + Date.now(), 
      createdAt: new Date().toISOString(), 
      mode: app.run.mode, 
      stroop: summary, 
      questionnaire: clone(app.state.questionnaire), 
      report: report, 
      trialResults: app.run.results.slice(),
      userId: app.currentUser?.phone || 'unknown'
    }
    app.state.sessions.unshift(session)
    app.selectedSessionId = session.id
    app.selectedPlanKind = report.primaryPlan.kind
    app.reportLayerIndex = 0
    app.run.status = 'finished'
    saveState()
    saveTestDataToAdmin(session)
    renderProfile(); renderReport(); renderHistory(); renderHealing()
    switchScreen('assessment')
    notice('检测完成')
    speak(report.layers[0])
  }
  
  function saveTestDataToAdmin(session) {
    if (!app.currentUser?.agreedResearch) return
    
    const adminData = loadAdminData()
    const user = adminData.users.find(u => u.phone === app.currentUser.phone)
    
    if (user) {
      user.sessionCount = (user.sessionCount || 0) + 1
      if (!user.testHistory) user.testHistory = []
      user.testHistory.push({
        sessionId: session.id,
        createdAt: session.createdAt,
        grade: session.report.grade,
        score: session.report.resilienceIndex,
        attentionScore: session.stroop.attentionScore,
        accuracy: session.stroop.accuracy,
        avgReactionTime: session.stroop.averageReactionTime,
        suggestion: session.report.layers[2]
      })
    }
    
    adminData.totalSessions = (adminData.totalSessions || 0) + 1
    adminData.systemStats.totalTests = (adminData.systemStats.totalTests || 0) + 1
    
    const allScores = []
    adminData.users.forEach(u => {
      if (u.testHistory) {
        u.testHistory.forEach(t => allScores.push(t.score))
      }
    })
    adminData.systemStats.avgScore = allScores.length > 0 
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0
    adminData.systemStats.activeUsers = adminData.users.filter(u => 
      u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
    adminData.totalUsers = adminData.users.length
    
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData))
  }

  function createStimuli(count) {
    return Array.from({ length: count }, (_, i) => {
      const targetTimbre = i % 2 === 0 ? 'thick' : 'thin'
      const congruent = Math.random() > 0.45
      const spokenWord = targetTimbre === 'thick' ? (congruent ? '低' : '高') : (congruent ? '高' : '低')
      return { id: 'stimulus-' + i + '-' + Math.random().toString(36).slice(2, 8), spokenWord: spokenWord, targetTimbre: targetTimbre, congruent: congruent }
    }).sort(() => Math.random() - 0.5)
  }

  function summarizeRun(results, mode) {
    const correctCount = results.filter((i) => i.correct).length
    const missCount = results.filter((i) => i.response === 'miss').length
    const errorCount = results.length - correctCount
    const valid = results.map((i) => i.reactionTime).filter((v) => v !== null)
    const congruent = results.filter((i) => i.congruent && i.reactionTime !== null).map((i) => i.reactionTime)
    const incongruent = results.filter((i) => !i.congruent && i.reactionTime !== null).map((i) => i.reactionTime)
    const averageReactionTime = average(valid)
    const interferenceIndex = Math.max(0, average(incongruent) - average(congruent))
    return { mode: mode, totalTrials: results.length, correctCount: correctCount, errorCount: errorCount, missCount: missCount, accuracy: Math.round((correctCount / results.length) * 100), averageReactionTime: averageReactionTime, interferenceIndex: interferenceIndex, attentionScore: clamp(Math.round(100 - (averageReactionTime - 420) / 7 - errorCount * 6 - missCount * 8 - interferenceIndex / 12), 10, 100) }
  }

  function buildReport(stroop, q) {
    const resilienceIndex = clamp(Math.round(stroop.attentionScore * 0.72 + (6 - q.anxietyLevel) * 6 + (6 - q.sleepDifficulty) * 5 ), 35, 98)
    const grade = resilienceIndex >= 92 ? 'A' : resilienceIndex >= 84 ? 'A-' : resilienceIndex >= 76 ? 'B+' : resilienceIndex >= 68 ? 'B' : resilienceIndex >= 60 ? 'C+' : 'C'
    const weakness = q.anxietyLevel >= 4 ? '焦虑牵引偏强。' : q.sleepDifficulty >= 4 ? '睡眠准备不足。'  : stroop.interferenceIndex > 160 ? '听觉冲突抑制偏弱。' : '整体平稳。'
    const plans = buildHealingPlans(stroop, q)
    return { grade: grade, resilienceIndex: resilienceIndex, weakness: weakness, layers: ['综合等级 ' + grade + '，得分 ' + resilienceIndex + '。', '当前短板：' + weakness, '建议进入“' + plans.primaryPlan.title + '”。'], primaryPlan: plans.primaryPlan, secondaryPlans: plans.secondaryPlans }
  }

  function buildHealingPlans(stroop, q) {
    const list = []
    if (stroop.averageReactionTime > 800 || stroop.errorCount > 5) list.push({ kind: 'stream', title: '森林溪流', subtitle: '减负', rationale: '先降低听觉负荷' })
    if (q.anxietyLevel >= 4) list.push({ kind: 'bodyScan', title: '身体扫描', subtitle: '接地', rationale: '优先放松身体' })
    if (q.sleepDifficulty >= 4) list.push({ kind: 'theta', title: 'Theta 放松', subtitle: '助眠', rationale: '节律更平稳' })
    //if (q.attentionSwitching >= 4) list.push({ kind: 'metronome', title: '节律白噪', subtitle: '聚焦', rationale: '帮助稳住节奏' })
    if (!list.length) list.push({ kind: 'stream', title: '自然声景', subtitle: '平衡', rationale: '默认方案' })
    return { primaryPlan: list[0], secondaryPlans: list.slice(1) }
  }

  function getActiveSession() { return app.state.sessions.find((i) => i.id === app.selectedSessionId) || app.state.sessions[0] || null }
  function getActiveReport() { const s = getActiveSession(); return s ? s.report : null }
  function getAvailablePlans() { const r = getActiveReport(); return r ? [r.primaryPlan].concat(r.secondaryPlans) : [{ kind: 'stream', title: '自然声景', subtitle: '平衡', rationale: '默认方案' }] }
  function trendPoints(sessions) { const list = sessions.slice(0, 6).reverse(); return !list.length ? '' : list.map((s, i) => (20 + i * (260 / Math.max(list.length - 1, 1))) + ',' + (120 - s.stroop.attentionScore)).join(' ') }

  function speakReport() {
    const r = getActiveReport()
    if (!r) return
    let chain = Promise.resolve()
    r.layers.forEach((line) => { chain = chain.then(() => speak(line)) })
  }


function stopHealing(skipPostAssessment = false) {
  if (app.timers.healing) clearInterval(app.timers.healing);
  app.timers.healing = null;
  if (app.soundscapeStop) app.soundscapeStop();
  app.soundscapeStop = null;
  stopIntervals();
  cancelSpeech();
  app.overlaySeconds = 0;
  el.healingOverlay.classList.add('hidden');

  // 修复：疗愈结束移除按键监听（但如果需要后评估，则不移除）
  if (skipPostAssessment && app.healingKeyDownListener) {
    document.removeEventListener('keydown', app.healingKeyDownListener);
    app.healingKeyDownListener = null;
  }
}

function startHealing(minutes) {
 
  startHealingFlow();
}

function startHealingFlow(container) {
  stopHealing(true);
  
  const flowState = {
    scores: { anxiety: null, fatigue: null, anxietyAfter: null },
    currentStep: 1,
    healingMinutes: null,
    healingPlan: null,
    isInHealing: false
  };

  if (app.healingKeyDownListener) {
    document.removeEventListener('keydown', app.healingKeyDownListener);
    app.healingKeyDownListener = null;
  }

  window.pauseHealingAndAssess = function() {
    if (flowState.isInHealing) {
      if (app.timers.healing) {
        clearInterval(app.timers.healing);
        app.timers.healing = null;
      }
      if (app.soundscapeStop) {
        app.soundscapeStop();
        app.soundscapeStop = null;
      }
      stopIntervals();
      cancelSpeech();
      app.overlaySeconds = 0;
      el.healingOverlay.classList.add('hidden');
      
      flowState.isInHealing = false;
      enterPostAssessment();
    } else {
      cleanupHealing();
    }
  };

  function cleanupHealing() {
    if (app.healingKeyDownListener) {
      document.removeEventListener('keydown', app.healingKeyDownListener);
      app.healingKeyDownListener = null;
    }
    window.pauseHealingAndAssess = null;
    cancelSpeech();
  }

  function askQuestion1() {
    flowState.currentStep = 1;
    speak('欢迎来到声景疗愈。在开始放松之前，想请您给自己的状态打个分，满分是5分。第一个问题：您现在觉得焦虑、紧张的程度有多高？1分是完全不焦虑，5分是极度焦虑。请您按键盘上的数字 1 到 5 来打分。');
  }

  function askQuestion2() {
    flowState.currentStep = 2;
    speak('第二个问题：您现在觉得疲劳、困倦的程度有多高？1分是精神饱满，5分是非常疲惫。请您按键盘上的数字 1 到 5 来打分。');
  }

  function askDuration() {
    flowState.currentStep = 3;
    speak('好的，分数记下了。现在请您选一个想放松的时间。按键盘d键是5分钟，按a键是30分钟，按w键是1个小时。在听音乐的过程中，随时按ESC可以停止。');
  }

  function startHealingWithDuration(minutes) {
    flowState.healingMinutes = minutes;
    const plan = getAvailablePlans().find((p) => p.kind === app.selectedPlanKind) || getAvailablePlans()[0];
    flowState.healingPlan = plan;
    flowState.isInHealing = true;
    
    switchScreen('healing');
    
    cancelSpeech();

    startSoundscape(plan.kind).then((stop) => {
      app.soundscapeStop = stop;
      app.overlaySeconds = minutes * 60;
      el.overlayTitle.textContent = plan.title;
      el.overlaySubtitle.textContent = plan.subtitle;
      el.healingOverlay.classList.remove('hidden');
      updateOverlay();

      if (plan.kind === 'bodyScan') {
        speak(BODY_SCAN);
      }

      app.timers.healing = setInterval(() => {
        app.overlaySeconds -= 1;
        updateOverlay();
        if (app.overlaySeconds <= 0) {
          if (app.timers.healing) clearInterval(app.timers.healing);
          app.timers.healing = null;
          if (app.soundscapeStop) {
            app.soundscapeStop();
            app.soundscapeStop = null;
          }
          el.healingOverlay.classList.add('hidden');
          flowState.isInHealing = false;
          enterPostAssessment();
        }
      }, 1000);
    });
  }

  function enterPostAssessment() {
    flowState.currentStep = 4;
    speak('疗愈结束了。咱们再打一次分看看变化。请按数字 1 到 5 来评价您现在的焦虑程度。');
  }

  function finishHealing() {
    flowState.currentStep = 5;
    const anxietyChange = Math.max(0, flowState.scores.anxiety - (flowState.scores.anxietyAfter || flowState.scores.anxiety));
    const feedback = anxietyChange >= 2 
      ? '感觉您放松了不少，真为您高兴。欢迎您随时再回来听听，歇一歇。下次再见。'
      : '这次放松练习的时间可能稍微短了点，身体还没来得及充分反应。您可以再去训练页面玩一玩声音游戏，或者再来一次更长时间的疗愈，多练习几次效果会更好。';
    
    speak(feedback);
    
    setTimeout(() => {
      cleanupHealing();
    }, 8000);
  }

  function handleKeyDown(event) {
    const step = flowState.currentStep;
    
    if (event.key === 'Escape') {
      if (step === 4) {
        speak('已跳过评估，感谢使用声景疗愈。');
        cleanupHealing();
      } else if (!flowState.isInHealing && step < 4) {
        speak('已取消疗愈');
        cleanupHealing();
      }
      return;
    }

    switch (step) {
      case 1:
        if (/^[1-5]$/.test(event.key)) {
          flowState.scores.anxiety = parseInt(event.key);
          setTimeout(() => askQuestion2(), 500);
        }
        break;
        
      case 2:
        if (/^[1-5]$/.test(event.key)) {
          flowState.scores.fatigue = parseInt(event.key);
          setTimeout(() => askDuration(), 500);
        }
        break;
        
      case 3:
        switch (event.key) {
          case 'd':
            speak('开始5分钟疗愈');
            setTimeout(() => startHealingWithDuration(5), 800);
            break;
          case 'a':
            speak('开始30分钟疗愈');
            setTimeout(() => startHealingWithDuration(30), 800);
            break;
          case 'w':
            speak('开始1小时疗愈');
            setTimeout(() => startHealingWithDuration(60), 800);
            break;
        }
        break;
        
      case 4:
        if (/^[1-5]$/.test(event.key)) {
          flowState.scores.anxietyAfter = parseInt(event.key);
          setTimeout(() => finishHealing(), 500);
        }
        break;
    }
  }

  app.healingKeyDownListener = handleKeyDown;
  document.addEventListener('keydown', handleKeyDown);

  askQuestion1();
}




  function updateOverlay() {
    const m = String(Math.max(0, Math.floor(app.overlaySeconds / 60))).padStart(2, '0')
    const s = String(Math.max(0, app.overlaySeconds % 60)).padStart(2, '0')
    el.overlayCountdown.textContent = m + ':' + s
  }

 function cancelSpeech() {
    if (window.speechSynthesis) {
      app.speechVersion += 1;
      window.speechSynthesis.cancel();
      app.speechPaused = false;
      app.speechPausedAt = 0;
      app.speechPausedDuration = 0;
    }
  }

  function speak(text, opts) {
    if (!window.speechSynthesis) return Promise.resolve();
    
    app.currentSpeech = text;
    app.speechStartTime = Date.now();
    app.speechPausedDuration = 0;
    
    const version = ++app.speechVersion;
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.pitch = (opts && opts.pitch) || 1;
      u.rate = (opts && opts.rate) || 1;

      u.onend = () => {
        if (version === app.speechVersion) {
          app.currentSpeech = null;
          resolve();
        }
      };
      
      u.onerror = () => {
        app.currentSpeech = null;
        resolve();
      };
      
      window.speechSynthesis.speak(u);
    });
  }

  function getAudioContext() {
    if (!window.AudioContext) return Promise.resolve(null)
    if (!app.audioContext) app.audioContext = new window.AudioContext()
    return app.audioContext.state === 'suspended' ? app.audioContext.resume().then(() => app.audioContext) : Promise.resolve(app.audioContext)
  }

  function playEnvelopeTone(cfg) {
    return getAudioContext().then((ctx) => {
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = cfg.type
      osc.frequency.setValueAtTime(cfg.frequency, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(cfg.gain || 0.06, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (cfg.duration || 0.2))
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + (cfg.duration || 0.2) + 0.02)
    })
  }

  function playCueTone() { playEnvelopeTone({ frequency: 880, type: 'sine', duration: 0.22, gain: 0.08 }) }
  function playFeedbackTone(ok) { if (ok) { playEnvelopeTone({ frequency: 660, type: 'triangle', duration: 0.16, gain: 0.06 }); setTimeout(() => playEnvelopeTone({ frequency: 990, type: 'triangle', duration: 0.18, gain: 0.05 }), 110) } else playEnvelopeTone({ frequency: 320, type: 'sawtooth', duration: 0.22, gain: 0.05 }) }

  function playTimbrePad(timbre) {
    return getAudioContext().then((ctx) => {
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      osc.type = timbre === 'thick' ? 'sawtooth' : 'triangle'
      osc.frequency.setValueAtTime(timbre === 'thick' ? 160 : 640, now)
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(timbre === 'thick' ? 900 : 2200, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.045, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
      osc.start(now); osc.stop(now + 0.48)
    })
  }

  function playStroopStimulus(stimulus, mode) {
    playTimbrePad(stimulus.targetTimbre)
    const prompt = mode === 'game' ? (stimulus.spokenWord === '高' ? '高，小鸟' : '低，大象') : stimulus.spokenWord
    speak(prompt, { pitch: stimulus.targetTimbre === 'thick' ? 0.58 : 1.55, rate: mode === 'game' ? 0.95 : 0.9 })
  }

  function startSoundscape(kind) {
    stopIntervals()
    return getAudioContext().then((ctx) => {
      if (!ctx) return () => {}
      const cleanups = []
      if (kind === 'stream') {
        cleanups.push(createNoise(ctx, 0.018, 900, null))
        app.soundscapeIntervals.push(setInterval(() => createDrop(ctx, 360 + Math.random() * 220), 1300))
      }
      if (kind === 'bodyScan') {
        const osc = ctx.createOscillator(), gain = ctx.createGain()
        osc.type = 'sine'; osc.frequency.value = 196; gain.gain.value = 0.012
        osc.connect(gain); gain.connect(ctx.destination); osc.start()
        cleanups.push(() => osc.stop())
      }
      if (kind === 'theta') {
        const carrier = ctx.createOscillator(), lfo = ctx.createOscillator(), mod = ctx.createGain(), gain = ctx.createGain()
        carrier.type = 'sine'; carrier.frequency.value = 220; lfo.type = 'sine'; lfo.frequency.value = 6; mod.gain.value = 0.018; gain.gain.value = 0.03
        lfo.connect(mod); mod.connect(gain.gain); carrier.connect(gain); gain.connect(ctx.destination); carrier.start(); lfo.start()
        cleanups.push(() => { carrier.stop(); lfo.stop() })
      }
      if (kind === 'metronome') {
        cleanups.push(createNoise(ctx, 0.01, null, 1800))
        app.soundscapeIntervals.push(setInterval(() => playEnvelopeTone({ frequency: 880, type: 'square', duration: 0.06, gain: 0.03 }), 860))
      }
      return () => { stopIntervals(); cleanups.forEach((fn) => fn()) }
    })
  }

  function stopIntervals() { app.soundscapeIntervals.forEach((timer) => clearInterval(timer)); app.soundscapeIntervals = [] }

  function createNoise(ctx, gainValue, lowpassValue, highpassValue) {
    const size = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < size; i += 1) { const white = Math.random() * 2 - 1; last = (last + 0.02 * white) / 1.02; data[i] = last * 2.2 }
    const source = ctx.createBufferSource(), gain = ctx.createGain()
    source.buffer = buffer; source.loop = true; gain.gain.value = gainValue
    let dest = gain
    if (lowpassValue) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lowpassValue; gain.connect(lp); dest = lp }
    if (highpassValue) { const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = highpassValue; dest.connect(hp); dest = hp }
    source.connect(gain); dest.connect(ctx.destination); source.start()
    return () => source.stop()
  }

  function createDrop(ctx, f) {
    const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.type = 'sine'; osc.frequency.setValueAtTime(f, now); osc.frequency.exponentialRampToValueAtTime(f * 0.55, now + 0.5)
    gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(0.03, now + 0.03); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.58)
  }

})()

