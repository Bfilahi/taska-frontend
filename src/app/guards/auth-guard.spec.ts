import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth-service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));
  
    let mockAuthService: jasmine.SpyObj<AuthService>;
    let router: Router;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj(['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should not invoke createUrlTree if isLoggedIn is true', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    spyOn(router, 'createUrlTree');

    executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
  
  it('should invoke createUrlTree if isLoggedIn is false', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    spyOn(router, 'createUrlTree');

    executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });
});
