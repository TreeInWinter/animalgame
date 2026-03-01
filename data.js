window.ANIMALS = [
  { id: 'cat', emoji: '🐱', category: 'farm', nameZh: '小猫', nameEn: 'Cat', soundZh: '喵喵', soundEn: 'Meow', tone: { from: 680, to: 420, type: 'triangle' } },
  { id: 'dog', emoji: '🐶', category: 'farm', nameZh: '小狗', nameEn: 'Dog', soundZh: '汪汪', soundEn: 'Woof', tone: { from: 260, to: 170, type: 'sawtooth' } },
  { id: 'duck', emoji: '🦆', category: 'farm', nameZh: '小鸭', nameEn: 'Duck', soundZh: '嘎嘎', soundEn: 'Quack', tone: { from: 520, to: 430, type: 'square' } },
  { id: 'sheep', emoji: '🐑', category: 'farm', nameZh: '小羊', nameEn: 'Sheep', soundZh: '咩咩', soundEn: 'Baa', tone: { from: 420, to: 290, type: 'triangle' } },
  { id: 'cow', emoji: '🐮', category: 'farm', nameZh: '奶牛', nameEn: 'Cow', soundZh: '哞哞', soundEn: 'Moo', tone: { from: 190, to: 120, type: 'sawtooth' } },
  { id: 'chick', emoji: '🐥', category: 'farm', nameZh: '小鸡', nameEn: 'Chick', soundZh: '叽叽', soundEn: 'Cheep', tone: { from: 1400, to: 1100, type: 'square' } },
  { id: 'horse', emoji: '🐴', category: 'farm', nameZh: '小马', nameEn: 'Horse', soundZh: '嘶嘶', soundEn: 'Neigh', tone: { from: 360, to: 250, type: 'triangle' } },

  { id: 'lion', emoji: '🦁', category: 'forest', nameZh: '狮子', nameEn: 'Lion', soundZh: '吼吼', soundEn: 'Roar', tone: { from: 220, to: 120, type: 'sawtooth' } },
  { id: 'tiger', emoji: '🐯', category: 'forest', nameZh: '老虎', nameEn: 'Tiger', soundZh: '嗷呜', soundEn: 'Grr', tone: { from: 240, to: 130, type: 'sawtooth' } },
  { id: 'elephant', emoji: '🐘', category: 'forest', nameZh: '大象', nameEn: 'Elephant', soundZh: '噗噗', soundEn: 'Trumpet', tone: { from: 300, to: 180, type: 'square' } },
  { id: 'monkey', emoji: '🐵', category: 'forest', nameZh: '猴子', nameEn: 'Monkey', soundZh: '吱吱', soundEn: 'Ooh ooh', tone: { from: 900, to: 600, type: 'triangle' } },
  { id: 'fox', emoji: '🦊', category: 'forest', nameZh: '狐狸', nameEn: 'Fox', soundZh: '呀呀', soundEn: 'Yip', tone: { from: 740, to: 420, type: 'square' } },
  { id: 'rabbit', emoji: '🐰', category: 'forest', nameZh: '兔子', nameEn: 'Rabbit', soundZh: '呼呼', soundEn: 'Sniff', tone: { from: 1100, to: 900, type: 'sine' } },
  { id: 'bear', emoji: '🐻', category: 'forest', nameZh: '小熊', nameEn: 'Bear', soundZh: '吼', soundEn: 'Growl', tone: { from: 210, to: 130, type: 'sawtooth' } },

  { id: 'fish', emoji: '🐟', category: 'ocean', nameZh: '小鱼', nameEn: 'Fish', soundZh: '咕噜', soundEn: 'Blub', tone: { from: 520, to: 260, type: 'sine' } },
  { id: 'dolphin', emoji: '🐬', category: 'ocean', nameZh: '海豚', nameEn: 'Dolphin', soundZh: '啾啾', soundEn: 'Click', tone: { from: 1500, to: 900, type: 'triangle' } },
  { id: 'whale', emoji: '🐋', category: 'ocean', nameZh: '鲸鱼', nameEn: 'Whale', soundZh: '呜——', soundEn: 'Whale song', tone: { from: 160, to: 90, type: 'sine' } },
  { id: 'octopus', emoji: '🐙', category: 'ocean', nameZh: '章鱼', nameEn: 'Octopus', soundZh: '噗噜', soundEn: 'Ploop', tone: { from: 700, to: 350, type: 'triangle' } },
  { id: 'crab', emoji: '🦀', category: 'ocean', nameZh: '螃蟹', nameEn: 'Crab', soundZh: '咔哒', soundEn: 'Clack', tone: { from: 880, to: 500, type: 'square' } },
  { id: 'seal', emoji: '🦭', category: 'ocean', nameZh: '海豹', nameEn: 'Seal', soundZh: '嗷嗷', soundEn: 'Arf', tone: { from: 420, to: 220, type: 'triangle' } },
  { id: 'shark', emoji: '🦈', category: 'ocean', nameZh: '鲨鱼', nameEn: 'Shark', soundZh: '呼——', soundEn: 'Whoosh', tone: { from: 320, to: 120, type: 'sawtooth' } }
];

window.CATEGORY_LABELS = {
  all: { zh: '全部', en: 'All' },
  farm: { zh: '农场', en: 'Farm' },
  forest: { zh: '森林', en: 'Forest' },
  ocean: { zh: '海洋', en: 'Ocean' }
};

window.DIFFICULTY_LEVELS = {
  easy: { optionCount: 2, zh: '简单（2选1）', en: 'Easy (2 choices)' },
  normal: { optionCount: 3, zh: '普通（3选1）', en: 'Normal (3 choices)' },
  hard: { optionCount: 4, zh: '进阶（4选1）', en: 'Hard (4 choices)' }
};
