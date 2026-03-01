const animals = [
  { id: 'cat', name: '小猫', emoji: '🐱', sound: '喵喵' },
  { id: 'dog', name: '小狗', emoji: '🐶', sound: '汪汪' },
  { id: 'duck', name: '小鸭', emoji: '🦆', sound: '嘎嘎' },
  { id: 'sheep', name: '小羊', emoji: '🐑', sound: '咩咩' },
  { id: 'cow', name: '小牛', emoji: '🐮', sound: '哞哞' },
  { id: 'chick', name: '小鸡', emoji: '🐥', sound: '叽叽' }
];

const storageKey = 'animal-game-score';
let score = Number(localStorage.getItem(storageKey) || 0);
let currentQuestion = null;

const gridEl = document.querySelector('#animal-grid');
const questionEl = document.querySelector('#question');
const optionsEl = document.querySelector('#options');
const feedbackEl = document.querySelector('#feedback');
const scoreEl = document.querySelector('#score');
const resetBtn = document.querySelector('#reset-progress');
let audioContext = null;

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

function playAnimalSound(animalId) {
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
    return;
  }
}

function renderAnimals() {
  gridEl.innerHTML = '';
  animals.forEach((animal) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'animal-card';
    card.innerHTML = `<span class="emoji">${animal.emoji}</span><span class="name">${animal.name}</span>`;
    card.addEventListener('click', () => {
      playAnimalSound(animal.id);
    });
    gridEl.appendChild(card);
  });
}

function updateScore() {
  scoreEl.textContent = String(score);
  localStorage.setItem(storageKey, String(score));
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
      if (option === currentQuestion.answer) {
        score += 1;
        updateScore();
        feedbackEl.textContent = '真棒！答对啦 🎉';
        feedbackEl.className = 'feedback ok';
        playAnimalSound(currentQuestion.answer.id);
      } else {
        feedbackEl.textContent = `再试试，正确答案是 ${currentQuestion.answer.name}`;
        feedbackEl.className = 'feedback error';
        playAnimalSound(currentQuestion.answer.id);
      }
      setTimeout(nextQuestion, 800);
    });
    optionsEl.appendChild(button);
  });
}

resetBtn.addEventListener('click', () => {
  score = 0;
  updateScore();
  feedbackEl.textContent = '进度已重置。';
  feedbackEl.className = 'feedback';
});

renderAnimals();
updateScore();
nextQuestion();
