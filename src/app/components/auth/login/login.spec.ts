import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login } from './login';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth-service';
import { provideRouter, Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { By } from '@angular/platform-browser';
import { NEVER, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SignUp } from '../sign-up/sign-up';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  let router: Router;
  let toaster: HotToastService;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<Login>>;
  let mockAuthService: jasmine.SpyObj<AuthService>;


  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(['login']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    })
    .overrideComponent(Login, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
        ],
      },
    })
      .compileComponents();

    router = TestBed.inject(Router);
    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should show required error for email when touched and dirty', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const emailErrors = errors.find((e) => e.nativeElement.textContent.includes('Email is **required**.'));
      expect(emailErrors).toBeTruthy();
      expect(emailErrors?.nativeElement.textContent).toContain('Email is **required**.');
    });

    it('should show pattern error for invalid email format when touched and dirty', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.patchValue('p.com');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      expect(emailControl?.errors?.['pattern']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const err = errors.find((e) =>
        e.nativeElement.textContent.includes('email'));
      expect(err).toBeTruthy();
      expect(err?.nativeElement.textContent).toContain('Invalid email.'); 
    });

    it('should show required error for password when touched and dirty', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.markAsTouched();
      passwordControl?.markAsDirty();

      fixture.detectChanges();

      expect(passwordControl?.errors?.['required']).toBeTruthy();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      const err = errors.find(e => e.nativeElement.textContent.includes('Password'));
      expect(err).toBeTruthy();
      expect(err?.nativeElement.textContent).toContain('Password is **required**.');
    });

    it('should disable submit button when form is invalid', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.markAsTouched();
      emailControl?.markAsDirty();

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.login-btn'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should enable submit button when email and password are valid', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      emailControl?.patchValue('mario.rossi@example.com');
      passwordControl?.patchValue('Pass123!');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.login-btn'));
      expect(btn.nativeElement.disabled).toBeFalse();
    });
  });

  describe('Form Submission', () => {
    it('should set isLoading to true when form is submitted', () => {
      mockAuthService.login.and.returnValue(NEVER);

      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should append email and password to FormData on submit', () => {
      mockAuthService.login.and.returnValue(of('mock-token'));
      component.loginForm.get('email')?.patchValue('mario.rossi@example.com');
      component.loginForm.get('password')?.patchValue('Pass123!');
      const formData: FormData = new FormData();
      formData.append('email', component.loginForm.get('email')?.value);
      formData.append('password', component.loginForm.get('password')?.value);

      fixture.detectChanges();
      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith(formData);
    });

    it('should reset form on successful login', () => {
      mockAuthService.login.and.returnValue(of('mock-token'));
      spyOn(component.loginForm, 'reset');

      fixture.detectChanges();
      component.onSubmit();

      expect(component.loginForm.reset).toHaveBeenCalled();
    });

    it('should set isLoading to false on successful login', () => {
      mockAuthService.login.and.returnValue(of('mock-token'));

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should close dialog on successful login', () => {
      mockAuthService.login.and.returnValue(of('mock-token'));

      fixture.detectChanges();
      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should navigate to dashboard on successful login', () => {
      mockAuthService.login.and.returnValue(of('mock-token'));
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['dashboard']);
    });

    it('should show success toast on successful login', () => {
      mockAuthService.login.and.returnValue(of('mock-token'));
      spyOn(toaster, 'success');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.success).toHaveBeenCalledWith('Welcome');
    });

    it('should set isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAuthService.login.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show error toast with server message on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockAuthService.login.and.returnValue(throwError(() => error));
      spyOn(toaster, 'error');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });
  });

  describe('Loading State', () => {
    it('should show spinner icon while isLoading is true', () => {
      component.isLoading.set(true);

      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.animate-spin'));
      expect(spinner).toBeTruthy();
    });

    it('should disable submit button while isLoading is true', () => {
      component.isLoading.set(true);

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.login-btn'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Dialog Behavior', () => {
    it('should close dialog when close button is clicked', () => {
      const btn = fixture.debugElement.query(By.directive(MatDialogClose));
      btn.triggerEventHandler('click', new MouseEvent('click'));

      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should close current dialog and open SignUp dialog when openSignUpDialog is called', () => {
      component.openSignUpDialog();

      expect(dialogRef.close).toHaveBeenCalled();
      expect(dialog.open).toHaveBeenCalledWith(SignUp);
    });
  });
});
