import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-word-count',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto</label>
    <textarea rows="8" [ngModel]="text()" (ngModelChange)="text.set($event)" placeholder="Pega tu texto…"></textarea>
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong>{{ words() }}</strong><div class="muted">palabras</div></div>
      <div class="card"><strong>{{ chars() }}</strong><div class="muted">caracteres</div></div>
      <div class="card"><strong>{{ charsNoSpace() }}</strong><div class="muted">sin espacios</div></div>
      <div class="card"><strong>{{ lines() }}</strong><div class="muted">líneas</div></div>
    </div>
  `,
})
export class WordCountComponent {
  text = signal('');
  words = computed(() => (this.text().trim() ? this.text().trim().split(/\s+/).length : 0));
  chars = computed(() => this.text().length);
  charsNoSpace = computed(() => this.text().replace(/\s/g, '').length);
  lines = computed(() => (this.text() ? this.text().split(/\n/).length : 0));
}

@Component({
  selector: 'ftk-case-convert',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto</label>
    <textarea rows="6" [ngModel]="text()" (ngModelChange)="text.set($event)"></textarea>
    <div class="row" style="margin:0.8rem 0;">
      <button (click)="apply('upper')">MAYÚSCULAS</button>
      <button (click)="apply('lower')">minúsculas</button>
      <button (click)="apply('title')">Tipo Título</button>
      <button (click)="apply('sentence')">Tipo oración</button>
    </div>
    <label>Resultado</label>
    <textarea rows="6" class="result" readonly [value]="out()"></textarea>
  `,
})
export class CaseConvertComponent {
  text = signal('');
  out = signal('');
  apply(mode: 'upper' | 'lower' | 'title' | 'sentence') {
    const t = this.text();
    if (mode === 'upper') this.out.set(t.toUpperCase());
    else if (mode === 'lower') this.out.set(t.toLowerCase());
    else if (mode === 'title') this.out.set(t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()));
    else this.out.set(t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()));
  }
}

@Component({
  selector: 'ftk-lorem',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Párrafos: {{ count() }}</label>
    <input type="range" min="1" max="10" [ngModel]="count()" (ngModelChange)="count.set(+$event)" />
    <button class="primary" style="margin:0.8rem 0;" (click)="gen()">Generar</button>
    <textarea rows="10" class="result" readonly [value]="out()"></textarea>
  `,
})
export class LoremComponent {
  private base =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
  count = signal(3);
  out = signal('');
  gen() {
    this.out.set(Array.from({ length: this.count() }, () => this.base).join('\n\n'));
  }
}

@Component({
  selector: 'ftk-dedupe',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto (una entrada por línea)</label>
    <textarea rows="8" [ngModel]="text()" (ngModelChange)="text.set($event)"></textarea>
    <div class="row" style="margin:0.8rem 0;">
      <label class="row" style="margin:0;"><input type="checkbox" style="width:auto;" [ngModel]="trim()" (ngModelChange)="trim.set($event)" /> &nbsp;recortar espacios</label>
      <button class="primary" (click)="run()">Eliminar duplicados</button>
    </div>
    <label>Resultado ({{ removed() }} eliminados)</label>
    <textarea rows="8" class="result" readonly [value]="out()"></textarea>
  `,
})
export class DedupeComponent {
  text = signal('');
  out = signal('');
  trim = signal(true);
  removed = signal(0);
  run() {
    let lines = this.text().split(/\n/);
    if (this.trim()) lines = lines.map((l) => l.trim());
    const unique = [...new Set(lines)];
    this.removed.set(lines.length - unique.length);
    this.out.set(unique.join('\n'));
  }
}

@Component({
  selector: 'ftk-password-gen',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Longitud: {{ len() }}</label>
    <input type="range" min="6" max="48" [ngModel]="len()" (ngModelChange)="len.set(+$event)" />
    <div class="row" style="margin:0.6rem 0;">
      <label class="row" style="margin:0;"><input type="checkbox" style="width:auto;" [ngModel]="upper()" (ngModelChange)="upper.set($event)" /> &nbsp;A-Z</label>
      <label class="row" style="margin:0;"><input type="checkbox" style="width:auto;" [ngModel]="nums()" (ngModelChange)="nums.set($event)" /> &nbsp;0-9</label>
      <label class="row" style="margin:0;"><input type="checkbox" style="width:auto;" [ngModel]="sym()" (ngModelChange)="sym.set($event)" /> &nbsp;símbolos</label>
    </div>
    <button class="primary" (click)="gen()">Generar</button>
    <div class="card" style="margin-top:0.8rem; font-family:monospace; font-size:1.1rem; word-break:break-all;">{{ out() || '—' }}</div>
  `,
})
export class PasswordGenComponent {
  len = signal(16);
  upper = signal(true);
  nums = signal(true);
  sym = signal(true);
  out = signal('');
  gen() {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (this.upper()) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (this.nums()) chars += '0123456789';
    if (this.sym()) chars += '!@#$%^&*()-_=+[]{}';
    const arr = new Uint32Array(this.len());
    crypto.getRandomValues(arr);
    this.out.set(Array.from(arr, (n) => chars[n % chars.length]).join(''));
  }
}
