import { Injectable } from '@angular/core';
import { Account } from '../models/curriculum.model';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  goal: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'sj_account';
  private readonly apiBase = 'http://localhost:3000/api';

  getAccount(): Account | null {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  async register(payload: RegisterPayload): Promise<Account> {
    const clean = {
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      goal: payload.goal.trim()
    };

    this.validate(clean);

    try {
      const response = await fetch(`${this.apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clean)
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          return this.login(clean);
        }
        throw new Error(data.error || 'Account yaratishda xato yuz berdi');
      }

      const account = data.user as Account;
      localStorage.setItem(this.storageKey, JSON.stringify(account));
      return account;
    } catch (error) {
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        throw error;
      }

      const account: Account = {
        id: crypto.randomUUID(),
        fullName: clean.fullName,
        email: clean.email,
        goal: clean.goal,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(account));
      return account;
    }
  }

  async login(payload: RegisterPayload): Promise<Account> {
    const response = await fetch(`${this.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: payload.email, password: payload.password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Loginda xato yuz berdi');
    }

    const account = data.user as Account;
    localStorage.setItem(this.storageKey, JSON.stringify(account));
    return account;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  private validate(payload: RegisterPayload): void {
    if (payload.fullName.length < 3) {
      throw new Error('Ism kamida 3 ta belgidan iborat bo\'lsin');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      throw new Error('Email manzil noto\'g\'ri');
    }

    if (payload.password.length < 8) {
      throw new Error('Parol kamida 8 ta belgidan iborat bo\'lsin');
    }
  }
}
