import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService, AssessmentQuestion, UserLevel, AssessmentResult } from '../../services/assessment.service';
import { CameraService } from '../../services/camera.service';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

type AssessmentStage = 'welcome' | 'camera-request' | 'quiz' | 'results';
type LevelType = 'html' | 'css' | 'js' | 'git';

@Component({
    selector: 'app-assessment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './assessment.html',
    styleUrl: './assessment.scss'
})
export class AssessmentComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

    // State
    stage: AssessmentStage = 'welcome';
    currentLevel: LevelType = 'html';
    currentQuestionIndex = 0;
    selectedAnswer: string | null = null;
    userAnswers: Map<string, string> = new Map();

    // Data
    currentQuestions: AssessmentQuestion[] = [];
    userLevels: UserLevel = { html: 0, css: 0, js: 0, git: 0 };
    cameraActive = false;
    permissionDenied = false;
    inactivityDetected = false;
    timeSpent = 0;
    sessionStartTime: Date = new Date();

    // Timer
    timeRemaining = 60;
    totalTimeLimit = 900; // 15 minutes
    totalTimeRemaining = 900;
    timerInterval: any = null;
    questionTimeLimit = 60;

    // UI
    levels: LevelType[] = ['html', 'css', 'js', 'git'];
    completedLevels: Set<LevelType> = new Set();

    // Session tracking
    isTestInProgress = false;
    testFailedByNavigation = false;
    private inactivityTimer: any;
    private routerSubscription: Subscription | null = null;
totalTimeFormatted: any;

    constructor(
        private assessmentService: AssessmentService,
        private cameraService: CameraService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadLastResult();
        this.setupNavigationDetection();
    }

    ngOnDestroy(): void {
        this.cleanup();
    }

    private cleanup(): void {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
        if (this.routerSubscription) this.routerSubscription.unsubscribe();
        this.cameraService.stopCamera();

        // Agar test progress-da bo'lsa va cleanpu bo'lsaa failed qil
        if (this.isTestInProgress && this.stage !== 'results') {
            this.failTestByNavigation();
        }
    }

    // ============= NAVIGATION DETECTION =============
    private setupNavigationDetection(): void {
        // Detect route change
        this.routerSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                // Agar test progress-da bo'lsa va boshqa route-ga otmoqchi bo'lsa
                if (this.isTestInProgress && event.url !== '/assessment' && this.stage !== 'results') {
                    event.id; // Navigation will proceed but we'll fail the test
                    this.failTestByNavigation();
                }
            }
        });

        // Detect page close/refresh
        window.addEventListener('beforeunload', (event) => {
            if (this.isTestInProgress && this.stage !== 'results') {
                event.preventDefault();
                event.returnValue = '';
                this.failTestByNavigation();
            }
        });
    }

    private failTestByNavigation(): void {
        if (this.testFailedByNavigation) return; // Prevent multiple calls

        this.testFailedByNavigation = true;
        this.isTestInProgress = false;

        // Cleanup
        clearInterval(this.timerInterval);
        clearTimeout(this.inactivityTimer);
        this.cameraService.stopCamera();

        // Show failure message
        this.inactivityDetected = true;
        this.stage = 'results';

        // Alert user
        setTimeout(() => {
            alert('❌ Test to\'xtatildi! Boshqa sahifaga otib ketchingiz.\n\nUni qayta boshlash uchun "Testni Qayta Boshlash" tugmasini bosing.');
        }, 500);
    }

    // private cleanup(): void {
    //     if (this.timerInterval) clearInterval(this.timerInterval);
    //     if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    //     if (this.routerSubscription) this.routerSubscription.unsubscribe();
    //     this.cameraService.stopCamera();
    // }

    // ============= WELCOME STAGE =============
    startAssessment(): void {
        this.stage = 'camera-request';
    }

    // ============= CAMERA STAGE =============
    async requestCameraAccess(): Promise<void> {
        const stream = await this.cameraService.requestCameraAccess();

        if (stream && this.videoElement) {
            this.videoElement.nativeElement.srcObject = stream;
            this.cameraActive = true;
            this.permissionDenied = false;

            // Start camera monitoring
            this.startCameraMonitoring();

            // Start total timer
            this.startTotalTimer();

            // Start session
            this.isTestInProgress = true;
            this.assessmentService.startSession();
            this.sessionStartTime = new Date();

            // Start inactivity detection
            this.startInactivityDetection();

            // Move to first level
            setTimeout(() => {
                this.moveToNextLevel();
            }, 1000);
        } else {
            this.permissionDenied = true;
        }
    }

    skipCamera(): void {
        // Camera bo'lmasdan ham test qilish mumkin
        this.isTestInProgress = true;
        this.stage = 'quiz';
        this.assessmentService.startSession();
        this.sessionStartTime = new Date();
        this.startTotalTimer();
        this.startInactivityDetection();
        this.moveToNextLevel();
    }

    // ============= QUIZ STAGE =============
    moveToNextLevel(): void {
        if (this.completedLevels.size === this.levels.length) {
            this.finishAssessment();
            return;
        }

        // Qo'llanmagan level topish
        for (const level of this.levels) {
            if (!this.completedLevels.has(level)) {
                this.currentLevel = level;
                break;
            }
        }

        this.loadQuestionsForLevel();
        this.stage = 'quiz';
    }

    private loadQuestionsForLevel(): void {
        // 5 ta random savol olyapmiz
        this.currentQuestions = this.assessmentService.getRandomQuestionsForLevel(this.currentLevel, 5);
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.startQuestionTimer();
    }

    private startQuestionTimer(): void {
        if (this.timerInterval) clearInterval(this.timerInterval);

        const currentQuestion = this.currentQuestions[this.currentQuestionIndex];
        this.questionTimeLimit = currentQuestion.timeLimit || 60;
        this.timeRemaining = this.questionTimeLimit;

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.timeSpent++;

            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.submitAnswer(false);
            }
        }, 1000);
    }

    private startTotalTimer(): void {
        this.totalTimeRemaining = this.totalTimeLimit;
        this.timerInterval = setInterval(() => {
            this.totalTimeRemaining--;
            if (this.totalTimeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.onTotalTimeUp();
            }
        }, 1000);
    }

    private onTotalTimeUp(): void {
        this.isTestInProgress = false;
        this.cameraService.stopCamera();
        this.assessmentService.endSession();

        this.stage = 'results';

        alert('⏰ Vaqt tugadi! Test yakunlandi.');
    }

    private startCameraMonitoring(): void {
        if (!this.cameraActive) return;

        setInterval(() => {
            if (this.cameraService.getStream() && this.cameraService.getStream()!.getVideoTracks().length > 0) {
                const track = this.cameraService.getStream()!.getVideoTracks()[0];
                if (track.readyState !== 'live') {
                    this.onCameraDisconnected();
                }
            }
        }, 5000); // Check every 5 seconds
    }

    private onCameraDisconnected(): void {
        if (!this.cameraActive) return;

        alert('⚠️ Kamera uzildi! Test davom ettirish uchun kamera qayta ulaning.');
        // Could fail the test or pause it
    }

    get currentQuestion(): AssessmentQuestion | undefined {
        return this.currentQuestions[this.currentQuestionIndex];
    }

    submitAnswer(isCorrect?: boolean): void {
        if (!this.currentQuestion) return;

        clearInterval(this.timerInterval);

        // Javob saqlash
        this.userAnswers.set(this.currentQuestion.id, this.selectedAnswer || '');

        // Keyingi savolga o'tish
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.selectedAnswer = null;
            this.startQuestionTimer();
        } else {
            // Bu level tugadi
            this.calculateLevelScore();
            this.completedLevels.add(this.currentLevel);

            // Keyingi level
            this.moveToNextLevel();
        }
    }

    skipQuestion(): void {
        this.submitAnswer(false);
    }

    private calculateLevelScore(): void {
        const levelQuestions = this.currentQuestions;
        let correctCount = 0;

        levelQuestions.forEach(question => {
            const userAnswer = this.userAnswers.get(question.id);
            if (Array.isArray(question.correctAnswer)) {
                if (userAnswer && question.correctAnswer.includes(userAnswer)) {
                    correctCount++;
                }
            } else {
                if (userAnswer === question.correctAnswer) {
                    correctCount++;
                }
            }
        });

        const levelScore = this.assessmentService.calculateLevel(correctCount, levelQuestions.length);
        this.userLevels[this.currentLevel] = levelScore;
    }

    // ============= RESULTS STAGE =============
    private finishAssessment(): void {
        clearInterval(this.timerInterval);
        this.cameraService.stopCamera();
        this.assessmentService.endSession();

        this.stage = 'results';

        // Natijalarni saqlash
        const result: AssessmentResult = {
            timestamp: new Date(),
            totalQuestions: this.currentQuestions.length * this.levels.length,
            correctAnswers: Math.round((Object.values(this.userLevels).reduce((a, b) => a + b) / 400) * (this.currentQuestions.length * this.levels.length)),
            timeSpent: this.timeSpent,
            levels: this.userLevels,
            details: Array.from(this.userAnswers.entries()).map(([qId, answer]) => ({
                questionId: qId,
                answered: !!answer,
                correct: this.isAnswerCorrect(qId, answer)
            }))
        };

        this.assessmentService.saveResult(result);
    }

    private isAnswerCorrect(questionId: string, answer: string): boolean {
        const allQuestions = this.currentQuestions;
        const question = allQuestions.find(q => q.id === questionId);

        if (!question) return false;

        if (Array.isArray(question.correctAnswer)) {
            return question.correctAnswer.includes(answer);
        }
        return question.correctAnswer === answer;
    }

    private loadLastResult(): void {
        const lastResult = this.assessmentService.getLastResult();
        // Agar kerak bo'lsa, last result UI da ko'rsatish
    }

    // ============= INACTIVITY DETECTION =============
    private startInactivityDetection(): void {
        const resetTimer = () => {
            if (this.inactivityTimer) clearTimeout(this.inactivityTimer);

            this.inactivityTimer = setTimeout(() => {
                this.onInactivityDetected();
            }, 30000); // 30 soniya inactivity after fail test
        };

        document.addEventListener('mousemove', resetTimer);
        document.addEventListener('keydown', resetTimer);
        document.addEventListener('click', resetTimer);

        resetTimer();
    }

    private onInactivityDetected(): void {
        this.inactivityDetected = true;
        this.isTestInProgress = false;
        this.cameraService.stopCamera();
        this.assessmentService.endSession();

        this.stage = 'results';

        // Show warning
        setTimeout(() => {
            alert('⚠️ Test davomida 30 soniya inaktiv qoldingiz!\n\nTest to\'xtatildi. Qayta boshlash uchun "Testni Qayta Boshlash" tugmasini bosing.');
        }, 500);
    }

    // ============= UTILITY =============
    getProgressPercent(): number {
        return (this.completedLevels.size / this.levels.length) * 100;
    }

    getLevelLabel(level: LevelType): string {
        return level.toUpperCase();
    }

    getScoreColor(score: number): string {
        if (score >= 80) return '#4caf50';
        if (score >= 60) return '#ff9800';
        return '#f44336';
    }

    restartAssessment(): void {
        this.userAnswers.clear();
        this.userLevels = { html: 0, css: 0, js: 0, git: 0 };
        this.completedLevels.clear();
        this.timeSpent = 0;
        this.stage = 'welcome';
        this.inactivityDetected = false;
        this.testFailedByNavigation = false; // Reset navigation failure flag
        this.isTestInProgress = false; // Reset test progress
        this.selectedAnswer = null;
        this.currentQuestionIndex = 0;
        this.currentQuestions = [];

        // Clear all timers
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    }

    goHome(): void {
        this.cleanup();
        this.router.navigate(['/']);
    }
}
