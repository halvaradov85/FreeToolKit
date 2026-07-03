import { Component, ElementRef, HostListener, signal, viewChild } from '@angular/core';
import { FileDropComponent } from '../shared/file-drop.component';

interface Rect { x: number; y: number; w: number; h: number; }

@Component({
  selector: 'ftk-crop',
  standalone: true,
  imports: [FileDropComponent],
  template: `
    @if (!src()) {
      <ftk-file-drop accept="image/*" [multiple]="false" (filesChange)="setFile($event)" />
    } @else {
      <p class="muted">Arrastra el recuadro para moverlo y la esquina ◢ para cambiar el tamaño.</p>
      <div class="stage" #stage>
        <img #img [src]="src()" (load)="onImgLoad()" alt="origen" draggable="false" />
        <div class="overlay"
             [style.left.px]="sel().x" [style.top.px]="sel().y"
             [style.width.px]="sel().w" [style.height.px]="sel().h"
             (pointerdown)="startMove($event)">
          <span class="dim">{{ natW() }}×{{ natH() }}</span>
          <div class="handle" (pointerdown)="startResize($event)"></div>
        </div>
      </div>
      <div class="row" style="margin-top:0.8rem;">
        <button class="primary" (click)="crop()">Recortar</button>
        <button (click)="reset()">Cambiar imagen</button>
      </div>
      @if (out()) {
        <label>Resultado</label>
        <img [src]="out()" alt="recorte" style="max-width:100%;border-radius:10px;border:1px solid var(--border);" />
        <a [href]="out()" download="recorte.png"><button style="margin-top:0.5rem;">Descargar PNG</button></a>
      }
    }
  `,
  styles: [
    `
      .stage { position: relative; display: inline-block; max-width: 100%; line-height: 0; user-select: none; touch-action: none; }
      .stage img { max-width: 100%; height: auto; border-radius: 10px; display: block; }
      .overlay {
        position: absolute; border: 2px solid var(--primary); cursor: move;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.45); box-sizing: border-box;
      }
      .handle {
        position: absolute; right: -8px; bottom: -8px; width: 16px; height: 16px;
        background: var(--primary); border: 2px solid #fff; border-radius: 4px; cursor: nwse-resize;
      }
      .dim {
        position: absolute; top: -22px; left: 0; font-size: 0.7rem; line-height: 1;
        background: var(--primary); color: #fff; padding: 2px 6px; border-radius: 6px; white-space: nowrap;
      }
    `,
  ],
})
export class CropComponent {
  private imgEl = viewChild<ElementRef<HTMLImageElement>>('img');
  readonly src = signal('');
  readonly out = signal('');
  readonly sel = signal<Rect>({ x: 20, y: 20, w: 150, h: 150 });
  private image: HTMLImageElement | null = null;
  private scale = 1; // natural / display
  private mode: 'none' | 'move' | 'resize' = 'none';
  private start = { px: 0, py: 0, x: 0, y: 0, w: 0, h: 0 };

  natW() { return Math.round(this.sel().w * this.scale); }
  natH() { return Math.round(this.sel().h * this.scale); }

  setFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    this.out.set('');
    const img = new Image();
    img.onload = () => { this.image = img; this.src.set(img.src); };
    img.src = URL.createObjectURL(file);
  }

  reset() { this.src.set(''); this.out.set(''); this.image = null; }

  onImgLoad() {
    const el = this.imgEl()?.nativeElement;
    if (!el || !this.image) return;
    this.scale = this.image.naturalWidth / el.clientWidth;
    // Selección inicial centrada al 60%.
    const w = Math.round(el.clientWidth * 0.6);
    const h = Math.round(el.clientHeight * 0.6);
    this.sel.set({ x: (el.clientWidth - w) / 2, y: (el.clientHeight - h) / 2, w, h });
  }

  startMove(ev: PointerEvent) {
    ev.preventDefault();
    this.mode = 'move';
    const s = this.sel();
    this.start = { px: ev.clientX, py: ev.clientY, x: s.x, y: s.y, w: s.w, h: s.h };
  }

  startResize(ev: PointerEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.mode = 'resize';
    const s = this.sel();
    this.start = { px: ev.clientX, py: ev.clientY, x: s.x, y: s.y, w: s.w, h: s.h };
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(ev: PointerEvent) {
    if (this.mode === 'none') return;
    const el = this.imgEl()?.nativeElement;
    if (!el) return;
    const dx = ev.clientX - this.start.px;
    const dy = ev.clientY - this.start.py;
    const maxW = el.clientWidth;
    const maxH = el.clientHeight;
    if (this.mode === 'move') {
      const x = Math.min(Math.max(0, this.start.x + dx), maxW - this.start.w);
      const y = Math.min(Math.max(0, this.start.y + dy), maxH - this.start.h);
      this.sel.set({ x, y, w: this.start.w, h: this.start.h });
    } else {
      const w = Math.min(Math.max(20, this.start.w + dx), maxW - this.start.x);
      const h = Math.min(Math.max(20, this.start.h + dy), maxH - this.start.y);
      this.sel.set({ x: this.start.x, y: this.start.y, w, h });
    }
  }

  @HostListener('window:pointerup')
  onPointerUp() { this.mode = 'none'; }

  crop() {
    if (!this.image) return;
    const s = this.sel();
    const sx = Math.round(s.x * this.scale), sy = Math.round(s.y * this.scale);
    const sw = Math.round(s.w * this.scale), sh = Math.round(s.h * this.scale);
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext('2d')!.drawImage(this.image, sx, sy, sw, sh, 0, 0, sw, sh);
    this.out.set(canvas.toDataURL('image/png'));
  }
}
