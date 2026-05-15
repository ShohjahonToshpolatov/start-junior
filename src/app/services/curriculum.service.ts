import { Injectable } from '@angular/core';
import {
  Lesson, Module, UserProgress, Exercise, ModuleProject,
  HomeworkTask, QuizQuestion
} from '../models/curriculum.model';

const API_BASE = 'http://localhost:3000/api';

// ─── helpers ────────────────────────────────────────────────────────────────

type LessonSeed = Omit<Lesson, 'id' | 'moduleId' | 'order' | 'videoUrl'> & {
  videoQuery: string;
};

const yt = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} uzbek tilida`)}`;

const hw = (
  lessonId: string,
  order: number,
  data: Omit<HomeworkTask, 'id'>
): HomeworkTask => ({ id: `${lessonId}-hw-${order}`, ...data });

const quiz = (
  lessonId: string,
  hwOrder: number,
  qs: Omit<QuizQuestion, 'id'>[]
): QuizQuestion[] =>
  qs.map((q, i) => ({ id: `${lessonId}-hw-${hwOrder}-q${i + 1}`, ...q }));

const generateHardHomeworkTask = (
  lessonId: string,
  moduleId: string,
  lessonTitle: string
): HomeworkTask => {
  const order = parseInt(lessonId.split('-').pop() || '0', 10);
  const base = {
    order: 99,
    title: 'AI bilan tekshiriladigan murakkab kod topshirig‘i',
    description: `Ushbu dars uchun murakkab amaliy kod yozing va AI tekshiruvdan o‘tsin. ${lessonTitle} mavzusini chuqur o‘zlashtirish kerak.`,
    type: 'code' as const,
    difficulty: 'qiyin' as const,
    xp: 120,
    starterCode: '',
    expectedOutput: '',
  };

  if (moduleId === 'html') {
    switch (order) {
      case 1:
        return hw(lessonId, 99, {
          ...base,
          starterCode: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profil Sahifam</title>
</head>
<body>
  <header>
    <h1>Profilim</h1>
  </header>
  <main>
    <section>
      <!-- O'zining ismingni <h2> bilan yozing -->
      <!-- Qisqa tasnif <p> bilan yozing -->
      <!-- 3 ta ijtimoiy tarmoqqa linklar (<a>) qo'shing -->
    </section>
    <section>
      <!-- "Ko'nikmalar" nomli <h3> -->
      <!-- Ro'yxat (<ul>) bilan 5 ta ko'nikma qo'shing -->
    </section>
  </main>
  <footer>
    <p>&copy; 2026 Mening Saytim</p>
  </footer>
</body>
</html>`,
          expectedOutput: 'DOCTYPE, html, head, body, header, h1, h2, p, ul, li, a, footer, meta charset, viewport',
        });
      case 2:
        return hw(lessonId, 99, {
          ...base,
          starterCode: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mahsulotlar</title>
</head>
<body>
  <header>
    <h1>Bizning Mahsulotlar</h1>
    <p>Eng muqobil mahsulotlar</p>
  </header>
  <main>
    <!-- "Elektronika" kategoriyasi uchun section -->
    <section>
      <h2>Elektronika</h2>
      <ul>
        <!-- 3-4 ta elektronika mahsulotini <li> bilan qo'shing -->
      </ul>
    </section>
    <!-- "Kitoblar" kategoriyasi uchun section -->
    <section>
      <h2>Kitoblar</h2>
      <ol>
        <!-- Reyting bo'yicha 3-4 ta kitobni qo'shing -->
      </ol>
    </section>
  </main>
</body>
</html>`,
          expectedOutput: 'h1, h2, p, ul, ol, li, DOCTYPE, meta charset, viewport, section',
        });
      case 3:
        return hw(lessonId, 99, {
          ...base,
          starterCode: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mening Loyihalarim</title>
</head>
<body>
  <header>
    <h1>Mening Loyihalarim</h1>
    <p>Quyida mening eng yaxshi loyihalarni ko'rishingiz mumkin</p>
  </header>
  <nav>
    <!-- GitHub sahifasiga link -->
    <a href="#">GitHub</a>
    <!-- Portfolio sahifasiga link -->
    <a href="#">Portfolio</a>
    <!-- Contact sahifasiga link -->
    <a href="#">Bog'lanish</a>
  </nav>
  <main>
    <!-- 3-4 ta loyihaning rasmlarini qo'shing -->
    <!-- Har bir rasm uchun alt atribut qo'llanilishi shart -->
    <article>
      <h2>Loyiha 1</h2>
      <img src="" alt="">
      <p>Loyiha tasnifi</p>
    </article>
  </main>
</body>
</html>`,
          expectedOutput: 'img, alt, a href, h1, h2, p, nav, header, main, article, DOCTYPE, meta charset, viewport',
        });
      default:
        return hw(lessonId, 99, {
          ...base,
          starterCode: `<!-- DOCTYPE yozing -->
<!-- html tegi oching, lang="uz" -->
<!-- head tegi oching -->
<!-- meta charset="UTF-8" -->
<!-- meta name="viewport" content="width=device-width, initial-scale=1.0" -->
<!-- title "${lessonTitle}" -->
<!-- head yoping -->
<!-- body oching -->
<!-- h1 "${lessonTitle}" -->
<!-- p "Ushbu darsga mos HTML sahifa." -->
<!-- body yoping -->
<!-- html yoping -->`,
          expectedOutput: 'DOCTYPE, html, head, body, h1, p, meta charset, viewport',
        });
    }
  }

  switch (moduleId) {
    case 'css':
      return hw(lessonId, 99, {
        ...base,
        starterCode: `/* Profil kartasini shakllantiring */
.profile-card {
  max-width: 400px;
  margin: 20px auto;
  padding: 30px;
  border-radius: 12px;
  /* Qora fonli gradiyent qo'shing: #1a1a2e dan #16213e ga */
  /* Oq matn rangi qo'shing */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.profile-card h2 {
  /* Shrift hajmi: 28px, qalinligi: bold */
  margin: 0 0 10px 0;
}

.profile-card .bio {
  /* Shrift o'lcham: 16px */
  /* opacity: 0.8 */
  margin: 15px 0;
}

.profile-card .skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.skill-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  /* border-radius: 20px qo'shing */
  /* transition: all 0.3s ease */
  cursor: pointer;
}

.skill-tag:hover {
  /* background: rgba(255, 255, 255, 0.2) */
  /* transform: translateY(-2px) */
}
`,
        expectedOutput: 'gradient, border-radius, box-shadow, flex, padding, hover, dark theme, opacity',
      });

    case 'js':
      return hw(lessonId, 99, {
        ...base,
        starterCode: `// ToDo List uygulamasi
const todos = [
  { id: 1, text: 'HTML o\\'rganish', completed: true },
  { id: 2, text: 'CSS o\\'rganish', completed: false },
  { id: 3, text: 'JavaScript o\\'rganish', completed: false }
];

// Yangi todo qo'shuvchi funksiya yozing
function addTodo(text) {
  // Yangi id: Math.max(...todos.map(t => t.id)) + 1
  // const newTodo = { id, text, completed: false }
  // todos.push(newTodo)
  // return todos
}

// Todo ni to'liq qilish uchun funksiya
function completeTodo(id) {
  // const todo = todos.find(t => t.id === id)
  // if (todo) todo.completed = true
  // return todos
}

// Faqat to'liqlab qilinmagan todos ni ko'rsatuvchi funksiya
function getPendingTodos() {
  // return todos.filter(t => !t.completed)
}

// Total to'liqlab qilingan foizni hisoblash
function getCompletionPercentage() {
  // const completed = todos.filter(t => t.completed).length
  // return Math.round((completed / todos.length) * 100)
}

// Test
console.log('Initial todos:', todos);
addTodo('Backend o\\'rganish');
console.log('Pending:', getPendingTodos());
console.log('Completion:', getCompletionPercentage() + '%');
`,
        expectedOutput: 'addTodo, completeTodo, getPendingTodos, getCompletionPercentage, filter, find, map, push',
      });

    case 'backend':
      return hw(lessonId, 99, {
        ...base,
        starterCode: `// API server uchun UserController yozing
async function handleUsersRequest(req, res) {
  // Mavjud foydalanuvchilar
  const users = [
    { id: 1, name: 'Ali', email: 'ali@example.com', active: true },
    { id: 2, name: 'Vali', email: 'vali@example.com', active: false },
    { id: 3, name: 'Shodiya', email: 'shodiya@example.com', active: true }
  ];

  try {
    // Req.method POST bo'lsa, yangi user qo'shing
    if (req.method === 'POST') {
      // const newUser = { id: users.length + 1, ...req.body }
      // users.push(newUser)
      // return newUser
    }

    // Req.method GET bo'lsa, faqat active users qaytaring
    if (req.method === 'GET') {
      // const activeUsers = users.filter(u => u.active)
      // return activeUsers.map(u => ({ id: u.id, name: u.name }))
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'success', data: [] }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ status: 'error', message: error.message }));
  }
}
`,
        expectedOutput: 'async function, filter, map, JSON.stringify, Content-Type, active users, POST, GET',
      });

    case 'git':
      return hw(lessonId, 99, {
        ...base,
        starterCode: `// Git commit tarihini tahlil qiluvchi funksiya
const gitLog = \`commit 3a7b5c2 - Ali: HTML layout qildim
commit 2f8d1e4 - Vali: CSS styling qildim
commit 1k9m3n6 - Shodiya: JavaScript logic qildim
commit 5p2q7r8 - Ali: README.md qo'shdim\`;

// Parse git log: har bir commit uchun hash va author chiqarish
function parseGitLog(logText) {
  // logText.split('\\n') qiling
  // filter qiling: faqat 'commit' bilan boshlanganlarini
  // map qiling: { hash: '...', author: '...', message: '...' } ko'rinishga
  // return qiling
}

// Author bo'yicha commit count hisoblash
function getCommitsByAuthor(commits) {
  // commits.reduce((acc, c) => { acc[c.author] = (acc[c.author] || 0) + 1; return acc }, {})
}

// Test
const commits = parseGitLog(gitLog);
console.log('Commits:', commits);
console.log('By author:', getCommitsByAuthor(commits));
`,
        expectedOutput: 'parseGitLog, split, filter, map, startsWith, reduce, commit, hash, author',
      });

    default:
      return hw(lessonId, 99, {
        ...base,
        starterCode: `// solve funksiyasini yozing
function solve(data) {
  // return data;
}

solve([]);
`,
        expectedOutput: 'function, data, return, solve',
      });
  }
};

const generateHomeworkTasks = (
  lessonId: string,
  moduleId: string,
  lessonTitle: string
): HomeworkTask[] => {
  const codeTask = generateHardHomeworkTask(lessonId, moduleId, lessonTitle);

  const quizTask: HomeworkTask = hw(lessonId, 98, {
    order: 98,
    title: 'AI bilan tekshiriladigan savollar',
    description: `Ushbu dars bo‘yicha muhim tushunchalarni mustahkamlang. Har bir savolni diqqat bilan bajaring.`,
    type: 'quiz',
    difficulty: 'orta',
    xp: 80,
    questions: quiz(lessonId, 98, [
      {
        question: `Ushbu darsda qaysi asosiy mavzu muhokama qilindi?`,
        options: [
          'Asosiy kontent va semantik HTML',
          'Server-side rendering',
          'Git branchlarini birlashtirish',
          'CSS grid emas, faqat float ishlatish'
        ],
        correct: 0,
        explanation: 'Darsda asosiy eʼtibor mavzu va semantik tarkibga qaratilgan.'
      },
      {
        question: `Quyidagi elementlardan qaysi biri darsdagi vazifaga mos keladi?`,
        options: [
          'footer',
          'console.log',
          'git commit',
          'require()'
        ],
        correct: 0,
        explanation: 'Footer semantic layerga tegishli va darsda ishlatiladi.'
      },
      {
        question: `Ushbu darsda qaysi texnologiya yoki ko‘nikma asosiy bo‘ldi?`,
        options: [
          'Ajax so‘rovlar',
          'HTML/CSS asosiy tuzilma',
          'React komponentlari',
          'Docker konteynerlari'
        ],
        correct: 1,
        explanation: 'Dars HTML/CSS asosiy tuzilmasi haqida.'
      }
    ])
  });

  const projectTask: HomeworkTask = hw(lessonId, 97, {
    order: 97,
    title: 'Real amaliy loyiha tekshiruv',
    description: `Ushbu dars bo‘yicha real loyiha holatini tekshiring va barcha talablarni bajaring.`,
    type: 'project',
    difficulty: 'orta',
    xp: 100,
    checkList: [
      'Dars mavzusi bo‘yicha real kod qismini yozdim',
      'Mualliflikni va foydalanuvchi tajribasini yaxshiladim',
      'Natijani brauzerda sinab ko‘rdim',
      'AI tekshiruvi uchun sharhlar/izohlar yozdim'
    ]
  });

  return [codeTask, quizTask, projectTask];
};

const lesson = (moduleId: string, order: number, seed: LessonSeed): Lesson => {
  const defaultHomework = generateHomeworkTasks(`${moduleId}-${order}`, moduleId, seed.title);
  return {
    id: `${moduleId}-${order}`,
    moduleId,
    order,
    title: seed.title,
    duration: seed.duration,
    description: seed.description,
    videoTitle: seed.videoTitle,
    videoUrl: yt(seed.videoQuery),
    theory: seed.theory,
    codeExample: seed.codeExample,
    task: seed.task,
    taskHint: seed.taskHint,
    difficulty: seed.difficulty,
    requirementsList: seed.requirementsList,
    exercises: seed.exercises ?? [],
    homeworkTasks: [...(seed.homeworkTasks ?? []), ...defaultHomework],
  };
};

const createModule = (
  id: string, order: number, title: string, icon: string,
  color: string, description: string, totalHours: string,
  seeds: LessonSeed[],
  project?: ModuleProject
): Module => ({
  id, order, title, icon, color, description, totalHours,
  lessons: seeds.map((s, i) => lesson(id, i + 1, s)),
  project,
});

const moduleProjects: Record<'setup' | 'html' | 'css' | 'js' | 'backend' | 'git', ModuleProject> = {
  setup: {
    id: 'setup-project',
    title: 'Kurs ish muhitini tayyorlash va portfolio boshlash',
    description: 'VS Code, Live Server, Git va GitHub bilan real ish muhitini sozlab, o‘z portfolio sahifasini boshlang.',
    requirements: [
      'VS Code da Live Server, Prettier va GitLens extensionlarini o‘rnatdim',
      ' loyiha papkasini Git reposiga aylantirdim',
      'GitHub sahifasida repository yaratdim',
      'Portfolio uchun oddiy HTML sahifa tuzdim'
    ],
    rubric: [
      { criterion: 'Ish muhitini sozlash', points: 25 },
      { criterion: 'Git va GitHub bazasini yaratish', points: 25 },
      { criterion: 'Portfolio strukturasining aniq bo‘lishi', points: 25 },
      { criterion: 'Yozilgan fayllarni brauzerda test qilish', points: 25 }
    ],
    totalPoints: 100
  },
  html: {
    id: 'html-project',
    title: 'To‘liq HTML sahifa loyihasi',
    description: 'HTML darslari oxirida sahifa tuzib, tarkib, navigatsiya va mobil moslik uchun tuzilmani bajaring.',
    requirements: [
      'HTML sahifa to‘liq tuzilgan',
      'navigatsiya va bo‘limlar aniq ishlaydi',
      'rasmlar va linklar qo‘shilgan',
      'meta teglar va sahifa sarlavhasi bor'
    ],
    rubric: [
      { criterion: 'To‘g‘ri sarlavha va meta teglar', points: 20 },
      { criterion: 'Kontent bo‘limlari va navigatsiya', points: 25 },
      { criterion: 'Rasm va linklar ishlashi', points: 25 },
      { criterion: 'Umumiy sahifa tuzilishi', points: 30 }
    ],
    totalPoints: 100
  },
  css: {
    id: 'css-project',
    title: 'Responsive dizayn va UI loyihasi',
    description: 'CSS darslari oxirida responsive portfolio yoki xizmat sahifasini chiroyli dizayndagi UI bilan yarating.',
    requirements: [
      'Responsive navbar va hero bo‘limi mavjud',
      'kartalar yoki xizmatlar bo‘limi grid bilan tuzilgan',
      'ranglar, tipografiya va hover effektlari ishlatilgan',
      'mobil qurilmalarda ham yaxshi ko‘rinadi'
    ],
    rubric: [
      { criterion: 'Responsive dizayn', points: 30 },
      { criterion: 'UI elementlarining izchil dizayni', points: 25 },
      { criterion: 'Hover efektlari va animatsiya', points: 20 },
      { criterion: 'Umumiy ishlash va brauzer tekshiruvi', points: 25 }
    ],
    totalPoints: 100
  },
  js: {
    id: 'js-project',
    title: 'Interaktiv JavaScript loyihasi',
    description: 'JavaScript darslari yakunida interaktiv to‘liq amaliy loyiha yaratib, DOM bilan ishlashni mustahkamlang.',
    requirements: [
      'DOM elementlar bilan interaktiv aloqani yaratdim',
      'formalar yoki buttonlar bilan dynamic voqealar ishlaydi',
      'ma’lumotlar JavaScript ichida boshqariladi',
      'foydalanuvchi feedbacki mavjud'
    ],
    rubric: [
      { criterion: 'DOM bilan interaktivlik', points: 30 },
      { criterion: 'JavaScript mantiqi va ma’lumotlar boshqaruvi', points: 30 },
      { criterion: 'Foydalanuvchi interaktsiyasi', points: 20 },
      { criterion: 'Qolgan qismlarning to‘g‘ri ishlashi', points: 20 }
    ],
    totalPoints: 100
  },
  backend: {
    id: 'backend-project',
    title: 'Node.js REST API loyihasi',
    description: 'Backend darslari oxirida Node.js da oddiy REST API yaratib, foydalanuvchi va progress ma’lumotlarini boshqaring.',
    requirements: [
      'HTTP server ochilgan',
      'GET va POST endpointlar ishlaydi',
      'JSON formatda so‘rov va javob qaytarildi',
      'server xatosiz ishladi va test qilindi'
    ],
    rubric: [
      { criterion: 'Server va endpoint tuzilishi', points: 30 },
      { criterion: 'JSON so‘rov va javoblar', points: 25 },
      { criterion: 'Data saqlash/logika', points: 25 },
      { criterion: 'Test va dokumentatsiya', points: 20 }
    ],
    totalPoints: 100
  },
  git: {
    id: 'git-project',
    title: 'Git va GitHub portfolioga deploy',
    description: 'Git darslari oxirida GitHub repository yaratib, branchlar, commitlar va deploy jarayonini ko‘rsating.',
    requirements: [
      'Repository GitHub ga push qilindi',
      'branch va merge jarayoni ko‘rsatildi',
      'README fayli yozildi',
      'deploy jarayoni yoki GitHub Pages rejalashtirildi'
    ],
    rubric: [
      { criterion: 'Git commit va branch ishlovi', points: 30 },
      { criterion: 'GitHub repository tartibi', points: 25 },
      { criterion: 'README va hujjatlash', points: 25 },
      { criterion: 'Deploy reja yoki ko‘rsatma', points: 20 }
    ],
    totalPoints: 100
  }
};

// ─── MODULE 1: SETUP ─────────────────────────────────────────────────────────

const setupSeeds: LessonSeed[] = [
  {
    title: "VS Code o'rnatish va sozlash",
    duration: '45 daqiqa',
    description: "VS Code ni yuklab olish, extensionlar va qulay ish muhitini sozlash.",
    videoTitle: "VS Code o'rnatish va sozlash — Uzbek",
    videoQuery: "VS Code o'rnatish sozlash extensionlar",
    difficulty: 'oson',
    theory: `VS Code — dasturchilar uchun eng mashhur kod muharriri.
Bepul, yengil va kuchli.

Kerakli extensionlar:
- Live Server: faylni brauzerda avtomatik yangilaydi
- Prettier: kodni chiroyli formatlaydi
- Auto Rename Tag: HTML tegni ozgartirganda juftini ham ozgartiradi
- HTML CSS Support: HTML da CSS klasslarini taklif qiladi
- GitLens: git tarixini korish uchun

Ish muhitini sozlash:
- Font: Fira Code (ligaturalar bor)
- Font size: 14-16px
- Tab size: 2
- Format on save: true`,
    codeExample: `// settings.json (VS Code sozlamalari)
{
  "editor.fontFamily": "Fira Code",
  "editor.fontSize": 15,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.wordWrap": "on",
  "liveServer.settings.donotShowInfoMsg": true
}`,
    task: "VS Code ni o'rnating, 5 ta extensionni o'rnating va settings.json ni sozlang.",
    taskHint: 'Ctrl+Shift+P -> "Open Settings JSON" deb yozing.',
    requirementsList: [
      "VS Code o'rnatildi va ochildi",
      "5 ta extension o'rnatildi",
      'Settings.json sozlandi',
      "Fira Code fonti o'rnatildi",
    ],
    homeworkTasks: [],
  },

  {
    title: 'Terminal va buyruqlar satri',
    duration: '50 daqiqa',
    description: 'Terminal nima, asosiy buyruqlar: cd, ls, mkdir, touch, pwd.',
    videoTitle: 'Terminal asosiy buyruqlar — Uzbek',
    videoQuery: 'terminal buyruqlar cd mkdir ls uzbek',
    difficulty: 'oson',
    theory: `Terminal — kompyuterni matn orqali boshqarish.
Dasturchi bolish uchun terminalni yaxshi bilish kerak.

Asosiy buyruqlar:
- pwd: hozir qaysi papkada turganingiz
- ls: papka ichini korish
- cd papka: papkaga kirish
- cd ..: bir yuqoriga chiqish
- mkdir nom: yangi papka yaratish
- touch fayl.html: yangi fayl yaratish
- rm fayl: faylni ochirish
- clear: terminalni tozalash

VS Code da terminal: Ctrl + backtick`,
    codeExample: `# Loyiha papkasini yaratish
mkdir start-junior-practice
cd start-junior-practice

# Papka tuzilmasini yaratish
mkdir 01-html 02-css 03-js assets

# Fayl yaratish
touch 01-html/index.html
touch 02-css/index.html 02-css/style.css
touch 03-js/index.html 03-js/app.js

# Hamma narsani korish
ls -la`,
    task: "Terminalda start-junior-practice papkasini yarating va ichida 4 ta papka oching.",
    taskHint: 'mkdir bir vaqtda bir nechta papka yaratadi: mkdir a b c',
    requirementsList: [
      'Terminal VS Code da ochildi',
      'start-junior-practice papkasi yaratildi',
      'Ichki papkalar yaratildi',
      "ls buyrug'i bilan tekshirildi",
    ],
    homeworkTasks: [
      hw('setup-2', 1, {
        order: 1,
        title: 'Terminal buyruqlar testi',
        description: 'Asosiy terminal buyruqlarini bilasizmi?',
        type: 'quiz',
        difficulty: 'oson',
        xp: 30,
        questions: quiz('setup-2', 1, [
          {
            question: "Terminalda hozir qaysi papkada turganingizni ko'rsatuvchi buyruq qaysi?",
            options: ['ls', 'cd', 'pwd', 'mkdir'],
            correct: 2,
            explanation: "pwd (print working directory) — hozirgi papka yo'lini ko'rsatadi.",
          },
          {
            question: 'Yangi papka yaratish uchun qaysi buyruq ishlatiladi?',
            options: ['touch', 'mkdir', 'cd', 'rm'],
            correct: 1,
            explanation: 'mkdir (make directory) — yangi papka yaratadi.',
          },
          {
            question: 'Bir yuqori papkaga chiqish uchun nima yoziladi?',
            options: ['cd /', 'cd ~', 'cd ..', 'cd -'],
            correct: 2,
            explanation: "cd .. — bir daraja yuqori (ota) papkaga o'tadi.",
          },
          {
            question: "Yangi bo'sh fayl yaratish buyrug'i?",
            options: ['new', 'create', 'touch', 'make'],
            correct: 2,
            explanation: "touch fayl.html — bo'sh fayl yaratadi yoki oxirgi o'zgarish vaqtini yangilaydi.",
          },
          {
            question: "Papka ichidagi fayllarni ko'rsatuvchi buyruq?",
            options: ['show', 'ls', 'dir', 'view'],
            correct: 1,
            explanation: "ls — list, papka tarkibini ko'rsatadi. ls -la batafsil ko'rsatadi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Brauzer DevTools bilan ishlash',
    duration: '55 daqiqa',
    description: 'Chrome DevTools: Elements, Console, Network, Device toolbar.',
    videoTitle: "Chrome DevTools to'liq qo'llanma — Uzbek",
    videoQuery: 'Chrome DevTools console elements network uzbek',
    difficulty: 'oson',
    theory: `DevTools — brauzer ichidagi dasturchi asbobi.

Qismlar:
- Elements: HTML va CSS ni real vaqtda korish va ozgartirish
- Console: JavaScript xatolari va console.log chiqishi
- Network: qaysi fayllar yuklanayapti, qancha vaqt ketayapti
- Sources: JavaScript fayllarini korish va breakpoint qoyish
- Device toolbar: turli telefon/planshet ekranlarini simulatsiya qilish
- Lighthouse: sayt tezligi va sifatini tekshirish

Ochish usullari:
- F12
- Ctrl + Shift + I
- Ong klik -> Inspect`,
    codeExample: `// Console da sinab koring:
console.log('Salom DevTools!');
console.warn('Bu ogohlantirish');
console.error('Bu xato misoli');
console.table([{ism: 'Ali', yosh: 22}, {ism: 'Vali', yosh: 25}]);

// Elementni tekshirish
document.querySelector('h1').style.color = 'red';
document.querySelectorAll('p').length;`,
    task: "DevTools oching, Console da 5 ta buyruq yozing, telefon rejimida sinab ko'ring.",
    taskHint: "Device toolbar: Ctrl+Shift+M. iPhone 14 Pro ni tanlang.",
    requirementsList: [
      'DevTools F12 bilan ochildi',
      'Console da console.log yozildi',
      "Elements panelida HTML ko'rildi",
      'Device toolbar da telefon rejimi sinaldi',
    ],
    homeworkTasks: [
      hw('setup-3', 1, {
        order: 1,
        title: 'DevTools testi',
        description: 'DevTools qismlarini bilasizmi?',
        type: 'quiz',
        difficulty: 'oson',
        xp: 30,
        questions: quiz('setup-3', 1, [
          {
            question: "JavaScript xatolarini qaysi DevTools panelida ko'rish mumkin?",
            options: ['Elements', 'Network', 'Console', 'Sources'],
            correct: 2,
            explanation: "Console paneli JavaScript xatolari va console.log ni ko'rsatadi.",
          },
          {
            question: 'HTML va CSS ni real vaqtda tahrirlash uchun qaysi panel?',
            options: ['Console', 'Elements', 'Network', 'Application'],
            correct: 1,
            explanation: "Elements panelida DOM va CSS ni ko'rish va tahrirlash mumkin.",
          },
          {
            question: 'DevTools ni ochish uchun qaysi tugma?',
            options: ['F5', 'F12', 'F8', 'Ctrl+D'],
            correct: 1,
            explanation: 'F12 yoki Ctrl+Shift+I DevTools ni ochadi.',
          },
        ]),
      }),
    ],
  },

  {
    title: 'Internet va web qanday ishlaydi',
    duration: '60 daqiqa',
    description: 'Frontend, backend, API, HTTP, hosting — asosiy tushunchalar.',
    videoTitle: 'Internet qanday ishlaydi — Uzbek',
    videoQuery: 'internet qanday ishlaydi frontend backend API uzbek',
    difficulty: 'oson',
    theory: `Web qanday ishlaydi?

Brauzer (frontend) <-> HTTP <-> Server (backend) <-> Database

Frontend: foydalanuvchi ko'radigan qism
- HTML: tuzilma (skeleton)
- CSS: ko'rinish (stil)
- JavaScript: harakatlar (logika)

Backend: server tomoni
- Ma'lumotlarni saqlaydi
- Foydalanuvchilarni boshqaradi
- API orqali frontend bilan gaplashadi

API: shartnoma
- GET /users: barcha foydalanuvchilar
- POST /login: kirish
- PUT /profile: profilni yangilash

HTTP status kodlari:
- 200: OK
- 201: Yaratildi
- 404: Topilmadi
- 500: Server xatosi`,
    codeExample: `// Brauzer bu so'rovni yuboradi:
// GET https://api.example.com/lessons

// Server bu javobni qaytaradi:
// {
//   "status": 200,
//   "data": [
//     { "id": 1, "title": "HTML kirish" },
//     { "id": 2, "title": "CSS selektorlar" }
//   ]
// }

// Frontend bu javobni ko'rsatadi
fetch('/api/lessons')
  .then(res => res.json())
  .then(data => console.log(data));`,
    task: "Daftarda frontend/backend/API tushunchalarini o'z so'zingiz bilan yozing.",
    taskHint: "Instagram misolida yozing: kontent frontend, saqlash backend, yuklash API.",
    requirementsList: [
      "Frontend nima — tushunildi",
      "Backend nima — tushunildi",
      "API nima — tushunildi",
      "HTTP status kodlari — yodlandi",
    ],
    homeworkTasks: [
      hw('setup-4', 1, {
        order: 1,
        title: 'Web tushunchalar testi',
        description: 'Asosiy web tushunchalarni bilasizmi?',
        type: 'quiz',
        difficulty: 'oson',
        xp: 40,
        questions: quiz('setup-4', 1, [
          {
            question: 'HTML, CSS, JavaScript qaysi tomonga tegishli?',
            options: ['Backend', 'Database', 'Frontend', 'Server'],
            correct: 2,
            explanation: "HTML, CSS, JS — frontend texnologiyalari, brauzerda ishlaydi.",
          },
          {
            question: 'HTTP 404 status kodi nimani anglatadi?',
            options: ['Server xatosi', 'Muvaffaqiyatli', 'Topilmadi', "Ruxsat yo'q"],
            correct: 2,
            explanation: "404 Not Found — so'ralgan resurs topilmadi.",
          },
          {
            question: 'API nima?',
            options: [
              'Brauzer turi',
              "Frontend va backend o'rtasidagi shartnoma/interfeys",
              'Database',
              'Hosting xizmati',
            ],
            correct: 1,
            explanation: "API (Application Programming Interface) — tizimlar o'rtasidagi muloqot qoidalari.",
          },
          {
            question: "Qaysi HTTP metodi yangi ma'lumot yaratish uchun ishlatiladi?",
            options: ['GET', 'DELETE', 'POST', 'PUT'],
            correct: 2,
            explanation: "POST — yangi resurs yaratish uchun. GET — o'qish, PUT — yangilash, DELETE — o'chirish.",
          },
        ]),
      }),
    ],
  },
];

// ─── MODULE 2: HTML ──────────────────────────────────────────────────────────

const htmlSeeds: LessonSeed[] = [
  {
    title: 'Birinchi HTML sahifa',
    duration: '55 daqiqa',
    description: 'DOCTYPE, html, head, body, meta va birinchi matnlar.',
    videoTitle: "HTML noldan — birinchi sahifa — Uzbek",
    videoQuery: 'HTML noldan birinchi sahifa DOCTYPE uzbek',
    difficulty: 'oson',
    theory: `HTML — HyperText Markup Language.
Sahifaning tuzilmasini belgilaydi.

Asosiy tuzilma:
- DOCTYPE html: brauzerga HTML5 ekanini bildiradi
- html lang="uz": bosh element, til belgilanadi
- head: ko'rinmaydigan sozlamalar
- meta charset="UTF-8": o'zbek harflari to'g'ri chiqishi uchun
- meta name="viewport": telefonda to'g'ri o'lcham uchun
- title: brauzer tabidagi nom
- body: foydalanuvchi ko'radigan kontent

Qoida: har sahifada faqat bitta h1 bo'lsin.`,
    codeExample: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mening birinchi sahifam</title>
</head>
<body>
  <h1>Salom, men Ali Valiyev!</h1>
  <p>Men hozir HTML o'rganayapman.</p>
  <p>Maqsadim: 3 oyda Junior Frontend Developer bo'lish.</p>
</body>
</html>`,
    task: "O'zingiz haqingizda HTML sahifa yarating: ism, shahar, maqsad.",
    taskHint: "Live Server bilan ochib ko'ring. Har saqlashda avtomatik yangilanadi.",
    requirementsList: [
      "DOCTYPE va html tegi to'g'ri yozildi",
      'meta charset va viewport bor',
      "title brauzerda ko'rinadi",
      'h1 va p teglar ishlatildi',
    ],
    homeworkTasks: [
      hw('html-1', 1, {
        order: 1,
        title: 'HTML tuzilma testi',
        description: 'Asosiy HTML teglarni bilasizmi?',
        type: 'quiz',
        difficulty: 'oson',
        xp: 30,
        questions: quiz('html-1', 1, [
          {
            question: "HTML sahifaning bosh elementi qaysi?",
            options: ['<head>', '<body>', '<html>', '<div>'],
            correct: 2,
            explanation: "<html> — barcha boshqa elementlarni o'rab turuvchi asosiy element.",
          },
          {
            question: "O'zbek harflari to'g'ri chiqishi uchun qaysi meta kerak?",
            options: [
              '<meta name="lang" content="uz">',
              '<meta charset="UTF-8">',
              '<meta lang="uzbek">',
              '<meta encoding="utf8">',
            ],
            correct: 1,
            explanation: "charset=\"UTF-8\" barcha tillar, jumladan o'zbek harflarini to'g'ri ko'rsatadi.",
          },
          {
            question: "Brauzer tabida ko'rinadigan nom qaysi tegda yoziladi?",
            options: ['<h1>', '<header>', '<title>', '<meta name="title">'],
            correct: 2,
            explanation: "<title> — brauzer tabida va qidiruv natijalarida ko'rinadigan nom.",
          },
        ]),
      }),
      hw('html-1', 2, {
        order: 2,
        title: 'HTML kod yozish',
        description: "To'g'ri HTML tuzilma yarating.",
        type: 'code',
        difficulty: 'oson',
        xp: 50,
        starterCode: `<!DOCTYPE html>
<html lang="uz">
<head>
  <!-- meta charset va viewport qo'shing -->
  <title>Mening sahifam</title>
</head>
<body>
  <!-- h1 da o'z ismingizni, p da shahringizni yozing -->
</body>
</html>`,
        expectedOutput: 'DOCTYPE, charset, viewport, h1, p mavjud',
      }),
    ],
  },

  {
    title: "Matn teglari va ro'yxatlar",
    duration: '55 daqiqa',
    description: "h1-h6, p, strong, em, ul, ol, li — matn formatlash.",
    videoTitle: "HTML matn teglari ro'yxatlar — Uzbek",
    videoQuery: 'HTML h1 p strong em ul ol li uzbek',
    difficulty: 'oson',
    theory: `Matn teglari:
- h1-h6: sarlavhalar (kattadan kichikka)
- p: paragraf (odatiy matn)
- strong: muhim qalin matn (semantic)
- b: faqat ko'rinishi uchun qalin
- em: urg'u berilgan kursiv (semantic)
- i: faqat kursiv
- br: yangi qator
- hr: gorizontal chiziq

Ro'yxatlar:
- ul (unordered list): tartibsiz ro'yxat (nuqtali)
- ol (ordered list): tartibli ro'yxat (raqamli)
- li (list item): ro'yxat elementi

Sarlavha tartibini buzish SEO va accessibility uchun yomon:
h1 -> h2 -> h3 (h1 dan h3 ga o'tib ketish xato)`,
    codeExample: `<h1>Frontend yo'l xaritam</h1>
<h2>O'rganadigan texnologiyalar</h2>

<ol>
  <li>
    <strong>HTML</strong> — sahifa tuzilmasi
    <ul>
      <li>Teglar va atributlar</li>
      <li>Formalar</li>
      <li>Semantik HTML</li>
    </ul>
  </li>
  <li><strong>CSS</strong> — dizayn va layout</li>
  <li><strong>JavaScript</strong> — interaktivlik</li>
</ol>

<p>Men <em>har kuni</em> kamida <strong>1 soat</strong> mashq qilaman.</p>`,
    task: "Haftalik o'qish rejangizni sarlavhalar va ro'yxatlar bilan yozing.",
    taskHint: "Dush-Yak-Chor-Pay-Jum uchun ol, har kun uchun ul ichida ul ishlating.",
    requirementsList: [
      "h1, h2 sarlavhalar to'g'ri tartibda",
      'ol va ul ishlatildi',
      'strong va em ishlatildi',
      "Ichma-ich (nested) ro'yxat bor",
    ],
    homeworkTasks: [
      hw('html-2', 1, {
        order: 1,
        title: 'Matn teglari testi',
        description: 'HTML matn teglarini bilasizmi?',
        type: 'quiz',
        difficulty: 'oson',
        xp: 30,
        questions: quiz('html-2', 1, [
          {
            question: '<strong> va <b> ning farqi nima?',
            options: [
              "Farqi yo'q, bir xil",
              "<strong> semantic (muhim matn), <b> faqat ko'rinish uchun",
              "<b> semantic, <strong> faqat ko'rinish",
              '<strong> katta, <b> kichik',
            ],
            correct: 1,
            explanation: '<strong> screen reader va SEO uchun muhimligini bildiradi. <b> faqat qalin qiladi.',
          },
          {
            question: "Raqamli tartibli ro'yxat uchun qaysi teg?",
            options: ['<ul>', '<list>', '<ol>', '<nl>'],
            correct: 2,
            explanation: "<ol> (ordered list) — 1, 2, 3... tartibida raqamli ro'yxat.",
          },
          {
            question: 'Qaysi sarlavha eng kichik?',
            options: ['<h1>', '<h3>', '<h5>', '<h6>'],
            correct: 3,
            explanation: 'h1 eng katta, h6 eng kichik sarlavha.',
          },
        ]),
      }),
    ],
  },

  {
    title: "Linklar, rasmlar va fayl yo'llari",
    duration: '60 daqiqa',
    description: "a, img, href, src, alt, relative va absolute path.",
    videoTitle: 'HTML linklar va rasmlar — Uzbek',
    videoQuery: 'HTML a img href src alt relative path uzbek',
    difficulty: 'oson',
    theory: `Linklar:
- href: manzil (URL yoki fayl yo'li)
- target="_blank": yangi tabda ochish
- rel="noopener": xavfsizlik uchun (target="_blank" bilan)
- mailto:email: email link
- tel:+998: telefon link
- #id: sahifa ichida o'tish (anchor)

Rasmlar:
- src: rasm manzili
- alt: rasm yuklanmasa ko'rinadigan matn (MAJBURIY)
- width, height: o'lcham
- loading="lazy": sahifa yuklanishini tezlashtiradi

Fayl yo'llari:
- /images/photo.jpg: sayt ildizidan
- ./images/photo.jpg: hozirgi papkadan
- ../images/photo.jpg: bir yuqori papkadan`,
    codeExample: `<!-- Tashqi link -->
<a href="https://github.com" target="_blank" rel="noopener">
  GitHub profilim
</a>

<!-- Sahifa ichida o'tish -->
<a href="#contact">Aloqa bo'limiga o'tish</a>

<!-- Email va telefon -->
<a href="mailto:ali@gmail.com">Email yuborish</a>
<a href="tel:+998901234567">Qo'ng'iroq qilish</a>

<!-- Rasm -->
<img
  src="./assets/images/profile.jpg"
  alt="Ali Valiyev — Frontend Developer"
  width="320"
  height="320"
  loading="lazy"
>`,
    task: "Portfolio sahifangizga: profil rasm, GitHub link, email link va sahifa ichida anchor link qo'shing.",
    taskHint: "alt matni tavsiflovchi bo'lsin: \"Ali profil rasmi\" emas, \"Ali Valiyev — Frontend Developer\".",
    requirementsList: [
      'img tegi alt bilan qo\'shildi',
      'Tashqi link target="_blank" bilan',
      'Email yoki telefon link bor',
      'Anchor link ishlaydi',
    ],
    homeworkTasks: [
      hw('html-3', 1, {
        order: 1,
        title: 'Linklar va rasmlar testi',
        description: 'HTML link va rasm atributlarini bilasizmi?',
        type: 'quiz',
        difficulty: 'oson',
        xp: 30,
        questions: quiz('html-3', 1, [
          {
            question: "Rasm yuklanmasa ko'rinadigan matnni qaysi atributda yoziladi?",
            options: ['title', 'src', 'alt', 'desc'],
            correct: 2,
            explanation: "alt — accessibility va SEO uchun majburiy. Rasm yuklanmasa bu matn ko'rinadi.",
          },
          {
            question: 'Yangi tabda ochish uchun qaysi atribut?',
            options: ['target="_new"', 'target="_blank"', 'open="new"', 'tab="blank"'],
            correct: 1,
            explanation: 'target="_blank" — yangi tabda ochadi. Xavfsizlik uchun rel="noopener" ham qo\'shing.',
          },
          {
            question: 'Email linkni qanday yozish kerak?',
            options: [
              '<a href="email:ali@gmail.com">',
              '<a href="mail:ali@gmail.com">',
              '<a href="mailto:ali@gmail.com">',
              '<a href="send:ali@gmail.com">',
            ],
            correct: 2,
            explanation: "mailto: protokoli email dasturini ochadi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Formalar va inputlar',
    duration: '70 daqiqa',
    description: "form, label, input, textarea, select, button — forma yaratish.",
    videoTitle: 'HTML forma va inputlar — Uzbek',
    videoQuery: 'HTML form input label textarea select uzbek',
    difficulty: 'orta',
    theory: `Forma foydalanuvchidan ma'lumot olish uchun.

Input turlari:
- text: oddiy matn
- email: email (avtomatik validatsiya)
- password: yashirin matn
- number: raqam
- tel: telefon
- url: web manzil
- checkbox: belgilash
- radio: bir tanlov
- date: sana
- file: fayl yuklash
- hidden: ko'rinmas qiymat
- submit: yuborish tugmasi

Muhim atributlar:
- for/id: label va input ni bog'laydi (MAJBURIY)
- required: majburiy maydon
- placeholder: hint matn
- minlength/maxlength: uzunlik chegarasi
- pattern: regex tekshiruv
- disabled: o'chirilgan
- readonly: faqat o'qish`,
    codeExample: `<form action="/api/register" method="POST" novalidate>

  <div class="form-group">
    <label for="fullname">Ism familiya *</label>
    <input
      type="text"
      id="fullname"
      name="fullname"
      placeholder="Ali Valiyev"
      required
      minlength="3"
      maxlength="50"
    >
  </div>

  <div class="form-group">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required>
  </div>

  <div class="form-group">
    <label for="level">Daraja</label>
    <select id="level" name="level">
      <option value="">Tanlang</option>
      <option value="beginner">Boshlang'ich</option>
      <option value="middle">O'rta</option>
    </select>
  </div>

  <div class="form-group">
    <label for="goal">Maqsad</label>
    <textarea id="goal" name="goal" rows="4" placeholder="3 oyda..."></textarea>
  </div>

  <button type="submit">Ro'yxatdan o'tish</button>
</form>`,
    task: "Kursga ro'yxatdan o'tish formasini yarating: ism, email, telefon, daraja (select), maqsad (textarea).",
    taskHint: "Har input uchun label qo'shing, for=\"id\" bilan bog'lang.",
    requirementsList: [
      '4 xil input turi ishlatildi',
      "Har input uchun label bor va bog'langan",
      'required atributi qo\'llanildi',
      'select va textarea bor',
    ],
    homeworkTasks: [
      hw('html-4', 1, {
        order: 1,
        title: 'Forma elementlari testi',
        description: 'HTML forma elementlarini bilasizmi?',
        type: 'quiz',
        difficulty: 'orta',
        xp: 40,
        questions: quiz('html-4', 1, [
          {
            question: "Label va inputni bog'lash uchun qaysi atributlar juft bo'lishi kerak?",
            options: ['name va id', 'for va id', 'label va input', 'class va id'],
            correct: 1,
            explanation: "label ning for atributi input ning id atributiga teng bo'lishi kerak.",
          },
          {
            question: 'Majburiy maydon uchun qaysi atribut?',
            options: ['mandatory', 'required', 'must', 'validate'],
            correct: 1,
            explanation: "required — forma yuborilganda bu maydon bo'sh bo'lmasligi kerakligini bildiradi.",
          },
          {
            question: 'Ko\'p qatorli matn kiritish uchun qaysi element?',
            options: ['<input type="multiline">', '<textbox>', '<textarea>', '<input type="text" rows="4">'],
            correct: 2,
            explanation: '<textarea rows="4"> — ko\'p qatorli matn maydoni.',
          },
          {
            question: 'Parol kiritish maydoni uchun qaysi input turi?',
            options: ['type="secret"', 'type="hidden"', 'type="secure"', 'type="password"'],
            correct: 3,
            explanation: 'type="password" — kiritilgan matnni yashiradi.',
          },
        ]),
      }),
    ],
  },

  {
    title: 'Semantik HTML va accessibility',
    duration: '65 daqiqa',
    description: "header, nav, main, section, article, aside, footer — ma'noli tuzilma.",
    videoTitle: 'Semantik HTML accessibility — Uzbek',
    videoQuery: 'semantik HTML header nav main section footer accessibility uzbek',
    difficulty: 'orta',
    theory: `Semantik HTML — ma'noli teglar bilan yozish.

Nima uchun muhim?
1. SEO: Google tuzilmani tushunadi
2. Accessibility: screen reader foydalanuvchilar uchun
3. Boshqa dasturchilar uchun o'qilishi oson
4. Kelajakda qo'llab-quvvatlash oson

Asosiy teglar:
- header: sahifa yoki bo'lim sarlavhasi
- nav: navigatsiya
- main: asosiy kontent (sahifada bitta)
- section: mantiqiy bo'lim
- article: mustaqil kontent (blog post, yangilik)
- aside: qo'shimcha kontent (sidebar)
- footer: pastki qism
- figure + figcaption: rasm va yozuvi
- time: vaqt va sana

Nima qilmaslik:
- Hamma narsani div qilish
- table ni layout uchun ishlatish
- Sarlavha tartibini buzish`,
    codeExample: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Ali Valiyev — Portfolio</title>
</head>
<body>

  <header>
    <a href="/" class="logo">AV</a>
    <nav aria-label="Asosiy navigatsiya">
      <a href="#about">Men haqimda</a>
      <a href="#projects">Loyihalar</a>
      <a href="#contact">Aloqa</a>
    </nav>
  </header>

  <main>
    <section id="about" aria-labelledby="about-title">
      <h1 id="about-title">Frontend Developer — Ali Valiyev</h1>
      <p>HTML, CSS va JavaScript bilan ishlayman.</p>
    </section>

    <section id="projects" aria-labelledby="projects-title">
      <h2 id="projects-title">Loyihalarim</h2>
      <article>
        <h3>Portfolio sayt</h3>
        <p>Birinchi shaxsiy portfolio saytim.</p>
        <a href="#">Ko'rish</a>
      </article>
    </section>
  </main>

  <footer>
    <p>&copy; <time datetime="2026">2026</time> Ali Valiyev</p>
  </footer>

</body>
</html>`,
    task: "Portfolio sahifangizni semantik HTML bilan qayta tuzing. div larni olib, semantik teglar qo'ying.",
    taskHint: "main sahifada bitta bo'lsin. nav ichida faqat navigatsiya bo'lsin.",
    requirementsList: [
      'header, nav, main, footer bor',
      'main sahifada bitta',
      'section lar aria-labelledby bilan',
      "div o'rniga to'g'ri teglar ishlatildi",
    ],
    homeworkTasks: [
      hw('html-5', 1, {
        order: 1,
        title: 'Semantik HTML testi',
        description: 'Semantik HTML teglarni bilasizmi?',
        type: 'quiz',
        difficulty: 'orta',
        xp: 40,
        questions: quiz('html-5', 1, [
          {
            question: "Sahifada asosiy kontentni o'rash uchun qaysi teg va qancha marta?",
            options: ["<div> — ko'p marta", "<main> — faqat bir marta", "<section> — bir marta", "<content> — bir marta"],
            correct: 1,
            explanation: "<main> sahifada faqat bir marta ishlatiladi va asosiy kontentni o'raydi.",
          },
          {
            question: 'Blog posti yoki yangilik uchun qaysi semantik teg?',
            options: ['<section>', '<div>', '<article>', '<post>'],
            correct: 2,
            explanation: "<article> — mustaqil, qayta ishlatilishi mumkin bo'lgan kontent uchun.",
          },
          {
            question: 'Navigatsiya uchun qaysi teg?',
            options: ['<menu>', '<nav>', '<ul>', '<links>'],
            correct: 1,
            explanation: '<nav> — asosiy navigatsiya linklari uchun semantik teg.',
          },
        ]),
      }),
    ],
  },
];

// ─── MODULE 3: CSS ───────────────────────────────────────────────────────────

const cssSeeds: LessonSeed[] = [
  {
    title: 'CSS ulash va selektorlar',
    duration: '60 daqiqa',
    description: 'External CSS, selektorlar, specificity va cascade.',
    videoTitle: "CSS noldan — selektorlar va ulash — Uzbek",
    videoQuery: 'CSS noldan selektorlar class id specificity uzbek',
    difficulty: 'oson',
    theory: `CSS HTML ni bezaydi.

Ulash usullari (yaxshidan yomonga):
1. External: link rel="stylesheet" href="style.css" (ENG YAXSHI)
2. Internal: style tegi ichida
3. Inline: style="color:red" (FAQAT test uchun)

Selektorlar:
- element: p { }
- class: .card { }
- id: #hero { }
- attribute: input[type="email"] { }
- pseudo-class: a:hover { }
- pseudo-element: p::first-line { }
- combinator: .nav a { }

Specificity (kuch tartibi):
inline > #id > .class > element

Cascade: bir xil specificity da oxirgi yozilgan qoida ishlaydi.`,
    codeExample: `/* Reset va asosiy sozlamalar */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* CSS o'zgaruvchilari */
:root {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-primary: #22c55e;
  --color-accent: #7c3aed;
  --font-main: 'Segoe UI', system-ui, sans-serif;
  --radius: 8px;
  --shadow: 0 4px 24px rgba(0,0,0,0.3);
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-main);
  line-height: 1.6;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: var(--color-primary);
  color: #052e16;
}

.btn-primary:hover {
  background: #16a34a;
  transform: translateY(-2px);
}`,
    task: "Portfolio uchun style.css fayl yarating, CSS o'zgaruvchilarini aniqlang va asosiy stillari yozing.",
    taskHint: ":root da ranglar, shrift, radius ni aniqlang. Keyin componentlarda var() orqali ishlating.",
    requirementsList: [
      'External CSS ulandi',
      ':root da CSS variables aniqlandi',
      'body asosiy stillari yozildi',
      '.container classi bor',
    ],
    homeworkTasks: [
      hw('css-1', 1, {
        order: 1,
        title: 'CSS selektorlar testi',
        description: "CSS selektorlar va specificity ni bilasizmi?",
        type: 'quiz',
        difficulty: 'oson',
        xp: 35,
        questions: quiz('css-1', 1, [
          {
            question: 'Qaysi selektor kuchliroq (higher specificity)?',
            options: ['p', '.text', '#title', 'body p'],
            correct: 2,
            explanation: '#id selektori eng kuchli: 0,1,0,0. Class: 0,0,1,0. Element: 0,0,0,1.',
          },
          {
            question: "CSS o'zgaruvchisini qanday e'lon qilinadi?",
            options: ['$color: red', '--color: red', 'var-color: red', '@color: red'],
            correct: 1,
            explanation: "CSS custom properties -- (ikki defis) bilan boshlanadi: --color-primary: #22c55e",
          },
          {
            question: 'Hover effekti uchun qaysi pseudo-class?',
            options: [':focus', ':active', ':hover', ':visited'],
            correct: 2,
            explanation: ':hover — sichqoncha element ustida turganda ishlaydi.',
          },
          {
            question: "CSS o'zgaruvchisini qanday ishlatiladi?",
            options: ['$(--color)', 'var(--color)', '@color', '$color'],
            correct: 1,
            explanation: "var(--color-primary) — CSS o'zgaruvchisini ishlatish sintaksisi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Box model, spacing va typography',
    duration: '65 daqiqa',
    description: 'margin, padding, border, box-sizing, font, line-height.',
    videoTitle: 'CSS box model va typography — Uzbek',
    videoQuery: 'CSS box model margin padding border typography uzbek',
    difficulty: 'oson',
    theory: `Box model:
Har element = content + padding + border + margin

box-sizing: border-box — padding va border width ichiga kiradi.
Bu qoida har loyihada birinchi yozilishi kerak.

Spacing:
- margin: element tashqarisi
- padding: element ichkarisi
- gap: flex/grid elementlar orasidagi bo'shliq (margin dan yaxshi)

Typography:
- font-family: shrift
- font-size: o'lcham (rem dan foydalaning, px emas)
- font-weight: qalinlik (400 normal, 700 bold)
- line-height: qatorlar orasidagi bo'shliq (1.5-1.8)
- letter-spacing: harflar orasidagi bo'shliq
- text-transform: uppercase/lowercase/capitalize

rem vs px:
- 1rem = 16px (brauzer default)
- rem accessibility uchun yaxshiroq`,
    codeExample: `/* Box model reset */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Typography tizimi */
:root {
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  1.875rem;  /* 30px */
  --text-4xl:  2.25rem;   /* 36px */
}

.card {
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius);
}

h1 { font-size: var(--text-4xl); line-height: 1.2; }
h2 { font-size: var(--text-3xl); line-height: 1.3; }
p  { font-size: var(--text-base); line-height: 1.7; }`,
    task: "3 ta loyiha kartasini box model va to'g'ri spacing bilan yarating.",
    taskHint: "Barcha kartalar bir xil padding: 24px. margin o'rniga gap ishlatib ko'ring.",
    requirementsList: [
      'box-sizing: border-box qo\'llanildi',
      'Typography tizimi yaratildi',
      '3 ta karta bir xil spacing bilan',
      'rem ishlatildi, px emas',
    ],
    homeworkTasks: [
      hw('css-2', 1, {
        order: 1,
        title: 'Box model testi',
        description: "CSS box model ni bilasizmi?",
        type: 'quiz',
        difficulty: 'oson',
        xp: 35,
        questions: quiz('css-2', 1, [
          {
            question: 'box-sizing: border-box nima qiladi?',
            options: [
              "Box ga border qo'shadi",
              'Padding va border ni width ichiga kiritadi',
              "Margin ni o'chiradi",
              'Box ni kichraytiradi',
            ],
            correct: 1,
            explanation: 'border-box: width = content + padding + border. Shunda width 300px bo\'lsa, padding qo\'shilsa ham 300px qoladi.',
          },
          {
            question: "Element ichki bo'shlig'i uchun qaysi xossa?",
            options: ['margin', 'border', 'padding', 'spacing'],
            correct: 2,
            explanation: "padding — element chegarasi ichidagi bo'shliq. margin — tashqarisidagi.",
          },
          {
            question: '1rem nechi px ga teng (default)?',
            options: ['8px', '10px', '16px', '20px'],
            correct: 2,
            explanation: "Brauzer default: 1rem = 16px. Foydalanuvchi bu ni o'zgartira oladi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Flexbox — navbar, kartalar, layout',
    duration: '75 daqiqa',
    description: 'display:flex, justify-content, align-items, gap, flex-wrap.',
    videoTitle: "CSS Flexbox to'liq qo'llanma — Uzbek",
    videoQuery: 'CSS Flexbox justify-content align-items gap uzbek',
    difficulty: 'orta',
    theory: `Flexbox — bir o'qli (1D) layout tizimi.

Container xossalari:
- display: flex — flexboxni yoqish
- flex-direction: row | column — yo'nalish
- justify-content: flex-start | center | flex-end | space-between | space-around
- align-items: stretch | center | flex-start | flex-end | baseline
- flex-wrap: nowrap | wrap | wrap-reverse
- gap: elementlar orasidagi bo'shliq

Item xossalari:
- flex: 1 — bo'sh joyni teng bo'lish
- flex-grow: 1 — o'sish
- flex-shrink: 0 — siqilmaslik
- flex-basis: 250px — minimal kenglik
- align-self: center — faqat bir element uchun

Qachon Flexbox:
- Navbar (horizontal)
- Tugmalar qatori
- Karta juftlari
- Element markazlash`,
    codeExample: `/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 24px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
}

/* Kartalar qatori */
.cards-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.card {
  flex: 1 1 280px;
}

/* Markazlash */
.center-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}`,
    task: "Navbarni Flexbox bilan qiling: logo chapda, linklar o'ngda. Projects kartalarini flex bilan tizimli qiling.",
    taskHint: "justify-content: space-between navbar uchun. flex: 1 1 280px kartalar uchun.",
    requirementsList: [
      'Navbar Flexbox bilan ishlaydi',
      'Kartalar flex-wrap bilan joylashdi',
      "gap ishlatildi margin o'rniga",
      'align-items ishlatildi',
    ],
    homeworkTasks: [
      hw('css-3', 1, {
        order: 1,
        title: 'Flexbox testi',
        description: "CSS Flexbox ni bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 40,
        questions: quiz('css-3', 1, [
          {
            question: 'Flex container da elementlarni vertikal markazlash uchun?',
            options: ['justify-content: center', 'align-items: center', 'vertical-align: center', 'text-align: center'],
            correct: 1,
            explanation: 'align-items: center — cross axis (vertikal, agar direction: row bo\'lsa) bo\'yicha markazlaydi.',
          },
          {
            question: "Logo chapda, nav o'ngda bo'lishi uchun qaysi qiymat?",
            options: ['align-items: space-between', 'justify-content: space-between', 'display: flex-between', 'flex: space-between'],
            correct: 1,
            explanation: 'justify-content: space-between — birinchi element boshida, oxirgisi oxirida, qolganlar teng taqsimlanadi.',
          },
          {
            question: 'flex: 1 nima degani?',
            options: ['flex-basis: 1px', 'flex-grow: 1, flex-shrink: 1, flex-basis: 0', 'Bitta element', 'margin: 1px'],
            correct: 1,
            explanation: "flex: 1 = flex-grow:1, flex-shrink:1, flex-basis:0. Element bo'sh joyni teng bo'ladi.",
          },
        ]),
      }),
    ],
  },

  {
    title: "CSS Grid — sahifa layout",
    duration: '70 daqiqa',
    description: "grid-template-columns, minmax, auto-fit, grid areas.",
    videoTitle: "CSS Grid to'liq qo'llanma — Uzbek",
    videoQuery: 'CSS Grid template columns minmax auto-fit uzbek',
    difficulty: 'orta',
    theory: `Grid — ikki o'qli (2D) layout tizimi.

Container xossalari:
- display: grid
- grid-template-columns: ustunlarni aniqlash
- grid-template-rows: qatorlarni aniqlash
- gap / column-gap / row-gap
- grid-template-areas: vizual layout

Item xossalari:
- grid-column: 1 / 3 — ustunlarni egallash
- grid-row: 1 / 2 — qatorlarni egallash

Foydali texnikalar:
- repeat(3, 1fr) — 3 ta teng ustun
- repeat(auto-fit, minmax(250px, 1fr)) — responsive grid
- minmax(min, max) — minimal va maksimal o'lcham

Qachon Grid:
- Sahifa umumiy tuzilmasi
- Galereya
- Dashboard
- Ko'p ustunli kontent`,
    codeExample: `/* Asosiy sahifa layout */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 280px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 0;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

/* Responsive projects grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Skills grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}`,
    task: "Projects bo'limini CSS Grid bilan responsive qiling. Skills bo'limini ham grid bilan tuzing.",
    taskHint: "auto-fit va minmax(280px, 1fr) o'z-o'zidan responsive bo'ladi.",
    requirementsList: [
      'Projects grid auto-fit ishlatadi',
      'Skills grid bor',
      'gap ishlatildi',
      'grid-template-areas ishlatildi',
    ],
    homeworkTasks: [
      hw('css-4', 1, {
        order: 1,
        title: 'CSS Grid testi',
        description: "CSS Grid ni bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 40,
        questions: quiz('css-4', 1, [
          {
            question: 'Responsive grid uchun qaysi texnika ishlatiladi?',
            options: [
              'grid-template-columns: 1fr 1fr 1fr',
              'repeat(auto-fit, minmax(250px, 1fr))',
              'display: flex; flex-wrap: wrap',
              'grid-columns: responsive',
            ],
            correct: 1,
            explanation: "auto-fit + minmax — ekran kengligiga qarab ustunlar soni o'zgaradi. Responsive.",
          },
          {
            question: '3 ta teng kenglikdagi ustun yaratish uchun?',
            options: ['grid: 3 columns', 'grid-template-columns: repeat(3, 1fr)', 'columns: 3', 'grid-columns: 3'],
            correct: 1,
            explanation: 'repeat(3, 1fr) = 1fr 1fr 1fr. 3 ta teng kenglikdagi ustun.',
          },
        ]),
      }),
    ],
  },

  {
    title: 'Responsive design va media query',
    duration: '75 daqiqa',
    description: "Mobile-first, breakpointlar, media query, responsive tipografiya.",
    videoTitle: 'Responsive design media query — Uzbek',
    videoQuery: 'responsive design mobile-first media query breakpoint uzbek',
    difficulty: 'orta',
    theory: `Responsive — har ekranda yaxshi ko'rinish.

Mobile-first yondashuvi:
1. Avval mobil dizayn yozing (kichik ekran)
2. Keyin min-width bilan katta ekranlar uchun qo'shing

Breakpointlar (mashhur):
- 640px: kichik telefon -> katta telefon
- 768px: telefon -> planshet
- 1024px: planshet -> noutbuk
- 1280px: noutbuk -> katta ekran
- 1536px: katta monitor

Media query sintaksisi:
@media (min-width: 768px) — mobil first
@media (max-width: 767px) — desktop first

Nima tekshirish kerak:
- Matn chiqib ketmasin
- Rasm buzilmasin
- Tugmalar 44px dan kichik bo'lmasin (touch target)
- Horizontal scroll bo'lmasin`,
    codeExample: `/* Mobile first */
.hero {
  padding: 48px 16px;
  text-align: center;
}

.hero h1 {
  font-size: 2rem;
}

/* Planshet va undan katta */
@media (min-width: 768px) {
  .hero {
    padding: 80px 32px;
    text-align: left;
  }
  .hero h1 {
    font-size: 3rem;
  }
}

/* Katta ekran */
@media (min-width: 1024px) {
  .hero {
    padding: 120px 48px;
  }
  .hero h1 {
    font-size: 4rem;
  }
}

/* Responsive navigatsiya */
.nav-links {
  display: none;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
  .hamburger {
    display: none;
  }
}`,
    task: "Portfolio sahifangizni mobil va desktop uchun responsive qiling. DevTools da tekshiring.",
    taskHint: "Avval 390px (iPhone 14) da tekshiring, keyin 768px, keyin 1280px.",
    requirementsList: [
      'Mobile-first CSS yozildi',
      'Kamida 2 ta breakpoint bor',
      'DevTools da 390px da tekshirildi',
      "Horizontal scroll yo'q",
    ],
    homeworkTasks: [
      hw('css-5', 1, {
        order: 1,
        title: 'Responsive design testi',
        description: "Media query va responsive dizaynni bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 40,
        questions: quiz('css-5', 1, [
          {
            question: "Mobile-first yondashuvida qaysi media query ishlatiladi?",
            options: ['@media (max-width: 768px)', '@media (min-width: 768px)', '@media screen', '@media mobile'],
            correct: 1,
            explanation: "min-width — \"shu kenglikdan KATTA bo'lsa\" degan ma'no. Avval kichik ekran yoziladi.",
          },
          {
            question: "Touch target (tugma) minimal o'lchami qancha bo'lishi kerak?",
            options: ['24px', '32px', '44px', '56px'],
            correct: 2,
            explanation: "Apple va Google qo'llanmasi: 44x44px minimum. Kichikroq bo'lsa bosish qiyin.",
          },
        ]),
      }),
    ],
  },
];

// ─── MODULE 4: JAVASCRIPT ────────────────────────────────────────────────────

const jsSeeds: LessonSeed[] = [
  {
    title: "O'zgaruvchilar va data turlari",
    duration: '70 daqiqa',
    description: "const, let, string, number, boolean, array, object, null, undefined.",
    videoTitle: "JavaScript noldan — o'zgaruvchilar — Uzbek",
    videoQuery: 'JavaScript noldan ozgaruvchilar const let data types uzbek',
    difficulty: 'oson',
    theory: `JavaScript sahifani interaktiv qiladi.

O'zgaruvchilar:
- const: qiymat o'zgarmasa (birinchi tanlov)
- let: qiymat o'zgarsa
- var: ISHLATMANG (scope muammolari bor)

Data turlari — Primitiv:
- string: "matn" yoki 'matn' yoki template literal
- number: 42, 3.14, -7
- boolean: true, false
- null: qasddan bo'sh
- undefined: qiymat berilmagan
- symbol: noyob kalit

Murakkab:
- array: [1, 2, 3]
- object: { key: value }

typeof operatori:
- typeof "salom"  => "string"
- typeof 42       => "number"
- typeof []       => "object" (!)
- typeof null     => "object" (!)`,
    codeExample: `// To'g'ri
const ism = 'Ali Valiyev';
const yosh = 22;
const faol = true;
let bal = 0;

// Array
const texnologiyalar = ['HTML', 'CSS', 'JavaScript', 'Git'];

// Object
const dasturchi = {
  ism: 'Ali',
  yosh: 22,
  shahar: 'Toshkent',
  ko_nikmalar: ['HTML', 'CSS', 'JS'],
  ish: null,
  tajriba: undefined
};

// Template literals
const xabar = "Salom, men " + dasturchi.ism + ", " + dasturchi.yosh + " yoshdaman.";
console.log(xabar);

// Destructuring
const { ism: devIsm, shahar } = dasturchi;
const [birinchi, ikkinchi] = texnologiyalar;

console.log(devIsm, shahar);
console.log(birinchi);`,
    task: "O'zingiz haqingizda object yarating: ism, yosh, shahar, ko'nikmalar (array), maqsad. console.log qiling.",
    taskHint: "Object ichida array bo'lishi mumkin: ko_nikmalar: ['HTML', 'CSS']",
    requirementsList: [
      "const va let to'g'ri ishlatildi",
      'Object yaratildi',
      'Array object ichida bor',
      'console.log qilindi',
    ],
    homeworkTasks: [
      hw('js-1', 1, {
        order: 1,
        title: 'JS data turlari testi',
        description: 'JavaScript data turlarini bilasizmi?',
        type: 'quiz',
        difficulty: 'oson',
        xp: 35,
        questions: quiz('js-1', 1, [
          {
            question: "Qiymat o'zgarmaydigan o'zgaruvchi uchun qaysi kalit so'z?",
            options: ['var', 'let', 'const', 'fixed'],
            correct: 2,
            explanation: "const — constant, qiymatini qayta belgilab bo'lmaydi. Birinchi tanlov.",
          },
          {
            question: 'typeof [] nima qaytaradi?',
            options: ['"array"', '"list"', '"object"', '"undefined"'],
            correct: 2,
            explanation: "typeof [] === \"object\". Array ham object hisoblanadi. Array ni tekshirish uchun Array.isArray() ishlatiladi.",
          },
          {
            question: "Qaysi ikki qiymat \"bo'sh\" ma'nosini bildiradi?",
            options: ['false va 0', 'null va undefined', 'empty va void', '"" va null'],
            correct: 1,
            explanation: "null — qasddan bo'sh qiymat. undefined — qiymat berilmagan.",
          },
          {
            question: 'Template literal uchun qaysi belgi?',
            options: ['"matn"', "'matn'", 'backtick (`) bilan', '/matn/'],
            correct: 2,
            explanation: "Template literal backtick (`) bilan yoziladi. ${ozgaruvchi} bilan qiymat qo'shiladi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Funksiyalar va arrow functions',
    duration: '75 daqiqa',
    description: 'function, arrow function, parametrlar, return, scope, callback.',
    videoTitle: 'JavaScript funksiyalar arrow function — Uzbek',
    videoQuery: 'JavaScript funksiyalar arrow function scope callback uzbek',
    difficulty: 'orta',
    theory: `Funksiya — qayta ishlatiladigan kod bloki.

Funksiya turlari:
1. Function declaration:
   function salom(ism) { return "Salom " + ism; }

2. Function expression:
   const salom = function(ism) { return "Salom " + ism; }

3. Arrow function (zamonaviy):
   const salom = (ism) => "Salom " + ism;
   const qosh = (a, b) => a + b;

Clean code qoidalari:
- Funksiya bitta ish qilsin
- Nomi aniq bo'lsin: getUserById, calculateTotal
- 15-20 qatordan uzun bo'lmasin
- Parametrlar 3 tadan oshmasin
- Har doim return qiymatini aniqlang

Default parametrlar:
const salom = (ism = "Mehmon") => "Salom, " + ism + "!";`,
    codeExample: `// Oddiy funksiyalar
const greet = (name, lang = 'uz') => {
  const greetings = { uz: 'Salom', en: 'Hello', ru: 'Privet' };
  return (greetings[lang] || 'Salom') + ', ' + name + '!';
};

// Hisoblash funksiyalari
const calculateDiscount = (price, percent) => {
  const discount = (price * percent) / 100;
  return { original: price, discount, final: price - discount };
};

// Array funksiyalari
const filterByLevel = (students, level) =>
  students.filter(s => s.level === level);

const getTotalXP = (students) =>
  students.reduce((sum, s) => sum + s.xp, 0);

// Callback
const processData = (data, callback) => {
  const result = data.map(item => item * 2);
  callback(result);
};

// Ishlatish
console.log(greet('Ali'));
console.log(greet('John', 'en'));
console.log(calculateDiscount(100000, 20));`,
    task: "formatName, calculateAge, findMax, filterActive — 4 ta funksiya yozing va sinang.",
    taskHint: "findMax uchun: Math.max(...array) yoki array.reduce() ishlatishingiz mumkin.",
    requirementsList: [
      'Arrow function ishlatildi',
      'Default parametr bor',
      'Kamida 4 ta funksiya yozildi',
      "Har funksiya console.log bilan sinaldi",
    ],
    homeworkTasks: [
      hw('js-2', 1, {
        order: 1,
        title: 'Funksiyalar testi',
        description: "JavaScript funksiyalarni bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 40,
        questions: quiz('js-2', 1, [
          {
            question: "Arrow function to'g'ri sintaksisi?",
            options: [
              'function => (x) { return x * 2 }',
              'const double = (x) => x * 2',
              'const double = x -> x * 2',
              'arrow double(x) { x * 2 }',
            ],
            correct: 1,
            explanation: "const fn = (params) => expression yoki const fn = (params) => { return ...; }",
          },
          {
            question: 'Default parametr qanday yoziladi?',
            options: [
              'function f(x = default 10)',
              'function f(x || 10)',
              'function f(x = 10)',
              'function f(x: 10)',
            ],
            correct: 2,
            explanation: "f(x = 10) — agar x berilmasa, 10 qiymat olinadi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Array metodlari',
    duration: '80 daqiqa',
    description: 'map, filter, reduce, find, some, every, forEach, sort.',
    videoTitle: 'JavaScript array metodlari — Uzbek',
    videoQuery: 'JavaScript array map filter reduce find uzbek',
    difficulty: 'orta',
    theory: `Array metodlari — zamonaviy JS ning asosi.

Eng muhim metodlar:
- .map(fn): har element uchun yangi array qaytaradi
- .filter(fn): shartni qanoatlantirgan elementlar
- .reduce(fn, initial): arraydan bitta qiymat
- .find(fn): birinchi mos element
- .findIndex(fn): birinchi mos element indeksi
- .some(fn): hech bo'lmasa bitta mos bo'lsa true
- .every(fn): hammasining mos bo'lsa true
- .forEach(fn): har element uchun (qaytarisiz)
- .sort(fn): tartiblash
- .includes(val): element bormi
- .flat(): ichma-ich arrayni tekislash

Chaining (zanjirlash):
products
  .filter(p => p.active)
  .map(p => p.name)
  .sort()`,
    codeExample: `const students = [
  { id: 1, name: 'Ali',   xp: 850,  level: 'middle', active: true },
  { id: 2, name: 'Vali',  xp: 1200, level: 'senior', active: true },
  { id: 3, name: 'Soli',  xp: 300,  level: 'junior', active: false },
  { id: 4, name: 'Kamol', xp: 650,  level: 'junior', active: true },
];

// map: faqat ismlar
const names = students.map(s => s.name);

// filter: faqat faol juniorlar
const activeJuniors = students
  .filter(s => s.active && s.level === 'junior');

// reduce: umumiy XP
const totalXP = students.reduce((sum, s) => sum + s.xp, 0);

// find: birinchi senior
const firstSenior = students.find(s => s.level === 'senior');

// sort: XP bo'yicha kamayish tartibida
const byXP = [...students].sort((a, b) => b.xp - a.xp);

// chaining
const topNames = students
  .filter(s => s.active)
  .sort((a, b) => b.xp - a.xp)
  .slice(0, 3)
  .map(s => s.name + ': ' + s.xp + ' XP');

console.log(totalXP, topNames);`,
    task: "Products array yarating (nom, narx, kategoriya, faol). map, filter, reduce, sort bilan 5 ta topshiriq bajaring.",
    taskHint: "Spread operator [...array] bilan nusxa olib sort qiling, asl arrayni o'zgartirmang.",
    requirementsList: [
      'map ishlatildi',
      'filter ishlatildi',
      'reduce ishlatildi',
      'sort + find ishlatildi',
    ],
    homeworkTasks: [
      hw('js-3', 1, {
        order: 1,
        title: 'Array metodlar testi',
        description: "JavaScript array metodlarini bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 45,
        questions: quiz('js-3', 1, [
          {
            question: '.map() nima qaytaradi?',
            options: [
              'Hech narsa',
              'Bir qiymat',
              "Asl array o'zgartirilgan holda",
              'Yangi array',
            ],
            correct: 3,
            explanation: ".map() — har element uchun funksiya chaqirib, YANGI array qaytaradi. Asl o'zgarmaydi.",
          },
          {
            question: "Array dan bitta qiymat (masalan, yig'indi) olish uchun?",
            options: ['.map()', '.filter()', '.reduce()', '.find()'],
            correct: 2,
            explanation: ".reduce() — array ni bitta qiymatga \"qisqartiradi\": yig'indi, maksimum, object va b.",
          },
          {
            question: '.filter() va .find() farqi?',
            options: [
              "Farqi yo'q",
              '.filter() birinchi mos, .find() hammasi',
              '.filter() massiv qaytaradi, .find() birinchi mos elementni',
              '.find() tezroq',
            ],
            correct: 2,
            explanation: ".filter() — barcha mos elementlarni array sifatida. .find() — birinchi mos elementni yoki undefined.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'DOM bilan ishlash',
    duration: '80 daqiqa',
    description: 'querySelector, textContent, classList, createElement, addEventListener.',
    videoTitle: 'JavaScript DOM manipulyatsiya — Uzbek',
    videoQuery: 'JavaScript DOM querySelector createElement classList uzbek',
    difficulty: 'orta',
    theory: `DOM — Document Object Model.
HTML ning JavaScript dagi vakolatxonasi.

Elementlarni topish:
- document.querySelector('.class'): bitta element
- document.querySelectorAll('.class'): NodeList
- document.getElementById('id'): id bilan
- element.closest('.parent'): ota elementni topish

Kontent o'zgartirish:
- element.textContent = 'matn': faqat matn
- element.innerHTML = '<b>HTML</b>': HTML (XSS xavfi!)
- element.value: input qiymati

Klasslar:
- element.classList.add('active')
- element.classList.remove('active')
- element.classList.toggle('active')
- element.classList.contains('active')

Yaratish va qo'shish:
- document.createElement('div')
- parent.appendChild(child)
- parent.prepend(child)
- element.remove()`,
    codeExample: `// Elementlarni topish
const title = document.querySelector('#hero-title');
const cards = document.querySelectorAll('.project-card');

// O'zgartirish
title.textContent = 'Yangi sarlavha';
title.classList.add('highlighted');

// Dinamik karta yaratish
function createProjectCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.id = project.id;

  const h3 = document.createElement('h3');
  h3.textContent = project.title;
  card.appendChild(h3);

  const p = document.createElement('p');
  p.textContent = project.description;
  card.appendChild(p);

  return card;
}

// Ro'yxatni render qilish
const projects = [
  { id: 1, title: 'Portfolio', description: 'Shaxsiy portfolio sayt' },
  { id: 2, title: 'Todo App', description: 'Vazifalar ilovasi' },
];

const container = document.querySelector('.projects-grid');
projects.forEach(p => container.appendChild(createProjectCard(p)));`,
    task: "Projects ma'lumotlarini JS array dan olib DOM da render qiling. createElement bilan qiling.",
    taskHint: "innerHTML o'rniga createElement + textContent ishlatishga harakat qiling (XSS dan himoya).",
    requirementsList: [
      'querySelector ishlatilib element topildi',
      'createElement bilan element yaratildi',
      'Array dan DOM render qilindi',
      'classList ishlatildi',
    ],
    homeworkTasks: [
      hw('js-4', 1, {
        order: 1,
        title: 'DOM testi',
        description: "JavaScript DOM ni bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 45,
        questions: quiz('js-4', 1, [
          {
            question: 'Bitta elementni class bilan topish uchun?',
            options: [
              'document.getElement(".card")',
              'document.querySelector(".card")',
              'document.find(".card")',
              'document.select(".card")',
            ],
            correct: 1,
            explanation: 'querySelector CSS selektor sintaksisini ishlatadi: ".class", "#id", "tag".',
          },
          {
            question: "Faqat matnni (HTML siz) o'zgartirish uchun?",
            options: ['innerHTML', 'innerText', 'textContent', 'content'],
            correct: 2,
            explanation: "textContent — faqat matn, HTML siz. innerHTML HTML ni ham qabul qiladi (XSS xavfi).",
          },
          {
            question: 'classList.toggle() nima qiladi?',
            options: [
              'Klassni ochadi',
              'Klassni yopadi',
              "Klass bo'lsa olib tashlaydi, bo'lmasa qo'shadi",
              "Barcha klasslarni o'chiradi",
            ],
            correct: 2,
            explanation: "toggle() — almashtirib turadi. Dark mode, hamburger menu kabi joylarda qulay.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Fetch API va async/await',
    duration: '85 daqiqa',
    description: "fetch, Promise, async/await, try/catch, loading/error holatlar.",
    videoTitle: 'JavaScript Fetch API async await — Uzbek',
    videoQuery: 'JavaScript fetch API async await promise uzbek',
    difficulty: 'qiyin',
    theory: `Fetch API — server bilan asinxron muloqot.

Promise holatlari:
- Pending: kutilmoqda
- Fulfilled: muvaffaqiyatli
- Rejected: xato

async/await — Promise ni osonroq yozish:
async function getData() {
  const res = await fetch('/api/data');
  const json = await res.json();
  return json;
}

try/catch — xatolarni ushlash:
try {
  const data = await getData();
} catch (error) {
  console.error(error);
}

Har so'rovda 3 holat bo'lishi kerak:
1. Loading: ma'lumot yuklanmoqda
2. Success: ma'lumot ko'rsatish
3. Error: xato xabari`,
    codeExample: `// Asosiy fetch funksiyasi
async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'HTTP ' + response.status);
  }

  return response.json();
}

// GET so'rov
async function loadPosts() {
  const loading = document.querySelector('.loading');
  const container = document.querySelector('.posts');
  const errorEl = document.querySelector('.error');

  loading.hidden = false;
  errorEl.hidden = true;

  try {
    const posts = await apiFetch(
      'https://jsonplaceholder.typicode.com/posts?_limit=6'
    );

    container.innerHTML = '';
    posts.forEach(p => {
      const article = document.createElement('article');
      const h3 = document.createElement('h3');
      h3.textContent = p.title;
      const desc = document.createElement('p');
      desc.textContent = p.body;
      article.appendChild(h3);
      article.appendChild(desc);
      container.appendChild(article);
    });
  } catch (err) {
    errorEl.textContent = "Ma'lumot yuklanmadi: " + err.message;
    errorEl.hidden = false;
  } finally {
    loading.hidden = true;
  }
}

loadPosts();`,
    task: "JSONPlaceholder dan postlarni fetch qiling. Loading, success va error holatlarini ko'rsating.",
    taskHint: "https://jsonplaceholder.typicode.com/posts?_limit=6 manzilidan foydalaning.",
    requirementsList: [
      'async/await ishlatildi',
      'try/catch bor',
      'Loading holati bor',
      "Error holati ko'rsatiladi",
    ],
    homeworkTasks: [
      hw('js-5', 1, {
        order: 1,
        title: 'Fetch API testi',
        description: "JavaScript Fetch va async/await ni bilasizmi?",
        type: 'quiz',
        difficulty: 'qiyin',
        xp: 50,
        questions: quiz('js-5', 1, [
          {
            question: 'async funksiya nima qaytaradi?',
            options: ['undefined', 'Oddiy qiymat', 'Promise', 'Callback'],
            correct: 2,
            explanation: "async funksiya har doim Promise qaytaradi. await bilan kutish mumkin.",
          },
          {
            question: 'fetch() dan JSON olish uchun qanday?',
            options: [
              'fetch(url).getJSON()',
              'await (await fetch(url)).json()',
              'fetch(url).toJSON()',
              'JSON.parse(fetch(url))',
            ],
            correct: 1,
            explanation: "Ikki qadam: 1) await fetch(url) — Response olish, 2) await response.json() — JSON parse.",
          },
          {
            question: 'fetch() xatosini ushlash uchun?',
            options: ['if/else', 'try/catch', '.onError()', '.catch() faqat'],
            correct: 1,
            explanation: "try/catch async/await bilan ishlaydi. .catch() chaining bilan ham bo'ladi.",
          },
        ]),
      }),
    ],
  },
];

// ─── MODULE 5: BACKEND ───────────────────────────────────────────────────────

const backendSeeds: LessonSeed[] = [
  {
    title: "Node.js va HTTP server",
    duration: '70 daqiqa',
    description: "Node.js o'rnatish, npm, birinchi HTTP server, routing.",
    videoTitle: 'Node.js noldan HTTP server — Uzbek',
    videoQuery: 'Node.js noldan HTTP server npm uzbek',
    difficulty: 'orta',
    theory: `Node.js — JavaScript ni serverda ishlatish imkonini beradi.

Nima uchun Node.js?
- JavaScript ni allaqachon bilasiz
- Katta jamoa va ekotizim (npm)
- Tez va yengil (non-blocking I/O)
- Real-time ilovalar uchun yaxshi

npm (Node Package Manager):
- npm init: yangi loyiha
- npm install express: paket o'rnatish
- npm run start: skriptni ishlatish
- package.json: loyiha konfiguratsiyasi

HTTP server asosi:
- Request: mijozdan kelgan so'rov
- Response: serverdan qaytgan javob
- Routing: URL ga qarab handler tanlash`,
    codeExample: `// server/index.js
const http = require('http');
const url = require('url');

const PORT = 3000;

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (pathname === '/api/health' && method === 'GET') {
    return sendJSON(res, 200, { status: 'ok', time: new Date() });
  }

  if (pathname === '/api/lessons' && method === 'GET') {
    return sendJSON(res, 200, { lessons: [] });
  }

  sendJSON(res, 404, { error: 'Endpoint topilmadi' });
});

server.listen(PORT, () => {
  console.log('Server http://localhost:' + PORT + ' da ishlayapti');
});`,
    task: "Node.js serverni ishga tushiring. /api/health va /api/lessons endpointlarini tekshiring.",
    taskHint: "Terminal: node server/index.js. Brauzerda: http://localhost:3000/api/health",
    requirementsList: [
      "Node.js o'rnatildi",
      "Server ishga tushdi",
      "/api/health ishlaydi",
      "JSON javob qaytaradi",
    ],
    homeworkTasks: [
      hw('backend-1', 1, {
        order: 1,
        title: "Node.js va HTTP testi",
        description: "Node.js asoslarini bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 45,
        questions: quiz('backend-1', 1, [
          {
            question: 'Node.js nima?',
            options: [
              'Brauzer turi',
              'JavaScript framework',
              "JavaScript runtime — brauzerdan tashqarida JS ishlatish",
              'Database',
            ],
            correct: 2,
            explanation: "Node.js — V8 engine asosida qurilgan JavaScript runtime. Serverda, terminalda ishlaydi.",
          },
          {
            question: 'HTTP 201 status kodi nimani anglatadi?',
            options: ['OK', "Created — muvaffaqiyatli yaratildi", 'Not Found', 'Server Error'],
            correct: 1,
            explanation: "201 Created — yangi resurs muvaffaqiyatli yaratildi. POST so'rovlarda ishlatiladi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'REST API: CRUD operatsiyalar',
    duration: '80 daqiqa',
    description: "GET, POST, PUT, DELETE — to'liq CRUD, validatsiya, error handling.",
    videoTitle: 'REST API CRUD operatsiyalar — Uzbek',
    videoQuery: 'REST API CRUD GET POST PUT DELETE Node.js uzbek',
    difficulty: 'qiyin',
    theory: `CRUD — Create, Read, Update, Delete.

RESTful API qoidalari:
- GET /lessons: barcha darslar
- GET /lessons/:id: bitta dars
- POST /lessons: yangi dars yaratish
- PUT /lessons/:id: darsni to'liq yangilash
- PATCH /lessons/:id: qisman yangilash
- DELETE /lessons/:id: darsni o'chirish

Validatsiya muhim:
- Majburiy maydonlar bormi?
- Email format to'g'rimi?
- Parol yetarli uzunlikdami?
- ID mavjudmi?

Error handling status kodlari:
- 400: Noto'g'ri so'rov (validatsiya xatosi)
- 401: Autentifikatsiya kerak
- 403: Ruxsat yo'q
- 404: Topilmadi
- 409: Conflict (email allaqachon mavjud)
- 500: Server ichki xatosi`,
    codeExample: `// Yordamchi funksiyalar
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function validateUser({ fullName, email, password }) {
  if (!fullName || fullName.trim().length < 3)
    return 'Ism kamida 3 belgi';
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))
    return "Email noto'g'ri";
  if (!password || password.length < 8)
    return 'Parol kamida 8 belgi';
  return null;
}

// Register endpoint
if (pathname === '/api/auth/register' && method === 'POST') {
  const body = await readBody(req);
  const error = validateUser(body);

  if (error) return sendJSON(res, 400, { error });

  const users = readUsers();
  if (users.find(u => u.email === body.email))
    return sendJSON(res, 409, { error: 'Email allaqachon mavjud' });

  const user = {
    id: Date.now().toString(),
    fullName: body.fullName.trim(),
    email: body.email.toLowerCase(),
    goal: body.goal || '',
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  return sendJSON(res, 201, { user });
}`,
    task: "Register va login endpointlarini yozing, Postman yoki Thunder Client bilan sinang.",
    taskHint: "Thunder Client — VS Code extension. POST /api/auth/register ga JSON body yuboring.",
    requirementsList: [
      'Register endpoint ishlaydi',
      'Validatsiya xatolari qaytariladi',
      '409 duplicate email uchun',
      'Postman/Thunder Client bilan sinaldi',
    ],
    homeworkTasks: [
      hw('backend-2', 1, {
        order: 1,
        title: 'REST API testi',
        description: "REST API qoidalarini bilasizmi?",
        type: 'quiz',
        difficulty: 'qiyin',
        xp: 55,
        questions: quiz('backend-2', 1, [
          {
            question: "Mavjud resursni o'chirish uchun qaysi HTTP metod?",
            options: ['GET', 'POST', 'PUT', 'DELETE'],
            correct: 3,
            explanation: "DELETE /users/:id — resursni o'chirish uchun.",
          },
          {
            question: "Email allaqachon mavjud bo'lganda qaysi status kodi?",
            options: ['400', '404', '409', '500'],
            correct: 2,
            explanation: "409 Conflict — resurs allaqachon mavjud (duplicate email, username va h.).",
          },
          {
            question: "Qisman yangilash (faqat email o'zgartirish) uchun qaysi metod?",
            options: ['POST', 'PUT', 'PATCH', 'UPDATE'],
            correct: 2,
            explanation: "PATCH — qisman yangilash. PUT — to'liq yangilash (barcha maydonlar kerak).",
          },
        ]),
      }),
    ],
  },
];

// ─── MODULE 6: GIT ───────────────────────────────────────────────────────────

const gitSeeds: LessonSeed[] = [
  {
    title: "Git asoslari va birinchi commit",
    duration: '60 daqiqa',
    description: "git init, add, commit, log — version control asoslari.",
    videoTitle: 'Git noldan birinchi commit — Uzbek',
    videoQuery: 'Git noldan init add commit log uzbek',
    difficulty: 'oson',
    theory: `Git — kod tarixini boshqarish tizimi.

Nima uchun Git:
- Xato qilsangiz oldingi holatga qaytish
- Bir vaqtda ko'p feature ustida ishlash
- Jamoada ishlash
- Employer lar GitHub ni ko'radi

Asosiy buyruqlar:
- git init          — yangi repo
- git status        — holat
- git add .         — barcha o'zgarishlar
- git add fayl.html — faqat bir fayl
- git commit -m "xabar" — saqlash
- git log --oneline — tarix
- git diff          — farqlar

Yaxshi commit xabarlari:
- feat: add contact form
- fix: correct email validation
- style: update navbar spacing
- docs: add README`,
    codeExample: `# Yangi loyiha uchun Git
git init
git status

# Fayllarni staging ga qo'shish
git add index.html style.css

# Commit qilish
git commit -m "feat: add portfolio homepage"

# Tarixni ko'rish
git log --oneline

# O'zgarishlarni ko'rish
git diff
git diff --staged

# .gitignore fayli ichida:
# node_modules/
# .env
# dist/
# *.log`,
    task: "Portfolio loyihangizda Git ishga tushiring va kamida 3 ta commit qiling.",
    taskHint: "Har yirik o'zgarishdan keyin commit qiling. \"Barcha narsa\" deb bir commit qilmang.",
    requirementsList: [
      'git init qilingan',
      'Kamida 3 ta commit bor',
      'Commit xabarlari aniq',
      '.gitignore fayli bor',
    ],
    homeworkTasks: [
      hw('git-1', 1, {
        order: 1,
        title: 'Git buyruqlar testi',
        description: "Git asosiy buyruqlarini bilasizmi?",
        type: 'quiz',
        difficulty: 'oson',
        xp: 35,
        questions: quiz('git-1', 1, [
          {
            question: "O'zgarishlarni staging ga qo'shish buyrug'i?",
            options: ['git save', 'git add .', 'git commit', 'git push'],
            correct: 1,
            explanation: "git add . — barcha o'zgargan fayllarni staging ga qo'shadi.",
          },
          {
            question: 'git commit -m "xabar" nima qiladi?',
            options: [
              "GitHub ga yuboradi",
              "O'zgarishlarni lokal saqlab, snapshot oladi",
              'Yangi branch yaratadi',
              "Fayllarni o'chiradi",
            ],
            correct: 1,
            explanation: "git commit — staging dagi o'zgarishlarni lokal tarixga yozadi.",
          },
          {
            question: "Commit tarixini ko'rish uchun?",
            options: ['git history', 'git show', 'git log', 'git status'],
            correct: 2,
            explanation: "git log (yoki git log --oneline qisqa ko'rinish) — commit tarixini ko'rsatadi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'GitHub va remote repository',
    duration: '65 daqiqa',
    description: "GitHub, remote, push, pull, clone — kodni internetga chiqarish.",
    videoTitle: 'GitHub remote repository push pull — Uzbek',
    videoQuery: 'GitHub remote repository push pull clone uzbek',
    difficulty: 'oson',
    theory: `GitHub — kodni internetda saqlash va ko'rsatish platformasi.

Asosiy buyruqlar:
- git remote add origin URL  — GitHub repo ulash
- git push -u origin main    — birinchi push
- git push                   — keyingi push lar
- git pull                   — yangiliklar olish
- git clone URL              — repo nusxa olish

README.md — loyihaning yuzasi:
- Loyiha nomi va tavsifi
- Texnologiyalar
- O'rnatish qo'llanmasi
- Skrinshot yoki demo link

GitHub profilini to'ldirish:
- Bio: kim ekangiz
- Location: Toshkent, Uzbekistan
- Pin qilingan loyihalar
- Yashil contribution grafik`,
    codeExample: `# GitHub ga ulash
git remote add origin https://github.com/username/portfolio.git
git branch -M main
git push -u origin main

# Yangiliklar yuborish
git add .
git commit -m "feat: add dark mode toggle"
git push

# README.md namunasi:
# Ali Valiyev — Portfolio
#
# Tech Stack
# - HTML5, CSS3, JavaScript
# - Node.js, REST API
#
# Features
# - Responsive design
# - Dark mode
# - Contact form`,
    task: "Portfolio loyihangizni GitHub ga yuklang. README.md yozing. GitHub Pages dan chiqaring.",
    taskHint: "GitHub Pages: repo Settings -> Pages -> Deploy from branch -> main -> Save.",
    requirementsList: [
      'GitHub repo yaratildi',
      'Loyiha push qilindi',
      'README.md yozildi',
      'GitHub Pages ishlaydi',
    ],
    homeworkTasks: [
      hw('git-2', 1, {
        order: 1,
        title: 'GitHub testi',
        description: "GitHub va remote repo ni bilasizmi?",
        type: 'quiz',
        difficulty: 'oson',
        xp: 35,
        questions: quiz('git-2', 1, [
          {
            question: "Lokal commitlarni GitHub ga yuborish buyrug'i?",
            options: ['git send', 'git upload', 'git push', 'git sync'],
            correct: 2,
            explanation: "git push — lokal commitlarni remote (GitHub) ga yuboradi.",
          },
          {
            question: "Mavjud GitHub reposini lokal kompyuterga nusxa olish?",
            options: ['git copy', 'git download', 'git fetch', 'git clone'],
            correct: 3,
            explanation: "git clone URL — GitHub dagi reposini to'liq nusxa oladi.",
          },
        ]),
      }),
    ],
  },

  {
    title: 'Branch va Pull Request',
    duration: '70 daqiqa',
    description: "Branch yaratish, merge, conflict hal qilish, PR ochish.",
    videoTitle: 'Git branch merge Pull Request — Uzbek',
    videoQuery: 'Git branch merge conflict pull request uzbek',
    difficulty: 'orta',
    theory: `Branch — parallel ish oqimi.

Nima uchun branch:
- main ni buzmaslik
- Yangi feature mustaqil ishlab chiqish
- Jamoada har kishi o'z branchida

Asosiy buyruqlar:
- git branch                      — branchlar ro'yxati
- git checkout -b feature-contact — yangi branch
- git checkout main               — asosiy branchga qaytish
- git merge feature-contact       — branchni birlashtirish
- git branch -d feature-contact   — branchni o'chirish

Pull Request (PR):
- GitHub da branch -> main ni birlashtirish so'rovi
- Kod review uchun imkoniyat
- CI/CD testlar o'tishi kerak
- Team mates tasdiqlaydi

Yaxshi PR:
- Kichik o'zgarishlar
- Nima o'zgargani yozilgan
- Skrinshot qo'yilgan`,
    codeExample: `# Yangi feature uchun branch
git checkout -b feature-dark-mode

# Kodni yozing, keyin:
git add .
git commit -m "feat: add dark mode toggle"

# GitHub ga push qilish
git push origin feature-dark-mode

# Main ga merge qilish
git checkout main
git merge feature-dark-mode
git push

# Eski branchni o'chirish
git branch -d feature-dark-mode
git push origin --delete feature-dark-mode

# Conflict bo'lganda:
# 1. Conflictli faylni oching
# 2. <<<<<<, =======, >>>>>>> belgilarini olib tashlang
# 3. Kerakli kodni qoldiring
# 4. git add . && git commit`,
    task: "feature-about branch oching, about bo'limini yangilang, main ga merge qiling.",
    taskHint: "GitHub da Pull Request ham oching — bu amaliy tajriba beradi.",
    requirementsList: [
      'Yangi branch yaratildi',
      'Branch da commit qilindi',
      'Main ga merge qilindi',
      'PR GitHub da ochildi',
    ],
    homeworkTasks: [
      hw('git-3', 1, {
        order: 1,
        title: 'Branch va PR testi',
        description: "Git branch va Pull Request ni bilasizmi?",
        type: 'quiz',
        difficulty: 'orta',
        xp: 40,
        questions: quiz('git-3', 1, [
          {
            question: "Yangi branch yaratib o'tish uchun?",
            options: [
              'git branch new-feature',
              'git create new-feature',
              'git checkout -b new-feature',
              'git switch --create new-feature',
            ],
            correct: 2,
            explanation: "git checkout -b nom — yangi branch yaratib, o'sha branchga o'tadi.",
          },
          {
            question: 'Pull Request nima maqsadda ishlatiladi?',
            options: [
              "GitHub dan o'zgartirish olish",
              "Branch ni main ga qo'shish so'rovi, ko'rib chiqish uchun",
              "Kodni yuklab olish",
              "Commit tarixini ko'rish",
            ],
            correct: 1,
            explanation: "PR — kod review va branch ni asosiy branchga qo'shish jarayoni.",
          },
        ]),
      }),
    ],
  },
];

// ─── SERVICE ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CurriculumService {
  private modules: Module[] = [
    createModule('setup', 1, "01 — Muhit va asoslar", '⚙️', '#14b8a6',
      'VS Code, terminal, DevTools, internet qanday ishlaydi.', '1-hafta', setupSeeds, moduleProjects.setup),

    createModule('html', 2, '02 — HTML: Tuzilma', '🏗️', '#e34c26',
      'Teglar, semantika, formalar, accessibility.', '2-3-hafta', htmlSeeds, moduleProjects.html),

    createModule('css', 3, '03 — CSS: Dizayn', '🎨', '#2563eb',
      "Selektorlar, box model, Flexbox, Grid, responsive.", '4-5-hafta', cssSeeds, moduleProjects.css),

    createModule('js', 4, '04 — JavaScript: Mantiq', '⚡', '#f59e0b',
      "O'zgaruvchilar, funksiyalar, DOM, fetch, async.", '6-8-hafta', jsSeeds, moduleProjects.js),

    createModule('backend', 5, '05 — Node.js: Backend', '🖥️', '#16a34a',
      'HTTP server, REST API, CRUD, autentifikatsiya.', '9-10-hafta', backendSeeds, moduleProjects.backend),

    createModule('git', 6, '06 — Git: Ish oqimi', '🔀', '#f05032',
      'Version control, GitHub, branch, PR, deploy.', '11-12-hafta', gitSeeds, moduleProjects.git),
  ];

  getModules(): Module[] { return this.modules; }

  getModule(id: string): Module | undefined {
    return this.modules.find(m => m.id === id);
  }

  getLesson(moduleId: string, lessonId: string): Lesson | undefined {
    return this.getModule(moduleId)?.lessons.find(l => l.id === lessonId);
  }

  getAllLessons(): Lesson[] {
    return this.modules.flatMap(m => m.lessons);
  }

  getTotalLessons(): number {
    return this.modules.reduce((s, m) => s + m.lessons.length, 0);
  }

  getTotalMinutes(): number {
    return this.modules.reduce((s, m) =>
      s + m.lessons.reduce((ls, l) => ls + parseInt(l.duration, 10), 0), 0);
  }

  private normalizeProgress(progress: any): UserProgress {
    return {
      completedLessons: Array.isArray(progress?.completedLessons) ? progress.completedLessons : [],
      completedExercises: Array.isArray(progress?.completedExercises) ? progress.completedExercises : [],
      completedProjects: Array.isArray(progress?.completedProjects) ? progress.completedProjects : [],
      completedHomework: Array.isArray(progress?.completedHomework) ? progress.completedHomework : [],
      homeworkScores: typeof progress?.homeworkScores === 'object' && progress.homeworkScores !== null ? progress.homeworkScores : {},
      quizAnswers: typeof progress?.quizAnswers === 'object' && progress.quizAnswers !== null ? progress.quizAnswers : {},
      currentLesson: typeof progress?.currentLesson === 'string' ? progress.currentLesson : 'setup-1',
      startDate: typeof progress?.startDate === 'string' ? progress.startDate : new Date().toISOString(),
      xp: typeof progress?.xp === 'number' ? progress.xp : 0,
      streak: typeof progress?.streak === 'number' ? progress.streak : 0,
    };
  }

  getProgress(): UserProgress {
    try {
      const stored = localStorage.getItem('sj_progress');
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.normalizeProgress(parsed);
      }
    } catch { /* ignore */ }
    return this.normalizeProgress(null);
  }

  saveProgress(progress: UserProgress): void {
    localStorage.setItem('sj_progress', JSON.stringify(this.normalizeProgress(progress)));
  }

  isCompleted(lessonId: string): boolean {
    return this.getProgress().completedLessons.includes(lessonId);
  }

  isExerciseCompleted(id: string): boolean {
    return this.getProgress().completedExercises.includes(id);
  }

  isProjectCompleted(id: string): boolean {
    return this.getProgress().completedProjects.includes(id);
  }

  isHomeworkCompleted(id: string): boolean {
    const progress = this.getProgress();
    return Array.isArray(progress.completedHomework) && progress.completedHomework.includes(id);
  }

  getHomeworkScore(id: string): number {
    const progress = this.getProgress();
    return progress.homeworkScores?.[id] ?? 0;
  }

  getCompletionPercent(): number {
    const total = this.getTotalLessons();
    return total > 0
      ? Math.round((this.getProgress().completedLessons.length / total) * 100)
      : 0;
  }

  getFirstIncompleteLesson(): Lesson | null {
    return this.getAllLessons().find(l => !this.isCompleted(l.id)) ?? null;
  }

  getAccessibleModule(): Module | null {
    const first = this.getFirstIncompleteLesson();
    return first ? this.getModule(first.moduleId) ?? null : null;
  }

  canAccessLesson(lessonId: string): boolean {
    const lesson = this.getAllLessons().find(l => l.id === lessonId);
    if (!lesson) return false;
    if (this.isCompleted(lessonId)) return true;
    const first = this.getFirstIncompleteLesson();
    return first?.id === lessonId;
  }

  async markComplete(lessonId: string, userId?: string): Promise<void> {
    const p = this.getProgress();
    if (!p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
      p.currentLesson = lessonId;
      p.xp += 50;
    }
    this.saveProgress(p);
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/progress/mark-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lessonId }),
      });
    } catch { /* local fallback */ }
  }

  async markExerciseComplete(exerciseId: string, userId?: string): Promise<void> {
    const p = this.getProgress();
    if (!p.completedExercises.includes(exerciseId)) {
      p.completedExercises.push(exerciseId);
      p.xp += 25;
    }
    this.saveProgress(p);
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/progress/mark-exercise`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, exerciseId }),
      });
    } catch { /* local fallback */ }
  }

  async markProjectComplete(projectId: string, userId?: string): Promise<void> {
    const p = this.getProgress();
    if (!p.completedProjects.includes(projectId)) {
      p.completedProjects.push(projectId);
      p.xp += 200;
    }
    this.saveProgress(p);
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/progress/mark-project`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectId }),
      });
    } catch { /* local fallback */ }
  }

  async markHomeworkComplete(
    taskId: string, score: number, userId?: string
  ): Promise<void> {
    const p = this.getProgress();
    if (!p.completedHomework.includes(taskId)) {
      p.completedHomework.push(taskId);
      p.xp += score >= 80 ? 50 : score >= 60 ? 30 : 15;
    }
    p.homeworkScores[taskId] = score;
    this.saveProgress(p);
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/progress/mark-homework`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, taskId, score }),
      });
    } catch { /* local fallback */ }
  }

  saveQuizAnswer(questionId: string, answerIndex: number): void {
    const p = this.getProgress();
    p.quizAnswers = { ...p.quizAnswers, [questionId]: answerIndex };
    this.saveProgress(p);
  }

  getQuizAnswer(questionId: string): number | undefined {
    const progress = this.getProgress();
    return progress.quizAnswers?.[questionId];
  }

  async syncProgress(userId: string): Promise<void> {
    const p = this.getProgress();
    for (const lessonId of p.completedLessons) {
      try {
        await fetch(`${API_BASE}/progress/mark-complete`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, lessonId }),
        });
      } catch { /* continue */ }
    }
  }
}