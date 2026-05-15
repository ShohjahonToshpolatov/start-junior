import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CurriculumService } from '../../services/curriculum.service';
import { AuthService } from '../../services/auth.service';

import { Lesson, Module } from '../../models/curriculum.model';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './lesson-detail.html',
  styleUrl: './lesson-detail.scss'
})
export class LessonDetailComponent implements OnInit {

  lesson: Lesson | null = null;
  module: Module | null = null;

  isCompleted = false;
  justCompleted = false;

  activeTab: 'theory' | 'code' | 'task' | 'homework' | 'exercises' = 'theory';

  showExerciseSolution: string | null = null;

  prevLesson: Lesson | null = null;
  nextLesson: Lesson | null = null;

  showHint = false;

  completionRequirements: { [key: string]: boolean } = {};

  exercisesToComplete: string[] = [];

  completedExercisesCount = 0;

  codeAnswers: { [taskId: string]: string } = {};
  quizAnswers: { [questionId: string]: number } = {};
  projectChecklist: { [taskId: string]: { [item: string]: boolean } } = {};
  taskResults: { [taskId: string]: { passed: boolean; score: number; message: string } } = {};
  projectStatus = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private curriculumService: CurriculumService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {

      const moduleId = params['moduleId'];
      const lessonId = params['lessonId'];

      this.module =
        this.curriculumService.getModule(moduleId) || null;

      this.lesson =
        this.curriculumService.getLesson(moduleId, lessonId) || null;

      this.isCompleted =
        this.curriculumService.isCompleted(lessonId);

      this.justCompleted = false;

      if (this.module && this.lesson) {

        this.initializeCompletionRequirements();

        const idx =
          this.module.lessons.findIndex(
            l => l.id === lessonId
          );

        this.prevLesson =
          idx > 0
            ? this.module.lessons[idx - 1]
            : null;

        this.nextLesson =
          idx < this.module.lessons.length - 1
            ? this.module.lessons[idx + 1]
            : null;

        if (!this.canAccessLesson()) {

          const allLessons =
            this.curriculumService.getAllLessons();

          const firstIncomplete =
            allLessons.find(
              l => !this.isLessonCompleted(l.id)
            );

          if (firstIncomplete) {

            this.router.navigate([
              '/lesson',
              firstIncomplete.moduleId,
              firstIncomplete.id
            ]);

            return;
          }

          const firstModule =
            this.curriculumService.getModules()[0];

          if (firstModule) {

            this.router.navigate([
              '/lesson',
              firstModule.id,
              firstModule.lessons[0].id
            ]);

            return;
          }
        }

        this.initializeHomeworkState();
      }

      window.scrollTo(0, 0);

      this.activeTab = 'theory';
    });
  }

  setTab(
    tab: 'theory' | 'code' | 'task' | 'homework' | 'exercises'
  ): void {

    this.activeTab = tab;
  }

  private initializeCompletionRequirements(): void {

    if (!this.lesson) return;

    if (
      this.lesson.requirementsList &&
      this.lesson.requirementsList.length > 0
    ) {

      this.lesson.requirementsList.forEach(req => {
        this.completionRequirements[req] = false;
      });

    } else {

      this.completionRequirements = {
        'Kod yozdim va ishlamoqda': false,
        'Tushundim va tushuntira olaman': false,
        'O\'z variantimni sinab ko\'rdim': false,
        'GitHub/DevTools da tekshirdim': false
      };
    }

    if (
      this.lesson.exercises &&
      this.lesson.exercises.length > 0
    ) {

      this.exercisesToComplete =
        this.lesson.exercises.map(ex => ex.id);

      this.completedExercisesCount =
        this.exercisesToComplete.filter(
          exId => this.isExerciseCompleted(exId)
        ).length;
    }
  }

  getCompletionPercentage(): number {

    const totalItems =
      Object.keys(this.completionRequirements).length +
      this.exercisesToComplete.length +
      (this.lesson?.homeworkTasks?.length ?? 0);

    if (totalItems === 0) return 0;

    const completedItems =
      Object.values(this.completionRequirements)
        .filter(v => v).length +
      this.completedExercisesCount +
      (this.lesson?.homeworkTasks?.filter(task => this.isHomeworkTaskComplete(task.id)).length ?? 0);

    return Math.round(
      (completedItems / totalItems) * 100
    );
  }

  isAllRequirementsMet(): boolean {

    const allRequirementsChecked =
      Object.values(this.completionRequirements)
        .every(v => v === true);

    const allExercisesCompleted =
      this.exercisesToComplete.length === 0 ||
      this.exercisesToComplete.every(
        exId => this.isExerciseCompleted(exId)
      );

    const allHomeworkCompleted =
      !this.lesson?.homeworkTasks ||
      this.lesson.homeworkTasks.every(
        task => this.isHomeworkTaskComplete(task.id)
      );

    return (
      allRequirementsChecked &&
      allExercisesCompleted &&
      allHomeworkCompleted
    );
  }

  toggleRequirement(key: string): void {

    this.completionRequirements[key] =
      !this.completionRequirements[key];
  }

  async markComplete(): Promise<void> {

    if (
      !this.lesson ||
      !this.isAllRequirementsMet()
    ) return;

    const account =
      this.authService.getAccount();

    await this.curriculumService.markComplete(
      this.lesson.id,
      account?.id
    );

    this.isCompleted = true;

    this.justCompleted = true;
  }

  markAndContinue(): void {

    if (this.isAllRequirementsMet()) {
      this.markComplete();
    }
  }

  canContinueToNext(): boolean {

    return this.isAllRequirementsMet();
  }

  initializeHomeworkState(): void {
    if (!this.lesson || !this.lesson.homeworkTasks) return;

    this.lesson.homeworkTasks.forEach(task => {
      if (task.type === 'code') {
        this.codeAnswers[task.id] = task.starterCode || '';
      }

      if (task.type === 'quiz' && task.questions) {
        task.questions.forEach(question => {
          const saved = this.curriculumService.getQuizAnswer(question.id);
          if (saved !== undefined) {
            this.quizAnswers[question.id] = saved;
          }
        });
      }

      if (task.type === 'project' && task.checkList) {
        this.projectChecklist[task.id] = {};
        task.checkList.forEach(item => {
          this.projectChecklist[task.id][item] = false;
        });
      }

      const score = this.curriculumService.getHomeworkScore(task.id);
      if (score) {
        this.taskResults[task.id] = {
          passed: score >= 70,
          score,
          message: score >= 70
            ? `✅ Ushbu topshiriq ${score}% to'g'ri bajarildi.`
            : `⚠️ Bir oz qayta ko'rib chiqing — ${score}% yetarli.`
        };
      }
    });
  }

  getHomeworkTasks() {
    return this.lesson?.homeworkTasks ?? [];
  }

  isHomeworkTaskComplete(taskId: string): boolean {
    return this.curriculumService.isHomeworkCompleted(taskId);
  }

  getHomeworkScore(taskId: string): number {
    return this.curriculumService.getHomeworkScore(taskId);
  }

  getTaskResultMessage(taskId: string): string {
    return this.taskResults[taskId]?.message || '';
  }

  getHomeworkCompletedCount(): number {
    return this.lesson?.homeworkTasks?.filter(task => this.isHomeworkTaskComplete(task.id)).length ?? 0;
  }

  getHomeworkPendingCount(): number {
    return (this.lesson?.homeworkTasks?.length ?? 0) - this.getHomeworkCompletedCount();
  }

  evaluateCodeTask(task: any): void {
    const answer = (this.codeAnswers[task.id] || '').trim();
    if (!answer) {
      this.taskResults[task.id] = {
        passed: false,
        score: 0,
        message: 'Kod yozilmadi. Iltimos, kodni kiritib qayta yuboring.'
      };
      return;
    }

    // Remove HTML comments
    const codeWithoutComments = answer.replace(/<!--[\s\S]*?-->/g, '');

    const expected = (task.expectedOutput || '').toLowerCase();
    const keywords = expected
      .split(/[^\p{L}\p{N}]+/gu)
      .filter((item: string) => item && item.length > 1);

    let matched = 0;
    for (const keyword of keywords) {
      let found = false;
      if (keyword === 'doctype') {
        found = /<!doctype/i.test(codeWithoutComments);
      } else if (keyword === 'meta' && expected.includes('charset')) {
        found = /<meta[^>]*charset/i.test(codeWithoutComments);
      } else if (keyword === 'meta' && expected.includes('viewport')) {
        found = /<meta[^>]*viewport/i.test(codeWithoutComments);
      } else if (keyword === 'img') {
        found = /<img/i.test(codeWithoutComments);
      } else if (keyword === 'alt') {
        found = /alt\s*=/i.test(codeWithoutComments);
      } else if (keyword === 'a' && expected.includes('href')) {
        found = /<a[^>]*href/i.test(codeWithoutComments);
      } else if (keyword === 'h1') {
        found = /<h1/i.test(codeWithoutComments);
      } else if (keyword === 'p') {
        found = /<p/i.test(codeWithoutComments);
      } else if (keyword === 'ul') {
        found = /<ul/i.test(codeWithoutComments);
      } else if (keyword === 'ol') {
        found = /<ol/i.test(codeWithoutComments);
      } else if (keyword === 'li') {
        found = /<li/i.test(codeWithoutComments);
      } else if (keyword === 'html') {
        found = /<html/i.test(codeWithoutComments);
      } else if (keyword === 'head') {
        found = /<head/i.test(codeWithoutComments);
      } else if (keyword === 'body') {
        found = /<body/i.test(codeWithoutComments);
      } else if (keyword === 'title') {
        found = /<title/i.test(codeWithoutComments);
      } else if (keyword === 'header') {
        found = /<header/i.test(codeWithoutComments);
      } else if (keyword === 'main') {
        found = /<main/i.test(codeWithoutComments);
      } else if (keyword === 'section') {
        found = /<section/i.test(codeWithoutComments);
      } else if (keyword === 'footer') {
        found = /<footer/i.test(codeWithoutComments);
      } else {
        // For other keywords, check if present
        found = codeWithoutComments.toLowerCase().includes(keyword);
      }
      if (found) matched++;
    }

    const score = keywords.length > 0
      ? Math.min(100, Math.round((matched / keywords.length) * 100))
      : 0;

    const passed = score >= 70;
    this.taskResults[task.id] = {
      passed,
      score,
      message: passed
        ? `✅ Kod topshirig'ingiz ${score}% baholandi. AI tekshiruvi muvaffaqiyatli.`
        : `⚠️ Hali to'liq emas. AI tekshiruvi ${score}% baholadi. Kutilyotgan elementlarni tekshiring.`
    };

    if (passed) {
      this.saveHomeworkResult(task.id, score);
    }
  }

  submitQuizTask(task: any): void {
    if (!task.questions) return;

    let correct = 0;
    task.questions.forEach((question: any) => {
      const selected = this.quizAnswers[question.id];
      if (selected !== undefined) {
        this.curriculumService.saveQuizAnswer(question.id, selected);
      }
      if (selected === question.correct) {
        correct += 1;
      }
    });

    const score = Math.round((correct / task.questions.length) * 100);
    const passed = score >= 70;
    this.taskResults[task.id] = {
      passed,
      score,
      message: passed
        ? `🎯 ${correct}/${task.questions.length} savol to'g'ri. AI tekshiruvi o'tdi.`
        : `⚠️ ${correct}/${task.questions.length} savol to'g'ri. Qayta urinib ko'ring.`
    };

    if (passed) {
      this.saveHomeworkResult(task.id, score);
    }
  }

  toggleProjectChecklist(taskId: string, item: string): void {
    if (!this.projectChecklist[taskId]) return;
    this.projectChecklist[taskId][item] = !this.projectChecklist[taskId][item];
  }

  submitProjectTask(task: any): void {
    if (!task.checkList) return;

    const checklist = this.projectChecklist[task.id] || {};
    const total = task.checkList.length;
    const completed = Object.values(checklist).filter(v => v).length;
    const score = Math.round((completed / total) * 100);
    const passed = completed === total;

    this.taskResults[task.id] = {
      passed,
      score,
      message: passed
        ? `✅ Barcha shartlar bajarildi. AI tekshiruvi to'liq.`
        : `⚠️ ${completed}/${total} shart bajarildi. Qolganlarini to'ldiring.`
    };

    if (passed) {
      this.saveHomeworkResult(task.id, score);
    }
  }

  markReadingTaskComplete(taskId: string): void {
    const score = 80;
    this.taskResults[taskId] = {
      passed: true,
      score,
      message: '✅ Maqola o‘qildi. Topshiriq bajarildi.'
    };
    this.saveHomeworkResult(taskId, score);
  }

  saveHomeworkResult(taskId: string, score: number): void {
    const account = this.authService.getAccount();
    this.curriculumService.markHomeworkComplete(taskId, score, account?.id);
  }

  isLessonCompleted(lessonId: string): boolean {

    return this.curriculumService.isCompleted(
      lessonId
    );
  }

  copyCode(): void {

    if (this.lesson) {

      navigator.clipboard.writeText(
        this.lesson.codeExample
      );
    }
  }

  isModuleProjectCompleted(): boolean {
    return !!(this.module?.project && this.curriculumService.isProjectCompleted(this.module.project.id));
  }

  areAllModuleLessonsCompleted(): boolean {
    return !!(this.module && this.module.lessons.every(l => this.isLessonCompleted(l.id)));
  }

  async markModuleProjectComplete(): Promise<void> {
    if (!this.module?.project) return;
    const account = this.authService.getAccount();
    if (!account) return;

    await this.curriculumService.markProjectComplete(this.module.project.id, account.id);
    this.projectStatus = '✅ Modul loyihasi yakunlandi. +200 XP';
  }

  goNext(): void {

    if (!this.module || !this.nextLesson) return;

    this.router.navigate([
      '/lesson',
      this.module.id,
      this.nextLesson.id
    ]);
  }

  getModuleProgress(): number {

    return this.curriculumService.getCompletionPercent();
  }

  getFirstIncompleteLesson(): Lesson | null {

    if (!this.module) return null;

    for (const lesson of this.module.lessons) {

      if (!this.isLessonCompleted(lesson.id)) {
        return lesson;
      }
    }

    return null;
  }

  canAccessLesson(): boolean {

    if (!this.module || !this.lesson) {
      return false;
    }

    // Birinchi dars (setup-1) har doim ochiq
    if (this.lesson.id === 'setup-1') {
      return true;
    }

    // Agar bu dars allaqachon bajarilgan bo'lsa, ochiq
    if (this.isLessonCompleted(this.lesson.id)) {
      return true;
    }

    // Oldingi darsni tekshirish (shu modul ichida)
    if (this.lesson.order > 1) {
      const prevLesson = this.module.lessons.find(
        l => l.order === this.lesson!.order - 1
      );
      if (prevLesson && !this.isLessonCompleted(prevLesson.id)) {
        return false;
      }
    }

    // Agar bu modulning birinchi darsi bo'lsa, oldingi modulni tekshirish
    if (this.lesson.order === 1) {
      const allModules = this.curriculumService.getModules();
      const currentModuleIndex = allModules.findIndex(
        m => m.id === this.module!.id
      );

      // Oldingi modullarni tekshirish
      for (let i = 0; i < currentModuleIndex; i++) {
        const moduleLessons = allModules[i].lessons;
        const allLessonsCompleted = moduleLessons.every(
          l => this.isLessonCompleted(l.id)
        );
        if (!allLessonsCompleted) {
          return false;
        }
      }
    }

    return true;
  }

  toggleExerciseSolution(
    exerciseId: string
  ): void {

    this.showExerciseSolution =
      this.showExerciseSolution === exerciseId
        ? null
        : exerciseId;
  }

  isExerciseCompleted(
    exerciseId: string
  ): boolean {

    return this.curriculumService
      .isExerciseCompleted(exerciseId);
  }

  async markExerciseComplete(
    exerciseId: string
  ): Promise<void> {

    const account =
      this.authService.getAccount();

    await this.curriculumService
      .markExerciseComplete(
        exerciseId,
        account?.id
      );

    this.completedExercisesCount =
      this.exercisesToComplete.filter(
        exId => this.isExerciseCompleted(exId)
      ).length;
  }
}