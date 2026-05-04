import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth-service';
import { environment } from '../../environments/environment.development';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';


describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  const baseUrl: string = environment.BASE_URL;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  
  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceMock }
      ],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should NOT add Authorization header for sign-in request', () => {
    const req = new HttpRequest('POST', `${environment.BASE_URL}/sign-in`, null);

    const next: HttpHandlerFn = jasmine.createSpy().and.callFake((request) => {
      expect(request.headers.has('Authorization')).toBeFalse();
      return of({} as any);
    });

    interceptor(req, next);
  });

  it('should add Authorization header when token exists', () => {
    authServiceMock.getToken.and.returnValue('mock-token');
    const req = new HttpRequest('GET', `${baseUrl}/products`);

    const next: HttpHandlerFn = jasmine.createSpy().and.callFake((request) => {
      expect(request.headers.get('Authorization')).toBe('Bearer mock-token');
      return of({} as any);
    });

    interceptor(req, next);
  });

  it('should NOT add Authorization header when token is null', () => {
    authServiceMock.getToken.and.returnValue(null);
    const req = new HttpRequest('GET', `${baseUrl}/products`);

    const next: HttpHandlerFn = jasmine.createSpy().and.callFake((request) => {
      expect(request.headers.has('Authorization')).toBeFalse();
      return of({} as any);
    });

    interceptor(req, next);
  });

});
