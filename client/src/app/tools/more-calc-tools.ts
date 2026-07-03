import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-loan',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Monto del préstamo</label>
    <input type="number" [ngModel]="amount()" (ngModelChange)="amount.set(+$event)" />
    <label>Interés anual (%)</label>
    <input type="number" [ngModel]="rate()" (ngModelChange)="rate.set(+$event)" />
    <label>Plazo (meses)</label>
    <input type="number" [ngModel]="months()" (ngModelChange)="months.set(+$event)" />
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong>{{ monthly() | number:'1.2-2' }}</strong><div class="muted">cuota mensual</div></div>
      <div class="card"><strong>{{ total() | number:'1.2-2' }}</strong><div class="muted">total a pagar</div></div>
      <div class="card"><strong>{{ interest() | number:'1.2-2' }}</strong><div class="muted">intereses</div></div>
    </div>
  `,
})
export class LoanComponent {
  amount = signal(10000);
  rate = signal(12);
  months = signal(24);
  monthly = computed(() => {
    const r = this.rate() / 100 / 12;
    const n = this.months();
    if (n <= 0) return 0;
    if (r === 0) return this.amount() / n;
    return (this.amount() * r) / (1 - Math.pow(1 + r, -n));
  });
  total = computed(() => this.monthly() * this.months());
  interest = computed(() => this.total() - this.amount());
}

@Component({
  selector: 'ftk-discount',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Precio original</label>
    <input type="number" [ngModel]="price()" (ngModelChange)="price.set(+$event)" />
    <label>Descuento: {{ pct() }}%</label>
    <input type="range" min="0" max="90" [ngModel]="pct()" (ngModelChange)="pct.set(+$event)" />
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong>{{ final() | number:'1.2-2' }}</strong><div class="muted">precio final</div></div>
      <div class="card"><strong>{{ saved() | number:'1.2-2' }}</strong><div class="muted">ahorras</div></div>
    </div>
  `,
})
export class DiscountComponent {
  price = signal(100);
  pct = signal(20);
  saved = computed(() => (this.price() * this.pct()) / 100);
  final = computed(() => this.price() - this.saved());
}
