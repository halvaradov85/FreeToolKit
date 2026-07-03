import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ftk-tts',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (!supported()) {
      <p class="muted">Tu navegador no soporta síntesis de voz.</p>
    } @else {
      <label>Texto</label>
      <textarea rows="5" [ngModel]="text()" (ngModelChange)="text.set($event)" placeholder="Escribe lo que quieres escuchar…"></textarea>

      @if (voices().length) {
        <label>Voz</label>
        <select [ngModel]="voiceName()" (ngModelChange)="voiceName.set($event)">
          @for (v of voices(); track v.name) { <option [value]="v.name">{{ v.name }} ({{ v.lang }})</option> }
        </select>
      }

      <label>Velocidad: {{ rate() }}×</label>
      <input type="range" min="0.5" max="2" step="0.1" [ngModel]="rate()" (ngModelChange)="rate.set(+$event)" />

      <div class="row" style="margin-top:0.8rem;">
        <button class="primary" [disabled]="!text().trim() || speaking()" (click)="speak()">🔊 Escuchar</button>
        <button [disabled]="!speaking()" (click)="stop()">⏹ Detener</button>
      </div>
    }
  `,
})
export class TextToSpeechComponent implements OnInit, OnDestroy {
  readonly supported = signal(typeof window !== 'undefined' && 'speechSynthesis' in window);
  readonly text = signal('');
  readonly voices = signal<SpeechSynthesisVoice[]>([]);
  readonly voiceName = signal('');
  readonly rate = signal(1);
  readonly speaking = signal(false);

  ngOnInit() {
    if (!this.supported()) return;
    this.loadVoices();
    speechSynthesis.addEventListener('voiceschanged', this.loadVoices);
  }

  ngOnDestroy() {
    if (this.supported()) {
      speechSynthesis.removeEventListener('voiceschanged', this.loadVoices);
      speechSynthesis.cancel();
    }
  }

  private loadVoices = () => {
    const list = speechSynthesis.getVoices();
    if (!list.length) return;
    this.voices.set(list);
    if (!this.voiceName()) {
      const es = list.find((v) => v.lang.startsWith('es'));
      this.voiceName.set((es ?? list[0]).name);
    }
  };

  speak() {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(this.text());
    const v = this.voices().find((x) => x.name === this.voiceName());
    if (v) { u.voice = v; u.lang = v.lang; }
    u.rate = this.rate();
    u.onend = () => this.speaking.set(false);
    u.onerror = () => this.speaking.set(false);
    this.speaking.set(true);
    speechSynthesis.speak(u);
  }

  stop() {
    speechSynthesis.cancel();
    this.speaking.set(false);
  }
}
