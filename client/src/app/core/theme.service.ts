import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initial());

  private initial(): Theme {
    const saved = localStorage.getItem('ftk-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  constructor() {
    this.apply(this.theme());
  }

  toggle() {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem('ftk-theme', next);
    this.apply(next);
  }

  private apply(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
