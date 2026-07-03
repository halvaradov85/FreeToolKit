import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import type { QuotaStatus } from '@freetoolkit/shared';

const LANGS = [
  { code: 'es', name: 'Español' }, { code: 'en', name: 'Inglés' }, { code: 'fr', name: 'Francés' },
  { code: 'de', name: 'Alemán' }, { code: 'it', name: 'Italiano' }, { code: 'pt', name: 'Portugués' },
  { code: 'ja', name: 'Japonés' }, { code: 'zh', name: 'Chino' }, { code: 'ru', name: 'Ruso' },
];

@Component({
  selector: 'ftk-translate',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (quota(); as q) {
      @if (!q.unlimited) { <p class="muted">Cupo de hoy: <strong>{{ q.remaining }}</strong> de {{ q.limit }}</p> }
    }
    <div class="row" style="align-items:flex-end;">
      <div style="flex:1;">
        <label>De</label>
        <select [ngModel]="from()" (ngModelChange)="from.set($event)">
          @for (l of langs; track l.code) { <option [value]="l.code">{{ l.name }}</option> }
        </select>
      </div>
      <button (click)="swap()" title="Invertir" style="margin-bottom:1px;">⇄</button>
      <div style="flex:1;">
        <label>A</label>
        <select [ngModel]="to()" (ngModelChange)="to.set($event)">
          @for (l of langs; track l.code) { <option [value]="l.code">{{ l.name }}</option> }
        </select>
      </div>
    </div>
    <label>Texto</label>
    <textarea rows="4" [ngModel]="text()" (ngModelChange)="text.set($event)" placeholder="Escribe el texto a traducir…"></textarea>
    <button class="primary" style="margin:0.8rem 0;" [disabled]="busy()" (click)="run()">
      {{ busy() ? 'Traduciendo…' : 'Traducir' }}
    </button>
    @if (result()) {
      <label>Traducción</label>
      <div class="card result">{{ result() }}</div>
      @if (canSpeak) {
        <button style="margin-top:0.5rem;" (click)="speak()">🔊 Escuchar</button>
      }
    }
    @if (error()) { <p class="muted" style="color:#ef4444;">{{ error() }}</p> }
    @if (upgrade()) {
      <div class="card" style="margin-top:0.6rem;border-color:var(--primary);">
        Alcanzaste el límite gratis de hoy. <a href="/billing/upgrade">Pásate a Pro</a> para traducir sin límites.
      </div>
    }
  `,
})
export class TranslateComponent implements OnInit {
  private http = inject(HttpClient);
  readonly langs = LANGS;
  readonly from = signal('en');
  readonly to = signal('es');
  readonly text = signal('');
  readonly result = signal('');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly upgrade = signal(false);
  readonly quota = signal<QuotaStatus | null>(null);

  async ngOnInit() { await this.refreshQuota(); }

  private async refreshQuota() {
    try { this.quota.set(await firstValueFrom(this.http.get<QuotaStatus>('/api/v1/tools/text-translate/quota'))); } catch { /* */ }
  }

  readonly canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  swap() { const f = this.from(); this.from.set(this.to()); this.to.set(f); }

  speak() {
    if (!this.canSpeak || !this.result()) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(this.result());
    u.lang = this.to();
    const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith(this.to()));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }

  async run() {
    if (!this.text().trim()) return;
    this.busy.set(true); this.error.set(''); this.upgrade.set(false);
    try {
      const r = await firstValueFrom(
        this.http.post<{ translatedText: string }>('/api/v1/translate', { text: this.text(), from: this.from(), to: this.to() }),
      );
      this.result.set(r.translatedText);
      await this.refreshQuota();
    } catch (e) {
      const err = e as HttpErrorResponse;
      if (err.status === 429) { this.upgrade.set(true); this.error.set('Cupo diario agotado.'); }
      else if (err.status === 503) this.error.set('El traductor no está disponible ahora. No se consumió tu cupo.');
      else this.error.set('No se pudo traducir. Inténtalo de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}
