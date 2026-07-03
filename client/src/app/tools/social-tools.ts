import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-social-hashtags',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Palabras clave (separadas por comas o espacios)</label>
    <textarea rows="3" [ngModel]="keywords()" (ngModelChange)="keywords.set($event)" placeholder="viaje, fotografía, atardecer"></textarea>
    <label>Resultado</label>
    <div class="card result" style="min-height:60px;">{{ hashtags() || '—' }}</div>
    <button style="margin-top:0.6rem;" (click)="copy()">Copiar</button>
  `,
})
export class SocialHashtagsComponent {
  keywords = signal('');
  private extras = ['trending', 'viral', 'love', 'instagood', 'photooftheday', 'follow', 'instadaily'];
  hashtags = computed(() => {
    const words = this.keywords()
      .split(/[\s,]+/)
      .map((w) => w.trim().toLowerCase().replace(/[^a-z0-9áéíóúñ]/gi, ''))
      .filter(Boolean);
    if (!words.length) return '';
    const base = words.map((w) => '#' + w);
    const combos = words.length > 1 ? ['#' + words.join('')] : [];
    const extra = this.extras.slice(0, Math.max(0, 12 - base.length)).map((e) => '#' + e);
    return [...new Set([...base, ...combos, ...extra])].join(' ');
  });
  copy() { navigator.clipboard?.writeText(this.hashtags()); }
}
