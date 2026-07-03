import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TOOLS_BY_ID } from '@freetoolkit/shared';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';

interface HistoryItem { id: string; toolId: string; createdAt: string; }

@Component({
  selector: 'ftk-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <section class="container">
      <div class="row" style="justify-content:space-between;">
        <h1>Mi panel</h1>
        <button (click)="logout()">Cerrar sesión</button>
      </div>

      @if (auth.user(); as u) {
        <div class="grid" style="margin:1rem 0;">
          <div class="card"><div class="muted">Email</div><strong>{{ u.email }}</strong></div>
          <div class="card"><div class="muted">Plan</div><strong><span class="badge" [class.pro]="u.tier==='PRO'">{{ u.tier }}</span></strong></div>
          <div class="card"><div class="muted">Rol</div><strong>{{ u.role }}</strong></div>
        </div>

        @if (u.tier === 'FREE') {
          <div class="card" style="border-color: var(--primary); margin-bottom:1rem;">
            <strong>Desbloquea todo con Pro</strong> — uso ilimitado y sin anuncios.
            <a routerLink="/billing/upgrade"><button class="primary" style="margin-top:0.5rem;">Pásate a Pro</button></a>
          </div>
        }

        <div class="card" style="margin-bottom:1rem;">
          <h3 style="margin-top:0;">Preferencias</h3>
          <label>Tema</label>
          <select [ngModel]="u.themePref" (ngModelChange)="saveTheme($event)">
            <option value="SYSTEM">Sistema</option><option value="LIGHT">Claro</option><option value="DARK">Oscuro</option>
          </select>
          @if (saved()) { <p class="muted">✓ Guardado</p> }
        </div>

        @if (u.role === 'ADMIN') {
          <p><a routerLink="/admin">→ Ir al panel de administración</a></p>
        }

        <h3>Historial reciente</h3>
        @if (history().length === 0) {
          <p class="muted">Aún no has usado herramientas que registren historial.</p>
        }
        <div class="grid">
          @for (h of history(); track h.id) {
            <a class="card" [routerLink]="['/tools', h.toolId]">
              <strong>{{ toolName(h.toolId) }}</strong>
              <div class="muted">{{ h.createdAt | date:'short' }}</div>
            </a>
          }
        </div>
      }
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private theme = inject(ThemeService);
  private http = inject(HttpClient);
  readonly history = signal<HistoryItem[]>([]);
  readonly saved = signal(false);

  async ngOnInit() {
    if (!this.auth.user()) await this.auth.loadMe();
    try {
      this.history.set(await firstValueFrom(this.http.get<HistoryItem[]>('/api/v1/account/history')));
    } catch { /* noop */ }
  }

  toolName(id: string) { return TOOLS_BY_ID[id]?.name ?? id; }

  async saveTheme(pref: 'LIGHT' | 'DARK' | 'SYSTEM') {
    await firstValueFrom(this.http.patch('/api/v1/account/preferences', { themePref: pref }));
    const u = this.auth.user();
    if (u) this.auth.user.set({ ...u, themePref: pref });
    if (pref !== 'SYSTEM' && this.theme.theme() !== pref.toLowerCase()) this.theme.toggle();
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 1500);
  }

  logout() { this.auth.logout(); location.assign('/'); }
}
