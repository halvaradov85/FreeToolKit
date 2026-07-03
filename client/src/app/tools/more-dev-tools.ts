import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-color-picker',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Color</label>
    <input type="color" [ngModel]="hex()" (ngModelChange)="hex.set($event)" style="height:48px;" />
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong>{{ hex().toUpperCase() }}</strong><div class="muted">HEX</div></div>
      <div class="card"><strong>{{ rgb() }}</strong><div class="muted">RGB</div></div>
      <div class="card"><strong>{{ hsl() }}</strong><div class="muted">HSL</div></div>
    </div>
    <div [style.background]="hex()" style="height:70px;border-radius:8px;margin-top:1rem;border:1px solid var(--border);"></div>
  `,
})
export class ColorPickerComponent {
  hex = signal('#2563eb');
  private parse = computed(() => {
    const h = this.hex().replace('#', '');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  });
  rgb = computed(() => { const { r, g, b } = this.parse(); return `rgb(${r}, ${g}, ${b})`; });
  hsl = computed(() => {
    let { r, g, b } = this.parse();
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  });
}

@Component({
  selector: 'ftk-minify',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Código (CSS / JS / HTML)</label>
    <textarea rows="8" [ngModel]="input()" (ngModelChange)="input.set($event)"></textarea>
    <button class="primary" style="margin:0.8rem 0;" (click)="run()">Minificar</button>
    <label>Resultado ({{ saved() }}% menos)</label>
    <textarea rows="6" class="result" readonly [value]="output()"></textarea>
  `,
})
export class MinifyComponent {
  input = signal('');
  output = signal('');
  saved = signal(0);
  run() {
    const out = this.input()
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n\r]*/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,>])\s*/g, '$1')
      .trim();
    this.output.set(out);
    const before = this.input().length || 1;
    this.saved.set(Math.max(0, Math.round((1 - out.length / before) * 100)));
  }
}

@Component({
  selector: 'ftk-seo-meta',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Título</label>
    <input [ngModel]="title()" (ngModelChange)="title.set($event)" />
    <label>Descripción</label>
    <textarea rows="2" [ngModel]="desc()" (ngModelChange)="desc.set($event)"></textarea>
    <label>URL</label>
    <input [ngModel]="url()" (ngModelChange)="url.set($event)" />
    <label>Meta tags generadas</label>
    <textarea rows="8" class="result" readonly [value]="output()"></textarea>
  `,
})
export class SeoMetaComponent {
  title = signal('');
  desc = signal('');
  url = signal('');
  output = computed(() =>
    [
      `<title>${this.title()}</title>`,
      `<meta name="description" content="${this.desc()}">`,
      `<meta property="og:title" content="${this.title()}">`,
      `<meta property="og:description" content="${this.desc()}">`,
      `<meta property="og:url" content="${this.url()}">`,
      `<meta property="og:type" content="website">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${this.title()}">`,
      `<meta name="twitter:description" content="${this.desc()}">`,
    ].join('\n'),
  );
}

@Component({
  selector: 'ftk-json-xml-validate',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Contenido</label>
    <textarea rows="8" [ngModel]="input()" (ngModelChange)="input.set($event)"></textarea>
    <div class="row" style="margin:0.8rem 0;">
      <button class="primary" (click)="validate('json')">Validar JSON</button>
      <button (click)="validate('xml')">Validar XML</button>
    </div>
    <div class="card" [style.borderColor]="ok() ? '#22c55e' : '#ef4444'">{{ message() || 'Sin validar.' }}</div>
  `,
})
export class JsonXmlValidateComponent {
  input = signal('');
  message = signal('');
  ok = signal(false);
  validate(kind: 'json' | 'xml') {
    if (kind === 'json') {
      try { JSON.parse(this.input()); this.ok.set(true); this.message.set('✅ JSON válido'); }
      catch (e) { this.ok.set(false); this.message.set('❌ ' + (e as Error).message); }
    } else {
      const doc = new DOMParser().parseFromString(this.input(), 'application/xml');
      const err = doc.querySelector('parsererror');
      if (err) { this.ok.set(false); this.message.set('❌ XML inválido'); }
      else { this.ok.set(true); this.message.set('✅ XML válido'); }
    }
  }
}

@Component({
  selector: 'ftk-htaccess',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label class="row" style="margin:0;"><input type="checkbox" style="width:auto;" [ngModel]="forceHttps()" (ngModelChange)="forceHttps.set($event)" /> &nbsp;Forzar HTTPS</label>
    <label class="row" style="margin:0.4rem 0 0;"><input type="checkbox" style="width:auto;" [ngModel]="wwwToNon()" (ngModelChange)="wwwToNon.set($event)" /> &nbsp;Redirigir www → sin www</label>
    <label class="row" style="margin:0.4rem 0 0;"><input type="checkbox" style="width:auto;" [ngModel]="blockDot()" (ngModelChange)="blockDot.set($event)" /> &nbsp;Bloquear archivos ocultos (.git, .env)</label>
    <label>.htaccess</label>
    <textarea rows="12" class="result" readonly [value]="output()"></textarea>
  `,
})
export class HtaccessComponent {
  forceHttps = signal(true);
  wwwToNon = signal(false);
  blockDot = signal(true);
  output = computed(() => {
    const lines = ['RewriteEngine On'];
    if (this.forceHttps()) lines.push('RewriteCond %{HTTPS} off', 'RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
    if (this.wwwToNon()) lines.push('RewriteCond %{HTTP_HOST} ^www\\.(.*)$ [NC]', 'RewriteRule ^(.*)$ https://%1/$1 [L,R=301]');
    if (this.blockDot()) lines.push('RewriteRule "(^|/)\\." - [F]');
    return lines.join('\n');
  });
}
