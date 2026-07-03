import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { FileDropComponent } from '../shared/file-drop.component';

@Component({
  selector: 'ftk-qr-generate',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label>Texto o URL</label>
    <input [ngModel]="text()" (ngModelChange)="text.set($event)" placeholder="https://…" />
    <label>Color</label>
    <input type="color" [ngModel]="color()" (ngModelChange)="color.set($event)" style="height:42px;" />
    <button class="primary" style="margin:0.8rem 0;" (click)="gen()">Generar QR</button>
    @if (dataUrl()) {
      <div><img [src]="dataUrl()" alt="QR" style="border-radius:8px;background:#fff;padding:8px;" /></div>
      <a [href]="dataUrl()" download="qr.png"><button style="margin-top:0.6rem;">Descargar PNG</button></a>
    }
  `,
})
export class QrGenerateComponent {
  text = signal('https://freetoolkit.local');
  color = signal('#000000');
  dataUrl = signal('');
  async gen() {
    if (!this.text()) return;
    this.dataUrl.set(
      await QRCode.toDataURL(this.text(), { width: 256, color: { dark: this.color(), light: '#ffffff' } }),
    );
  }
}

@Component({
  selector: 'ftk-qr-read',
  standalone: true,
  imports: [FormsModule, FileDropComponent],
  template: `
    <label>Imagen con QR</label>
    <ftk-file-drop accept="image/*" [multiple]="false" (filesChange)="setFile($event)" />
    @if (result()) { <div class="card" style="margin-top:1rem; word-break:break-all;"><strong>{{ result() }}</strong></div> }
    @if (error()) { <p class="muted">{{ error() }}</p> }
  `,
})
export class QrReadComponent {
  result = signal('');
  error = signal('');
  setFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    this.error.set('');
    this.result.set('');
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      if (code) this.result.set(code.data);
      else this.error.set('No se detectó ningún QR en la imagen.');
    };
    img.src = URL.createObjectURL(file);
  }
}
