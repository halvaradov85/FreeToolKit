import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-password-strength',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Contraseña</label>
    <input type="text" [ngModel]="pw()" (ngModelChange)="pw.set($event)" placeholder="Escribe una contraseña…" />
    <div class="card" style="margin-top:1rem;">
      <div class="bar"><div class="fill" [style.width.%]="score() * 25" [style.background]="color()"></div></div>
      <strong>{{ label() }}</strong>
      <ul class="muted" style="margin:0.5rem 0 0; padding-left:1.1rem;">
        @for (h of hints(); track h) { <li>{{ h }}</li> }
      </ul>
    </div>
  `,
  styles: [`.bar{height:10px;border-radius:6px;background:var(--border);overflow:hidden;margin-bottom:0.6rem;} .fill{height:100%;transition:width .2s;}`],
})
export class PasswordStrengthComponent {
  pw = signal('');
  private checks = computed(() => {
    const p = this.pw();
    return {
      len: p.length >= 12,
      upperLower: /[a-z]/.test(p) && /[A-Z]/.test(p),
      num: /\d/.test(p),
      sym: /[^A-Za-z0-9]/.test(p),
    };
  });
  score = computed(() => Object.values(this.checks()).filter(Boolean).length);
  label = computed(() => ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'][this.score()]);
  color = computed(() => ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][this.score()]);
  hints = computed(() => {
    const c = this.checks();
    const h: string[] = [];
    if (!c.len) h.push('Usa al menos 12 caracteres');
    if (!c.upperLower) h.push('Combina mayúsculas y minúsculas');
    if (!c.num) h.push('Añade números');
    if (!c.sym) h.push('Añade símbolos');
    return h.length ? h : ['¡Excelente contraseña!'];
  });
}

@Component({
  selector: 'ftk-hash-gen',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto</label>
    <textarea rows="4" [ngModel]="text()" (ngModelChange)="text.set($event)"></textarea>
    <label>Algoritmo</label>
    <select [ngModel]="algo()" (ngModelChange)="algo.set($event)">
      <option value="SHA-256">SHA-256</option><option value="SHA-1">SHA-1</option><option value="SHA-512">SHA-512</option>
    </select>
    <button class="primary" style="margin:0.8rem 0;" (click)="run()">Calcular hash</button>
    <div class="card result" style="font-family:monospace; word-break:break-all;">{{ out() || '—' }}</div>
    <p class="muted">Nota: MD5 requiere una librería server-side; aquí se ofrecen los algoritmos de WebCrypto.</p>
  `,
})
export class HashGenComponent {
  text = signal('');
  algo = signal<'SHA-256' | 'SHA-1' | 'SHA-512'>('SHA-256');
  out = signal('');
  async run() {
    const data = new TextEncoder().encode(this.text());
    const buf = await crypto.subtle.digest(this.algo(), data);
    this.out.set(Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join(''));
  }
}

@Component({
  selector: 'ftk-encrypt-text',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto</label>
    <textarea rows="4" [ngModel]="text()" (ngModelChange)="text.set($event)"></textarea>
    <label>Clave</label>
    <input type="password" [ngModel]="key()" (ngModelChange)="key.set($event)" />
    <div class="row" style="margin:0.8rem 0;">
      <button class="primary" (click)="encrypt()">Cifrar</button>
      <button (click)="decrypt()">Descifrar</button>
    </div>
    <label>Resultado</label>
    <textarea rows="4" class="result" [ngModel]="out()" (ngModelChange)="out.set($event)"></textarea>
    @if (error()) { <p class="muted">{{ error() }}</p> }
  `,
})
export class EncryptTextComponent {
  text = signal('');
  key = signal('');
  out = signal('');
  error = signal('');

  private async deriveKey(salt: Uint8Array) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(this.key()), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
    );
  }

  async encrypt() {
    this.error.set('');
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await this.deriveKey(salt);
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(this.text()));
      const packed = new Uint8Array([...salt, ...iv, ...new Uint8Array(ct)]);
      this.out.set(btoa(String.fromCharCode(...packed)));
    } catch { this.error.set('No se pudo cifrar.'); }
  }

  async decrypt() {
    this.error.set('');
    try {
      const packed = Uint8Array.from(atob(this.out().trim()), (c) => c.charCodeAt(0));
      const salt = packed.slice(0, 16);
      const iv = packed.slice(16, 28);
      const data = packed.slice(28);
      const key = await this.deriveKey(salt);
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
      this.text.set(new TextDecoder().decode(pt));
    } catch { this.error.set('Clave incorrecta o datos inválidos.'); }
  }
}
