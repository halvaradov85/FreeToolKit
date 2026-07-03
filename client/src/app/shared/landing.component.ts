import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'ftk-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero container">
      <span class="pill">✨ 51 herramientas · 100% gratis para empezar</span>
      <h1>{{ i18n.t('landing.heading') }}</h1>
      <p class="muted lead">{{ i18n.t('landing.subheading') }}</p>
      <a routerLink="/tools"><button class="primary cta">{{ i18n.t('landing.cta') }}</button></a>

      <div class="grid stats">
        <div class="card"><strong>51</strong><span class="muted">herramientas</span></div>
        <div class="card"><strong>8</strong><span class="muted">categorías</span></div>
        <div class="card"><strong>35</strong><span class="muted">sin enviar datos</span></div>
        <div class="card"><strong>0€</strong><span class="muted">para empezar</span></div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero { text-align: center; padding: 4rem 1rem 2rem; }
      .pill {
        display: inline-block; margin-bottom: 1.2rem; padding: 0.4rem 0.9rem;
        border-radius: 999px; font-size: 0.85rem; font-weight: 600;
        color: var(--primary); background: var(--grad-soft);
        border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
      }
      .hero h1 {
        font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.1; margin: 0 0 0.8rem;
        background: var(--grad); -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .lead { max-width: 640px; margin: 0 auto 1.8rem; font-size: 1.15rem; line-height: 1.6; }
      .cta { font-size: 1.05rem; padding: 0.75rem 1.6rem; }
      .stats { max-width: 760px; margin: 3rem auto 0; }
      .stats .card { text-align: center; display: flex; flex-direction: column; gap: 0.2rem; }
      .stats strong {
        font-size: 2rem; background: var(--grad);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      }
      .stats .muted { font-size: 0.85rem; }
    `,
  ],
})
export class LandingComponent {
  readonly i18n = inject(I18nService);
}
