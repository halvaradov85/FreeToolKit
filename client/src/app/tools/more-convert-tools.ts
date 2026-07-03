import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UnitGroup { label: string; units: Record<string, number>; }

const UNIT_GROUPS: Record<string, UnitGroup> = {
  longitud: { label: 'Longitud', units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, mi: 1609.34 } },
  peso: { label: 'Peso', units: { mg: 0.000001, g: 0.001, kg: 1, t: 1000, lb: 0.453592, oz: 0.0283495 } },
  volumen: { label: 'Volumen', units: { ml: 0.001, l: 1, m3: 1000, gal: 3.78541 } },
};

@Component({
  selector: 'ftk-units',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Categoría</label>
    <select [ngModel]="group()" (ngModelChange)="onGroup($event)">
      @for (g of groups; track g) { <option [value]="g">{{ UNIT_GROUPS[g].label }}</option> }
    </select>
    <div class="row">
      <div style="flex:1;">
        <label>De</label>
        <input type="number" [ngModel]="value()" (ngModelChange)="value.set(+$event)" />
        <select [ngModel]="from()" (ngModelChange)="from.set($event)">
          @for (u of units(); track u) { <option [value]="u">{{ u }}</option> }
        </select>
      </div>
      <div style="flex:1;">
        <label>A</label>
        <div class="card"><strong>{{ result() | number:'1.0-4' }}</strong></div>
        <select [ngModel]="to()" (ngModelChange)="to.set($event)">
          @for (u of units(); track u) { <option [value]="u">{{ u }}</option> }
        </select>
      </div>
    </div>
  `,
})
export class UnitsComponent {
  readonly UNIT_GROUPS = UNIT_GROUPS;
  readonly groups = Object.keys(UNIT_GROUPS);
  group = signal('longitud');
  value = signal(1);
  from = signal('m');
  to = signal('km');
  units = computed(() => Object.keys(UNIT_GROUPS[this.group()].units));
  result = computed(() => {
    const g = UNIT_GROUPS[this.group()].units;
    return (this.value() * g[this.from()]) / g[this.to()];
  });
  onGroup(g: string) {
    this.group.set(g);
    const u = Object.keys(UNIT_GROUPS[g].units);
    this.from.set(u[0]);
    this.to.set(u[1] ?? u[0]);
  }
}

@Component({
  selector: 'ftk-timezone',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Fecha y hora</label>
    <input type="datetime-local" [ngModel]="dt()" (ngModelChange)="dt.set($event)" />
    <label>Zona destino</label>
    <select [ngModel]="zone()" (ngModelChange)="zone.set($event)">
      @for (z of zones; track z) { <option [value]="z">{{ z }}</option> }
    </select>
    <div class="card" style="margin-top:1rem;"><strong>{{ converted() }}</strong></div>
  `,
})
export class TimezoneComponent {
  zones = ['America/Lima', 'America/Mexico_City', 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'America/New_York', 'Asia/Tokyo', 'UTC'];
  dt = signal('');
  zone = signal('Europe/Madrid');
  converted = computed(() => {
    if (!this.dt()) return '—';
    try {
      const d = new Date(this.dt());
      return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short', timeZone: this.zone() }).format(d);
    } catch { return '—'; }
  });
}

@Component({
  selector: 'ftk-speed',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <label>Valor</label>
    <input type="number" [ngModel]="val()" (ngModelChange)="val.set(+$event)" />
    <label>Unidad</label>
    <select [ngModel]="unit()" (ngModelChange)="unit.set($event)">
      <option value="Mbps">Mbps</option><option value="MBps">MB/s</option><option value="Gbps">Gbps</option><option value="kBps">kB/s</option>
    </select>
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong>{{ mbps() | number:'1.0-2' }}</strong><div class="muted">Mbps</div></div>
      <div class="card"><strong>{{ mbps()/8 | number:'1.0-2' }}</strong><div class="muted">MB/s</div></div>
      <div class="card"><strong>{{ mbps()/1000 | number:'1.0-3' }}</strong><div class="muted">Gbps</div></div>
    </div>
  `,
})
export class SpeedComponent {
  val = signal(100);
  unit = signal('Mbps');
  mbps = computed(() => {
    const v = this.val();
    switch (this.unit()) {
      case 'MBps': return v * 8;
      case 'Gbps': return v * 1000;
      case 'kBps': return (v * 8) / 1000;
      default: return v;
    }
  });
}
