import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import type { QuotaStatus, ToolDef } from '@freetoolkit/shared';
import { FileDropComponent } from '../shared/file-drop.component';

interface ParamField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'color' | 'select';
  default?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const WATERMARK_POSITIONS = [
  { value: 'northwest', label: 'Arriba izquierda' },
  { value: 'north', label: 'Arriba centro' },
  { value: 'northeast', label: 'Arriba derecha' },
  { value: 'west', label: 'Centro izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'east', label: 'Centro derecha' },
  { value: 'southwest', label: 'Abajo izquierda' },
  { value: 'south', label: 'Abajo centro' },
  { value: 'southeast', label: 'Abajo derecha' },
];

// Campos de parámetros por herramienta (UX clara en vez de JSON manual).
const PARAM_FIELDS: Record<string, ParamField[]> = {
  'image-resize': [
    { key: 'width', label: 'Ancho (px)', type: 'number', default: '800' },
    { key: 'height', label: 'Alto (px, opcional)', type: 'number' },
  ],
  'image-compress': [{ key: 'quality', label: 'Calidad (30–95)', type: 'number', default: '70' }],
  'image-watermark': [
    { key: 'text', label: 'Texto de la marca', type: 'text', default: 'FreeToolKit' },
    { key: 'position', label: 'Posición', type: 'select', default: 'southeast', options: WATERMARK_POSITIONS },
    { key: 'color', label: 'Color', type: 'color', default: '#ffffff' },
    { key: 'opacity', label: 'Opacidad (0.1–1)', type: 'number', default: '0.5' },
  ],
  'pdf-split': [
    { key: 'from', label: 'Desde la página', type: 'number', default: '1' },
    { key: 'to', label: 'Hasta la página (opcional)', type: 'number' },
  ],
};

@Component({
  selector: 'ftk-server-tool',
  standalone: true,
  imports: [FormsModule, FileDropComponent],
  template: `
    <!-- Slot de anuncios para usuarios no-Pro (FR-011) -->
    <div class="ad-slot muted">Publicidad · pásate a Pro para quitarla</div>

    @if (quota(); as q) {
      @if (!q.unlimited) {
        <p class="muted">Cupo de hoy: <strong>{{ q.remaining }}</strong> de {{ q.limit }} restantes</p>
      } @else {
        <p class="muted">Uso ilimitado</p>
      }
    }

    <label>Archivo(s)</label>
    <ftk-file-drop [accept]="acceptType()" [multiple]="multiFile()" (filesChange)="files = $event" />

    @for (f of fields(); track f.key) {
      <label>{{ f.label }}</label>
      @if (f.type === 'select') {
        <select [ngModel]="paramValues()[f.key]" (ngModelChange)="setParam(f.key, $event)">
          @for (o of f.options ?? []; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
        </select>
      } @else if (f.type === 'color') {
        <input type="color" style="height:44px;" [ngModel]="paramValues()[f.key]" (ngModelChange)="setParam(f.key, $event)" />
      } @else {
        <input [type]="f.type" [ngModel]="paramValues()[f.key]" (ngModelChange)="setParam(f.key, $event)"
               [placeholder]="f.placeholder ?? ''" />
      }
    }

    @if (fields().length === 0) {
      <label>Parámetros (JSON opcional)</label>
      <textarea rows="2" [ngModel]="paramsText()" (ngModelChange)="paramsText.set($event)"></textarea>
    }

    <button class="primary" style="margin:0.9rem 0;" [disabled]="busy()" (click)="run()">
      {{ busy() ? 'Procesando…' : 'Ejecutar' }}
    </button>

    @if (message()) { <div class="card" [style.borderColor]="error() ? '#ef4444' : '#22c55e'">{{ message() }}</div> }

    @if (downloadUrl()) {
      <a [href]="downloadUrl()" [download]="downloadName()"><button style="margin-top:0.6rem;">Descargar resultado</button></a>
    }

    @if (upgrade()) {
      <div class="card" style="margin-top:0.8rem; border-color: var(--primary);">
        Alcanzaste el límite gratuito de hoy. <a href="/billing/upgrade">Pásate a Pro</a> para uso ilimitado.
      </div>
    }
  `,
  styles: [`.ad-slot{border:1px dashed var(--border);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.8rem;margin-bottom:1rem;}`],
})
export class ServerToolComponent {
  private http = inject(HttpClient);

  readonly toolDef = input.required<ToolDef>();
  readonly quota = signal<QuotaStatus | null>(null);
  readonly paramsText = signal('');
  readonly paramValues = signal<Record<string, string>>({});
  readonly busy = signal(false);
  readonly message = signal('');
  readonly error = signal(false);
  readonly upgrade = signal(false);
  readonly downloadUrl = signal('');
  readonly downloadName = signal('resultado');
  readonly fields = computed<ParamField[]>(() => PARAM_FIELDS[this.toolDef()?.id ?? ''] ?? []);
  // Solo "unir PDF" necesita varios archivos; el resto procesan uno.
  readonly multiFile = computed(() => this.toolDef()?.id === 'pdf-merge');
  readonly acceptType = computed(() => {
    const id = this.toolDef()?.id;
    if (id === 'word-to-pdf') return '.doc,.docx,.odt,.rtf';
    if (id === 'excel-to-pdf') return '.xls,.xlsx,.ods,.csv';
    const cat = this.toolDef()?.category;
    if (cat === 'imagenes') return 'image/*';
    if (cat === 'pdf') return 'application/pdf';
    return '*';
  });
  files: File[] = [];

  constructor() {
    effect(
      () => {
        const def = this.toolDef();
        if (!def) return;
        this.refreshQuota(def.id);
        // Inicializa los campos con sus valores por defecto.
        const init: Record<string, string> = {};
        for (const f of PARAM_FIELDS[def.id] ?? []) if (f.default) init[f.key] = f.default;
        this.paramValues.set(init);
      },
      { allowSignalWrites: true },
    );
  }

  setParam(key: string, value: string) {
    this.paramValues.update((p) => ({ ...p, [key]: value }));
  }

  private async refreshQuota(id: string) {
    try {
      this.quota.set(await firstValueFrom(this.http.get<QuotaStatus>(`/api/v1/tools/${id}/quota`)));
    } catch { /* sin cuota visible */ }
  }

  private buildParams(): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(this.paramValues())) {
      if (v === '' || v === null || v === undefined) continue;
      const field = this.fields().find((f) => f.key === k);
      params[k] = field?.type === 'number' ? Number(v) : v;
    }
    if (this.fields().length === 0 && this.paramsText().trim()) {
      try { Object.assign(params, JSON.parse(this.paramsText().trim())); } catch { /* ignora JSON inválido */ }
    }
    return params;
  }

  private filenameFromResponse(response: HttpResponse<Blob>, fallback: string) {
    const disposition = response.headers.get('content-disposition') ?? '';
    const match = /filename="?([^"]+)"?/i.exec(disposition);
    return match?.[1] || fallback;
  }

  async run() {
    const def = this.toolDef();
    if (!def) return;
    this.message.set(''); this.error.set(false); this.upgrade.set(false); this.downloadUrl.set('');

    if (this.files.length === 0) {
      this.error.set(true);
      this.message.set('Primero sube un archivo (arrastra, pega o usa la cámara).');
      return;
    }

    this.busy.set(true);
    try {
      const form = new FormData();
      this.files.forEach((f) => form.append('files', f));
      form.append('params', JSON.stringify(this.buildParams()));
      const response = await firstValueFrom(
        this.http.post(`/api/v1/tools/${def.id}/execute`, form, { responseType: 'blob', observe: 'response' }),
      );
      const blob = response.body ?? new Blob();
      this.downloadUrl.set(URL.createObjectURL(blob));
      this.downloadName.set(this.filenameFromResponse(response, `${def.id}-resultado`));
      this.message.set('¡Listo! Descarga tu resultado.');
      this.refreshQuota(def.id);
    } catch (e) {
      this.error.set(true);
      const err = e as HttpErrorResponse;
      if (err.status === 429) {
        this.upgrade.set(true);
        this.message.set('Cupo diario agotado.');
      } else if (err.status === 402) {
        this.upgrade.set(true);
        this.message.set('Esta herramienta es exclusiva de Pro.');
      } else if (err.status === 503) {
        this.message.set('El proveedor externo no está disponible ahora. No se consumió tu cupo.');
      } else if (err.status === 501) {
        this.message.set('Esta herramienta llega en una próxima iteración.');
      } else if (err.status === 400) {
        this.message.set('Revisa el archivo y los parámetros (formato o valores).');
      } else {
        this.message.set('No se pudo procesar el archivo. Inténtalo de nuevo.');
      }
    } finally {
      this.busy.set(false);
    }
  }
}
