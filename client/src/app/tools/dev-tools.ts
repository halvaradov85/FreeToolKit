import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-base64',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto</label>
    <textarea rows="5" [ngModel]="text()" (ngModelChange)="text.set($event)"></textarea>
    <div class="row" style="margin:0.8rem 0;">
      <button class="primary" (click)="encode()">Codificar →</button>
      <button (click)="decode()">← Decodificar</button>
    </div>
    <label>Base64</label>
    <textarea rows="5" class="result" [ngModel]="b64()" (ngModelChange)="b64.set($event)"></textarea>
    @if (error()) { <p class="muted">{{ error() }}</p> }
  `,
})
export class Base64Component {
  text = signal('');
  b64 = signal('');
  error = signal('');
  encode() {
    this.error.set('');
    try { this.b64.set(btoa(unescape(encodeURIComponent(this.text())))); }
    catch { this.error.set('No se pudo codificar.'); }
  }
  decode() {
    this.error.set('');
    try { this.text.set(decodeURIComponent(escape(atob(this.b64().trim())))); }
    catch { this.error.set('Base64 inválido.'); }
  }
}

@Component({
  selector: 'ftk-json-format',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>JSON</label>
    <textarea rows="8" [ngModel]="input()" (ngModelChange)="input.set($event)" placeholder='{"hola":"mundo"}'></textarea>
    <div class="row" style="margin:0.8rem 0;">
      <button class="primary" (click)="format(2)">Formatear</button>
      <button (click)="format(0)">Minificar</button>
    </div>
    @if (error()) { <p class="muted">⚠️ {{ error() }}</p> }
    <textarea rows="10" class="result" readonly [value]="output()"></textarea>
  `,
})
export class JsonFormatComponent {
  input = signal('');
  output = signal('');
  error = signal('');
  format(indent: number) {
    this.error.set('');
    try {
      const obj = JSON.parse(this.input());
      this.output.set(JSON.stringify(obj, null, indent));
    } catch (e) {
      this.error.set((e as Error).message);
      this.output.set('');
    }
  }
}
