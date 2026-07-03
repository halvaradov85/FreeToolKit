import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-temperature',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Valor</label>
    <input type="number" [ngModel]="val()" (ngModelChange)="val.set(+$event)" />
    <label>Desde</label>
    <select [ngModel]="from()" (ngModelChange)="from.set($event)">
      <option value="C">Celsius</option><option value="F">Fahrenheit</option><option value="K">Kelvin</option>
    </select>
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong>{{ celsius() | number:'1.0-2' }} °C</strong></div>
      <div class="card"><strong>{{ fahrenheit() | number:'1.0-2' }} °F</strong></div>
      <div class="card"><strong>{{ kelvin() | number:'1.0-2' }} K</strong></div>
    </div>
  `,
})
export class TemperatureComponent {
  val = signal(25);
  from = signal('C');
  celsius = computed(() => {
    const v = this.val();
    return this.from() === 'C' ? v : this.from() === 'F' ? ((v - 32) * 5) / 9 : v - 273.15;
  });
  fahrenheit = computed(() => (this.celsius() * 9) / 5 + 32);
  kelvin = computed(() => this.celsius() + 273.15);
}

@Component({
  selector: 'ftk-number-base',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Valor</label>
    <input [ngModel]="val()" (ngModelChange)="val.set($event)" placeholder="p. ej. 255" />
    <label>Base de entrada</label>
    <select [ngModel]="base()" (ngModelChange)="base.set(+$event)">
      <option [value]="2">Binario (2)</option><option [value]="8">Octal (8)</option>
      <option [value]="10">Decimal (10)</option><option [value]="16">Hexadecimal (16)</option>
    </select>
    @if (dec() !== null) {
      <div class="row" style="margin-top:1rem;">
        <div class="card"><strong>{{ dec() }}</strong><div class="muted">dec</div></div>
        <div class="card"><strong>{{ bin() }}</strong><div class="muted">bin</div></div>
        <div class="card"><strong>{{ oct() }}</strong><div class="muted">oct</div></div>
        <div class="card"><strong>{{ hex() }}</strong><div class="muted">hex</div></div>
      </div>
    } @else {
      <p class="muted" style="margin-top:1rem;">Valor inválido para la base seleccionada.</p>
    }
  `,
})
export class NumberBaseComponent {
  val = signal('255');
  base = signal(10);
  dec = computed<number | null>(() => {
    const n = parseInt(this.val().trim(), this.base());
    return Number.isNaN(n) ? null : n;
  });
  bin = computed(() => this.dec()?.toString(2) ?? '');
  oct = computed(() => this.dec()?.toString(8) ?? '');
  hex = computed(() => this.dec()?.toString(16).toUpperCase() ?? '');
}
