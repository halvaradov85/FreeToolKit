import { Injectable, signal } from '@angular/core';
import es from '../../assets/i18n/es.json';

// i18n ligero (español principal). Estructura preparada para añadir idiomas:
// carga perezosa de otros diccionarios y cambio de locale en runtime.
type Dict = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<string>(localStorage.getItem('ftk-locale') ?? 'es');
  private dict: Dict = es as Dict;

  t(key: string): string {
    return this.dict[key] ?? key;
  }

  async use(locale: string) {
    if (locale === 'es') {
      this.dict = es as Dict;
    } else {
      const mod = await import(`../../assets/i18n/${locale}.json`);
      this.dict = mod.default as Dict;
    }
    this.locale.set(locale);
    localStorage.setItem('ftk-locale', locale);
  }
}
