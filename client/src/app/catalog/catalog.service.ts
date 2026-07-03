import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { CategoryMeta, ToolCatalogEntry } from '@freetoolkit/shared';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = '/api/v1/catalog';

  getTools(): Observable<ToolCatalogEntry[]> {
    return this.http.get<ToolCatalogEntry[]>(`${this.base}/tools`);
  }

  getCategories(): Observable<CategoryMeta[]> {
    return this.http.get<CategoryMeta[]>(`${this.base}/categories`);
  }
}
