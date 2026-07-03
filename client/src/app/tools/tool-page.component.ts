import { Component, computed, effect, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { TOOLS_BY_ID } from '@freetoolkit/shared';
import { I18nService } from '../core/i18n.service';
import { AuthService } from '../core/auth.service';
import { TOOL_REGISTRY } from './registry';
import { ServerToolComponent } from './server-tool.component';

@Component({
  selector: 'ftk-tool-page',
  standalone: true,
  imports: [NgComponentOutlet, RouterLink, ServerToolComponent],
  template: `
    <section class="container" style="max-width:760px;">
      <a routerLink="/tools" class="muted">{{ i18n.t('tool.back') }}</a>
      @if (tool(); as t) {
        <div class="row" style="justify-content:space-between; margin:0.6rem 0 0.2rem;">
          <h1 style="margin:0;">{{ t.name }}</h1>
          <span class="badge" [class.pro]="t.tier === 'PRO'">
            {{ t.tier === 'PRO' ? 'PRO' : (t.freeLimitPerDay === null ? 'Gratis' : t.freeLimitPerDay + '/día') }}
          </span>
        </div>
        <p class="muted">{{ t.description }}</p>
        <div class="card" style="margin-top:1rem;">
          @if (component()) {
            <ng-container *ngComponentOutlet="component()!" />
          } @else if (t.runtime !== 'client') {
            <ftk-server-tool [toolDef]="t" />
          } @else {
            <p>{{ i18n.t('tool.notImplemented') }}</p>
          }
        </div>
      } @else {
        <p class="muted" style="margin-top:1rem;">Herramienta no encontrada.</p>
      }
    </section>
  `,
})
export class ToolPageComponent {
  readonly i18n = inject(I18nService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), { initialValue: '' });
  readonly tool = computed(() => TOOLS_BY_ID[this.id()] ?? null);
  readonly component = computed(() => TOOL_REGISTRY[this.id()] ?? null);

  constructor() {
    // Registra en el historial la apertura de una herramienta client-side (con sesión).
    effect(() => {
      const t = this.tool();
      if (t && t.runtime === 'client' && this.auth.isAuthenticated()) {
        void this.auth.recordToolUse(t.id);
      }
    });
  }
}
