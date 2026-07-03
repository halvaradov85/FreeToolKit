import { Component, signal } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { FileDropComponent } from '../shared/file-drop.component';

// El worker de pdf.js se sirve como asset estático (procesamiento 100% en el navegador).
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PageImg { page: number; url: string; }

@Component({
  selector: 'ftk-pdf-to-image',
  standalone: true,
  imports: [FileDropComponent],
  template: `
    <ftk-file-drop accept="application/pdf" [multiple]="false" (filesChange)="setFile($event)" />
    @if (busy()) { <p class="muted">Procesando PDF… ({{ pages().length }} páginas)</p> }
    @if (error()) { <p class="muted" style="color:#ef4444;">{{ error() }}</p> }
    @if (pages().length) {
      <p class="muted">{{ pages().length }} página(s). Haz clic en "Descargar" en cada una.</p>
      <div class="grid">
        @for (p of pages(); track p.page) {
          <div class="card" style="text-align:center;">
            <img [src]="p.url" [alt]="'Página ' + p.page" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" />
            <a [href]="p.url" [download]="'pagina-' + p.page + '.png'"><button style="margin-top:0.5rem;">Descargar pág. {{ p.page }}</button></a>
          </div>
        }
      </div>
    }
  `,
})
export class PdfToImageComponent {
  readonly pages = signal<PageImg[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');

  async setFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    this.pages.set([]);
    this.error.set('');
    this.busy.set(true);
    try {
      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const max = Math.min(pdf.numPages, 30); // límite de seguridad
      for (let n = 1; n <= max; n++) {
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        this.pages.update((list) => [...list, { page: n, url: canvas.toDataURL('image/png') }]);
      }
    } catch {
      this.error.set('No se pudo leer el PDF. Asegúrate de que es un archivo válido.');
    } finally {
      this.busy.set(false);
    }
  }
}
