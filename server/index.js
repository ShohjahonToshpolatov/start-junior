const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

const lessonsSummary = [
  'VS Code va DevTools',
  'HTML toliq asoslar',
  'CSS responsive dizayn',
  'JavaScript DOM va fetch',
  'Node.js backend API',
  'Git, GitHub va deploy'
];

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, '[]', 'utf8');
  }
}

async function readUsers() {
  await ensureDataFile();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(raw);
}

async function saveUsers(users) {
  await ensureDataFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

async function readProgress() {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(PROGRESS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveProgress(progress) {
  await ensureDataFile();
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request juda katta'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('JSON format noto\'g\'ri'));
      }
    });
    req.on('error', reject);
  });
}

function validateRegister(payload) {
  const fullName = String(payload.fullName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const goal = String(payload.goal || '').trim();

  if (fullName.length < 3) return { error: 'Ism kamida 3 ta belgi bo\'lsin' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email noto\'g\'ri' };
  if (password.length < 8) return { error: 'Parol kamida 8 ta belgi bo\'lsin' };

  return { fullName, email, password, goal: goal || 'Junior developer bo\'lish' };
}

async function registerUser(req, res) {
  const payload = await readJsonBody(req);
  const valid = validateRegister(payload);
  if (valid.error) return sendJson(res, 400, { error: valid.error });

  const users = await readUsers();
  if (users.some((user) => user.email === valid.email)) {
    return sendJson(res, 409, { error: 'Bu email bilan account bor' });
  }

  const user = {
    id: crypto.randomUUID(),
    fullName: valid.fullName,
    email: valid.email,
    goal: valid.goal,
    createdAt: new Date().toISOString()
  };

  // Demo uchun parol ochiq saqlanmaydi. Real loyihada bcrypt hash kerak.
  users.push({
    ...user,
    passwordHash: crypto.createHash('sha256').update(valid.password).digest('hex')
  });
  await saveUsers(users);

  return sendJson(res, 201, { user });
}

async function loginUser(req, res) {
  const payload = await readJsonBody(req);
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!email || !password) {
    return sendJson(res, 400, { error: 'Email va parol kerak' });
  }

  const users = await readUsers();
  const user = users.find((u) => u.email === email);
  if (!user) {
    return sendJson(res, 404, { error: 'Account topilmadi' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  if (user.passwordHash !== passwordHash) {
    return sendJson(res, 401, { error: 'Parol noto‘g‘ri' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return sendJson(res, 200, { user: safeUser });
}

async function router(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/') {
    return sendJson(res, 200, { ok: true, message: 'Start Junior backend ishlayapti. API endpointlar /api/health, /api/lessons, /api/auth/register, /api/progress/:userId, /api/progress/mark-complete, /api/certificate/:userId' });
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, name: 'Start Junior API', time: new Date().toISOString() });
  }

  if (req.method === 'GET' && url.pathname === '/api/lessons') {
    return sendJson(res, 200, { modules: lessonsSummary, price: 0, duration: '3 oy' });
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    return registerUser(req, res);
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    return loginUser(req, res);
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/progress/')) {
    const userId = url.pathname.split('/').pop();
    const progress = await readProgress();
    return sendJson(res, 200, progress[userId] || { completedLessons: [], xp: 0, streak: 0 });
  }

  if (req.method === 'POST' && url.pathname === '/api/progress/mark-complete') {
    const payload = await readJsonBody(req);
    const { userId, lessonId } = payload;
    if (!userId || !lessonId) return sendJson(res, 400, { error: 'userId va lessonId kerak' });

    const progress = await readProgress();
    if (!progress[userId]) progress[userId] = { completedLessons: [], completedExercises: [], completedProjects: [], xp: 0, streak: 0 };

    if (!progress[userId].completedLessons.includes(lessonId)) {
      progress[userId].completedLessons.push(lessonId);
      progress[userId].xp += 50;
      progress[userId].streak = Math.max(progress[userId].streak, 1);
    }

    await saveProgress(progress);
    return sendJson(res, 200, { success: true, progress: progress[userId] });
  }

  if (req.method === 'POST' && url.pathname === '/api/progress/mark-exercise') {
    const payload = await readJsonBody(req);
    const { userId, exerciseId } = payload;
    if (!userId || !exerciseId) return sendJson(res, 400, { error: 'userId va exerciseId kerak' });

    const progress = await readProgress();
    if (!progress[userId]) progress[userId] = { completedLessons: [], completedExercises: [], completedProjects: [], xp: 0, streak: 0 };

    if (!progress[userId].completedExercises) {
      progress[userId].completedExercises = [];
    }

    if (!progress[userId].completedExercises.includes(exerciseId)) {
      progress[userId].completedExercises.push(exerciseId);
      progress[userId].xp += 25;
    }

    await saveProgress(progress);
    return sendJson(res, 200, { success: true, progress: progress[userId] });
  }

  if (req.method === 'POST' && url.pathname === '/api/progress/mark-project') {
    const payload = await readJsonBody(req);
    const { userId, projectId } = payload;
    if (!userId || !projectId) return sendJson(res, 400, { error: 'userId va projectId kerak' });

    const progress = await readProgress();
    if (!progress[userId]) progress[userId] = { completedLessons: [], completedExercises: [], completedProjects: [], xp: 0, streak: 0 };

    if (!progress[userId].completedProjects) {
      progress[userId].completedProjects = [];
    }

    if (!progress[userId].completedProjects.includes(projectId)) {
      progress[userId].completedProjects.push(projectId);
      progress[userId].xp += 200;
    }

    await saveProgress(progress);
    return sendJson(res, 200, { success: true, progress: progress[userId] });
  }

  if (req.method === 'POST' && url.pathname === '/api/progress/mark-homework') {
    const payload = await readJsonBody(req);
    const { userId, taskId, score } = payload;
    if (!userId || !taskId || typeof score !== 'number') {
      return sendJson(res, 400, { error: 'userId, taskId va score kerak' });
    }

    const progress = await readProgress();
    if (!progress[userId]) progress[userId] = { completedLessons: [], completedExercises: [], completedProjects: [], xp: 0, streak: 0 };
    if (!progress[userId].completedHomework) progress[userId].completedHomework = [];
    if (!progress[userId].homeworkScores) progress[userId].homeworkScores = {};

    if (!progress[userId].completedHomework.includes(taskId)) {
      progress[userId].completedHomework.push(taskId);
      if (score >= 80) progress[userId].xp += 50;
      else if (score >= 60) progress[userId].xp += 30;
      else progress[userId].xp += 15;
    }
    progress[userId].homeworkScores[taskId] = score;

    await saveProgress(progress);
    return sendJson(res, 200, { success: true, progress: progress[userId] });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/certificate/')) {
    const userId = url.pathname.split('/').pop();
    const progress = await readProgress();
    const userProgress = progress[userId] || { completedLessons: [], xp: 0, streak: 0 };
    const users = await readUsers();
    const user = users.find(u => u.id === userId);

    if (!user) return sendJson(res, 404, { error: 'User topilmadi' });

    const totalLessons = 39; // Umumiy darslar soni
    const completionPercent = Math.round((userProgress.completedLessons.length / totalLessons) * 100);

    // Faqat barcha darslar tugagan bo'lsa certificate beriladi
    if (userProgress.completedLessons.length < totalLessons) {
      return sendJson(res, 400, {
        error: `Certificate olish uchun barcha darslarni tugating. ${userProgress.completedLessons.length}/${totalLessons} dars tugagan.`
      });
    }

    const certificate = {
      userName: user.fullName,
      completionPercent,
      xp: userProgress.xp,
      completedLessons: userProgress.completedLessons.length,
      totalLessons,
      issuedAt: new Date().toISOString(),
      certificateId: `SJ-${userId}-${Date.now()}`
    };

    return sendJson(res, 200, certificate);
  }

  return sendJson(res, 404, { error: 'Endpoint topilmadi' });
}

const server = http.createServer((req, res) => {
  router(req, res).catch((error) => {
    sendJson(res, 500, { error: error.message || 'Server xatosi' });
  });
});

server.listen(PORT, () => {
  console.log(`Start Junior API: http://localhost:${PORT}`);
});