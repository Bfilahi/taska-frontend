import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth-service';
import { provideHttpClient } from '@angular/common/http';
import { User } from './user';
import { Router } from '@angular/router';
import { SignupRequest } from '../dto/signupRequest';
import { environment } from '../../environments/environment.development';

describe('AuthService', () => {
  let service: AuthService;

  let authUrl: string = `${environment.BASE_URL}/auth`;

  let mockUserService: jasmine.SpyObj<User>;
  let router: Router;
  let httpTestingController: HttpTestingController;

  let signupRequest: SignupRequest;

  beforeEach(() => {
    mockUserService = jasmine.createSpyObj(['getUser']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        { provide: User, useValue: mockUserService }
      ]
    });

    signupRequest = {
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      password: 'Pass123!'
    }

    router = TestBed.inject(Router);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set isLoggedIn to true when a token exists in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      const newService = TestBed.runInInjectionContext(() => new AuthService);

      expect(newService.isLoggedIn()).toBeTrue();
    });

    it('should leave isLoggedIn as false when no token exists', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      const newService = TestBed.runInInjectionContext(() => new AuthService);

      expect(newService.isLoggedIn()).toBeFalse();
    });
  });

  describe('signup()', () => {
    it('should call POST /auth/sign-up with the correct request body', () => {
      service.signup(signupRequest).subscribe();

      const req = httpTestingController.expectOne(`${authUrl}/sign-up`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(signupRequest);
      req.flush({});
    });
  });

  describe('login()', () => {
    let formData: FormData;

    beforeEach(() => {
      formData = new FormData();
      formData.append('email', signupRequest.email);
      formData.append('password', signupRequest.password);
    });

    it('should call POST /auth/sign-in with the FormData payload', () => {
      service.login(formData).subscribe();

      const req = httpTestingController.expectOne(`${authUrl}/sign-in`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(formData);
      req.flush('mock-token');
    });

    it('should save the returned token to localStorage on success', () => {
      spyOn<any>(service, 'saveToken');

      service.login(formData).subscribe();

      const req = httpTestingController.expectOne(`${authUrl}/sign-in`);
      req.flush('mock-token');
      expect(service['saveToken']).toHaveBeenCalledWith('mock-token');
    });

    it('should set isLoggedIn to true on success', () => {
      service.login(formData).subscribe();

      const req = httpTestingController.expectOne(`${authUrl}/sign-in`);
      req.flush('mock-token');
      const result = service.isLoggedIn();
      expect(result).toBeTrue();
    });

    it('should call userService.getUser() on success', () => {
      service.login(formData).subscribe();

      const req = httpTestingController.expectOne(`${authUrl}/sign-in`);
      req.flush('mock-token');
      expect(mockUserService.getUser).toHaveBeenCalled();
    });

    it('should propagate errors', () => {
      service.login(formData).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${authUrl}/sign-in`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('getToken()', () => {
    it('should return the token string when jwt exists in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      const result = service.getToken();

      expect(localStorage.getItem).toHaveBeenCalledWith('jwt');
      expect(result).toBe('mock-token');
    });

    it('should return null when jwt doesn\'s exists in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      const result = service.getToken();

      expect(result).toBeNull();
    });
  });

  describe('logout()', () => {
    it('should remove jwt from localStorage', () => {
      spyOn(localStorage, 'removeItem');

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt');
    });

    it('should remove user from localStorage', () => {
      spyOn(localStorage, 'removeItem');

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should set isLoggedIn to false', () => {
      service.logout();

      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should navigate to \'/\'', () => {
      spyOn(router, 'navigate');

      service.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
