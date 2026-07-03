import { Component, OnInit, signal } from '@angular/core';
import QRCode from 'qrcode';

/**
 * Donación anónima por cripto (USDT).
 *
 * Una dirección de wallet es pública (como un IBAN): NO revela tu nombre, cara
 * ni email a quien dona. Reemplaza los placeholders de abajo por TUS direcciones.
 * Consejo: usa una wallet dedicada solo a donaciones, separada de tus fondos.
 *
 * TRC-20 (red TRON) es la más usada en Latinoamérica por sus comisiones bajas y
 * es la recomendada para retirar por Binance P2P.
 */
interface DonationNetwork {
  readonly id: string;
  readonly label: string;
  readonly asset: string;
  readonly address: string;
}

const NETWORKS: readonly DonationNetwork[] = [
  { id: 'trc20', label: 'USDT · TRON (TRC-20)', asset: 'USDT', address: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
  { id: 'bep20', label: 'USDT · BNB Smart Chain (BEP-20)', asset: 'USDT', address: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
];

@Component({
  selector: 'ftk-donate',
  standalone: true,
  template: `
    <div class="donate-box">
      <p class="donate-title">💚 Apoya FreeToolKit</p>
      <p class="muted donate-sub">Donación anónima en USDT. Mantiene las herramientas gratis y sin censura.</p>

      @if (networks.length > 1) {
        <div class="net-row">
          @for (n of networks; track n.id) {
            <button
              class="net-btn"
              [class.active]="n.id === selected().id"
              (click)="select(n)"
            >{{ n.label }}</button>
          }
        </div>
      } @else {
        <p class="net-single">{{ selected().label }}</p>
      }

      @if (qr()) {
        <img class="qr" [src]="qr()" [alt]="'QR de donación ' + selected().asset" width="180" height="180" />
      }

      <div class="addr-row">
        <code class="addr" [title]="selected().address">{{ selected().address }}</code>
        <button class="copy" (click)="copy()">{{ copied() ? '✅ Copiado' : '📋 Copiar' }}</button>
      </div>
    </div>
  `,
  styles: [
    `
      .donate-box {
        display: inline-flex; flex-direction: column; align-items: center; gap: 0.6rem;
        max-width: 100%; padding: 1.1rem 1.3rem;
        border: 1px solid var(--border); border-radius: 16px;
        background: color-mix(in srgb, var(--surface) 70%, transparent);
      }
      .donate-title { font-weight: 800; font-size: 1.05rem; margin: 0; }
      .donate-sub { margin: 0; font-size: 0.85rem; }
      .net-row { display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; }
      .net-btn {
        font-size: 0.78rem; padding: 0.35rem 0.6rem; border-radius: 10px;
        border: 1px solid var(--border); background: transparent; color: var(--text);
        cursor: pointer; transition: background 0.15s, border-color 0.15s;
      }
      .net-btn.active { border-color: var(--primary); color: var(--primary); background: var(--grad-soft); }
      .net-single { margin: 0; font-size: 0.8rem; font-weight: 600; color: var(--primary); }
      .qr { border-radius: 12px; background: #fff; padding: 8px; }
      .addr-row {
        display: flex; align-items: center; gap: 0.4rem; max-width: 100%;
        flex-wrap: wrap; justify-content: center;
      }
      .addr {
        font-size: 0.72rem; padding: 0.35rem 0.5rem; border-radius: 8px;
        background: var(--grad-soft); max-width: 14rem;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .copy {
        font-size: 0.78rem; padding: 0.35rem 0.6rem; border-radius: 8px;
        border: 1px solid var(--primary); color: var(--primary); background: transparent; cursor: pointer;
      }
    `,
  ],
})
export class DonateComponent implements OnInit {
  readonly networks = NETWORKS;
  readonly selected = signal<DonationNetwork>(NETWORKS[0]);
  readonly qr = signal<string>('');
  readonly copied = signal(false);

  ngOnInit(): void {
    void this.renderQr();
  }

  select(n: DonationNetwork): void {
    if (n.id === this.selected().id) return;
    this.selected.set(n);
    this.copied.set(false);
    void this.renderQr();
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.selected().address);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Clipboard no disponible (p. ej. contexto no seguro): el usuario puede copiar a mano.
    }
  }

  private async renderQr(): Promise<void> {
    try {
      const url = await QRCode.toDataURL(this.selected().address, {
        width: 180,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
      this.qr.set(url);
    } catch {
      this.qr.set('');
    }
  }
}
