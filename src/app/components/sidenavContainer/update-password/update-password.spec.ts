import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePassword } from './update-password';
import { provideZonelessChangeDetection } from '@angular/core';
import { User } from '../../../services/user';
import { HotToastService } from '@ngxpert/hot-toast';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { PasswordRequest } from '../../../dto/passwordRequest';
import { HttpErrorResponse } from '@angular/common/http';

describe('UpdatePassword', () => {
  let component: UpdatePassword;
  let fixture: ComponentFixture<UpdatePassword>;

  let mockUserService: jasmine.SpyObj<User>;
  let toaster: HotToastService;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj(['updatePassword']);

    await TestBed.configureTestingModule({
      imports: [UpdatePassword],
      providers: [provideZonelessChangeDetection(), { provide: User, useValue: mockUserService }],
    }).compileComponents();

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(UpdatePassword);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should be invalid when all fields are empty', () => {
      fixture.detectChanges();

      expect(component.updatePasswordForm.invalid).toBeTrue();
    });

    it('should be invalid when oldPassword does not match the pattern', () => {
      const oldPass = component.updatePasswordForm.get('oldPassword');
      const newPass = component.updatePasswordForm.get('newPassword');
      const confirmPass = component.updatePasswordForm.get('confirmPassword');

      oldPass?.patchValue('pass123!');
      newPass?.patchValue('Pass123!');
      confirmPass?.patchValue('Pass123!');

      fixture.detectChanges();

      expect(component.updatePasswordForm.invalid).toBeTrue();
    });

    it('should be invalid when confirmPassword is empty', () => {
      const oldPass = component.updatePasswordForm.get('oldPassword');
      const newPass = component.updatePasswordForm.get('newPassword');

      oldPass?.patchValue('Pass123!');
      newPass?.patchValue('Pass1234!');

      fixture.detectChanges();

      expect(component.updatePasswordForm.invalid).toBeTrue();
    });

    it('should be valid when all fields are filled correctly', () => {
      const oldPass = component.updatePasswordForm.get('oldPassword');
      const newPass = component.updatePasswordForm.get('newPassword');
      const confirmPass = component.updatePasswordForm.get('confirmPassword');

      oldPass?.patchValue('Pass123!');
      newPass?.patchValue('Pass1234!');
      confirmPass?.patchValue('Pass1234!');

      fixture.detectChanges();

      expect(component.updatePasswordForm.invalid).toBeFalse();
    });

    it('should disable the submit button when the form is invalid', () => {
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Submit Behavior', () => {
    const passValue = 'pass123!';

    beforeEach(() => {
      const oldPass = component.updatePasswordForm.get('oldPassword');
      const newPass = component.updatePasswordForm.get('newPassword');
      const confirmPass = component.updatePasswordForm.get('confirmPassword');

      oldPass?.patchValue(passValue);
      newPass?.patchValue(passValue);
      confirmPass?.patchValue(passValue);
    });

    it('should set isLoading to true on form submission', () => {
      mockUserService.updatePassword.and.returnValue(NEVER);

      fixture.detectChanges();
      component.updatePassword();

      expect(component.isLoading()).toBeTrue();
    });

    it('should disable the submit button while isLoading is true', () => {
      mockUserService.updatePassword.and.returnValue(NEVER);

      fixture.detectChanges();
      component.updatePassword();

      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should call userService.updatePassword with the correct payload on submit', () => {
      const request: PasswordRequest = {
        oldPassword: passValue,
        newPassword: passValue,
        confirmPassword: passValue,
      };
      mockUserService.updatePassword.and.returnValue(of(void 0));

      component.updatePassword();

      expect(mockUserService.updatePassword).toHaveBeenCalledWith(request);
    });

    it('should reset isLoading to false and reset the form on success', () => {
      mockUserService.updatePassword.and.returnValue(of(void 0));

      component.updatePassword();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show a success toast on successful password update', () => {
      mockUserService.updatePassword.and.returnValue(of(void 0));
      spyOn(toaster, 'success');

      component.updatePassword();

      expect(toaster.success).toHaveBeenCalledWith('Password was updated successfully');
    });

    it('should reset isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500, 
        error: {message: 'Something went wrong'}
      });
      mockUserService.updatePassword.and.returnValue(throwError(() => error));

      component.updatePassword();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show an error toast with the API error message on failure', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockUserService.updatePassword.and.returnValue(throwError(() => error));
      spyOn(toaster, 'error');

      component.updatePassword();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });
  });

});
