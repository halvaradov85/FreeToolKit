import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import type { CategoryMeta, ToolCatalogEntry } from '@freetoolkit/shared';
import { CatalogService } from './catalog.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'ftk-catalog',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container">
      <h1>{{ i18n.t('nav.catalog') }}</h1>

      <div class="row" style="margin: 1rem 0;">
        <input
          type="search"
          [placeholder]="i18n.t('catalog.search')"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
          style="max-width: 360px;"
        />
      </div>

      <div class="row" style="margin-bottom: 1rem;">
        <button [class.primary]="!category()" (click)="category.set(null)">
          {{ i18n.t('catalog.all') }}
        </button>
        @for (c of categories(); track c.id) {
          <button [class.primary]="category() === c.id" (click)="category.set(c.id)">
            {{ c.label }}
          </button>
        }
      </div>

      @if (filtered().length === 0) {
        <p class="muted">{{ i18n.t('catalog.empty') }}</p>
      }

      <div class="grid">
        @for (t of filtered(); track t.id) {
          <a class="card tool" [routerLink]="['/tools', t.id]">
            <div class="row" style="justify-content: space-between;">
              <strong>{{ t.name }}</strong>
              <span class="badge" [class.pro]="t.tier === 'PRO'">
                {{ t.tier === 'PRO' ? 'PRO' : (t.effectiveFreeLimitPerDay === null ? 'Gratis' : t.effectiveFreeLimitPerDay + '/día') }}
              </span>
            </div>
            <p class="muted" style="margin: 0.4rem 0 0;">{{ t.description }}</p>
          </a>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .tool {
        display: block; color: var(--text); position: relative; overflow: hidden;
        cursor: pointer;
      }
      .tool::before {
        content: ''; position: absolute; inset: 0 0 auto 0; height: 4px;
        background: var(--grad); opacity: 0; transition: opacity 0.2s;
      }
      .tool:hover {
        text-decoration: none; border-color: transparent;
        transform: translateY(-4px); box-shadow: var(--shadow-lg);
      }
      .tool:hover::before { opacity: 1; }
      h1 { background: var(--grad); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; display: inline-block; }
    `,
  ],
})
export class CatalogComponent {
  readonly i18n = inject(I18nService);
  private catalog = inject(CatalogService);

  readonly tools = toSignal(this.catalog.getTools(), { initialValue: [] as ToolCatalogEntry[] });
  readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] as CategoryMeta[] });
  readonly query = signal('');
  readonly category = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const cat = this.category();
    return this.tools().filter((t) => {
      if (cat && t.category !== cat) return false;
      if (q && !(`${t.name} ${t.description}`.toLowerCase().includes(q))) return false;
      return t.enabled;
    });
  });
}
