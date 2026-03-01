const animals = window.ANIMALS || [];
const categories = window.CATEGORY_LABELS || {};
const levels = window.DIFFICULTY_LEVELS || {};

const storageKey = 'animal-game-state-v1-2-v1-4';
const todayKey = new Date().toISOString().slice(0, 10);

const defaultState = {
  score: 0,
  streak: 0,
  difficulty: 'normal',
  category: 'all',
  language: 'zh',
  wrongQueue: [],
  dailyStats: {}
};

const persisted = JSON.parse(localStorage.getItem(storageKey) || '{}');
const state = {
  ...defaultState,
  ...persisted,
  dailyStats: persisted.dailyStats || {},
  wrongQueue: Array.isArray(persisted.wrongQueue) ? persisted.wrongQueue : []
};

state.dailyStats[todayKey] = state.dailyStats[todayKey] || { attempts: 0, correct: 0 };

let currentQuestion = null;
let audioContext = null;

const gridEl = document.querySelector('#animal-grid');
const questionEl = document.querySelector('#question');
const optionsEl = document.querySelector('#options');
const feedbackEl = document.querySelector('#feedback');
const scoreEl = document.querySelector('#score');
const streakEl = document.querySelector('#streak');
const dailyCountEl = document.querySelector('#daily-count');
const resetBtn = document.querySelector('#reset-progress');
const difficultyEl = document.querySelector('#difficulty');
const categoryEl = document.querySelector('#category');
const languageToggleEl = document.querySelector('#lang-toggle');
const replayBtn = document.querySelector('#replay-question');

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone({ start, duration, fromFreq, toFreq, gain = 0.18, type = 'sine', filterFreq = 1600 }) {
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

function playAnimalSound(animal) {
  if (!animal) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime + 0.01;
  const tone = animal.tone || { from: 500, to: 320, type: 'sine' };

  playTone({
    start: now,
    duration: 0.18,
    fromFreq: tone.from,
    toFreq: tone.to,
    gain: 0.18,
    type: tone.type,
    filterFreq: Math.max(500, tone.from + 400)
  });

  playTone({
    start: now + 0.16,
    duration: 0.16,
    fromFreq: tone.from * 0.9,
    toFreq: tone.to * 0.85,
    gain: 0.14,
    type: tone.type,
    filterFreq: Math.max(500, tone.from + 200)
  });
}

function getName(animal) {
  return state.language === 'zh' ? animal.nameZh : animal.nameEn;
}

function getSound(animal) {
  return state.language === 'zh' ? animal.soundZh : animal.soundEn;
}

function getFilteredAnimals() {
  if (state.category === 'all') return animals;
  return animals.filter((item) => item.category === state.category);
}

function buildSelectOptions() {
  difficultyEl.innerHTML = '';
  Object.entries(levels).forEach(([key, value]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = state.language === 'zh' ? value.zh : value.en;
    option.selected = key === state.difficulty;
    difficultyEl.appendChild(option);
  });

  categoryEl.innerHTML = '';
  Object.entries(categories).forEach(([key, value]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = state.language === 'zh' ? value.zh : value.en;
    option.selected = key === state.category;
    categoryEl.appendChild(option);
  });
}

function renderAnimals() {
  gridEl.innerHTML = '';
  getFilteredAnimals().forEach((animal) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'animal-card';
    card.innerHTML = `<span class="emoji">${animal.emoji}</span><span class="name">${getName(animal)}</span>`;
    card.addEventListener('click', () => playAnimalSound(animal));
    gridEl.appendChild(card);
  });
}

function updateProgress() {
  scoreEl.textContent = String(state.score);
  streakEl.textContent = String(state.streak);
  dailyCountEl.textContent = String(state.dailyStats[todayKey].attempts || 0);
  saveState();
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function updateWrongQueueByTurn() {
  state.wrongQueue = state.wrongQueue
    .map((item) => ({ ...item, remain: item.remain - 1 }))
    .filter((item) => item.remain > 0);
}

function getAnswerCandidate(candidates) {
  const replayCandidates = state.wrongQueue.filter((item) => candidates.some((a) => a.id === item.id));
  if (replayCandidates.length > 0 && Math.random() < 0.72) {
    const picked = randomPick(replayCandidates);
    return candidates.find((item) => item.id === picked.id) || randomPick(candidates);
  }
  return randomPick(candidates);
}

function nextQuestion() {
  updateWrongQueueByTurn();

  const candidatePool = getFilteredAnimals();
  const optionCount = Math.min(levels[state.difficulty].optionCount, candidatePool.length);
  const answer = getAnswerCandidate(candidatePool);
  const options = [answer];

  while (options.length < optionCount) {
    const candidate = randomPick(candidatePool);
    if (!options.includes(candidate)) options.push(candidate);
  }

  options.sort(() => Math.random() - 0.5);
  currentQuestion = { answer, options };

  questionEl.textContent = state.language === 'zh'
    ? `请找出：${getSound(answer)} 是哪只动物？`
    : `Which animal says: ${getSound(answer)}?`;

  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';

  optionsEl.innerHTML = '';
  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.textContent = `${option.emoji} ${getName(option)}`;
    button.addEventListener('click', () => handleAnswer(option));
    optionsEl.appendChild(button);
  });
}

function handleAnswer(option) {
  if (!currentQuestion) return;

  state.dailyStats[todayKey].attempts += 1;

  if (option.id === currentQuestion.answer.id) {
    state.score += 1;
    state.streak += 1;
    state.dailyStats[todayKey].correct += 1;

    if (state.streak > 0 && state.streak % 3 === 0) {
      feedbackEl.textContent = state.language === 'zh'
        ? `太棒了！你已经连续答对 ${state.streak} 题啦 🌟`
        : `Awesome! ${state.streak} correct in a row 🌟`;
      feedbackEl.className = 'feedback reward';
    } else {
      feedbackEl.textContent = state.language === 'zh' ? '真棒！答对啦 🎉' : 'Great job! Correct 🎉';
      feedbackEl.className = 'feedback ok';
    }
  } else {
    state.streak = 0;
    state.wrongQueue.push({
      id: currentQuestion.answer.id,
      remain: Math.floor(Math.random() * 3) + 3
    });

    feedbackEl.textContent = state.language === 'zh'
      ? `再试试，正确答案是 ${getName(currentQuestion.answer)}`
      : `Try again. The answer is ${getName(currentQuestion.answer)}`;
    feedbackEl.className = 'feedback error';
  }

  playAnimalSound(currentQuestion.answer);
  updateProgress();
  saveState();
  setTimeout(nextQuestion, 800);
}

function bindEvents() {
  difficultyEl.addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    saveState();
    nextQuestion();
  });

  categoryEl.addEventListener('change', (e) => {
    state.category = e.target.value;
    saveState();
    renderAnimals();
    nextQuestion();
  });

  languageToggleEl.addEventListener('click', () => {
    state.language = state.language === 'zh' ? 'en' : 'zh';
    buildSelectOptions();
    renderAnimals();
    nextQuestion();
    updateProgress();
  });

  replayBtn.addEventListener('click', () => {
    if (currentQuestion) playAnimalSound(currentQuestion.answer);
  });

  resetBtn.addEventListener('click', () => {
    state.score = 0;
    state.streak = 0;
    state.wrongQueue = [];
    state.dailyStats = { [todayKey]: { attempts: 0, correct: 0 } };
    feedbackEl.textContent = state.language === 'zh' ? '进度已重置。' : 'Progress reset.';
    feedbackEl.className = 'feedback';
    updateProgress();
    nextQuestion();
  });
}

function init() {
  if (!levels[state.difficulty]) state.difficulty = 'normal';
  if (!categories[state.category]) state.category = 'all';
  if (!['zh', 'en'].includes(state.language)) state.language = 'zh';

  buildSelectOptions();
  bindEvents();
  renderAnimals();
  updateProgress();
  nextQuestion();
}

init();
