import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUp } from './sign-up';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth-service';
import { HotToastService } from '@ngxpert/hot-toast';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { SignupRequest } from '../../../dto/signupRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { Login } from '../login/login';

describe('SignUp', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<SignUp>>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let toaster: HotToastService;

  let mockSignupRequest: SignupRequest;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(['signup']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialogRef, useValue: dialogRef },
      ]
    })
    .overrideComponent(SignUp, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
        ],
      },
    })
    .compileComponents();

    mockSignupRequest = {
      firstName: 'mario',
      lastName: 'rossi',
      email: 'mario.rossi@example.com',
      password: 'Pass1234!',
    }

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation - First Name', () => {
    it('should show a required error when firstName is touched, dirty and empty', () => {
      const firstnameControl = component.signupForm.get('firstName');
      firstnameControl?.markAsTouched();
      firstnameControl?.markAsDirty();

      fixture.detectChanges();

      expect(firstnameControl?.errors?.['required']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('First name'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('First name is **required**.');
    });

    it('should show a minlength error when firstName is less than 3 characters', () => {
      const firstnameControl = component.signupForm.get('firstName');
      firstnameControl?.patchValue('aa');
      firstnameControl?.markAsTouched();
      firstnameControl?.markAsDirty();

      fixture.detectChanges();

      expect(firstnameControl?.errors?.['minlength']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('First name'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('First name must be at least');
    });

    it('should show a maxlength error when firstName is more than 20 characters', () => {
      const firstnameControl = component.signupForm.get('firstName');
      firstnameControl?.patchValue('aaaaabbbbbbccccccddddddddeeee');
      firstnameControl?.markAsTouched();
      firstnameControl?.markAsDirty();

      fixture.detectChanges();

      expect(firstnameControl?.errors?.['maxlength']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('First name'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('First name must be at most');
    });

    it('should not show errors when firstName is valid', () => {
      const firstnameControl = component.signupForm.get('firstName');
      firstnameControl?.patchValue('adam');
      firstnameControl?.markAsTouched();
      firstnameControl?.markAsDirty();

      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      expect(errors).toEqual([]);
    });
  });

  describe('Form Validation - Last Name', () => {
    it('should show a required error when lastName is touched, dirty and empty', () => {
      const lastnameControl = component.signupForm.get('lastName');
      lastnameControl?.markAsTouched();
      lastnameControl?.markAsDirty();

      fixture.detectChanges();

      expect(lastnameControl?.errors?.['required']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Last name'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Last name is **required**.');
    });

    it('should show a minlength error when lastName is less than 3 characters', () => {
      const lastnameControl = component.signupForm.get('lastName');
      lastnameControl?.patchValue('ab');
      lastnameControl?.markAsTouched();
      lastnameControl?.markAsDirty();

      fixture.detectChanges();

      expect(lastnameControl?.errors?.['minlength']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Last name'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Last name must be at least');
    });

    it('should show a maxlength error when lastName is more than 20 characters', () => {
      const lastnameControl = component.signupForm.get('lastName');
      lastnameControl?.patchValue('aaaaabbbbbbccccccddddddddeeee');
      lastnameControl?.markAsTouched();
      lastnameControl?.markAsDirty();

      fixture.detectChanges();

      expect(lastnameControl?.errors?.['maxlength']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Last name'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Last name must be at most');
    });

    it('should not show errors when lastName is valid', () => {
      const lastnameControl = component.signupForm.get('lastName');
      lastnameControl?.patchValue('rossi');
      lastnameControl?.markAsTouched();
      lastnameControl?.markAsDirty();

      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      expect(errors).toEqual([]);
    });
  });

  describe('Form Validation - Email', () => {
    it('should show a required error when email is touched, dirty and empty', () => {
      const emailControl = component.signupForm.get('email');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      expect(emailControl?.errors?.['required']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Email'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Email name is **required**.');
    });

    it('should show a pattern error when email is invalid', () => {
      const emailControl = component.signupForm.get('email');
      emailControl?.patchValue('@e.')
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      expect(emailControl?.errors?.['pattern']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('email'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Invalid email.');
    });

    it('should not show errors when email is valid', () => {
      const emailControl = component.signupForm.get('email');
      emailControl?.patchValue('mario.rossi@example.com');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      expect(errors).toEqual([]);
    });
  });

  describe('Form Validation - Password', () => {
    it('should show a required error when password is touched, dirty and empty', () => {
      const passwordControl = component.signupForm.get('password');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.errors?.['required']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Password'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Password is **required**.');
    });

    it('should show a pattern error when password has no uppercase letter', () => {
      const passwordControl = component.signupForm.get('password');
      passwordControl?.patchValue('password1234!');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.errors?.['pattern']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Password'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Password is **weak**.');
    });

    it('should show a pattern error when password has no lowercase letter', () => {
      const passwordControl = component.signupForm.get('password');
      passwordControl?.patchValue('PASSWORD1234!');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.errors?.['pattern']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Password'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Password is **weak**.');
    });

    it('should show a pattern error when password has no digit', () => {
      const passwordControl = component.signupForm.get('password');
      passwordControl?.patchValue('Password!');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.errors?.['pattern']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Password'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Password is **weak**.');
    });

    it('should show a pattern error when password is less than 8 characters', () => {
      const passwordControl = component.signupForm.get('password');
      passwordControl?.patchValue('Pas12!');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.errors?.['pattern']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const error = errors.find((e) => e.nativeElement.textContent.includes('Password'));
      expect(error).toBeTruthy();
      expect(error?.nativeElement.textContent).toContain('Password is **weak**.');
    });

    it('should not show errors when password is valid', () => {
      const passwordControl = component.signupForm.get('password');
      passwordControl?.patchValue('Pass123!');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      expect(errors).toEqual([]);
    });
  });

  describe('Form Submission', () => {
    it('should set isLoading to true when form is submitted', () => {
      mockAuthService.signup.and.returnValue(NEVER);
      component.isLoading.set(false);
      
      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should call authService.signup with the correct payload', () => {
      mockAuthService.signup.and.returnValue(of());
      component.signupForm.get('firstName')?.patchValue('mario');
      component.signupForm.get('lastName')?.patchValue('rossi');
      component.signupForm.get('email')?.patchValue('mario.rossi@example.com');
      component.signupForm.get('password')?.patchValue('Pass1234!');

      fixture.detectChanges();
      component.onSubmit();

      expect(mockAuthService.signup).toHaveBeenCalledWith(mockSignupRequest);
    });

    it('should reset the form on successful signup', () => {
      mockAuthService.signup.and.returnValue(of({}));
      spyOn(component.signupForm, 'reset');

      fixture.detectChanges();
      component.onSubmit();

      expect(component.signupForm.reset).toHaveBeenCalled();
    });

    it('should set isLoading to false on successful signup', () => {
      mockAuthService.signup.and.returnValue(of({}));
      component.isLoading.set(true);

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show a success toast on successful signup', () => {
      mockAuthService.signup.and.returnValue(of({}));
      spyOn(toaster, 'success');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.success).toHaveBeenCalledWith('Profile was created successfully');
    });

    it('should close the dialog on successful signup', () => {
      mockAuthService.signup.and.returnValue(of({}));

      fixture.detectChanges();
      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should set isLoading to false on signup error', () => {
      component.isLoading.set(true);
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAuthService.signup.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show an error toast with the server message on signup error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockAuthService.signup.and.returnValue(throwError(() => error));
      spyOn(toaster, 'error');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });

    it('should keep the dialog open on signup error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockAuthService.signup.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onSubmit();

      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Dialog Interaction', () => {
    it('should close the dialog when the close button is clicked', () => {
      const btn = fixture.debugElement.query(By.directive(MatDialogClose));
      btn.triggerEventHandler('click', new MouseEvent('click'));

      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should close the current dialog when openLoginDialog is called', () => {
      component.openLoginDialog();

      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should open the login dialog when openLoginDialog is called', () => {
      component.openLoginDialog();

      expect(dialog.open).toHaveBeenCalledWith(Login);
    });
  });
});