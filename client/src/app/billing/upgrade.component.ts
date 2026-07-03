import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/auth.service';

interface CheckoutResult { checkoutUrl: string; simulated: boolean; }

@Component({
  selector: 'ftk-upgrade',
  standalone: true,
  template: `
    <section class="container" style="max-width:560px;">
      <h1>Pásate a Pro</h1>
      <div class="card">
        <h2 style="margin-top:0;">FreeToolKit Pro · $5/mes</h2>
        <ul class="muted">
          <li>Uso ilimitado de todas las herramientas</li>
          <li>Sin anuncios</li>
          <li>Funciones extra (batch, HD, paletas y bóveda guardadas, analytics)</li>
        </ul>
        @if (!auth.isAuthenticated()) {
          <p class="muted">Necesitas <a href="/login">iniciar sesión</a> para suscribirte.</p>
        } @else if (auth.user()?.tier === 'PRO') {
          <p>✅ Ya eres Pro. ¡Gracias por tu apoyo!</p>
        } @else {
          <div class="row" style="margin-top:1rem;">
            <button class="primary" [disabled]="busy()" (click)="checkout('STRIPE')">Pagar con Stripe</button>
            <button [disabled]="busy()" (click)="checkout('MERCADOPAGO')">Pagar con MercadoPago</button>
          </div>
          <p class="muted" style="margin-top:0.8rem;">Modo demo: el pago se simula para que puedas probar el flujo.</p>
        }
        @if (error()) { <p class="muted" style="color:#ef4444;">{{ error() }}</p> }
      </div>
    </section>
  `,
})
export class UpgradeComponent {
  readonly auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  readonly busy = signal(false);
  readonly error = signal('');

  async checkout(provider: 'STRIPE' | 'MERCADOPAGO') {
    this.busy.set(true);
    this.error.set('');
    try {
      const res = await firstValueFrom(
        this.http.post<CheckoutResult>('/api/v1/billing/checkout', { provider }),
      );
      // En modo simulado, checkoutUrl es una ruta interna /billing/confirm?session=...
      const url = new URL('http://x' + res.checkoutUrl);
      this.router.navigate([url.pathname], { queryParams: { session: url.searchParams.get('session') } });
    } catch {
      this.error.set('No se pudo iniciar el pago. Inténtalo de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}
