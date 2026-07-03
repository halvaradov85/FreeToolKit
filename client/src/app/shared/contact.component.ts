import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'ftk-contact',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="container" style="max-width:560px;">
      <h1>Contacto y sugerencias</h1>
      <p class="muted">¿Te falta una herramienta o encontraste un fallo? Cuéntanos. Llega directo al equipo.</p>
      <div class="card">
        @if (sent()) {
          <p style="color:#22c55e;"><strong>✅ ¡Gracias! Tu mensaje fue enviado.</strong></p>
          <button (click)="reset()">Enviar otro</button>
        } @else {
          <label>Nombre (opcional)</label>
          <input [ngModel]="name()" (ngModelChange)="name.set($event)" />
          <label>Email (opcional, para responderte)</label>
          <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" />
          <label>Mensaje</label>
          <textarea rows="5" [ngModel]="message()" (ngModelChange)="message.set($event)" placeholder="Escribe tu mensaje, sugerencia o reporte…"></textarea>
          @if (error()) { <p class="muted" style="color:#ef4444;">{{ error() }}</p> }
          <button class="primary" style="margin-top:0.8rem;" [disabled]="busy()" (click)="send()">
            {{ busy() ? 'Enviando…' : 'Enviar mensaje' }}
          </button>
        }
      </div>
    </section>
  `,
})
export class ContactComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  readonly name = signal('');
  readonly email = signal('');
  readonly message = signal('');
  readonly busy = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');

  constructor() {
    const u = this.auth.user();
    if (u) this.email.set(u.email);
  }

  async send() {
    if (this.message().trim().length < 3) { this.error.set('Escribe un mensaje.'); return; }
    this.busy.set(true); this.error.set('');
    try {
      await firstValueFrom(this.http.post('/api/v1/contact', {
        name: this.name() || undefined,
        email: this.email() || undefined,
        message: this.message(),
      }));
      this.sent.set(true);
    } catch {
      this.error.set('No se pudo enviar. Inténtalo de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }

  reset() {
    this.name.set(''); this.message.set(''); this.sent.set(false);
  }
}
