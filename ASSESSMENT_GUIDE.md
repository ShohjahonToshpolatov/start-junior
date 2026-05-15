# 📊 "Sizni Darajangizni Aniqlang" - Assessment Feature

## Overview

`"Sizni Darajangizni Aniqlang"` (Know Your Level) is a professional online assessment system for evaluating junior developers' proficiency in **HTML, CSS, JavaScript, and Git**. 

🌐 **Acccess**: `/assessment` route, or use navbar button **"📊 Sizni Darajangiz"**

---

## 🎯 Features

### 1. **Professional 4-Stage Assessment Flow**
- **Welcome Stage**: Feature overview and important rules
- **Camera Request**: Proctoring with browser camera access
- **Quiz Stage**: Timed questions with real-time feedback
- **Results Stage**: Detailed proficiency levels and recommendations

### 2. **4 Technology Levels**
- `HTML` - 5 practical questions
- `CSS` - 5 practical questions  
- `JavaScript` - 5 practical questions
- `Git` - 5 practical questions

### 3. **Question Types**
- `multiple-choice` - Select correct answer from options
- `practical` - Write code or explanations  
- `code-review` - Identify and fix code issues

### 4. **Question Pool**
16 diverse, non-repetitive questions per technology:
- Mix of Easy, Medium, Hard difficulty
- Real-world scenarios and examples
- Practical-focused (80%) vs Theory (20%)

### 5. **Smart Proctoring System**
- 🎬 **Camera Access**: Request permission at start
- ⏰ **30-Second Inactivity Detection**: Auto-fail if user leaves page
- 🚨 **Session Management**: Tracks active session in real-time
- 📱 **Mobile Support**: Works on tablets and phones (camera optional)

### 6. **Real-Time Timer**
- Individual time limits per question (45-150 seconds)
- Visual warning when <10 seconds remaining
- Auto-submission on timeout

### 7. **Smart Leveling Algorithm**
```
0-50% → Score (Boshidan boshla 💪)
50-60% → Score (Boshidan boshla 💪)  
60-80% → Score (Yaxshi, lekin tahlil kerak 📚)
80-100% → Score (Juda yaxshi! 🎉)
```

### 8. **Progress Tracking**
- Visual level badges (HTML, CSS, JS, Git)
- Real-time progress bar per level
- Completion percentage

### 9. **Results Analysis**
- Individual scores for each technology
- Color-coded performance (🟢 Good, 🟡 OK, 🔴 Poor)
- Personalized learning recommendations
- Session time tracking

### 10. **Data Persistence**
- Results saved to `localStorage`
- Accessible via `assessmentService.getLastResult()`
- Timestamped for history tracking

---

## 📁 Component Structure

```
src/app/pages/assessment/
├── assessment.ts          # Main component (23 methods)
├── assessment.html        # Template (4 stages)
└── assessment.scss        # Professional styling

src/app/services/
├── assessment.service.ts  # Quiz logic & data
└── camera.service.ts      # Camera & inactivity detection
```

---

## 🎮 User Flow

### Step 1: Welcome
- User sees features overview
- Reviews important rules
- Clicks "Testni Boshlash" button

### Step 2: Camera Setup
- Browser requests camera permission
- Video preview shown (if granted)
- Can skip if camera unavailable

### Step 3: Start Assessment
- Browser session starts  
- Inactivity timer begins (30 sec timeout)
- First question from HTML level shown

### Step 4: Answer Questions
- Select/type answer
- Timer counts down
- Submit or skip
- Auto-submit on timeout = wrong answer

### Step 5: Level Progression  
- After 5 questions → score calculated
- Move to next level (CSS)
- Repeat for all 4 levels

### Step 6: View Results
- All scores displayed
- Color-coded performance
- Personalized recommendations
- Option to restart or go home

---

## 🔧 Implementation Details

### Camera Service
```typescript
// Request camera access
const stream = await cameraService.requestCameraAccess();

// Detect inactivity (30 seconds)
cameraService.detectInactivity(() => {
  // Test failed - user was inactive
}, 30000);

// Stop camera on test end
cameraService.stopCamera();
```

### Assessment Service
```typescript
// Get questions for a level
const questions = assessmentService.getRandomQuestionsForLevel('html', 5);

// Calculate score
const score = assessmentService.calculateLevel(
  correctAnswers,    // 4
  totalQuestions     // 5
); // Returns: 80

// Save results
assessmentService.saveResult(result);

// Retrieve last result
const result = assessmentService.getLastResult();
```

### Component Methods
```typescript
stage: 'welcome' | 'camera-request' | 'quiz' | 'results'
currentLevel: 'html' | 'css' | 'js' | 'git'

startAssessment()              // Begin test
requestCameraAccess()          // Request camera
skipCamera()                   // Skip camera setup
moveToNextLevel()              // Next technology
submitAnswer(isCorrect?)       // Submit answer
skipQuestion()                 // Skip current
finishAssessment()             // Complete test
restartAssessment()            // Start over
goHome()                       // Return home
```

---

## 📊 Results Object Structure

```typescript
interface AssessmentResult {
  timestamp: Date;                    // When test completed
  totalQuestions: number;             // 20 (5 per level)
  correctAnswers: number;             // 16
  timeSpent: number;                  // 1245 seconds
  levels: {
    html: number;                     // 80
    css: number;                      // 75
    js: number;                       // 90
    git: number;                      // 70
  };
  details: [{
    questionId: string;               // 'html-1'
    answered: boolean;                // true
    correct: boolean;                 // true
  }];
}
```

---

## 🎨 UI Features

### Professional Design
- Gradient background (purple/blue)
- Modern glassmorphism navbar
- Smooth animations and transitions
- Color-coded difficulty badges
- Responsive mobile layout

### Accessibility
- Semantic HTML structure
- ARIA labels for buttons
- Keyboard navigation support
- High contrast text
- Large touch targets (mobile)

### Performance
- Lazy loading of questions
- Efficient timer management
- LocalStorage caching
- Minimal re-renders

---

## 🚀 How to Use

### For Students
1. Click **"📊 Sizni Darajangiz"** in navbar
2. Read welcome information
3. Allow camera access (or skip)
4. Answer 20 questions (5 per technology)
5. View results and recommendations
6. Review personal scores

### For Developers (Extending)
```typescript
// Add new question
{
  id: 'html-new',
  level: 'html',
  question: 'Your question here',
  type: 'multiple-choice',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 'A',
  explanation: 'Explanation here',
  difficulty: 'medium',
  timeLimit: 90
}

// Access results programmatically
this.assessmentService.getCurrentResult$().subscribe(result => {
  console.log(result.levels.html); // 80
});
```

---

## ⚙️ Configuration

### Available Settings
```typescript
// in assessment.service.ts
timeLimit: 60;                      // seconds per question
totalQuestionsPerLevel: 5;          // questions per tech
difficulty: 'easy' | 'medium' | 'hard';

// in camera.service.ts  
inactivityTimeout: 30000;           // 30 seconds
videoWidth: 320;
videoHeight: 240;
```

### Customize Questions
Edit `initializeQuestions()` method in `assessment.service.ts`:
- Add new questions to array
- Update difficulty levels
- Change time limits
- Modify explanations

---

## 🐛 Troubleshooting

### Camera Not Working
1. Check browser permissions (camera)
2. Try different browser (Chrome recommended)
3. Ensure HTTPS or localhost
4. Click "Kamerasiz Davom Etish" to skip

### Timer Too Fast/Slow
- Adjust `questionTimeLimit` in component
- Update per-question `timeLimit` in service

### Results Not Saved
- Check localStorage is enabled
- View browser DevTools → Application → LocalStorage
- Clear cache if needed

### Test Interrupted
- System auto-saves on inactivity
- Returns to home page
- Can restart immediately

---

## 📈 Future Enhancements

- [ ] Email results to users
- [ ] Certificate generation
- [ ] Advanced analytics dashboard
- [ ] Proctoring analytics (eye tracking)
- [ ] Integration with learning platform
- [ ] AI-powered question generation
- [ ] Voice-based responses
- [ ] Multiple language support
- [ ] Difficulty adaptation (dynamic)
- [ ] Social features (leaderboard)

---

## 📝 Example: Complete Assessment Session

```
1. User clicks navbar "📊 Sizni Darajangiz"
   → Redirects to /assessment

2. Welcome stage shows features
   → User clicks "Testni Boshlash"

3. Camera request dialog appears
   → User allows camera access
   → Video preview shown

4. Quiz starts with HTML question
   → Question: "HTML5 nima?"
   → Time: 60 seconds
   → User selects answer
   → Clicks "Javobni Yuborish"

5. Next question appears
   → Progress: 1/5
   → Timer: 60 seconds

6. After 5 questions complete
   → HTML level calculated: 80%
   → Move to CSS level

7. Same process for CSS, JS, Git

8. Results displayed
   → HTML: 80% (Green)
   → CSS: 75% (Yellow)
   → JS: 90% (Green)
   → Git: 70% (Yellow)

9. User can restart or go home
```

---

## 🎓 Learning Path Recommendations

Based on results:

**If HTML < 70%:**
- Review semantic HTML tags
- Practice form elements
- Study accessibility basics

**If CSS < 70%:**
- Master Flexbox layouts
- Practice CSS Grid
- Study responsive design

**If JS < 70%:**
- Review ES6 basics
- Practice DOM manipulation
- Study asynchronous code

**If Git < 70%:**
- Learn git commands
- Practice branching
- Study collaboration workflow

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console for errors
3. Clear cache and refresh
4. Try different browser
5. Contact development team

---

**Yaratilgan: May 14, 2026**  
**Versiya: 1.0**  
**Status: ✅ Production Ready**
