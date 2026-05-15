import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LessonsComponent } from './pages/lessons/lessons';
import { LessonDetailComponent } from './pages/lesson-detail/lesson-detail';
import { AccountComponent } from './pages/account/account';
import { CertificateComponent } from './pages/certificate/certificate';
import { AssessmentComponent } from './pages/assessment/assessment';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'certificate', component: CertificateComponent },
  { path: 'assessment', component: AssessmentComponent },
  { path: 'lessons', component: LessonsComponent },
  { path: 'lessons/:moduleId', component: LessonsComponent },
  { path: 'lesson/:moduleId/:lessonId', component: LessonDetailComponent },
  { path: '**', redirectTo: '' }
];
