import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { environment } from '../../environments/environment.development';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const baseUrl: string = environment.BASE_URL;

  if (req.url.includes(`${baseUrl}/sign-in`) || req.url.includes(`${baseUrl}/sign-up`)) return next(req);

  const token: string | null = authService.getToken();
  if(token){
    const cloneReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloneReq);
  }

  return next(req);
};