import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface UserProfile {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PRO';
  themePref: 'LIGHT' | 'DARK' | 'SYSTEM';
  localePref: string;
}

interface Tokens { accessToken: string; refreshToken: string; }

const ACCESS_KEY = 'ftk-access';
const REFRESH_KEY = 'ftk-refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  readonly user = signal<UserProfile | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  get accessToken(): string | null { return localStorage.getItem(ACCESS_KEY); }
  get refreshTokenValue(): string | null { return localStorage.getItem(REFRESH_KEY); }

  private store(tokens: Tokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  }

  private clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.user.set(null);
  }

  async register(email: string, password: string) {
    const tokens = await firstValueFrom(this.http.post<Tokens>('/api/v1/auth/register', { email, password }));
    this.store(tokens);
    await this.loadMe();
  }

  async login(email: string, password: string) {
    const tokens = await firstValueFrom(this.http.post<Tokens>('/api/v1/auth/login', { email, password }));
    this.store(tokens);
    await this.loadMe();
  }

  async logout() {
    const refreshToken = this.refreshTokenValue;
    try {
      if (refreshToken) await firstValueFrom(this.http.post('/api/v1/auth/logout', { refreshToken }));
    } catch { /* noop */ }
    this.clear();
  }

  async loadMe() {
    if (!this.accessToken) return;
    try {
      this.user.set(await firstValueFrom(this.http.get<UserProfile>('/api/v1/account/me')));
    } catch { this.clear(); }
  }

  /** Intenta renovar el access token con el refresh. Devuelve el nuevo access o null. */
  async tryRefresh(): Promise<string | null> {
    const refreshToken = this.refreshTokenValue;
    if (!refreshToken) return null;
    try {
      const tokens = await firstValueFrom(this.http.post<Tokens>('/api/v1/auth/refresh', { refreshToken }));
      this.store(tokens);
      return tokens.accessToken;
    } catch {
      this.clear();
      return null;
    }
  }

  async recordToolUse(toolId: string) {
    if (!this.isAuthenticated()) return;
    try {
      await firstValueFrom(this.http.post('/api/v1/account/history', { toolId }));
    } catch { /* el historial no debe interrumpir */ }
  }
}
