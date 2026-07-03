import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';
import { I18nService } from './core/i18n.service';
import { AuthService } from './core/auth.service';
import { DonateComponent } from './shared/donate.component';

@Component({
  selector: 'ftk-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, DonateComponent],
  template: `
    <header class="topbar">
      <div class="container row" style="justify-content: space-between;">
        <a routerLink="/" class="brand">🧰 {{ i18n.t('app.title') }}</a>
        <nav class="row">
          <a routerLink="/tools">{{ i18n.t('nav.catalog') }}</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/dashboard">Mi panel</a>
          } @else {
            <a routerLink="/login">Entrar</a>
          }
          <button (click)="theme.toggle()" [attr.aria-label]="i18n.t('nav.theme')" title="{{ i18n.t('nav.theme') }}">
            {{ theme.theme() === 'dark' ? '☀️' : '🌙' }}
          </button>
        </nav>
      </div>
    </header>
    <main>
      <router-outlet />
    </main>
    <footer class="container" style="padding: 2rem 1rem; text-align:center;">
      <ftk-donate />
      <p class="muted" style="margin-top:1rem;">
        <a routerLink="/contacto">Contacto y sugerencias</a> · {{ i18n.t('app.title') }} · {{ i18n.t('app.tagline') }}
      </p>
    </footer>
  `,
  styles: [
    `
      .topbar {
        border-bottom: 1px solid var(--border);
        background: color-mix(in srgb, var(--surface) 80%, transparent);
        backdrop-filter: saturate(160%) blur(10px);
        position: sticky; top: 0; z-index: 20;
      }
      .topbar > .container { padding-top: 0.7rem; padding-bottom: 0.7rem; }
      .brand {
        font-weight: 800; font-size: 1.25rem;
        background: var(--grad);
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      nav { gap: 0.4rem; }
      nav a {
        color: var(--text); font-weight: 600; padding: 0.4rem 0.7rem; border-radius: 10px;
        transition: background 0.15s, color 0.15s;
      }
      nav a:hover { background: var(--grad-soft); color: var(--primary); }
      main { min-height: 60vh; }
    `,
  ],
})
export class AppComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly auth = inject(AuthService);

  constructor() {
    // Carga el perfil si hay una sesión guardada.
    void this.auth.loadMe();
  }
}
