import { Component, ElementRef, HostListener, input, output, signal, viewChild } from '@angular/core';

interface Preview { name: string; url: string | null; }

@Component({
  selector: 'ftk-file-drop',
  standalone: true,
  template: `
    <div
      class="dz"
      [class.over]="over()"
      tabindex="0"
      role="button"
      (click)="pick()"
      (keydown.enter)="pick()"
      (dragover)="onDragOver($event)"
      (dragleave)="over.set(false)"
      (drop)="onDrop($event)"
    >
      <input #fileInput type="file" hidden [accept]="accept()" [multiple]="multiple()" (change)="onInput($event)" />
      <input #camInput type="file" hidden accept="image/*" capture="environment" (change)="onInput($event)" />

      <div class="dz-icon">{{ over() ? '📥' : '⬆️' }}</div>
      <p class="dz-main"><strong>Arrastra</strong> aquí o <span class="link">haz clic</span></p>
      <p class="dz-sub">también puedes <strong>pegar</strong> con Ctrl/⌘ + V</p>
      @if (isImage()) {
        <button type="button" class="cam" (click)="pickCamera($event)">📷 Usar cámara</button>
      }
    </div>

    @if (previews().length) {
      <div class="previews">
        @for (p of previews(); track p.name + p.url) {
          @if (p.url) {
            <div class="thumb"><img [src]="p.url" [alt]="p.name" /></div>
          } @else {
            <div class="thumb file">📄<span>{{ p.name }}</span></div>
          }
        }
      </div>
    }
  `,
  styles: [
    `
      .dz {
        border: 2px dashed var(--border); border-radius: 16px; padding: 1.6rem 1rem;
        text-align: center; cursor: pointer; background: var(--surface-2);
        transition: border-color 0.15s, background 0.15s, transform 0.1s;
      }
      .dz:hover, .dz:focus-visible { border-color: var(--primary); outline: none; }
      .dz.over { border-color: var(--primary); background: var(--grad-soft); transform: scale(1.01); }
      .dz-icon { font-size: 1.8rem; }
      .dz-main { margin: 0.4rem 0 0.1rem; }
      .dz-sub { margin: 0; font-size: 0.82rem; color: var(--muted); }
      .link { color: var(--primary); font-weight: 600; }
      .cam { margin-top: 0.8rem; }
      .previews { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.9rem; }
      .thumb {
        width: 78px; height: 78px; border-radius: 12px; overflow: hidden;
        border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
        background: var(--surface);
      }
      .thumb img { width: 100%; height: 100%; object-fit: cover; }
      .thumb.file { flex-direction: column; font-size: 1.4rem; gap: 0.2rem; padding: 0.3rem; }
      .thumb.file span { font-size: 0.6rem; color: var(--muted); text-align: center; word-break: break-all; line-height: 1.1; }
    `,
  ],
})
export class FileDropComponent {
  readonly accept = input<string>('*');
  readonly multiple = input<boolean>(true);
  readonly filesChange = output<File[]>();

  readonly over = signal(false);
  readonly previews = signal<Preview[]>([]);
  private fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private camInput = viewChild.required<ElementRef<HTMLInputElement>>('camInput');

  isImage() {
    return this.accept().includes('image');
  }

  pick() { this.fileInput().nativeElement.click(); }
  pickCamera(ev: Event) { ev.stopPropagation(); this.camInput().nativeElement.click(); }

  onInput(ev: Event) {
    const files = Array.from((ev.target as HTMLInputElement).files ?? []);
    if (files.length) this.setFiles(files);
  }

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.over.set(true);
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.over.set(false);
    const files = Array.from(ev.dataTransfer?.files ?? []).filter((f) => this.accepts(f));
    if (files.length) this.setFiles(files);
  }

  // Pegar con Ctrl+V (imágenes del portapapeles o archivos copiados).
  @HostListener('window:paste', ['$event'])
  onPaste(ev: ClipboardEvent) {
    const items = ev.clipboardData?.files;
    if (!items || items.length === 0) return;
    const files = Array.from(items).filter((f) => this.accepts(f));
    if (files.length) {
      ev.preventDefault();
      this.setFiles(files);
    }
  }

  private accepts(f: File): boolean {
    const a = this.accept();
    if (a === '*' || a === '') return true;
    if (a.includes('image')) return f.type.startsWith('image/');
    if (a.includes('pdf')) return f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    return true;
  }

  private setFiles(files: File[]) {
    const list = this.multiple() ? files : files.slice(0, 1);
    this.previews().forEach((p) => p.url && URL.revokeObjectURL(p.url));
    this.previews.set(
      list.map((f) => ({ name: f.name, url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null })),
    );
    this.filesChange.emit(list);
  }
}
