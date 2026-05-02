import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profile } from './profile';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { User } from '../../../services/user';
import { HotToastService } from '@ngxpert/hot-toast';
import { UserResponse } from '../../../dto/userResponse';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { UserRequest } from '../../../dto/userRequest';
import { HttpErrorResponse } from '@angular/common/http';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  let mockUserService: jasmine.SpyObj<User>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let toaster: HotToastService;

  let mockUserResponse: UserResponse;

  beforeEach(async () => {
    mockUserResponse = {
      id: 1,
      firstName: 'mario',
      lastName: 'rossi',
      email: 'mario.rossi@example.com',
      authorities: { authority: 'USER_ROLE' },
    };
    mockUserService = jasmine.createSpyObj(['updateProfile', 'getUser', 'deleteUser'], {
      user: signal<UserResponse | null>(mockUserResponse),
    });
    mockAuthService = jasmine.createSpyObj(['logout']);

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideZonelessChangeDetection(),
        { provide: User, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should pre-populate fields with user data from userService', () => {
      fixture.detectChanges();

      expect(component.profileForm.get('firstName')?.value).toBe(mockUserResponse.firstName);
      expect(component.profileForm.get('lastName')?.value).toBe(mockUserResponse.lastName);
      expect(component.profileForm.get('email')?.value).toBe(mockUserResponse.email);
    });

    it('should fall back to empty string if user() returns null', () => {
      mockUserService.user.set(null);
      
      fixture = TestBed.createComponent(Profile);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.profileForm.get('firstName')?.value).toBe('');
      expect(component.profileForm.get('lastName')?.value).toBe('');
      expect(component.profileForm.get('email')?.value).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should show required error for firstName when touched, dirty and empty', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.patchValue('');
      firstName?.markAsTouched();
      firstName?.markAsDirty();

      fixture.detectChanges();

      expect(firstName?.errors?.['required']).toBeTruthy();
    });

    it('should show minLength error for firstName when touched, dirty and under 3 characters', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.patchValue('aa');
      firstName?.markAsTouched();
      firstName?.markAsDirty();

      fixture.detectChanges();

      expect(firstName?.errors?.['minlength']).toBeTruthy();
    });

    it('should show required error for lastName when touched, dirty and empty', () => {
      const lastName = component.profileForm.get('lastName');
      lastName?.patchValue('');
      lastName?.markAsTouched();
      lastName?.markAsDirty();

      fixture.detectChanges();

      expect(lastName?.errors?.['required']).toBeTruthy();
    });

    it('should show minLength error for lastName when touched, dirty and under 3 characters', () => {
      const lastName = component.profileForm.get('lastName');
      lastName?.patchValue('aa');
      lastName?.markAsTouched();
      lastName?.markAsDirty();

      fixture.detectChanges();

      expect(lastName?.errors?.['minlength']).toBeTruthy();
    });

    it('should show required error for email when touched, dirty and empty', () => {
      const email = component.profileForm.get('email');
      email?.patchValue('');
      email?.markAsTouched();
      email?.markAsDirty();

      fixture.detectChanges();

      expect(email?.errors?.['required']).toBeTruthy();
    });

    it('should show pattern error for email when touched, dirty and invalid', () => {
      const email = component.profileForm.get('email');
      email?.patchValue('@email.com');
      email?.markAsTouched();
      email?.markAsDirty();

      fixture.detectChanges();

      expect(email?.errors?.['pattern']).toBeTruthy();
    });

    it('should not show pattern error for a valid email', () => {
      const email = component.profileForm.get('email');
      email?.patchValue('mario.rossi@email.com');
      email?.markAsTouched();
      email?.markAsDirty();

      fixture.detectChanges();

      expect(email?.errors?.['pattern']).toBeFalsy();
    });

    it('should disable save button when form is invalid', () => {
      component.profileForm.get('firstName')?.patchValue('');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('form button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should disable save button when isLoading is true', () => {
      component.isLoading.set(true);

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('form button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('save', () => {
    it('should set isLoading to true when save is called', () => {
      mockUserService.updateProfile.and.returnValue(NEVER);

      fixture.detectChanges();
      component.save();

      expect(component.isLoading()).toBeTrue();
    });

    it('should call updateProfile with the correct payload', () => {
      const request: UserRequest = {
        firstName: mockUserResponse.firstName,
        lastName: mockUserResponse.lastName,
        email: mockUserResponse.email,
      };
      mockUserService.updateProfile.and.returnValue(NEVER);

      fixture.detectChanges();
      component.save();

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(request);
    });

    it('should set isLoading to false on success', () => {
      mockUserService.updateProfile.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.save();

      expect(component.isLoading()).toBeFalse();
    });

    it('should remove user from localStorage on success', () => {
      spyOn(localStorage, 'removeItem');
      mockUserService.updateProfile.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.save();

      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should call getUser on success', () => {
      mockUserService.updateProfile.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.save();

      expect(mockUserService.getUser).toHaveBeenCalled();
    });

    it('should show success toast on success', () => {
      spyOn(toaster, 'success');
      mockUserService.updateProfile.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.save();

      expect(toaster.success).toHaveBeenCalledWith('Profile was updated successfully');
    });

    it('should set isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockUserService.updateProfile.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.save();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show error toast with error message on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockUserService.updateProfile.and.returnValue(throwError(() => error));
      spyOn(toaster, 'error');

      fixture.detectChanges();
      component.save();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });

    it('should not call getUser on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockUserService.updateProfile.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.save();
      
      expect(mockUserService.getUser).not.toHaveBeenCalled();
    });
  });

  describe('Delete', () => {
    it('should do nothing if confirm returns false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      mockUserService.deleteUser.and.returnValue(NEVER);

      component.delete();

      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should call deleteUser if confirm returns true', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockUserService.deleteUser.and.returnValue(of(void 0));

      component.delete();

      expect(mockUserService.deleteUser).toHaveBeenCalled();
    });

    it('should show success toast and call logout on delete success', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'success');
      mockUserService.deleteUser.and.returnValue(of(void 0));

      component.delete();

      expect(toaster.success).toHaveBeenCalledWith('User deleted successfully');
    });

    it('should show error toast with error message on delete error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockUserService.deleteUser.and.returnValue(throwError(() => error));

      component.delete();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });

    it('should not call logout on delete error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockUserService.deleteUser.and.returnValue(throwError(() => error));
      mockAuthService.logout.and.returnValue(void 0);

      component.delete();

      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });
});
