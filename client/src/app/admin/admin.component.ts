import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TOOLS, type ToolCatalogEntry } from '@freetoolkit/shared';
import { AuthService } from '../core/auth.service';

interface Metrics {
  totalUsers: number; proUsers: number; freeUsers: number;
  activeSubscriptions: number; shortLinks: number; conversionRate: number;
  topTools: { toolId: string; name: string; uses: number }[];
}
interface AdminUser { id: string; email: string; role: string; tier: string; status: string; }
interface ContactMsg { id: string; name: string | null; email: string | null; message: string; read: boolean; createdAt: string; }

@Component({
  selector: 'ftk-admin',
  standalone: true,
  template: `
    <section class="container">
      <h1>Panel de administración</h1>
      @if (!auth.isAdmin()) {
        <p class="muted">Acceso restringido a administradores.</p>
      } @else {
        @if (metrics(); as m) {
          <div class="grid" style="margin-bottom:1rem;">
            <div class="card"><div class="muted">Usuarios</div><strong style="font-size:1.5rem;">{{ m.totalUsers }}</strong></div>
            <div class="card"><div class="muted">Pro</div><strong style="font-size:1.5rem;">{{ m.proUsers }}</strong></div>
            <div class="card"><div class="muted">Conversión</div><strong style="font-size:1.5rem;">{{ m.conversionRate }}%</strong></div>
            <div class="card"><div class="muted">Suscripciones activas</div><strong style="font-size:1.5rem;">{{ m.activeSubscriptions }}</strong></div>
            <div class="card"><div class="muted">Enlaces creados</div><strong style="font-size:1.5rem;">{{ m.shortLinks }}</strong></div>
          </div>
          <div class="card" style="margin-bottom:1rem;">
            <h3 style="margin-top:0;">Herramientas más usadas</h3>
            @if (m.topTools.length === 0) { <p class="muted">Sin datos de uso aún.</p> }
            @for (t of m.topTools; track t.toolId) {
              <div class="row" style="justify-content:space-between;"><span>{{ t.name }}</span><strong>{{ t.uses }}</strong></div>
            }
          </div>
        }

        <div class="card" style="margin-bottom:1rem;">
          <h3 style="margin-top:0;">📨 Buzón de mensajes @if (unread() > 0) { <span class="badge pro">{{ unread() }} sin leer</span> }</h3>
          @if (messages().length === 0) { <p class="muted">No hay mensajes.</p> }
          @for (m of messages(); track m.id) {
            <div class="card" style="margin-bottom:0.5rem;" [style.opacity]="m.read ? 0.6 : 1">
              <div class="row" style="justify-content:space-between;">
                <strong>{{ m.name || 'Anónimo' }} @if (m.email) { <span class="muted">· {{ m.email }}</span> }</strong>
                @if (!m.read) { <button (click)="markRead(m)">Marcar leído</button> }
              </div>
              <p style="margin:0.4rem 0 0; white-space:pre-wrap;">{{ m.message }}</p>
            </div>
          }
        </div>

        <div class="card" style="margin-bottom:1rem;">
          <h3 style="margin-top:0;">Usuarios</h3>
          @for (u of users(); track u.id) {
            <div class="row" style="justify-content:space-between; border-bottom:1px solid var(--border); padding:0.4rem 0;">
              <span>{{ u.email }} <span class="badge">{{ u.role }}</span> <span class="badge" [class.pro]="u.tier==='PRO'">{{ u.tier }}</span></span>
              <button (click)="toggleStatus(u)">{{ u.status === 'ACTIVE' ? 'Suspender' : 'Reactivar' }}</button>
            </div>
          }
        </div>

        <div class="card">
          <h3 style="margin-top:0;">Herramientas ({{ tools().length }})</h3>
          <input type="search" placeholder="Filtrar…" (input)="filter.set($any($event.target).value)" style="margin-bottom:0.6rem;" />
          @for (t of filteredTools(); track t.id) {
            <div class="row" style="justify-content:space-between; border-bottom:1px solid var(--border); padding:0.35rem 0;">
              <span>{{ t.name }} <span class="muted" style="font-size:0.8rem;">({{ t.category }})</span></span>
              <button (click)="toggleTool(t)">{{ t.enabled ? 'Desactivar' : 'Activar' }}</button>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class AdminComponent implements OnInit {
  readonly auth = inject(AuthService);
  private http = inject(HttpClient);
  readonly metrics = signal<Metrics | null>(null);
  readonly users = signal<AdminUser[]>([]);
  readonly tools = signal<ToolCatalogEntry[]>([]);
  readonly filter = signal('');
  readonly messages = signal<ContactMsg[]>([]);
  readonly unread = signal(0);

  filteredTools() {
    const q = this.filter().toLowerCase();
    return this.tools().filter((t) => !q || t.name.toLowerCase().includes(q));
  }

  async ngOnInit() {
    if (!this.auth.user()) await this.auth.loadMe();
    if (!this.auth.isAdmin()) return;
    try {
      this.metrics.set(await firstValueFrom(this.http.get<Metrics>('/api/v1/admin/metrics')));
      this.users.set(await firstValueFrom(this.http.get<AdminUser[]>('/api/v1/admin/users')));
      this.tools.set(await firstValueFrom(this.http.get<ToolCatalogEntry[]>('/api/v1/catalog/tools')));
      const inbox = await firstValueFrom(this.http.get<{ unread: number; messages: ContactMsg[] }>('/api/v1/admin/messages'));
      this.messages.set(inbox.messages);
      this.unread.set(inbox.unread);
    } catch { /* noop */ }
    if (this.tools().length === 0) {
      this.tools.set(TOOLS.map((t) => ({ ...t, enabled: true, effectiveFreeLimitPerDay: t.freeLimitPerDay })));
    }
  }

  async markRead(m: ContactMsg) {
    await firstValueFrom(this.http.patch(`/api/v1/admin/messages/${m.id}`, { read: true }));
    this.messages.update((list) => list.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
    this.unread.update((n) => Math.max(0, n - 1));
  }

  async toggleStatus(u: AdminUser) {
    const status = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await firstValueFrom(this.http.patch(`/api/v1/admin/users/${u.id}`, { status }));
    this.users.update((list) => list.map((x) => (x.id === u.id ? { ...x, status } : x)));
  }

  async toggleTool(t: ToolCatalogEntry) {
    const enabled = !t.enabled;
    await firstValueFrom(this.http.patch(`/api/v1/admin/tools/${t.id}`, { enabled }));
    this.tools.update((list) => list.map((x) => (x.id === t.id ? { ...x, enabled } : x)));
  }
}
