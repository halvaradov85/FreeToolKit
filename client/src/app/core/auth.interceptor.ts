import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

function withToken(req: HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/** Adjunta el access token a las llamadas a la API y renueva una vez ante un 401. */
export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const isApi = req.url.startsWith('/api/');
  const isAuthCall = req.url.includes('/api/v1/auth/');
  const token = auth.accessToken;

  const request = isApi && token && !isAuthCall ? withToken(req, token) : req;

  return next(request).pipe(
    catchError((err) => {
      if (err?.status === 401 && isApi && !isAuthCall && auth.refreshTokenValue) {
        return from(auth.tryRefresh()).pipe(
          switchMap((newToken) => {
            if (!newToken) return throwError(() => err);
            return next(withToken(req, newToken));
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
