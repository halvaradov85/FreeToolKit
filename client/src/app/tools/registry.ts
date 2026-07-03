import type { Type } from '@angular/core';
import { WordCountComponent, CaseConvertComponent, LoremComponent, DedupeComponent, PasswordGenComponent } from './text-tools';
import { BmiComponent, PercentageComponent, TipComponent, AgeComponent } from './calc-tools';
import { LoanComponent, DiscountComponent } from './more-calc-tools';
import { TemperatureComponent, NumberBaseComponent } from './convert-tools';
import { UnitsComponent, TimezoneComponent, SpeedComponent } from './more-convert-tools';
import { Base64Component, JsonFormatComponent } from './dev-tools';
import { ColorPickerComponent, MinifyComponent, SeoMetaComponent, JsonXmlValidateComponent, HtaccessComponent } from './more-dev-tools';
import { QrGenerateComponent, QrReadComponent } from './qr-tools';
import { PasswordStrengthComponent, HashGenComponent, EncryptTextComponent } from './security-tools';
import { TweetCountComponent, ImageToBase64Component } from './misc-tools';
import { SocialHashtagsComponent } from './social-tools';
import { ImageConvertComponent, ImageFaviconComponent, SocialResizeComponent } from './image-tools';
import { CurrencyComponent } from './currency-tool';
import { TranslateComponent } from './translate-tool';
import { SpellcheckComponent } from './spellcheck-tool';
import { CropComponent } from './crop-tool';
import { TextToSpeechComponent } from './tts-tool';
import { PdfToImageComponent } from './pdf-to-image-tool';
import { EmailBreachComponent } from './email-breach-tool';

/**
 * Registro central de herramientas client-side (Principio II: enchufable).
 * Añadir una herramienta = registrar su componente aquí.
 * Las server-side / con proveedor muestran un aviso (se activan en fases posteriores).
 */
export const TOOL_REGISTRY: Record<string, Type<unknown>> = {
  // Texto (5)
  'text-word-count': WordCountComponent,
  'text-case-convert': CaseConvertComponent,
  'text-lorem-ipsum': LoremComponent,
  'text-dedupe': DedupeComponent,
  'text-password-gen': PasswordGenComponent,
  'text-translate': TranslateComponent,
  'text-spellcheck': SpellcheckComponent,
  'text-to-speech': TextToSpeechComponent,
  // Calculadoras (6)
  'calc-bmi': BmiComponent,
  'calc-percentage': PercentageComponent,
  'calc-tip': TipComponent,
  'calc-age': AgeComponent,
  'calc-loan': LoanComponent,
  'calc-discount': DiscountComponent,
  // Conversores (5 client; monedas es server+provider)
  'convert-temperature': TemperatureComponent,
  'convert-number-base': NumberBaseComponent,
  'convert-units': UnitsComponent,
  'convert-timezone': TimezoneComponent,
  'convert-speed': SpeedComponent,
  'convert-currency': CurrencyComponent,
  // Desarrollo (9 client; acortador es server)
  'base64': Base64Component,
  'json-format': JsonFormatComponent,
  'color-picker': ColorPickerComponent,
  'minify': MinifyComponent,
  'seo-meta-tags': SeoMetaComponent,
  'json-xml-validate': JsonXmlValidateComponent,
  'htaccess-gen': HtaccessComponent,
  'qr-generate': QrGenerateComponent,
  'qr-read': QrReadComponent,
  'pdf-to-image': PdfToImageComponent,
  // Seguridad (3 client; email-breach es server+provider)
  'sec-password-strength': PasswordStrengthComponent,
  'sec-hash-gen': HashGenComponent,
  'sec-encrypt-text': EncryptTextComponent,
  'sec-email-breach': EmailBreachComponent,
  // Redes (3)
  'social-tweet-count': TweetCountComponent,
  'social-resize': SocialResizeComponent,
  'social-hashtags': SocialHashtagsComponent,
  // Imágenes (4 client; el resto son server)
  'image-to-base64': ImageToBase64Component,
  'image-convert': ImageConvertComponent,
  'image-crop': CropComponent,
  'image-favicon': ImageFaviconComponent,
};
