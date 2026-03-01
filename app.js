const animals = [
  { id: 'cat', name: '小猫', emoji: '🐱', sound: '喵喵' },
  { id: 'dog', name: '小狗', emoji: '🐶', sound: '汪汪' },
  { id: 'duck', name: '小鸭', emoji: '🦆', sound: '嘎嘎' },
  { id: 'sheep', name: '小羊', emoji: '🐑', sound: '咩咩' },
  { id: 'cow', name: '小牛', emoji: '🐮', sound: '哞哞' },
  { id: 'chick', name: '小鸡', emoji: '🐥', sound: '叽叽' }
];

const storageKey = 'animal-game-score';
const parentKey = 'animal-game-parent-state';

const defaultParentState = {
  attempts: 0,
  correct: 0,
  lastLearnDate: '',
  streakDays: 0,
  animalStats: Object.fromEntries(animals.map((a) => [a.id, { attempts: 0, correct: 0 }])),
  settings: {
    bgm: false,
    sfx: true,
    animLevel: 'high'
  }
};

let score = Number(localStorage.getItem(storageKey) || 0);
let currentQuestion = null;
let audioContext = null;
let bgmTimer = null;
let parentState = loadParentState();

const gridEl = document.querySelector('#animal-grid');
const questionEl = document.querySelector('#question');
const optionsEl = document.querySelector('#options');
const feedbackEl = document.querySelector('#feedback');
const scoreEl = document.querySelector('#score');
const resetBtn = document.querySelector('#reset-progress');
const replayBtn = document.querySelector('#replay-sound');

const parentGateEl = document.querySelector('#parent-gate');
const parentDialogEl = document.querySelector('#parent-dialog');
const statTotalEl = document.querySelector('#stat-total');
const statAccuracyEl = document.querySelector('#stat-accuracy');
const statStreakEl = document.querySelector('#stat-streak');
const masteryListEl = document.querySelector('#mastery-list');
const resetAllBtn = document.querySelector('#reset-all');
const toggleBgmEl = document.querySelector('#toggle-bgm');
const toggleSfxEl = document.querySelector('#toggle-sfx');
const animLevelEl = document.querySelector('#anim-level');

function loadParentState() {
  try {
    const raw = localStorage.getItem(parentKey);
    if (!raw) return structuredClone(defaultParentState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultParentState),
      ...parsed,
      settings: {
        ...defaultParentState.settings,
        ...(parsed.settings || {})
      },
      animalStats: {
        ...defaultParentState.animalStats,
        ...(parsed.animalStats || {})
      }
    };
  } catch {
    return structuredClone(defaultParentState);
  }
}

function saveParentState() {
  localStorage.setItem(parentKey, JSON.stringify(parentState));
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone({
  start,
  duration,
  fromFreq,
  toFreq,
  gain = 0.18,
  type = 'sine',
  filterFreq = 1600
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFreq, start);

  osc.type = type;
  osc.frequency.setValueAtTime(fromFreq, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(50, toFreq), start + duration);

  amp.gain.setValueAtTime(0.001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playSuccessJingle() {
  if (!parentState.settings.sfx) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.01;
  playTone({ start: now, duration: 0.1, fromFreq: 520, toFreq: 660, gain: 0.13, type: 'triangle', filterFreq: 2200 });
  playTone({ start: now + 0.1, duration: 0.12, fromFreq: 660, toFreq: 880, gain: 0.13, type: 'triangle', filterFreq: 2400 });
}

function playErrorJingle() {
  if (!parentState.settings.sfx) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.01;
  playTone({ start: now, duration: 0.12, fromFreq: 280, toFreq: 180, gain: 0.14, type: 'sawtooth', filterFreq: 900 });
  playTone({ start: now + 0.12, duration: 0.1, fromFreq: 180, toFreq: 150, gain: 0.12, type: 'sawtooth', filterFreq: 800 });
}

function playAnimalSound(animalId) {
  if (!parentState.settings.sfx) return;

  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime + 0.01;

  if (animalId === 'cat') {
    playTone({ start: now, duration: 0.26, fromFreq: 680, toFreq: 420, gain: 0.14, type: 'triangle', filterFreq: 2200 });
    playTone({ start: now + 0.15, duration: 0.22, fromFreq: 520, toFreq: 360, gain: 0.12, type: 'sine', filterFreq: 1800 });
    return;
  }
  if (animalId === 'dog') {
    playTone({ start: now, duration: 0.12, fromFreq: 260, toFreq: 170, gain: 0.26, type: 'sawtooth', filterFreq: 900 });
    playTone({ start: now + 0.18, duration: 0.14, fromFreq: 220, toFreq: 150, gain: 0.24, type: 'sawtooth', filterFreq: 850 });
    return;
  }
  if (animalId === 'duck') {
    playTone({ start: now, duration: 0.1, fromFreq: 520, toFreq: 430, gain: 0.2, type: 'square', filterFreq: 1300 });
    playTone({ start: now + 0.12, duration: 0.1, fromFreq: 500, toFreq: 410, gain: 0.2, type: 'square', filterFreq: 1300 });
    return;
  }
  if (animalId === 'sheep') {
    playTone({ start: now, duration: 0.22, fromFreq: 420, toFreq: 290, gain: 0.18, type: 'triangle', filterFreq: 1100 });
    playTone({ start: now + 0.12, duration: 0.2, fromFreq: 300, toFreq: 240, gain: 0.16, type: 'sine', filterFreq: 900 });
    return;
  }
  if (animalId === 'cow') {
    playTone({ start: now, duration: 0.32, fromFreq: 190, toFreq: 120, gain: 0.24, type: 'sawtooth', filterFreq: 700 });
    playTone({ start: now + 0.2, duration: 0.22, fromFreq: 140, toFreq: 95, gain: 0.2, type: 'triangle', filterFreq: 600 });
    return;
  }
  if (animalId === 'chick') {
    playTone({ start: now, duration: 0.08, fromFreq: 1400, toFreq: 1100, gain: 0.1, type: 'square', filterFreq: 3000 });
    playTone({ start: now + 0.1, duration: 0.08, fromFreq: 1450, toFreq: 1150, gain: 0.1, type: 'square', filterFreq: 3000 });
  }
}

function startBgm() {
  if (!parentState.settings.bgm || bgmTimer) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  bgmTimer = setInterval(() => {
    if (!parentState.settings.bgm || !parentState.settings.sfx) return;
    const start = ctx.currentTime + 0.02;
    playTone({ start, duration: 0.16, fromFreq: 392, toFreq: 392, gain: 0.035, type: 'sine', filterFreq: 1400 });
    playTone({ start: start + 0.2, duration: 0.16, fromFreq: 523, toFreq: 523, gain: 0.03, type: 'sine', filterFreq: 1600 });
  }, 1200);
}

function stopBgm() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

function setAnimLevel(level) {
  document.body.dataset.animLevel = level;
  parentState.settings.animLevel = level;
  saveParentState();
}

function renderAnimals() {
  gridEl.innerHTML = '';
  animals.forEach((animal) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'animal-card';
    card.innerHTML = `<span class="emoji">${animal.emoji}</span><span class="name">${animal.name}</span>`;
    card.addEventListener('click', () => {
      card.classList.add('tap-active');
      setTimeout(() => card.classList.remove('tap-active'), 180);
      playAnimalSound(animal.id);
    });
    gridEl.appendChild(card);
  });
}

function updateScore() {
  scoreEl.textContent = String(score);
  localStorage.setItem(storageKey, String(score));
}

function trackLearningDay() {
  const today = new Date().toISOString().slice(0, 10);
  if (!parentState.lastLearnDate) {
    parentState.lastLearnDate = today;
    parentState.streakDays = 1;
    return;
  }

  if (parentState.lastLearnDate === today) return;

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  parentState.streakDays = parentState.lastLearnDate === yesterday ? parentState.streakDays + 1 : 1;
  parentState.lastLearnDate = today;
}

function setFeedback(type, text) {
  feedbackEl.textContent = text;
  feedbackEl.className = `feedback ${type} pulse`;
  setTimeout(() => feedbackEl.classList.remove('pulse'), 300);
}

function nextQuestion() {
  const answer = animals[Math.floor(Math.random() * animals.length)];
  const options = [answer];

  while (options.length < 3) {
    const candidate = animals[Math.floor(Math.random() * animals.length)];
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  options.sort(() => Math.random() - 0.5);
  currentQuestion = { answer, options };

  questionEl.textContent = `请找出：${answer.sound} 是哪只动物？`;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';

  optionsEl.innerHTML = '';
  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.textContent = `${option.emoji} ${option.name}`;
    button.addEventListener('click', () => {
      const isCorrect = option.id === currentQuestion.answer.id;
      const stat = parentState.animalStats[currentQuestion.answer.id] || { attempts: 0, correct: 0 };
      stat.attempts += 1;
      if (isCorrect) stat.correct += 1;
      parentState.animalStats[currentQuestion.answer.id] = stat;

      parentState.attempts += 1;
      if (isCorrect) {
        parentState.correct += 1;
        score += 1;
        updateScore();
        setFeedback('ok', '真棒！答对啦 🎉');
        button.classList.add('is-correct');
        playSuccessJingle();
      } else {
        setFeedback('error', `再试试，正确答案是 ${currentQuestion.answer.name}`);
        button.classList.add('is-wrong');
        playErrorJingle();
      }

      playAnimalSound(currentQuestion.answer.id);
      trackLearningDay();
      saveParentState();

      setTimeout(nextQuestion, 850);
    });
    optionsEl.appendChild(button);
  });
}

function renderParentStats() {
  statTotalEl.textContent = String(parentState.attempts);
  const accuracy = parentState.attempts ? Math.round((parentState.correct / parentState.attempts) * 100) : 0;
  statAccuracyEl.textContent = `${accuracy}%`;
  statStreakEl.textContent = String(parentState.streakDays);

  masteryListEl.innerHTML = '';
  animals.forEach((animal) => {
    const stat = parentState.animalStats[animal.id] || { attempts: 0, correct: 0 };
    const mastery = stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'mastery-row';
    row.innerHTML = `
      <span>${animal.emoji} ${animal.name}</span>
      <span class="bar"><i style="width:${mastery}%"></i></span>
      <span>${mastery}%</span>
    `;
    masteryListEl.appendChild(row);
  });
}

function bindParentControls() {
  let holdTimer = null;

  const startHold = () => {
    parentGateEl.classList.add('holding');
    holdTimer = setTimeout(() => {
      renderParentStats();
      toggleBgmEl.checked = parentState.settings.bgm;
      toggleSfxEl.checked = parentState.settings.sfx;
      animLevelEl.value = parentState.settings.animLevel;
      parentDialogEl.showModal();
    }, 1200);
  };

  const cancelHold = () => {
    parentGateEl.classList.remove('holding');
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  parentGateEl.addEventListener('mousedown', startHold);
  parentGateEl.addEventListener('touchstart', startHold, { passive: true });

  parentGateEl.addEventListener('mouseup', cancelHold);
  parentGateEl.addEventListener('mouseleave', cancelHold);
  parentGateEl.addEventListener('touchend', cancelHold);
  parentGateEl.addEventListener('touchcancel', cancelHold);

  toggleBgmEl.addEventListener('change', () => {
    parentState.settings.bgm = toggleBgmEl.checked;
    saveParentState();
    if (parentState.settings.bgm) startBgm();
    else stopBgm();
  });

  toggleSfxEl.addEventListener('change', () => {
    parentState.settings.sfx = toggleSfxEl.checked;
    saveParentState();
  });

  animLevelEl.addEventListener('change', () => setAnimLevel(animLevelEl.value));

  resetAllBtn.addEventListener('click', () => {
    const ok = window.confirm('确认清空全部学习数据吗？该操作不可撤销。');
    if (!ok) return;

    score = 0;
    localStorage.removeItem(storageKey);
    parentState = structuredClone(defaultParentState);
    saveParentState();
    updateScore();
    renderParentStats();
    setAnimLevel(parentState.settings.animLevel);
    stopBgm();
    feedbackEl.textContent = '所有学习数据已重置。';
    feedbackEl.className = 'feedback';
    nextQuestion();
  });
}

resetBtn.addEventListener('click', () => {
  score = 0;
  updateScore();
  feedbackEl.textContent = '进度已重置。';
  feedbackEl.className = 'feedback';
});

replayBtn.addEventListener('click', () => {
  if (!currentQuestion) return;
  playAnimalSound(currentQuestion.answer.id);
});

setAnimLevel(parentState.settings.animLevel);
if (parentState.settings.bgm) startBgm();

renderAnimals();
bindParentControls();
updateScore();
nextQuestion();
