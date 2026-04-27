import { TestBed } from '@angular/core/testing';

import { User } from './user';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserResponse } from '../dto/userResponse';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { UserRequest } from '../dto/userRequest';
import { PasswordRequest } from '../dto/passwordRequest';

describe('User', () => {
  let service: User;
  let httpTestingController: HttpTestingController;

  let mockUserResponse: UserResponse;
  let mockUserRequest: UserRequest;
  let mockPasswordRequest: PasswordRequest;
  const baseUrl: string = `${environment.BASE_URL}/user`;
  

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ]
    });

    mockUserResponse = {
      id: 1,
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      authorities: {authority: 'ROLE_USER'}
    };

    mockUserRequest = {
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
    };

    mockPasswordRequest = {
      oldPassword: 'oldPass123!',
      newPassword: 'newPass123!',
      confirmPassword: 'newPass123!',
    };

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(User);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser()', () => {
    it('should call saveUser() when localStorage has no \'user\' key', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      spyOn<any>(service, 'saveUser');

      service.getUser();

      expect(service['saveUser']).toHaveBeenCalled();
    });

    it('should read from cache and set the signal without making an HTTP call when \'user\' is in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUserResponse));

      service.getUser();

      expect(service.user()).toEqual(mockUserResponse);
    });
  });

  describe('saveUser()', () => {
    it('should set the signal with the response and persist it to localStorage on success', () => {
      spyOn<any>(service, 'getUserInfo').and.returnValue(of(mockUserResponse));
      spyOn(localStorage, 'setItem');

      service['saveUser']();

      expect(service.user()).toEqual(mockUserResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(service.user()));
    });

    it('should log an error on ERROR', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({ status: 500 });
      spyOn<any>(service, 'getUserInfo').and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      service['saveUser']();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser()', () => {
    it('should call delete and verify the correct HTTP URL', () => {
      service.deleteUser().subscribe();

      const req = httpTestingController.expectOne(baseUrl);
      req.flush({});
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toBe(baseUrl);
    });
  });

  describe('updateProfile()', () => {
    it('should call the method with the correct request body', () => {
      service.updateProfile(mockUserRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/profile-update`);
      req.flush({});
      expect(req.request.body).toEqual(mockUserRequest);
    });
  });

  describe('updatePassword()', () => {
    it('should call the method with correct request body', () => {
      service.updatePassword(mockPasswordRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/password-update`);
      req.flush({});
      expect(req.request.body).toEqual(mockPasswordRequest);
    });
  });
});
