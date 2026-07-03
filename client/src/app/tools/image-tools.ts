import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileDropComponent } from '../shared/file-drop.component';

abstract class CanvasToolBase {
  img = signal<HTMLImageElement | null>(null);
  out = signal('');
  setFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const image = new Image();
    image.onload = () => { this.img.set(image); this.process(); };
    image.src = URL.createObjectURL(file); // 100% en el navegador (Principio I)
  }
  abstract process(): void;
}

@Component({
  selector: 'ftk-image-convert',
  standalone: true,
  imports: [FormsModule, FileDropComponent],
  template: `
    <label>Imagen</label>
    <ftk-file-drop accept="image/*" [multiple]="false" (filesChange)="setFile($event)" />
    <label>Convertir a</label>
    <select [ngModel]="format()" (ngModelChange)="format.set($event); process()">
      <option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option>
    </select>
    @if (out()) {
      <img [src]="out()" alt="out" style="max-width:100%;border-radius:8px;margin:1rem 0;" />
      <a [href]="out()" [download]="'imagen' + ext()"><button class="primary">Descargar</button></a>
    }
  `,
})
export class ImageConvertComponent extends CanvasToolBase {
  format = signal('image/png');
  ext() { return this.format() === 'image/jpeg' ? '.jpg' : this.format() === 'image/webp' ? '.webp' : '.png'; }
  process() {
    const image = this.img();
    if (!image) return;
    const c = document.createElement('canvas');
    c.width = image.naturalWidth; c.height = image.naturalHeight;
    c.getContext('2d')!.drawImage(image, 0, 0);
    this.out.set(c.toDataURL(this.format(), 0.92));
  }
}

@Component({
  selector: 'ftk-image-crop',
  standalone: true,
  imports: [FormsModule, FileDropComponent],
  template: `
    <label>Imagen</label>
    <ftk-file-drop accept="image/*" [multiple]="false" (filesChange)="setFile($event)" />
    <div class="row">
      <div><label>X</label><input type="number" [ngModel]="x()" (ngModelChange)="x.set(+$event); process()" /></div>
      <div><label>Y</label><input type="number" [ngModel]="y()" (ngModelChange)="y.set(+$event); process()" /></div>
      <div><label>Ancho</label><input type="number" [ngModel]="w()" (ngModelChange)="w.set(+$event); process()" /></div>
      <div><label>Alto</label><input type="number" [ngModel]="h()" (ngModelChange)="h.set(+$event); process()" /></div>
    </div>
    @if (out()) {
      <img [src]="out()" alt="crop" style="max-width:100%;border-radius:8px;margin:1rem 0;" />
      <a [href]="out()" download="recorte.png"><button class="primary">Descargar</button></a>
    }
  `,
})
export class ImageCropComponent extends CanvasToolBase {
  x = signal(0); y = signal(0); w = signal(200); h = signal(200);
  process() {
    const image = this.img();
    if (!image) return;
    const c = document.createElement('canvas');
    c.width = this.w(); c.height = this.h();
    c.getContext('2d')!.drawImage(image, this.x(), this.y(), this.w(), this.h(), 0, 0, this.w(), this.h());
    this.out.set(c.toDataURL('image/png'));
  }
}

@Component({
  selector: 'ftk-image-favicon',
  standalone: true,
  imports: [FormsModule, FileDropComponent],
  template: `
    <label>Imagen</label>
    <ftk-file-drop accept="image/*" [multiple]="false" (filesChange)="setFile($event)" />
    @if (out()) {
      <div class="row" style="margin-top:1rem;align-items:flex-end;">
        <img [src]="out()" alt="favicon" width="64" height="64" style="image-rendering:pixelated;border:1px solid var(--border);border-radius:6px;" />
        <a [href]="out()" download="favicon.png"><button class="primary">Descargar favicon (32×32)</button></a>
      </div>
    }
  `,
})
export class ImageFaviconComponent extends CanvasToolBase {
  process() {
    const image = this.img();
    if (!image) return;
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    c.getContext('2d')!.drawImage(image, 0, 0, 32, 32);
    this.out.set(c.toDataURL('image/png'));
  }
}

const SOCIAL_PRESETS: Record<string, [number, number]> = {
  'IG cuadrado (1080×1080)': [1080, 1080],
  'IG historia (1080×1920)': [1080, 1920],
  'FB portada (820×312)': [820, 312],
  'Twitter post (1200×675)': [1200, 675],
};

@Component({
  selector: 'ftk-social-resize',
  standalone: true,
  imports: [FormsModule, FileDropComponent],
  template: `
    <label>Imagen</label>
    <ftk-file-drop accept="image/*" [multiple]="false" (filesChange)="setFile($event)" />
    <label>Formato de red</label>
    <select [ngModel]="preset()" (ngModelChange)="preset.set($event); process()">
      @for (p of presets; track p) { <option [value]="p">{{ p }}</option> }
    </select>
    @if (out()) {
      <img [src]="out()" alt="out" style="max-width:100%;border-radius:8px;margin:1rem 0;" />
      <a [href]="out()" download="social.png"><button class="primary">Descargar</button></a>
    }
  `,
})
export class SocialResizeComponent extends CanvasToolBase {
  readonly presets = Object.keys(SOCIAL_PRESETS);
  preset = signal(this.presets[0]);
  process() {
    const image = this.img();
    if (!image) return;
    const [tw, th] = SOCIAL_PRESETS[this.preset()];
    const c = document.createElement('canvas');
    c.width = tw; c.height = th;
    const ctx = c.getContext('2d')!;
    // Cubrir el lienzo manteniendo proporción (cover).
    const scale = Math.max(tw / image.naturalWidth, th / image.naturalHeight);
    const sw = image.naturalWidth * scale, sh = image.naturalHeight * scale;
    ctx.drawImage(image, (tw - sw) / 2, (th - sh) / 2, sw, sh);
    this.out.set(c.toDataURL('image/png'));
  }
}
