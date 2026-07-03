import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'ftk-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="container" style="max-width:420px;">
      <h1>{{ mode() === 'login' ? 'Iniciar sesión' : 'Crear cuenta' }}</h1>
      <div class="card">
        <label>Email</label>
        <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" autocomplete="email" />
        <label>Contraseña</label>
        <input type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" autocomplete="current-password" />
        @if (error()) { <p class="muted" style="color:#ef4444;">{{ error() }}</p> }
        <button class="primary" style="margin-top:0.8rem;width:100%;" [disabled]="busy()" (click)="submit()">
          {{ busy() ? '…' : (mode() === 'login' ? 'Entrar' : 'Registrarme') }}
        </button>
      </div>
      <p class="muted" style="margin-top:1rem;">
        @if (mode() === 'login') {
          ¿No tienes cuenta? <a routerLink="/register">Crear una</a>
        } @else {
          ¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a>
        }
      </p>
    </section>
  `,
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly mode = signal<'login' | 'register'>(
    this.route.snapshot.url.some((s) => s.path === 'register') ? 'register' : 'login',
  );
  readonly email = signal('');
  readonly password = signal('');
  readonly busy = signal(false);
  readonly error = signal('');

  async submit() {
    this.error.set('');
    if (!this.email() || this.password().length < 8) {
      this.error.set('Email válido y contraseña de al menos 8 caracteres.');
      return;
    }
    this.busy.set(true);
    try {
      if (this.mode() === 'login') await this.auth.login(this.email(), this.password());
      else await this.auth.register(this.email(), this.password());
      this.router.navigateByUrl('/dashboard');
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 401) this.error.set('Credenciales inválidas.');
      else if (status === 409) this.error.set('No se pudo completar el registro.');
      else if (status === 422) this.error.set('Revisa el email y la contraseña.');
      else this.error.set('Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}
