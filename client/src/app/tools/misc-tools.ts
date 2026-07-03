import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileDropComponent } from '../shared/file-drop.component';

@Component({
  selector: 'ftk-tweet-count',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Tweet</label>
    <textarea rows="5" [ngModel]="text()" (ngModelChange)="text.set($event)" placeholder="Escribe tu tweet…"></textarea>
    <div class="row" style="margin-top:1rem;">
      <div class="card"><strong [style.color]="over() ? '#ef4444' : 'inherit'">{{ remaining() }}</strong><div class="muted">restantes (de 280)</div></div>
      <div class="card"><strong>{{ text().length }}</strong><div class="muted">caracteres</div></div>
    </div>
    @if (over()) { <p class="muted">Te pasaste por {{ -remaining() }} caracteres.</p> }
  `,
})
export class TweetCountComponent {
  text = signal('');
  remaining = computed(() => 280 - this.text().length);
  over = computed(() => this.remaining() < 0);
}

@Component({
  selector: 'ftk-image-to-base64',
  standalone: true,
  imports: [FormsModule, FileDropComponent],
  template: `
    <label>Imagen</label>
    <ftk-file-drop accept="image/*" [multiple]="false" (filesChange)="setFile($event)" />
    @if (dataUrl()) {
      <img [src]="dataUrl()" alt="preview" style="max-width:100%;border-radius:8px;margin:1rem 0;" />
      <label>Data URL (Base64)</label>
      <textarea rows="6" class="result" readonly [value]="dataUrl()"></textarea>
    }
  `,
})
export class ImageToBase64Component {
  dataUrl = signal('');
  setFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.dataUrl.set(reader.result as string);
    reader.readAsDataURL(file); // procesado 100% en el navegador (Principio I)
  }
}
