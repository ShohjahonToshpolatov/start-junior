import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Account } from '../../models/curriculum.model';
import { AuthService, RegisterPayload } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class AccountComponent implements OnInit {
  account: Account | null = null;
  loading = false;
  error = '';
  success = '';

  form: RegisterPayload = {
    fullName: '',
    email: '',
    password: '',
    goal: '3 oyda Junior Frontend Developer bo\'lish'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.account = this.authService.getAccount();
  }

  async register(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      this.account = await this.authService.register(this.form);
      this.success = 'Account yaratildi. Progressingiz shu brauzerda saqlanadi.';
      this.form.password = '';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Noma\'lum xato yuz berdi';
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.account = null;
    this.success = 'Accountdan chiqildi.';
  }
}
