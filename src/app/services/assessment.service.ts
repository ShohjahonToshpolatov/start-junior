import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AssessmentQuestion {
    id: string;
    level: 'html' | 'css' | 'js' | 'git';
    question: string;
    description?: string;
    type: 'multiple-choice' | 'practical' | 'code-review';
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number; // seconds
}

export interface UserLevel {
    html: number; // 0-100
    css: number;
    js: number;
    git: number;
}

export interface AssessmentResult {
    userId?: string;
    timestamp: Date;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    levels: UserLevel;
    details: {
        questionId: string;
        answered: boolean;
        correct: boolean;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class AssessmentService {
    private assessmentQuestions: AssessmentQuestion[] = [];
    private currentResult$ = new BehaviorSubject<AssessmentResult | null>(null);
    private sessionActive$ = new BehaviorSubject<boolean>(false);

    constructor() {
        this.initializeQuestions();
    }

    private initializeQuestions(): void {
        // Kooop sifatli, mantiqli savolllar
        this.assessmentQuestions = [
            // ===== HTML - 25+ QUESTIONS =====
            // HTML - Easy
            { id: 'html-1', level: 'html', question: 'HTML5 nima?', type: 'multiple-choice', options: ['Markup tili', 'Programming tili', 'Database', 'Framework'], correctAnswer: 'Markup tili', explanation: 'HTML - HyperText Markup Language, markup tili, web sahifalarning struktuasini yaratadi', difficulty: 'easy', timeLimit: 45 },
            { id: 'html-2', level: 'html', question: 'Quyidagida semantic tag qaysi?', type: 'multiple-choice', options: ['<div>', '<span>', '<section>', '<b>'], correctAnswer: '<section>', explanation: '<section> semantic teg. <div> va <span> semantik emas, faqat qvatbazalik teglari', difficulty: 'easy', timeLimit: 45 },
            { id: 'html-3', level: 'html', question: 'Meta tag nima uchun ishlatiladi?', type: 'multiple-choice', options: ['SEO va meta ma\'lumot', 'Stil berish', 'Skript yozish', 'Rasm ko\'rsatish'], correctAnswer: 'SEO va meta ma\'lumot', explanation: 'Meta tag - sahifa haqida ma\'lumot (description, keywords), SEO uchun muhim', difficulty: 'easy', timeLimit: 50 },
            { id: 'html-4', level: 'html', question: 'Qanday teg form yaratadi?', type: 'multiple-choice', options: ['<form>', '<input>', '<button>', '<textarea>'], correctAnswer: '<form>', explanation: '<form> - formalarning kontejneri. <input>, <button>, <textarea> - form elementlari', difficulty: 'easy', timeLimit: 45 },
            { id: 'html-5', level: 'html', question: 'Alt atributi nima?', type: 'practical', correctAnswer: 'Rasm yuklanmaganda matn ko\'rsatish va accessibility uchun', explanation: 'Alt atributi screen readers uchun muhim: <img src="..." alt="Tasvir">', difficulty: 'easy', timeLimit: 60 },
            { id: 'html-6', level: 'html', question: '<img> tag nima uchun alt atributi kerak?', type: 'code-review', correctAnswer: 'Accessibility va SEO uchun', explanation: 'Alt matn: o\'qish asbobi uchun, rasm yuklanmaganda, SEO uchun', difficulty: 'easy', timeLimit: 55 },
            { id: 'html-7', level: 'html', question: 'Qaysi tag heading tagi?', type: 'multiple-choice', options: ['<h1> - <h6>', '<head>', '<header>', '<title>'], correctAnswer: '<h1> - <h6>', explanation: 'Heading tag-lar: <h1> - eng katta, <h6> - eng kichik. Ichida text bo\'ladi', difficulty: 'easy', timeLimit: 45 },

            // HTML - Medium
            { id: 'html-8', level: 'html', question: 'Accessibility nima? Misol bering', type: 'practical', correctAnswer: 'Shablon o\'z-o\'zidan foydalanishdagi qiyinchilik yo\'q qilish (alt, aria, semantic HTML)', explanation: 'Accessibility - barcha insonlar uchun accessible. ARIA, semantic HTML, alt matn', difficulty: 'medium', timeLimit: 120 },
            { id: 'html-9', level: 'html', question: 'Semantic HTML-da qanday teglar ishlatiladi?', type: 'practical', correctAnswer: '<header>, <nav>, <main>, <section>, <article>, <footer>, <aside>', explanation: 'Semantic teglar - ma\'noga ega teglar. Search enginelar ularni tushunadi', difficulty: 'medium', timeLimit: 90 },
            { id: 'html-10', level: 'html', question: 'SVG va Canvas farqi?', type: 'code-review', correctAnswer: 'SVG - vector (scalable), Canvas - raster (pixels). SVG XML, Canvas JavaScript', explanation: 'SVG: rasmlar, ikonkalar. Canvas: animation, graphics, games', difficulty: 'medium', timeLimit: 100 },
            { id: 'html-11', level: 'html', question: 'Data atributi nima? Misol', type: 'practical', correctAnswer: 'HTML-da kustom ma\'lumot saqlash: data-id="123"', explanation: 'data-* atributi - DOM-da kustom ma\'lumot. JavaScript-da element.dataset.id', difficulty: 'medium', timeLimit: 100 },
            { id: 'html-12', level: 'html', question: 'Label tag form uchun nima uchun muhim?', type: 'practical', correctAnswer: 'Accessibility va UX uchun input bilan bog\'lanish', explanation: '<label for="input-id">Label</label> - click-able va accessible', difficulty: 'medium', timeLimit: 80 },

            // HTML - Hard
            { id: 'html-13', level: 'html', question: 'Web Accessibility Guidelines (WAG) nima?', type: 'code-review', correctAnswer: 'WCAG - W3C standart accessibility qoidalari', explanation: 'WCAG 2.1: Color contrast, keyboard navigation, screen reader support', difficulty: 'hard', timeLimit: 120 },
            { id: 'html-14', level: 'html', question: 'Quyidagi HTML nima muammo:', type: 'code-review', correctAnswer: 'Form inputlari label-ga bog\'lanmagan, accessibility yomon', explanation: '<input> va <label> bog\'langan bo\'lishi kerak for atributi bilan', difficulty: 'hard', timeLimit: 110 },

            // ===== CSS - 25+ QUESTIONS =====
            // CSS - Easy
            { id: 'css-1', level: 'css', question: 'CSS nima?', type: 'multiple-choice', options: ['Stil tili', 'Programming tili', 'Markup tili', 'Database'], correctAnswer: 'Stil tili', explanation: 'CSS - Cascading Style Sheets. HTML rasmni qanday ko\'rinishi kerakligini aytadi', difficulty: 'easy', timeLimit: 45 },
            { id: 'css-2', level: 'css', question: 'Box Model nima?', type: 'multiple-choice', options: ['Content, Padding, Border, Margin', 'Width, Height, Color', 'Font, Size, Weight', 'Display, Position, Float'], correctAnswer: 'Content, Padding, Border, Margin', explanation: 'Box Model: ichki Content -> Padding (bo\'shluq) -> Border (chegara) -> Margin (tashqi bo\'shluq)', difficulty: 'easy', timeLimit: 45 },
            { id: 'css-3', level: 'css', question: 'Selektori turlari:', type: 'practical', correctAnswer: 'Element, Class (.), ID (#), Attribute ([]), Pseudo (:)', explanation: 'CSS selektori: p {} (element), .class {} (class), #id {} (ID)', difficulty: 'easy', timeLimit: 60 },
            { id: 'css-4', level: 'css', question: 'Flexbox nima?', type: 'multiple-choice', options: ['1D layout model', '2D layout model', 'Animation', 'Responsive'], correctAnswer: '1D layout model', explanation: 'Flexbox - bir darajali layout (qator yoki ustun). Elementlarni osongina hizalab beradi', difficulty: 'easy', timeLimit: 55 },
            { id: 'css-5', level: 'css', question: 'CSS Grid nima?', type: 'multiple-choice', options: ['2D layout model', '1D layout model', 'Animation', 'Transition'], correctAnswer: '2D layout model', explanation: 'CSS Grid - ikki darajali layout (qatorlar va ustunlar)', difficulty: 'easy', timeLimit: 50 },
            { id: 'css-6', level: 'css', question: 'Media query nima?', type: 'practical', correctAnswer: '@media (max-width: 768px) { ... }', explanation: 'Media query - turli ekranlarda CSS o\'zgartirish', difficulty: 'easy', timeLimit: 60 },
            { id: 'css-7', level: 'css', question: 'Position turlari:', type: 'practical', correctAnswer: 'static, relative, absolute, fixed, sticky', explanation: 'Position: static (default), relative (o\'z joyi), absolute (parent), fixed (viewport), sticky (scroll)', difficulty: 'easy', timeLimit: 70 },

            // CSS - Medium
            { id: 'css-8', level: 'css', question: 'Flexbox kod yozing: 3 item o\'ng tarafga', type: 'practical', correctAnswer: 'display: flex; justify-content: flex-end; yoki float: right;', explanation: 'Flexbox: display: flex, then justify-content (horizontal) yoki align-items (vertical)', difficulty: 'medium', timeLimit: 120 },
            { id: 'css-9', level: 'css', question: 'CSS Grid kod: 3x3 grid', type: 'practical', correctAnswer: 'display: grid; grid-template-columns: repeat(3, 1fr);', explanation: 'grid-template-columns va grid-template-rows grid yaratadi', difficulty: 'medium', timeLimit: 130 },
            { id: 'css-10', level: 'css', question: 'Responsive navbar kod yozing', type: 'code-review', correctAnswer: 'Mobile: stack, Desktop: flex. Media query @media (max-width: 768px)', explanation: 'Mobile-first: base - mobile, then @media - desktop', difficulty: 'medium', timeLimit: 150 },
            { id: 'css-11', level: 'css', question: 'Z-index nima?', type: 'practical', correctAnswer: 'Element-larni layerlash (depth). Katta z-index - oldinda', explanation: 'z-index: 1, 2, 3... Positioning bilan ishlatiladi (relative, absolute, fixed)', difficulty: 'medium', timeLimit: 80 },
            { id: 'css-12', level: 'css', question: 'CSS variablasi nima? Misol', type: 'practical', correctAnswer: '--color: #333; color: var(--color);', explanation: 'CSS custom properties. :root { --main-color: blue; }', difficulty: 'medium', timeLimit: 100 },

            // CSS - Hard
            { id: 'css-13', level: 'css', question: 'CSS performance: nima slow qiladi?', type: 'code-review', correctAnswer: 'Juda ko\'p selektorlar, !important, animations, large images', explanation: 'Performance: selector specificity, paint, composite, reflow', difficulty: 'hard', timeLimit: 120 },
            { id: 'css-14', level: 'css', question: 'BEM naming convention nima?', type: 'practical', correctAnswer: '.block__element--modifier { }', explanation: 'BEM: Block Element Modifier. Misol: .button__text--large', difficulty: 'hard', timeLimit: 110 },

            // ===== JAVASCRIPT - 30+ QUESTIONS =====
            // JS - Easy
            { id: 'js-1', level: 'js', question: 'JavaScript nima?', type: 'multiple-choice', options: ['Scripting tili', 'Markup tili', 'Stil tili', 'Database'], correctAnswer: 'Scripting tili', explanation: 'JavaScript - interaktivlik uchun. Browser-da ishlaydi (frontend) va Node.js (backend)', difficulty: 'easy', timeLimit: 45 },
            { id: 'js-2', level: 'js', question: 'const vs let vs var:', type: 'practical', correctAnswer: 'const - qa\'yta belgilanmaydi, let - block scope, var - deprecated', explanation: 'Modern: const default, let agar kerak. var - eski, global scope', difficulty: 'easy', timeLimit: 60 },
            { id: 'js-3', level: 'js', question: 'Array metodlari:', type: 'practical', correctAnswer: '.map(), .filter(), .reduce(), .forEach(), .find()', explanation: 'map - transform, filter - select, reduce - aggregate, forEach - loop, find - one item', difficulty: 'easy', timeLimit: 70 },
            { id: 'js-4', level: 'js', question: '.map() nima?', type: 'multiple-choice', options: ['Array o\'tkazish', 'Yangi array qaytarish', 'Birinchi element', 'Oxirgi element'], correctAnswer: 'Yangi array qaytarish', explanation: '.map() - transformation. Har bir element uchun function chaqiladi', difficulty: 'easy', timeLimit: 55 },
            { id: 'js-5', level: 'js', question: 'Arrow function sintaksis:', type: 'practical', correctAnswer: '(x) => x * 2  yoki (x, y) => x + y', explanation: 'Arrow function: () => { } . Qisqa va clean', difficulty: 'easy', timeLimit: 65 },
            { id: 'js-6', level: 'js', question: 'typeof operator:', type: 'practical', correctAnswer: 'typeof x - variable type: string, number, boolean, object, function, undefined', explanation: 'typeof "text" => "string", typeof 123 => "number"', difficulty: 'easy', timeLimit: 60 },
            { id: 'js-7', level: 'js', question: 'Template literal nima?', type: 'practical', correctAnswer: '`Hello ${name}!` - backtick bilan, ${} ichida expression', explanation: 'Template literal: backtick (`) ishlata, string interpolation', difficulty: 'easy', timeLimit: 65 },

            // JS - Medium
            { id: 'js-8', level: 'js', question: 'Asynchronous nima?', type: 'practical', correctAnswer: 'Callback, Promise, Async/Await - vaqt oluvchi operatsiyalar uchun', explanation: 'Async: setTimeout, fetch, API calls - non-blocking', difficulty: 'medium', timeLimit: 100 },
            { id: 'js-9', level: 'js', question: 'Promise nima? Kod yozing', type: 'practical', correctAnswer: 'new Promise((resolve, reject) => { ... }).then().catch()', explanation: 'Promise: pending -> resolved/rejected. then() va catch() chaining', difficulty: 'medium', timeLimit: 130 },
            { id: 'js-10', level: 'js', question: 'Async/Await kod:', type: 'practical', correctAnswer: 'async function() { const data = await fetch(...); }', explanation: 'Async/Await - Promise ishlashning qiyin qismi. try/catch dan foydalanish', difficulty: 'medium', timeLimit: 140 },
            { id: 'js-11', level: 'js', question: 'API dan ma\'lumot olib olish kod:', type: 'code-review', correctAnswer: 'fetch(url).then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err))', explanation: 'fetch API: GET, POST, error handling', difficulty: 'medium', timeLimit: 160 },
            { id: 'js-12', level: 'js', question: 'DOM manipulyatsiya: element yaratish', type: 'practical', correctAnswer: 'const div = document.createElement("div"); div.textContent = "Text"; document.body.appendChild(div);', explanation: 'document.createElement(), textContent, appendChild, innerHTML', difficulty: 'medium', timeLimit: 120 },
            { id: 'js-13', level: 'js', question: 'Event listener: button click', type: 'practical', correctAnswer: 'button.addEventListener("click", () => { ... });', explanation: 'addEventListener - event handling. "click", "change", "submit", "mouseover"', difficulty: 'medium', timeLimit: 100 },
            { id: 'js-14', level: 'js', question: 'this keyword nima?', type: 'code-review', correctAnswer: 'Context - qaysi object method ichida chaqirilayotgani', explanation: 'this - function yoki method context', difficulty: 'medium', timeLimit: 110 },

            // JS - Hard
            { id: 'js-15', level: 'js', question: 'Closure nima? Misol', type: 'practical', correctAnswer: 'Inner function outer scope variable-ga kirishi mumkin', explanation: 'function outer() { let x = 5; function inner() { return x; } return inner; }', difficulty: 'hard', timeLimit: 140 },
            { id: 'js-16', level: 'js', question: 'Prototypal inheritance:', type: 'code-review', correctAnswer: 'Object.create(), Constructor functions, Prototype chain', explanation: 'Inheritance JavaScript-da: prototype orqali, yoki class (ES6)', difficulty: 'hard', timeLimit: 130 },
            { id: 'js-17', level: 'js', question: 'Destructuring nima?', type: 'practical', correctAnswer: 'const { name, age } = person; const [a, b] = array;', explanation: 'Destructuring - object yoki array-dan qiymatlarni extract qilish', difficulty: 'hard', timeLimit: 120 },
            { id: 'js-18', level: 'js', question: 'Spread operator nima?', type: 'practical', correctAnswer: '...array yoki ...object - qiymatlari spread qiladi', explanation: 'Spread: array yoki object qiymatlarini copy yoki merge qilish', difficulty: 'hard', timeLimit: 120 },

            // ===== GIT - 20+ QUESTIONS =====
            // Git - Easy
            { id: 'git-1', level: 'git', question: 'Git nima?', type: 'multiple-choice', options: ['Version control system', 'Programming tili', 'Web framework', 'Database'], correctAnswer: 'Version control system', explanation: 'Git - code o\'zgarishlarini kuzatadi, save qiladi, collaboration uchun', difficulty: 'easy', timeLimit: 45 },
            { id: 'git-2', level: 'git', question: 'Repository nima?', type: 'multiple-choice', options: ['Project papkasi (code + history)', 'Database', 'Web server', 'Config fayli'], correctAnswer: 'Project papkasi (code + history)', explanation: 'Repository - .git papkasi bilan, Git history saqlaydi', difficulty: 'easy', timeLimit: 50 },
            { id: 'git-3', level: 'git', question: 'git init nima qiladi?', type: 'practical', correctAnswer: 'Yangi repository yaratadi (.git papkasi)', explanation: 'git init - papkani Git repository-ga aylantiradi', difficulty: 'easy', timeLimit: 55 },
            { id: 'git-4', level: 'git', question: 'git add nima?', type: 'practical', correctAnswer: 'Fayllarni staging area-ga qo\'shadi', explanation: 'git add . - barcha, git add file.txt - bitta fayl', difficulty: 'easy', timeLimit: 60 },
            { id: 'git-5', level: 'git', question: 'git commit nima?', type: 'practical', correctAnswer: 'Staging area-dan repository-ga saqlash message bilan', explanation: 'git commit -m "message" - checkpoint yaratadi', difficulty: 'easy', timeLimit: 60 },
            { id: 'git-6', level: 'git', question: 'Branch nima?', type: 'practical', correctAnswer: 'Parallel code development line', explanation: 'Branch: main, develop, feature/login. feature qayta merge qilinadi', difficulty: 'easy', timeLimit: 70 },
            { id: 'git-7', level: 'git', question: 'git status nima ko\'rsatadi?', type: 'practical', correctAnswer: 'Modified, Staged, Untracked fayllar', explanation: 'git status - qaysi fayllar o\'zgargan, qaysi stage-da', difficulty: 'easy', timeLimit: 65 },

            // Git - Medium
            { id: 'git-8', level: 'git', question: 'git workflow: noto\'g\'ri', type: 'code-review', correctAnswer: 'edit -> git add -> git commit -> git push (to\'g\'ri tartibi)', explanation: 'Workflow: modify -> stage (add) -> commit -> push remote', difficulty: 'medium', timeLimit: 100 },
            { id: 'git-9', level: 'git', question: 'git merge nima?', type: 'practical', correctAnswer: 'Ikki branch-ni birlashtiradi: git merge branch-name', explanation: 'merge - feature branch qiymatlarini main-ga qo\'shish', difficulty: 'medium', timeLimit: 90 },
            { id: 'git-10', level: 'git', question: 'git clone nima?', type: 'practical', correctAnswer: 'Remote repository-ni local-ga copy: git clone <url>', explanation: 'Clone - butun repository history bilan download', difficulty: 'medium', timeLimit: 85 },
            { id: 'git-11', level: 'git', question: 'Merge conflict nima? Hal qilish', type: 'code-review', correctAnswer: 'Same file-da ikki o\'zgarish. Manual fix + add + commit', explanation: 'Conflict markers: <<<<<<<, =======, >>>>>>> - fix qilish kerak', difficulty: 'medium', timeLimit: 130 },
            { id: 'git-12', level: 'git', question: 'git pull vs git fetch:', type: 'practical', correctAnswer: 'fetch - download faqat, pull - download + merge', explanation: 'Pull = Fetch + Merge. Pull dan oqildiroq fetch ish qilish', difficulty: 'medium', timeLimit: 100 },
            { id: 'git-13', level: 'git', question: 'git rebase nima?', type: 'code-review', correctAnswer: 'Branch history\'sini yengilash, linear history', explanation: 'Rebase vs Merge: rebase - clean history, merge - safe', difficulty: 'medium', timeLimit: 120 },

            // Git - Hard
            { id: 'git-14', level: 'git', question: 'git stash nima?', type: 'practical', correctAnswer: 'Changes saqlash vaqtiy o\'z: git stash, git stash pop', explanation: 'Stash - work-in-progress-ni save, keyin resume', difficulty: 'hard', timeLimit: 110 },
            { id: 'git-15', level: 'git', question: 'git reset vs git revert:', type: 'code-review', correctAnswer: 'reset - history o\'zgartiradi, revert - yangi commit qaytaradi', explanation: 'Reset: local history. Revert: public history (safe)', difficulty: 'hard', timeLimit: 130 },

            // Additional Practical Questions for HTML
            { id: 'html-15', level: 'html', question: 'Create a semantic HTML structure for a blog post with header, main content, and footer', type: 'practical', correctAnswer: '<article><header><h1>Title</h1></header><main><p>Content</p></main><footer>Author</footer></article>', explanation: 'Use semantic elements: article for content, header/main/footer for sections', difficulty: 'medium', timeLimit: 180 },
            { id: 'html-16', level: 'html', question: 'Write HTML for an accessible form with name and email fields', type: 'practical', correctAnswer: '<form><label for="name">Name:</label><input id="name" type="text"><label for="email">Email:</label><input id="email" type="email"></form>', explanation: 'Use label elements with for attributes linking to input ids for accessibility', difficulty: 'medium', timeLimit: 150 },
            { id: 'html-17', level: 'html', question: 'Create an HTML table with headers for student grades', type: 'practical', correctAnswer: '<table><thead><tr><th>Name</th><th>Grade</th></tr></thead><tbody><tr><td>John</td><td>A</td></tr></tbody></table>', explanation: 'Use thead for headers and tbody for data rows', difficulty: 'easy', timeLimit: 120 },

            // Additional Practical Questions for CSS
            { id: 'css-15', level: 'css', question: 'Write CSS to center a div both horizontally and vertically', type: 'practical', correctAnswer: '.center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }', explanation: 'Use absolute positioning with transform for perfect centering', difficulty: 'medium', timeLimit: 150 },
            { id: 'css-16', level: 'css', question: 'Create a responsive CSS grid layout for a photo gallery', type: 'practical', correctAnswer: '.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }', explanation: 'Use CSS Grid with auto-fit and minmax for responsive columns', difficulty: 'hard', timeLimit: 180 },
            { id: 'css-17', level: 'css', question: 'Write CSS for a button with hover effects', type: 'practical', correctAnswer: 'button { background: blue; color: white; transition: background 0.3s; } button:hover { background: darkblue; }', explanation: 'Use transition for smooth hover effects', difficulty: 'easy', timeLimit: 120 },

            // Additional Practical Questions for JS
            { id: 'js-15', level: 'js', question: 'Write a function to check if a string is a palindrome', type: 'practical', correctAnswer: 'function isPalindrome(str) { return str === str.split("").reverse().join(""); }', explanation: 'Compare string with its reverse', difficulty: 'medium', timeLimit: 150 },
            { id: 'js-16', level: 'js', question: 'Create a JavaScript function to fetch data from an API', type: 'practical', correctAnswer: 'async function fetchData(url) { const response = await fetch(url); return response.json(); }', explanation: 'Use async/await with fetch API', difficulty: 'medium', timeLimit: 180 },
            { id: 'js-17', level: 'js', question: 'Write code to add event listener to a button', type: 'practical', correctAnswer: 'document.querySelector("button").addEventListener("click", () => { console.log("Clicked"); });', explanation: 'Use addEventListener for modern event handling', difficulty: 'easy', timeLimit: 120 },
            { id: 'js-18', level: 'js', question: 'Implement a simple counter using closures', type: 'practical', correctAnswer: 'function createCounter() { let count = 0; return () => ++count; }', explanation: 'Use closure to maintain private state', difficulty: 'hard', timeLimit: 200 },

            // Additional Practical Questions for Git
            { id: 'git-16', level: 'git', question: 'Write commands to create a new branch and switch to it', type: 'practical', correctAnswer: 'git checkout -b new-feature', explanation: 'Use checkout -b to create and switch to new branch', difficulty: 'easy', timeLimit: 100 },
            { id: 'git-17', level: 'git', question: 'Show how to undo the last commit but keep changes', type: 'practical', correctAnswer: 'git reset --soft HEAD~1', explanation: 'Soft reset keeps changes staged', difficulty: 'medium', timeLimit: 120 },
            { id: 'git-18', level: 'git', question: 'Write commands to resolve a merge conflict', type: 'practical', correctAnswer: 'Edit conflicted files, then git add and git commit', explanation: 'Manually fix conflicts then stage and commit', difficulty: 'hard', timeLimit: 180 },
        ];
    }

    getQuestionsByLevel(level: 'html' | 'css' | 'js' | 'git', difficulty?: 'easy' | 'medium' | 'hard'): AssessmentQuestion[] {
        let questions = this.assessmentQuestions.filter(q => q.level === level);
        if (difficulty) {
            questions = questions.filter(q => q.difficulty === difficulty);
        }
        // Randomize question order
        return questions.sort(() => Math.random() - 0.5);
    }

    getRandomQuestionsForLevel(level: 'html' | 'css' | 'js' | 'git', count: number = 5): AssessmentQuestion[] {
        const allQuestions = this.getQuestionsByLevel(level);
        // Truly randomize by shuffling the array
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    calculateLevel(correctAnswers: number, totalQuestions: number): number {
        const percentage = (correctAnswers / totalQuestions) * 100;
        if (percentage >= 90) return 100;
        if (percentage >= 80) return 90;
        if (percentage >= 70) return 80;
        if (percentage >= 60) return 70;
        if (percentage >= 50) return 60;
        return Math.round(percentage);
    }

    startSession(): void {
        this.sessionActive$.next(true);
    }

    endSession(): void {
        this.sessionActive$.next(false);
    }

    isSessionActive$(): Observable<boolean> {
        return this.sessionActive$.asObservable();
    }

    saveResult(result: AssessmentResult): void {
        this.currentResult$.next(result);
        // LocalStorage\'ga saqlash
        localStorage.setItem('lastAssessmentResult', JSON.stringify(result));
    }

    getCurrentResult$(): Observable<AssessmentResult | null> {
        return this.currentResult$.asObservable();
    }

    getLastResult(): AssessmentResult | null {
        const stored = localStorage.getItem('lastAssessmentResult');
        return stored ? JSON.parse(stored) : null;
    }
}
