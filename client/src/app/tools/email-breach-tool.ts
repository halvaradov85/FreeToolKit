import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import type { QuotaStatus } from '@freetoolkit/shared';

interface BreachResult { breached: boolean; breaches: string[]; }

@Component({
  selector: 'ftk-email-breach',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (quota(); as q) {
      @if (!q.unlimited) { <p class="muted">Cupo de hoy: <strong>{{ q.remaining }}</strong> de {{ q.limit }}</p> }
    }
    <label>Correo electrónico</label>
    <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="tucorreo@ejemplo.com" autocomplete="off" />
    <button class="primary" style="margin:0.8rem 0;" [disabled]="busy()" (click)="check()">
      {{ busy() ? 'Comprobando…' : 'Comprobar' }}
    </button>

    @if (result(); as r) {
      @if (r.breached) {
        <div class="card" style="border-color:#ef4444;">
          <strong style="color:#ef4444;">⚠️ Tu correo apareció en {{ r.breaches.length }} filtración(es):</strong>
          <ul style="margin:0.5rem 0 0; padding-left:1.1rem;">
            @for (b of r.breaches; track b) { <li>{{ b }}</li> }
          </ul>
          <p class="muted" style="margin-top:0.5rem;">Cambia tus contraseñas en esos servicios y activa la verificación en dos pasos.</p>
        </div>
      } @else {
        <div class="card" style="border-color:#22c55e;">
          <strong style="color:#22c55e;">✅ Buenas noticias: tu correo no aparece en filtraciones conocidas.</strong>
        </div>
      }
    }
    @if (error()) { <p class="muted" style="color:#ef4444;">{{ error() }}</p> }
    @if (upgrade()) {
      <div class="card" style="margin-top:0.6rem;border-color:var(--primary);">
        Límite gratis de hoy alcanzado. <a href="/billing/upgrade">Pásate a Pro</a> para comprobaciones ilimitadas.
      </div>
    }
  `,
})
export class EmailBreachComponent implements OnInit {
  private http = inject(HttpClient);
  readonly email = signal('');
  readonly result = signal<BreachResult | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly upgrade = signal(false);
  readonly quota = signal<QuotaStatus | null>(null);

  async ngOnInit() {
    try { this.quota.set(await firstValueFrom(this.http.get<QuotaStatus>('/api/v1/tools/sec-email-breach/quota'))); } catch { /* */ }
  }

  async check() {
    if (!this.email().includes('@')) { this.error.set('Escribe un correo válido.'); return; }
    this.busy.set(true); this.error.set(''); this.upgrade.set(false); this.result.set(null);
    try {
      this.result.set(await firstValueFrom(this.http.post<BreachResult>('/api/v1/breach', { email: this.email() })));
      try { this.quota.set(await firstValueFrom(this.http.get<QuotaStatus>('/api/v1/tools/sec-email-breach/quota'))); } catch { /* */ }
    } catch (e) {
      const err = e as HttpErrorResponse;
      if (err.status === 429) { this.upgrade.set(true); this.error.set('Cupo diario agotado.'); }
      else if (err.status === 503) this.error.set('El servicio no está disponible ahora. No se consumió tu cupo.');
      else this.error.set('No se pudo comprobar. Inténtalo de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}
