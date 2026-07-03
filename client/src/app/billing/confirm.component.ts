import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'ftk-confirm',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container" style="max-width:480px; text-align:center;">
      @if (state() === 'processing') {
        <h1>Procesando tu pago…</h1>
        <p class="muted">Un momento por favor.</p>
      } @else if (state() === 'success') {
        <h1>🎉 ¡Ya eres Pro!</h1>
        <p class="muted">Uso ilimitado y sin anuncios activados.</p>
        <a routerLink="/dashboard"><button class="primary">Ir a mi panel</button></a>
      } @else {
        <h1>No se pudo confirmar el pago</h1>
        <p class="muted">{{ error() }}</p>
        <a routerLink="/billing/upgrade"><button>Reintentar</button></a>
      }
    </section>
  `,
})
export class ConfirmComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly state = signal<'processing' | 'success' | 'error'>('processing');
  readonly error = signal('');

  async ngOnInit() {
    const session = this.route.snapshot.queryParamMap.get('session');
    if (!session) { this.state.set('error'); this.error.set('Falta la sesión de pago.'); return; }
    try {
      await firstValueFrom(this.http.post('/api/v1/billing/confirm', { session }));
      // Renueva el token para obtener el tier PRO actualizado, luego recarga el perfil.
      await this.auth.tryRefresh();
      await this.auth.loadMe();
      this.state.set('success');
    } catch {
      this.state.set('error');
      this.error.set('No pudimos confirmar el pago. Si el problema persiste, contáctanos.');
    }
  }
}
