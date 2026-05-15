import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurriculumService } from '../../services/curriculum.service';
import { Module, Lesson } from '../../models/curriculum.model';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lessons.html',
  styleUrl: './lessons.scss'
})
export class LessonsComponent implements OnInit {
  modules: Module[] = [];
  activeModuleId = 'setup';
  activeModule: Module | null = null;
  progress = 0;
  completedCount = 0;
  totalLessons = 0;
  xp = 0;

  constructor(
    private curriculumService: CurriculumService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.modules = this.curriculumService.getModules();
    this.totalLessons = this.curriculumService.getTotalLessons();
    this.progress = this.curriculumService.getCompletionPercent();
    this.completedCount = this.curriculumService.getProgress().completedLessons.length;
    this.xp = this.curriculumService.getProgress().xp;

    this.route.params.subscribe(params => {
      if (params['moduleId']) {
        this.activeModuleId = params['moduleId'];
      }

      const requestedModule = this.curriculumService.getModule(this.activeModuleId) || this.modules[0];
      const accessibleModule = this.curriculumService.getAccessibleModule() || this.modules[0];

      if (!this.isModuleAccessible(requestedModule.id)) {
        this.activeModule = accessibleModule;
        this.activeModuleId = accessibleModule.id;
      } else {
        this.activeModule = requestedModule;
      }

      if (!this.activeModule && this.modules.length) {
        this.activeModule = this.modules[0];
        this.activeModuleId = this.modules[0].id;
      }
    });
  }

  selectModule(moduleId: string) {
    const accessibleModule = this.curriculumService.getAccessibleModule() || this.modules[0];
    if (!this.isModuleAccessible(moduleId)) {
      this.activeModule = accessibleModule;
      this.activeModuleId = accessibleModule.id;
      return;
    }

    this.activeModuleId = moduleId;
    this.activeModule = this.curriculumService.getModule(moduleId) || null;
  }

  isCompleted(lessonId: string): boolean {
    return this.curriculumService.isCompleted(lessonId);
  }

  getModuleProgress(moduleId: string): number {
    const module = this.curriculumService.getModule(moduleId);
    if (!module) return 0;
    const completed = module.lessons.filter(l => this.isCompleted(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  }

  getModuleCompleted(moduleId: string): number {
    const module = this.curriculumService.getModule(moduleId);
    if (!module) return 0;
    return module.lessons.filter(l => this.isCompleted(l.id)).length;
  }

  isLessonAccessible(lessonId: string): boolean {
    return this.curriculumService.canAccessLesson(lessonId);
  }

  isModuleAccessible(moduleId: string): boolean {
    const module = this.curriculumService.getModule(moduleId);
    if (!module) return false;

    if (module.lessons.every((lesson) => this.isCompleted(lesson.id))) {
      return true;
    }

    const accessibleModule = this.curriculumService.getAccessibleModule();
    return accessibleModule ? accessibleModule.id === moduleId : moduleId === this.modules[0]?.id;
  }
}
