import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

const COMMON = ['USD', 'EUR', 'GBP', 'JPY', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'BRL', 'CAD', 'CNY', 'CHF', 'AUD'];

interface FxResult { from: string; to: string; amount: number; rate: number; result: number; }

@Component({
  selector: 'ftk-currency',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Cantidad</label>
    <input type="number" [ngModel]="amount()" (ngModelChange)="amount.set(+$event)" />
    <div class="row" style="align-items:flex-end;">
      <div style="flex:1;">
        <label>De</label>
        <select [ngModel]="from()" (ngModelChange)="from.set($event)">
          @for (c of currencies; track c) { <option [value]="c">{{ c }}</option> }
        </select>
      </div>
      <button (click)="swap()" title="Invertir" style="margin-bottom:1px;">⇄</button>
      <div style="flex:1;">
        <label>A</label>
        <select [ngModel]="to()" (ngModelChange)="to.set($event)">
          @for (c of currencies; track c) { <option [value]="c">{{ c }}</option> }
        </select>
      </div>
    </div>
    <button class="primary" style="margin:0.9rem 0;" [disabled]="busy()" (click)="convert()">
      {{ busy() ? 'Consultando…' : 'Convertir' }}
    </button>
    @if (res(); as r) {
      <div class="card" style="text-align:center;">
        <div class="muted">{{ r.amount }} {{ r.from }} =</div>
        <strong style="font-size:1.8rem;">{{ r.result }} {{ r.to }}</strong>
        <div class="muted">1 {{ r.from }} = {{ r.rate }} {{ r.to }} · tasa en vivo</div>
      </div>
    }
    @if (error()) { <p class="muted" style="color:#ef4444;">{{ error() }}</p> }
  `,
})
export class CurrencyComponent {
  private http = inject(HttpClient);
  readonly currencies = COMMON;
  readonly amount = signal(100);
  readonly from = signal('USD');
  readonly to = signal('EUR');
  readonly res = signal<FxResult | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');

  swap() { const f = this.from(); this.from.set(this.to()); this.to.set(f); }

  async convert() {
    this.busy.set(true); this.error.set('');
    try {
      const params = new URLSearchParams({ from: this.from(), to: this.to(), amount: String(this.amount()) });
      this.res.set(await firstValueFrom(this.http.get<FxResult>(`/api/v1/fx/convert?${params}`)));
    } catch {
      this.error.set('No se pudo obtener la tasa ahora mismo. Inténtalo de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}
