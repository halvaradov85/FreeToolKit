import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-spellcheck',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto</label>
    <textarea rows="7" spellcheck="true" [ngModel]="text()" (ngModelChange)="text.set($event)"></textarea>
    <div class="row" style="margin:0.8rem 0;">
      <button class="primary" (click)="apply()">Aplicar limpieza básica</button>
      <button (click)="clear()">Limpiar</button>
    </div>
    <div class="row">
      <div class="card"><strong>{{ words() }}</strong><div class="muted">palabras</div></div>
      <div class="card"><strong>{{ suggestions().length }}</strong><div class="muted">ajustes</div></div>
    </div>
    @if (suggestions().length) {
      <ul class="muted" style="padding-left:1.1rem;">
        @for (s of suggestions(); track s) { <li>{{ s }}</li> }
      </ul>
    }
  `,
})
export class SpellcheckComponent {
  readonly text = signal('');
  readonly words = computed(() => (this.text().trim() ? this.text().trim().split(/\s+/).length : 0));
  readonly cleaned = computed(() => this.basicClean(this.text()));
  readonly suggestions = computed(() => {
    const original = this.text();
    const items: string[] = [];
    if (/\s{2,}/.test(original)) items.push('Espacios repetidos');
    if (/\s+[,.!?;:]/.test(original)) items.push('Espacios antes de puntuación');
    if (/[,.!?;:](?!\s|$)/.test(original)) items.push('Espacios después de puntuación');
    if (original && original !== this.cleaned()) items.push('Mayúscula inicial y puntuación');
    return [...new Set(items)];
  });

  apply() {
    this.text.set(this.cleaned());
  }

  clear() {
    this.text.set('');
  }

  private basicClean(value: string) {
    const cleaned = value
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/([,.!?;:])(?=\S)/g, '$1 ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return cleaned.replace(/(^|[.!?]\s+)([a-záéíóúñ])/g, (_, prefix: string, letter: string) => prefix + letter.toUpperCase());
  }
}
