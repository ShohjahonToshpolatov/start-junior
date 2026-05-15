import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CurriculumService } from '../../services/curriculum.service';
import { AuthService } from '../../services/auth.service';
import { Account } from '../../models/curriculum.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {
  progress = 0;
  account: Account | null = null;
  menuOpen = false;

  constructor(
    private curriculumService: CurriculumService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.progress = this.curriculumService.getCompletionPercent();
    this.account = this.authService.getAccount();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}