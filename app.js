(function () {
  const STORAGE_KEY = 'auditory-mind-space/contest-local-v3'
  const SCREENS = ['home', 'training', 'assessment', 'healing']
  const SCREEN_TITLES = { home: '首页', training: '认知训练', assessment: '注意力检测', healing: '声景疗愈' }
  const COLORS = { warm_wood: '温暖木质', soft_sun: '柔亮日光', silver_bell: '清亮铃声', deep_night: '低频夜色' }
  const INTRO = '欢迎来到听觉心理空间。可以通过首页、训练、检测和疗愈四页逐页操作。左箭头表示前一页，右箭头表示下一页'
  /*const HOME_INTRO = '首页包含您的个人信息和最近成绩，可以记录节奏签名作为匿名识别方式。'
  const TRAINING_INTRO = '训练页面提供标准训练和游戏训练两种模式，通过听觉认知训练提高注意力。'
  const ASSESSMENT_INTRO = '检测页面进行注意力检测，完成后会生成个人报告和建议。'
  const HEALING_INTRO = '疗愈页面提供多种声景疗愈方案，帮助您放松身心。'*/
  const BODY_SCAN = '请放松肩膀，把注意力放在呼吸上，从额头到肩颈，再到双手。'
  const $ = (id) => document.getElementById(id)
  const $$ = (s) => Array.from(document.querySelectorAll(s))
  // 定义各页面的引导文本
const NAV_INTROS = {
  home: '首页包含您的个人信息和最近成绩，可以记录节奏签名作为匿名识别方式。',
  training: '训练页面提供标准训练和游戏训练两种模式，通过听觉认知训练提高注意力。',
  assessment: '检测页面进行注意力检测，完成后会生成个人报告和建议。',
  healing: '疗愈页面提供多种声景疗愈方案，帮助您放松身心。'
};
const BUTTON_INTROS = {
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
  startBtn: '欢迎来到听觉心理空间。可以通过首页、训练、检测和疗愈四页逐页操作。左箭头表示前一页，右箭头表示下一页'
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
    audioContext: null,
    soundscapeStop: null,
    soundscapeIntervals: [],
  }
  const el = {
    notice: $('notice'), screenTitle: $('screenTitle'), deviceId: $('deviceId'), nicknameInput: $('nicknameInput'),
    tapSignatureLabel: $('tapSignatureLabel'), tapNotice: $('tapNotice'), latestGrade: $('latestGrade'),
    anxietyRange: $('anxietyRange'), sleepRange: $('sleepRange'), attentionRange: $('attentionRange'), colorPreference: $('colorPreference'),
    anxietyValue: $('anxietyValue'), sleepValue: $('sleepValue'), attentionValue: $('attentionValue'), colorValue: $('colorValue'),
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
    bindNameModalEvents()
    bind()
    renderAll()
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

    const audio = $('#welcomeAudio');
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.error('播放失败', err));
    }

    app.state.hasPlayedWelcome = true;
    saveState();
    
    app.state.profile.nickname = name.charAt(0) + '同学'
    saveState()
    renderProfile()
    el.nameModal.classList.add('hidden')
  }

  function playWelcomeAudio() {
  }

  function bind() {
    $('playIntro').addEventListener('click', () => speak(INTRO))
    // 为导航按钮绑定点击事件
$$('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const screen = btn.dataset.screen;
    if (NAV_INTROS[screen]) {
      speak(NAV_INTROS[screen]);
    }
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
    el.attentionRange.addEventListener('input', (e) => { app.state.questionnaire.attentionSwitching = Number(e.target.value); saveState(); renderQuestionnaire() })
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
      if (e.key === 'ArrowLeft') { e.preventDefault(); moveScreen(-1) }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveScreen(1) }
      if (e.key === 'ArrowUp' || (app.run.mode === 'game' && e.key === 'ArrowLeft')) { e.preventDefault(); handleAnswer('thick') }
      if (e.key === 'ArrowDown' || (app.run.mode === 'game' && e.key === 'ArrowRight')) { e.preventDefault(); handleAnswer('thin') }
    })
    Object.keys(BUTTON_INTROS).forEach(buttonId => {
    const button = $(buttonId);
    if (button) {
      button.addEventListener('click', () => {
        speak(BUTTON_INTROS[buttonId]);
      });
    }
  });
  }

  function loadState() {
    const base = {
      profile: { deviceId: randomId(), nickname: '访客', tapSignature: [] },
      questionnaire: { anxietyLevel: 2, sleepDifficulty: 2, attentionSwitching: 2, colorPreference: 'warm_wood' },
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

 function switchScreen(screen, playIntro = false) {
  if (!SCREENS.includes(screen)) return
  app.screen = screen
  renderScreenState()
  // 只在用户主动导航时播放引导提示
  if (playIntro && NAV_INTROS && NAV_INTROS[screen]) {
    speak(NAV_INTROS[screen]);
  }
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
  }

  function renderScreenState() {
    SCREENS.forEach((screen) => { const node = $('screen-' + screen); if (node) node.classList.toggle('active', screen === app.screen) })
    $$('.nav [data-screen]').forEach((b) => b.classList.toggle('active', b.dataset.screen === app.screen))
    el.screenTitle.textContent = SCREEN_TITLES[app.screen]
  }

  function renderProfile() {
    const latest = app.state.sessions[0]
    el.nicknameInput.value = app.state.profile.nickname
    el.tapSignatureLabel.textContent = app.state.profile.tapSignature.length ? app.state.profile.tapSignature.join(' / ') + ' ms' : '未记录'
    el.latestGrade.textContent = latest ? latest.report.grade + ' / ' + latest.stroop.attentionScore + ' 分' : '暂无'
  }

  function renderQuestionnaire() {
    const q = app.state.questionnaire
    el.anxietyRange.value = q.anxietyLevel
    el.sleepRange.value = q.sleepDifficulty
    el.attentionRange.value = q.attentionSwitching
    el.colorPreference.value = q.colorPreference
    el.anxietyValue.textContent = q.anxietyLevel + ' / 5'
    el.sleepValue.textContent = q.sleepDifficulty + ' / 5'
    el.attentionValue.textContent = q.attentionSwitching + ' / 5'
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
    renderTraining()
    renderAssessment()
    scheduleNextTrial(1100)
  }

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
    const session = { id: 'session-' + Date.now(), createdAt: new Date().toISOString(), mode: app.run.mode, stroop: summary, questionnaire: clone(app.state.questionnaire), report: report, trialResults: app.run.results.slice() }
    app.state.sessions.unshift(session)
    app.selectedSessionId = session.id
    app.selectedPlanKind = report.primaryPlan.kind
    app.reportLayerIndex = 0
    app.run.status = 'finished'
    saveState()
    renderProfile(); renderReport(); renderHistory(); renderHealing()
    switchScreen('assessment')
    notice('检测完成')
    speak(report.layers[0])
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
    const resilienceIndex = clamp(Math.round(stroop.attentionScore * 0.72 + (6 - q.anxietyLevel) * 6 + (6 - q.sleepDifficulty) * 5 + (6 - q.attentionSwitching) * 4), 35, 98)
    const grade = resilienceIndex >= 92 ? 'A' : resilienceIndex >= 84 ? 'A-' : resilienceIndex >= 76 ? 'B+' : resilienceIndex >= 68 ? 'B' : resilienceIndex >= 60 ? 'C+' : 'C'
    const weakness = q.anxietyLevel >= 4 ? '主要失分项在于焦虑情绪，您容易被情绪干扰注意力。' : q.sleepDifficulty >= 4 ? '主要失分项在于睡眠质量，睡眠不足影响了您的注意力表现。' : q.attentionSwitching >= 4 ? '主要失分项在于注意力切换，您在任务转换时需要更多时间。' : stroop.interferenceIndex > 160 ? '主要失分项在于选择性注意，您容易被周围的无关声音干扰。' : '整体表现平稳，没有明显短板。'
    const plans = buildHealingPlans(stroop, q)
    return { grade: grade, resilienceIndex: resilienceIndex, weakness: weakness, layers: ['您本次测评的综合认知韧性指数为 ' + grade + '。', weakness, '建议进入疗愈小屋，尝试‘' + plans.primaryPlan.title + '’声景进行15分钟的听觉放松训练。'], primaryPlan: plans.primaryPlan, secondaryPlans: plans.secondaryPlans }
  }

  function buildHealingPlans(stroop, q) {
    const list = []
    if (stroop.averageReactionTime > 800 || stroop.errorCount > 5) list.push({ kind: 'stream', title: '森林溪流', subtitle: '减负', rationale: '先降低听觉负荷' })
    if (q.anxietyLevel >= 4) list.push({ kind: 'bodyScan', title: '身体扫描', subtitle: '接地', rationale: '优先放松身体' })
    if (q.sleepDifficulty >= 4) list.push({ kind: 'theta', title: 'Theta 放松', subtitle: '助眠', rationale: '节律更平稳' })
    if (q.attentionSwitching >= 4) list.push({ kind: 'metronome', title: '节律白噪', subtitle: '聚焦', rationale: '帮助稳住节奏' })
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

  function stopHealing() {
    if (app.timers.healing) clearInterval(app.timers.healing)
    app.timers.healing = null
    if (app.soundscapeStop) app.soundscapeStop()
    app.soundscapeStop = null
    stopIntervals()
    cancelSpeech()
    app.overlaySeconds = 0
    el.healingOverlay.classList.add('hidden')
  }

  function startHealing(minutes) {
    const plan = getAvailablePlans().find((p) => p.kind === app.selectedPlanKind) || getAvailablePlans()[0]
    stopHealing()
    switchScreen('healing')
    startSoundscape(plan.kind).then((stop) => {
      app.soundscapeStop = stop
      app.overlaySeconds = minutes * 60
      el.overlayTitle.textContent = plan.title
      el.overlaySubtitle.textContent = plan.subtitle
      el.healingOverlay.classList.remove('hidden')
      updateOverlay()
      if (plan.kind === 'bodyScan') speak(BODY_SCAN)
      app.timers.healing = setInterval(() => {
        app.overlaySeconds -= 1
        updateOverlay()
        if (app.overlaySeconds <= 0) stopHealing()
      }, 1000)
    })
  }

  function updateOverlay() {
    const m = String(Math.max(0, Math.floor(app.overlaySeconds / 60))).padStart(2, '0')
    const s = String(Math.max(0, app.overlaySeconds % 60)).padStart(2, '0')
    el.overlayCountdown.textContent = m + ':' + s
  }

  function cancelSpeech() { if (window.speechSynthesis) { app.speechVersion += 1; window.speechSynthesis.cancel() } }
  function speak(text, opts) {
    if (!window.speechSynthesis) return Promise.resolve()
    const version = ++app.speechVersion
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'zh-CN'
      u.pitch = (opts && opts.pitch) || 1
      u.rate = (opts && opts.rate) || 1
      u.onend = () => { if (version === app.speechVersion) resolve() }
      u.onerror = () => resolve()
      window.speechSynthesis.speak(u)
    })
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