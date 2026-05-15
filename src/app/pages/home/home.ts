import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Module } from '../../models/curriculum.model';
import { CurriculumService } from '../../services/curriculum.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  modules: Module[] = [];
  totalLessons = 0;

  stats = [
    { value: '0', label: 'So\'m', sub: 'To\'liq bepul' },
    { value: '6', label: 'Modul', sub: 'VS Code dan Gitgacha' },
    { value: '32', label: 'Dars', sub: 'Video link va topshiriq bilan' },
    { value: '3', label: 'Oy', sub: 'Aniq yo\'l xarita' }
  ];

  roadmap = [
    { week: '1-hafta', title: 'Start va VS Code', desc: 'Muhit, DevTools, fayl tartibi va frontend/backend tushunchasi.', color: '#14b8a6' },
    { week: '2-3-hafta', title: 'HTML to\'liq', desc: 'Semantik sahifa, formalar, linklar, portfolio skeleti.', color: '#e34c26' },
    { week: '4-5-hafta', title: 'CSS to\'liq', desc: 'Box model, Flexbox, Grid, responsive dizayn va portfolio UI.', color: '#2563eb' },
    { week: '6-8-hafta', title: 'JavaScript to\'liq', desc: 'Funksiyalar, DOM, events, localStorage, fetch API.', color: '#f59e0b' },
    { week: '9-10-hafta', title: 'Node.js backend', desc: 'REST API, account yaratish, validatsiya va clean backend.', color: '#16a34a' },
    { week: '11-12-hafta', title: 'Git va final loyiha', desc: 'GitHub, branch, PR, deploy va Junior portfolio.', color: '#f05032' }
  ];

  faqs = [
    { q: 'Bu kurs chindan bepulmi?', a: 'Ha. Darslar, account yaratish, progress va backend demo bepul.' },
    { q: 'Video darslar qayerda?', a: 'Har dars ichida Uzbek tilidagi mos video darsni topish uchun YouTube qidiruv linki bor. Keyin aniq video URL qo\'yish oson.' },
    { q: 'Backend ham bormi?', a: 'Ha. Projectga Node.js backend qo\'shildi: health, lessons va register endpointlari bor.' },
    { q: '3 oyda nima tugaydi?', a: 'VS Code, HTML, CSS, JavaScript, Node.js API asoslari, Git/GitHub va final portfolio.' },
    { q: 'Account majburiymi?', a: 'Yo\'q, lekin progressni tartibli yuritish uchun bepul account sahifasi qo\'shilgan.' }
  ];

  openFaq: number | null = null;

  constructor(private curriculumService: CurriculumService) {}

  ngOnInit(): void {
    this.modules = this.curriculumService.getModules();
    this.totalLessons = this.curriculumService.getTotalLessons();
    this.stats[1].value = this.modules.length.toString();
    this.stats[2].value = this.totalLessons.toString();
  }

  toggleFaq(index: number): void {
    this.openFaq = this.openFaq === index ? null : index;
  }

  getCompletedForModule(moduleId: string): number {
    const progress = this.curriculumService.getProgress();
    const module = this.modules.find((m) => m.id === moduleId);
    if (!module) return 0;
    return module.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
  }
}
