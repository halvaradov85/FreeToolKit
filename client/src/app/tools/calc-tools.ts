import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-bmi',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Peso (kg)</label>
    <input type="number" [ngModel]="weight()" (ngModelChange)="weight.set(+$event)" />
    <label>Altura (cm)</label>
    <input type="number" [ngModel]="height()" (ngModelChange)="height.set(+$event)" />
    @if (bmi() > 0) {
      <div class="card" style="margin-top:1rem;">
        <strong style="font-size:1.6rem;">{{ bmi() | number: '1.1-1' }}</strong>
        <div class="muted">{{ category() }}</div>
      </div>
    }
  `,
})
export class BmiComponent {
  weight = signal(70);
  height = signal(170);
  bmi = computed(() => {
    const h = this.height() / 100;
    return h > 0 ? this.weight() / (h * h) : 0;
  });
  category = computed(() => {
    const b = this.bmi();
    if (b < 18.5) return 'Bajo peso';
    if (b < 25) return 'Peso normal';
    if (b < 30) return 'Sobrepeso';
    return 'Obesidad';
  });
}

@Component({
  selector: 'ftk-percentage',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>¿Cuánto es</label>
    <div class="row">
      <input type="number" [ngModel]="pct()" (ngModelChange)="pct.set(+$event)" style="max-width:120px;" /> % de
      <input type="number" [ngModel]="total()" (ngModelChange)="total.set(+$event)" style="max-width:160px;" />
    </div>
    <div class="card" style="margin-top:1rem;"><strong style="font-size:1.5rem;">{{ result() | number: '1.0-2' }}</strong></div>
  `,
})
export class PercentageComponent {
  pct = signal(15);
  total = signal(200);
  result = computed(() => (this.pct() / 100) * this.total());
}

@Component({
  selector: 'ftk-tip',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Cuenta</label>
    <input type="number" [ngModel]="bill()" (ngModelChange)="bill.set(+$event)" />
    <label>Propina: {{ tip() }}%</label>
    <input type="range" min="0" max="30" [ngModel]="tip()" (ngModelChange)="tip.set(+$event)" />
    <label>Personas</label>
    <input type="number" min="1" [ngModel]="people()" (ngModelChange)="people.set(+$event)" />
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong>{{ tipAmount() | number:'1.2-2' }}</strong><div class="muted">propina</div></div>
      <div class="card"><strong>{{ totalAmount() | number:'1.2-2' }}</strong><div class="muted">total</div></div>
      <div class="card"><strong>{{ perPerson() | number:'1.2-2' }}</strong><div class="muted">por persona</div></div>
    </div>
  `,
})
export class TipComponent {
  bill = signal(100);
  tip = signal(10);
  people = signal(2);
  tipAmount = computed(() => (this.bill() * this.tip()) / 100);
  totalAmount = computed(() => this.bill() + this.tipAmount());
  perPerson = computed(() => this.totalAmount() / Math.max(1, this.people()));
}

@Component({
  selector: 'ftk-age',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Fecha de nacimiento</label>
    <input type="date" [ngModel]="dob()" (ngModelChange)="dob.set($event)" />
    @if (result()) {
      <div class="card" style="margin-top:1rem;"><strong style="font-size:1.4rem;">{{ result() }}</strong></div>
    }
  `,
})
export class AgeComponent {
  dob = signal('');
  result = computed(() => {
    if (!this.dob()) return '';
    const b = new Date(this.dob());
    const now = new Date();
    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    let days = now.getDate() - b.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return `${years} años, ${months} meses, ${days} días`;
  });
}
